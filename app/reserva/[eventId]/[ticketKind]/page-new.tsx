'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { ProtectedRoute } from '@/src/features/auth';
import { useCurrentEventContext } from '@/contexts/CurrentEventContext';
import { useEventStorage } from '@/hooks/useEventStorage';
import { useReservationFlow } from '@/hooks/useReservationFlow';
import { WaitingListScreen } from '@/components/waiting-room/WaitingListScreen';

interface ReservationPageProps {
  params: {
    eventId: string;
    ticketKind: string;
  };
}

export default function ReservationPage({ params }: ReservationPageProps) {
  const eventId = decodeURIComponent(params.eventId);
  const ticketKind = params.ticketKind;
  
  const router = useRouter();
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState('');
  
  const { currentEvent, setCurrentEventByName, setCurrentEventFromData } = useCurrentEventContext();
  const { selectedEvent } = useEventStorage();

  // Hook do fluxo de reserva
  const {
    state,
    loading,
    error,
    reservation,
    isInWaitingList,
    checkAndReserve,
    reset,
  } = useReservationFlow();

  // Carregar evento no contexto
  useEffect(() => {
    if (selectedEvent && selectedEvent.eventStatus && selectedEvent.name === eventId) {
      if (!currentEvent || currentEvent.name !== selectedEvent.name) {
        setCurrentEventFromData(selectedEvent.eventStatus);
      }
    } else if (eventId && eventId !== 'undefined' && (!currentEvent || currentEvent.name !== eventId)) {
      setCurrentEventByName(eventId);
    }
  }, [eventId, selectedEvent?.savedAt, currentEvent?.name, setCurrentEventByName, setCurrentEventFromData]);

  // Processar reserva automaticamente quando o componente montar
  useEffect(() => {
    if (currentEvent && state === 'idle') {
      handleReserve();
    }
  }, [currentEvent, state]);

  const handleReserve = async () => {
    try {
      await checkAndReserve(eventId, 'client');
    } catch (err: any) {
      // Tratamento de erros específicos
      if (err.message?.includes('já possui') || err.message?.includes('ingresso pago')) {
        setDuplicateMessage(err.message);
        setShowDuplicateModal(true);
      }
    }
  };

  // Redirecionar para checkout quando reserva for criada
  useEffect(() => {
    if (state === 'reserved' && reservation) {
      console.log('[ReservationPage] Reserva criada, redirecionando para checkout');
      // Salvar dados da reserva
      localStorage.setItem('reservationData', JSON.stringify(reservation));
      localStorage.setItem('reservationTimestamp', new Date().toISOString());
      
      router.push(`/checkout/${encodeURIComponent(eventId)}`);
    }
  }, [state, reservation, eventId, router]);

  // Se foi adicionado à fila de espera, mostrar tela apropriada
  if (isInWaitingList || state === 'waitingList') {
    return (
      <ProtectedRoute>
        <WaitingListScreen 
          eventId={eventId}
          eventName={currentEvent?.name || eventId}
          onPromoted={() => {
            // Quando promovido, recarregar a página de reserva
            reset();
            handleReserve();
          }}
        />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {/* Estado: Verificando */}
            {state === 'checking' && (
              <>
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
                <CardTitle>Verificando Disponibilidade</CardTitle>
                <CardDescription>
                  Aguarde enquanto verificamos se há vagas disponíveis...
                </CardDescription>
              </>
            )}

            {/* Estado: Reservando */}
            {state === 'reserving' && (
              <>
                <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="w-10 h-10 text-orange-600 dark:text-orange-400 animate-spin" />
                </div>
                <CardTitle>Criando Reserva</CardTitle>
                <CardDescription>
                  Reservando sua vaga...
                </CardDescription>
              </>
            )}

            {/* Estado: Reservado (sucesso) */}
            {state === 'reserved' && (
              <>
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-green-600 dark:text-green-400">
                  Reserva Criada!
                </CardTitle>
                <CardDescription>
                  Redirecionando para pagamento...
                </CardDescription>
              </>
            )}

            {/* Estado: Erro */}
            {state === 'error' && (
              <>
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-red-600 dark:text-red-400">
                  Erro ao Criar Reserva
                </CardTitle>
                <CardDescription>
                  Ocorreu um erro ao processar sua reserva
                </CardDescription>
              </>
            )}

            {/* Estado: Idle/Carregando */}
            {state === 'idle' && loading && (
              <>
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-900/20 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="w-10 h-10 text-gray-600 dark:text-gray-400 animate-spin" />
                </div>
                <CardTitle>Carregando</CardTitle>
                <CardDescription>
                  Preparando sua reserva...
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Mensagem de erro */}
            {error && state === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Botão de tentar novamente */}
            {state === 'error' && (
              <div className="space-y-2">
                <Button 
                  onClick={handleReserve} 
                  className="w-full gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Tentar Novamente'
                  )}
                </Button>
                <Button 
                  onClick={() => router.push('/eventos')} 
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  Voltar para Eventos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de reserva duplicada */}
      <Dialog open={showDuplicateModal} onOpenChange={setShowDuplicateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Reserva já existente
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              {duplicateMessage || 'Você já possui uma reserva para este evento.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDuplicateModal(false);
                router.push('/eventos');
              }}
            >
              Ver outros eventos
            </Button>
            <Button
              onClick={() => {
                setShowDuplicateModal(false);
                router.push('/meus-ingressos');
              }}
            >
              Ver meus ingressos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
