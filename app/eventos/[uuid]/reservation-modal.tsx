import { useState } from 'react';
import { Event } from '@/types/event';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface ReservationModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export function ReservationModal({ event, isOpen, onClose, onSuccess }: ReservationModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const handleReservation = async () => {
    if (!selectedTicket) return;

    try {
      setLoading(true);
      const response = await api.events.checkSpot(event.uuid, selectedTicket);
      
      // if (response.isAvailable) {
      //   const reservationData = await api.events.reserveSpot(event.uuid, {
      //       ticket_kind: selectedTicket,
      //       userType: "client"
      //     });
      //     onSuccess(reservationData);
      // } else {
      //   // Mostrar mensagem de lista de espera
      // }
    } catch (error) {
      console.error('Erro ao fazer reserva:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reservar Ingresso</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {event.tickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                selectedTicket === ticket.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTicket(ticket.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{ticket.name}</p>
                  <p className="text-sm text-gray-600">{ticket.description}</p>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(ticket.price)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleReservation}
            disabled={!selectedTicket || loading}
          >
            {loading ? 'Reservando...' : 'Confirmar Reserva'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 