'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useReservationProcess, ReservationData } from '@/hooks/useReservationProcess';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
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
  // Decodificar o eventId caso tenha caracteres especiais
  const eventId = decodeURIComponent(params.eventId);
  const ticketKind = params.ticketKind;
  
  console.log('[ReservationPage] Params recebidos:', params);
  console.log('[ReservationPage] EventId decodificado:', eventId);
  console.log('[ReservationPage] TicketKind:', ticketKind);
  
  const [step, setStep] = useState<'checking' | 'reserving' | 'existing' | 'success' | 'error' | 'waiting'>('checking');
  const [customErrorMessage, setCustomErrorMessage] = useState<string>('');
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

  // Removido: Não redireciona mais para /perfil
  // Permite que usuários com reservas pendentes continuem para checkout mesmo se evento não estiver aberto

  // Initialize hook
  const reservationProcess = useReservationProcess(
    eventId && ticketKind ? { eventId, ticketKind } : undefined
  );

  const {
    isLoading,
    isError,
    errorMessage,
    reservationData,
    isWaitingList,
    checkSpotAvailability,
    reserveSpot,
    fetchUserReservations,
    checkReservationStatus,
  } = reservationProcess;

  useEffect(() => {
    if (reservationData) {
      setLocalReservationData(reservationData);
    }
  }, [reservationData]);

  // Função principal de processamento da reserva
  async function processReservation() {
    if (processingRef.current) {
      console.log("Processamento já iniciado, ignorando chamada...");
      return;
    }
    
    processingRef.current = true;
    
    console.log("Iniciando processamento de reserva");
    try {
      // 1. Verifica se o usuário já comprou o ingresso ou tem reserva pendente
      console.log("1. Verificando se já comprou o ingresso ou tem reserva...");
      try {
        const reservations = await api.users.getReservations();
        const currentReservation = reservations.find((res: any) => res.eventName === eventId);
        
        if (currentReservation && currentReservation.status === 'Pago') {
          console.log("Usuário já comprou este ingresso");
          router.push('/meus-ingressos');
          return;
        }
        
        // Se há reserva pendente (não paga), verificar disponibilidade e redirecionar para checkout
        if (currentReservation && currentReservation.status !== 'Pago') {
          console.log("Usuário já possui reserva pendente na API:", currentReservation);
          
          // Verificar se ainda há vagas disponíveis
          console.log("2. Verificando disponibilidade de vagas...");
          setStep('checking');
          const isAvailable = await checkSpotAvailability();
          console.log("Disponibilidade:", isAvailable);
          
          if (!isAvailable) {
            console.log("Não há vagas disponíveis");
            setStep('error');
            return;
          }
          
          // Se há vagas e já tem reserva, ir direto para o checkout
          console.log("Reserva existente válida, redirecionando para checkout");
          setLocalReservationData(currentReservation);
          
          // Salvar dados no localStorage e redirecionar
          localStorage.setItem('reservationData', JSON.stringify(currentReservation));
          localStorage.setItem('reservationTimestamp', new Date().toISOString());
          
          router.push(`/checkout/${eventId}`);
          return;
        }
        
        console.log("Nenhuma reserva encontrada na API, criando nova");
      } catch (error) {
        console.error("Erro ao verificar reservas na API:", error);
      }
      
      // 2. Verifica disponibilidade de vagas para nova reserva
      console.log("2. Verificando disponibilidade de vagas...");
      setStep('checking');
      const isAvailable = await checkSpotAvailability();
      console.log("Disponibilidade:", isAvailable);
      
      if (!isAvailable) {
        console.log("Não há vagas disponíveis");
        setStep('error');
        return;
      }
      
      // 3. Limpa localStorage antigo se existir
      console.log("3. Limpando dados antigos do localStorage...");
      localStorage.removeItem('reservationData');
      localStorage.removeItem('reservationTimestamp');

      // 4. Faz nova reserva
      console.log("4. Fazendo nova reserva...");
      setStep('reserving');
      
      const response = await reserveSpot();
      if (response) {
        console.log("Resposta da reserva:", response);
        
        // Se a resposta contém indicadores de reserva já existente no spotId
        if (response.spotId?.includes('existing') || response.spotId?.includes('fallback') || response.spotId?.includes('409')) {
          console.log("Reserva já existia");
          setStep('existing');
        } else {
          console.log("Nova reserva criada com sucesso");
          setStep('success');
        }
      } else {
        console.log("Erro na reserva");
        // Captura mensagem de erro da API
        if (errorMessage) {
          setCustomErrorMessage(errorMessage);
        }
        setStep('error');
      }
    } catch (error) {
      console.error("Erro no processamento:", error);
      // Tenta capturar mensagem do erro
      if (error instanceof Error) {
        setCustomErrorMessage(error.message);
      }
      setStep('error');
    }
  }

  useEffect(() => {
    processReservation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProceedToCheckout = async () => {
    try {
      console.log("Redirecionando para checkout:", eventId);
      
      // Salva os dados da reserva no localStorage
      if (localReservationData) {
        localStorage.setItem('reservationData', JSON.stringify(localReservationData));
        localStorage.setItem('reservationTimestamp', new Date().toISOString());
      }
      
      router.push(`/checkout/${eventId}`);
    } catch (error) {
      console.error("Erro ao processar compra:", error);
      setStep('error');
    }
  };

  const handleTryAgain = () => {
    processingRef.current = false;
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

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
            <h2 className="text-2xl font-semibold mb-3 text-center">Reserva realizada!</h2>
            <p className="text-muted-foreground text-center mb-2 max-w-xs">
              Você tem 5 minutos para concluir a compra.
            </p>
            <p className="text-sm text-muted-foreground mb-8 max-w-xs text-center">
              Após esse período, a reserva será cancelada automaticamente e você voltará para a fila.
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
            <h2 className="text-2xl font-semibold mb-3 text-center">
              {isWaitingList ? 'Lista de espera' : 'Erro na reserva'}
            </h2>
            <p className="text-muted-foreground text-center mb-6 max-w-xs">
              {isWaitingList 
                ? 'Não há mais vagas disponíveis para este evento. Você entrou para a lista de espera.'
                : (customErrorMessage || errorMessage || 'Não foi possível processar sua reserva. Tente novamente mais tarde ou entre em contato conosco.')}
            </p>
            {!isWaitingList && (
              <Button size="lg" className="w-full max-w-xs" onClick={handleTryAgain}>
                Tentar novamente
              </Button>
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
            <CardTitle className="text-3xl font-bold mb-2">Reserva de Inscrição</CardTitle>
            <CardDescription className="text-base mb-2">
              Reserve Sua Inscrição para o evento
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