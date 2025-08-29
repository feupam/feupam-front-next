'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useReservationProcess, ReservationData } from '@/hooks/useReservationProcess';
import { Loader2, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { api } from '@/lib/api';
import { useCurrentEventContext } from '@/contexts/CurrentEventContext';

interface ReservationPageProps {
  params: {
    eventId: string;
    ticketKind: string;
  };
}

export default function ReservationPage({ params }: ReservationPageProps) {
  const { eventId, ticketKind } = params;
  const [step, setStep] = useState<'checking' | 'reserving' | 'existing' | 'success' | 'error' | 'cancelled' | 'waiting'>('checking');
  const router = useRouter();
  const processingRef = useRef(false);
  const [localReservationData, setLocalReservationData] = useState<ReservationData | null>(null);
  const { currentEvent, isCurrentEventOpen, setCurrentEventByName } = useCurrentEventContext();

  // Verificar se o evento está aberto
  useEffect(() => {
    if (eventId && eventId !== 'undefined') {
      setCurrentEventByName(eventId);
    }
  }, [eventId, setCurrentEventByName]);

  // Se o evento não estiver aberto, redirecionar para perfil
  useEffect(() => {
    if (currentEvent && !isCurrentEventOpen) {
      console.log('[ReservationPage] Evento não está aberto, redirecionando para perfil');
      router.push('/perfil');
    }
  }, [currentEvent, isCurrentEventOpen, router]);

  // Only initialize hook if we have the required params
  const reservationProcess = useReservationProcess(
    eventId && ticketKind ? { eventId, ticketKind } : undefined
  );

  const {
    isLoading,
    isError,
    errorMessage,
    reservationData,
    isWaitingList,
    reservationStatus,
    checkSpotAvailability,
    reserveSpot,
    fetchUserReservations,
    purchaseTicket,
    checkReservationStatus,
    tryPurchase
  } = reservationProcess;

  useEffect(() => {
    if (reservationData) {
      setLocalReservationData(reservationData);
    }
  }, [reservationData]);

  // Função definida no escopo para processamento da reserva
  async function processReservation() {
    // Previne execução múltipla
    if (processingRef.current) {
      console.log("Processamento já iniciado, ignorando chamada...");
      return;
    }
    
    processingRef.current = true;
    
    console.log("Iniciando processamento de reserva");
    try {
      // Primeiro verifica se o usuário já comprou o ingresso
      try {
        const reservations = await api.users.getReservations();
        const currentReservation = reservations.find((res: any) => res.eventId === eventId);
        
        if (currentReservation && currentReservation.status === 'Pago') {
          console.log("Usuário já comprou este ingresso");
          // Redireciona para a página de ingressos
          router.push('/meus-ingressos');
          return;
        }
      } catch (error) {
        console.error("Erro ao verificar ingressos existentes:", error);
        // Continua com o fluxo normal em caso de erro
      }
      
      // Verifica se já existe reserva salva no localStorage
      const savedReservation = localStorage.getItem('reservationData');
      if (savedReservation) {
        try {
          const parsed = JSON.parse(savedReservation);
          if (parsed.eventId === eventId) {
            console.log("Reserva existente encontrada no localStorage");
            
            // Verifica o status da reserva para garantir que ainda é válida
            const reservationStatus = await checkReservationStatus();
            
            if (reservationStatus.status === 'cancelled') {
              console.log("Reserva existente está cancelada");
              setLocalReservationData(parsed);
              setStep('cancelled');
              return;
            } else if (reservationStatus.status === 'waiting') {
              console.log("Usuário está na lista de espera");
              setLocalReservationData(parsed);
              setStep('waiting');
              return;
            } else if (reservationStatus.status === 'pago') {
              console.log("Usuário já pagou");
              router.push('/meus-ingressos');
              return;
            }
            
            setLocalReservationData(parsed);
            setStep('existing');
            return;
          }
        } catch (e) {
          console.error("Erro ao processar reserva salva:", e);
          // Ignora erro de parse
        }
      }

      // Verifica disponibilidade
      console.log("Verificando disponibilidade");
      setStep('checking');
      const isAvailable = await checkSpotAvailability();
      console.log("Disponibilidade:", isAvailable);
      if (!isAvailable) {
        setStep('error');
        return;
      }

      // Tenta fazer reserva
      console.log("Reservando vaga");
      setStep('reserving');
      const response = await reserveSpot();
      if (response) {
        console.log("Reserva bem-sucedida:", response);
        setStep('success');
      } else if (isError) {
        console.log("Erro na reserva");
        setStep('error');
      } else {
        // Verifica reservas existentes
        console.log("Verificando reservas existentes");
        const existingReservation = await fetchUserReservations();
        if (existingReservation) {
          console.log("Reserva existente encontrada na API:", existingReservation);
          setStep('existing');
        } else {
          console.log("Nenhuma reserva encontrada");
          setStep('error');
        }
      }
    } catch (error) {
      console.error("Erro no processamento:", error);
      setStep('error');
    }
  }

  useEffect(() => {
    processReservation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProceedToCheckout = async () => {
    try {
      setStep('reserving'); // Mostra loader enquanto processa
      
      console.log("Iniciando processo de compra para o evento:", eventId);
      
      // NOVA LÓGICA: Verifica se estamos no estado 'success' (reserva recém-criada)
      if (step === 'success') {
        console.log("Reserva recém-criada, usando purchase diretamente...");
        try {
          // Chama a API para verificar o status e iniciar o processo de compra
          const result = await purchaseTicket(eventId);
          console.log("Resultado da verificação de status:", result);
          
          // Se chegou aqui, o status é 'reserved' e pode prosseguir
          // Verifica se temos dados da reserva para salvar
          if (localReservationData) {
            localStorage.setItem('reservationData', JSON.stringify(localReservationData));
            localStorage.setItem('reservationTimestamp', new Date().toISOString());
          }
          
          // Redireciona para o checkout
          router.push(`/checkout/${eventId}`);
          return;
        } catch (error) {
          console.error("Erro ao usar purchaseTicket:", error);
          setStep('error');
          return;
        }
      }
      
      // Se não estamos no estado 'success', segue o fluxo original
      // Verifica se há uma reserva existente para o evento
      const savedReservation = localStorage.getItem('reservationData');
      const hasExistingReservation = savedReservation && JSON.parse(savedReservation).eventId === eventId;
      
      if (hasExistingReservation) {
        // Se já existe uma reserva, usa o retry para verificar status e obter tempo restante
        try {
          console.log("Reserva existente encontrada, verificando status com retry...");
          const retryResult = await tryPurchase(eventId);
          console.log("Resultado da verificação com retry:", retryResult);
          
          if (retryResult) {
            // Verifica o status da reserva para tomar a ação adequada
            if (retryResult.status === "waiting") {
              setStep('waiting');
              return;
            } else if (retryResult.status === "expired" || retryResult.status === "cancelled") {
              setStep('cancelled');
              return;
            } else if (retryResult.status === "pago") {
              router.push('/meus-ingressos');
              return;
            } else if (retryResult.status === "reserved" && retryResult.remainingMinutes) {
              // Se a reserva ainda é válida e temos o tempo restante, salvamos os dados
              console.log(`Reserva válida. Tempo restante: ${retryResult.remainingMinutes} minutos`);
              
              // Se temos os dados da reserva local, os atualizamos com as informações mais recentes
              if (localReservationData) {
                const updatedReservationData = {
                  ...localReservationData,
                  status: retryResult.status,
                  // Se a API retornar um ID, usamos ele
                  id: retryResult.id || localReservationData.id,
                  // Se a API retornar um preço, usamos ele
                  price: retryResult.price || localReservationData.price
                };
                
                localStorage.setItem('reservationData', JSON.stringify(updatedReservationData));
              }
              
              // Redireciona para o checkout
              router.push(`/checkout/${eventId}`);
              return;
            }
          }
        } catch (retryError) {
          console.error("Erro ao usar retryPurchase:", retryError);
        }
      } else {
        // Se não existe reserva, usa o purchase para criar uma nova
        try {
          console.log("Nenhuma reserva existente encontrada, usando purchase...");
          // Chama a API para verificar o status e iniciar o processo de compra
          const result = await purchaseTicket(eventId);
          console.log("Resultado da verificação de status:", result);
          
          // Verifica o status da reserva para tomar a ação adequada
          if (typeof result === 'string') {
            // Se o resultado for uma string, é o status diretamente
            if (result === 'waiting') {
              // Mostra componente da lista de espera
              setStep('waiting');
              return;
            } else if (result === 'cancelled' || result === 'expired') {
              // Mostra componente de reserva cancelada/expirada
              setStep('cancelled');
              return;
            } else if (result === 'pago') {
              // Redireciona para página de ingressos
              router.push('/meus-ingressos');
              return;
            }
          } else if (result && result.status) {
            // Se for objeto, verifica a propriedade status
            if (result.status === 'waiting') {
              setStep('waiting');
              return;
            } else if (result.status === 'cancelled' || result.status === 'expired') {
              setStep('cancelled');
              return;
            } else if (result.status === 'pago') {
              router.push('/meus-ingressos');
              return;
            }
          }
        } catch (purchaseError) {
          console.error("Erro ao usar purchaseTicket:", purchaseError);
        }
      }
      
      // Se chegou aqui, o status é 'available' ou 'reserved' e pode prosseguir
      // Salva os dados da reserva no localStorage para que o checkout possa acessá-los
      if (localReservationData) {
        localStorage.setItem('reservationData', JSON.stringify(localReservationData));
        localStorage.setItem('reservationTimestamp', new Date().toISOString());
      }
      
      // Redireciona para o checkout com suporte a PIX e timer
      router.push(`/checkout/${eventId}`);
    } catch (error) {
      console.error("Erro ao processar compra:", error);
      setStep('error');
    }
  };

  const handleTryAgain = () => {
    processingRef.current = false; // Reseta o flag para permitir novo processamento
    processReservation();
  };

  const renderContent = () => {
    switch (step) {
      case 'checking':
        return (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
            <h2 className="text-2xl font-semibold mb-3 text-center">Verificando disponibilidade</h2>
            <p className="text-muted-foreground text-center max-w-xs">
              Estamos verificando se existem vagas disponíveis para este evento.
            </p>
          </div>
        );

      case 'reserving':
        return (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
            <h2 className="text-2xl font-semibold mb-3 text-center">Processando</h2>
            <p className="text-muted-foreground text-center max-w-xs">
              Estamos processando sua solicitação, por favor aguarde.
            </p>
          </div>
        );

      case 'existing':
        return (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <AlertTriangle className="w-16 h-16 text-amber-500 mb-6" />
            <h2 className="text-2xl font-semibold mb-3 text-center">Você já possui uma reserva</h2>
            <p className="text-muted-foreground text-center mb-8 max-w-xs">
              Você já possui uma reserva de ingresso para este evento. Prossiga para o checkout para finalizar a compra.
            </p>
            <Button size="lg" className="w-full max-w-xs" onClick={handleProceedToCheckout}>
              Continuar para pagamento
            </Button>
          </div>
        );
      
      case 'cancelled':
        return (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <XCircle className="w-16 h-16 text-destructive mb-6" />
            <h2 className="text-2xl font-semibold mb-3 text-center">Sua reserva foi cancelada ou expirou</h2>
            <p className="text-muted-foreground text-center mb-8 max-w-xs">
              Sua última tentativa de reserva foi cancelada ou expirou. Para tentar novamente, clique no botão abaixo e realize uma nova reserva para este evento.
            </p>
            <Button size="lg" className="w-full max-w-xs" onClick={handleTryAgain}>
              Fazer nova reserva
            </Button>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
            <h2 className="text-2xl font-semibold mb-3 text-center">Reserva realizada!</h2>
            <p className="text-muted-foreground text-center mb-2 max-w-xs">
              Você tem 10 minutos para concluir a compra.
            </p>
            <p className="text-sm text-muted-foreground mb-8 max-w-xs text-center">
              Após esse período, a reserva será cancelada automaticamente. Avance para o pagamento.
            </p>
            <Button size="lg" className="w-full max-w-xs" onClick={handleProceedToCheckout}>
              Continuar para pagamento
            </Button>
          </div>
        );

      case 'waiting':
        return (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <AlertTriangle className="w-16 h-16 text-amber-500 mb-6" />
            <h2 className="text-2xl font-semibold mb-3 text-center">Você está na lista de espera</h2>
            <p className="text-muted-foreground text-center mb-8 max-w-xs">
              Você está na lista de espera para este evento. Caso uma vaga seja disponibilizada, você será notificado.
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <XCircle className="w-16 h-16 text-destructive mb-6" />
            <h2 className="text-2xl font-semibold mb-3 text-center">Erro na reserva</h2>
            <p className="text-muted-foreground text-center mb-6 max-w-xs">
              {isWaitingList 
                ? 'Não há mais vagas disponíveis para este evento. Você entrou para a lista de espera.'
                : errorMessage || 'Ocorreu um erro ao processar sua reserva. Por favor, tente novamente.'}
            </p>
            {!isWaitingList && (
              <Button size="lg" className="w-full max-w-xs" onClick={handleTryAgain}>Tentar novamente</Button>
            )}
            {isWaitingList && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Lista de espera</AlertTitle>
                <AlertDescription>
                  Você está na lista de espera. Caso uma vaga seja disponibilizada, você será notificado.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background py-10 px-2">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-0">
            <CardTitle className="text-3xl font-bold mb-2">Reserva de Ingresso</CardTitle>
            <CardDescription className="text-base mb-2">
              Reserve seu ingresso para o evento
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
} 