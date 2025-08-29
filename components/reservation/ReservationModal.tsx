import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Event } from '@/types/event';
import { reservationService } from '@/services/reservationService';
import { formatCurrency } from '@/lib/utils';
import { NotificationToast, NotificationToastRef } from '@/components/notifications/notification-toast';

interface ReservationModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reservationData: any) => void;
}

export function ReservationModal({ event, isOpen, onClose, onSuccess }: ReservationModalProps) {
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef<NotificationToastRef>(null);

  const handleReservation = async () => {
    try {
      setLoading(true);
      
      // Primeiro verifica disponibilidade
      const availability = await reservationService.checkAvailability(event.uuid);
      
      // if (!availability.isAvailable) {
      //   notificationRef.current?.showNotification(
      //     "Não há vagas disponíveis no momento. Você será redirecionado para a lista de espera.",
      //     "warning"
      //   );
      //   // Redirecionar para lista de espera
      //   window.location.href = `/fila?event=${event.uuid}`;
      //   return;
      // }

      // Se há vaga, tenta criar a reserva
      const reservation = await reservationService.createReservation({
        eventId: event.uuid,
        ticketKind: 'inteira'
      });

      notificationRef.current?.showNotification(
        "Reserva realizada com sucesso. Você será redirecionado para o pagamento.",
        "success"
      );

      onSuccess(reservation);
      
    } catch (error) {
      notificationRef.current?.showNotification(
        "Não foi possível realizar a reserva. Tente novamente.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Reserva</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm space-y-2">
              <p><strong>Evento:</strong> {event.name}</p>
              <p><strong>Data:</strong> {new Date(event.startDate).toLocaleDateString('pt-BR')}</p>
              <p><strong>Valor:</strong> {formatCurrency(event.price)}</p>
            </div>

            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={handleReservation}
                disabled={loading}
              >
                {loading ? "Processando..." : "Confirmar Reserva"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <NotificationToast ref={notificationRef} />
    </>
  );
} 