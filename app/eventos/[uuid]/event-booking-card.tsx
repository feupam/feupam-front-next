import { Event } from '@/types/event';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ticket, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTicketAvailability } from '@/hooks/useTicketAvailability';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { NotificationToastRef } from '@/types/notification';
import userService from '@/services/userService';
import { auth } from '@/lib/firebase';
import { isProfileComplete } from '@/lib/utils/profile';

interface EventBookingCardProps {
  event: Event;
  notificationRef: React.RefObject<NotificationToastRef>;
}

export function EventBookingCard({ event, notificationRef }: EventBookingCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [profileIsComplete, setProfileIsComplete] = useState(false);
  const router = useRouter();
  
  const { availabilityMap, isLoading, error } = useTicketAvailability({
    eventId: event.uuid,
    tickets: event.tickets
  });

  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        if (auth.currentUser) {
          setIsCheckingProfile(true);
          const userProfile = await userService.getProfile();
          setProfileIsComplete(isProfileComplete(userProfile));
        }
      } catch (error) {
        setProfileIsComplete(false);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkUserProfile();
  }, []);

  const handleBooking = (ticketId: string) => {
    if (!availabilityMap[ticketId]) {
      notificationRef.current?.showNotification(
        'Este ingresso não está mais disponível',
        'error'
      );
      return;
    }

    // Se o perfil não estiver completo, redireciona para a página de edição com retorno para checkout
    if (!profileIsComplete) {
      router.push(`/perfil/editar/${event.uuid}`);
      return;
    }

    // Se o perfil estiver completo, continua normalmente para o checkout
    router.push(`/checkout/${event.uuid}?ticket=${ticketId}`);
  };

  if (error) {
    notificationRef.current?.showNotification(
      'Erro ao verificar disponibilidade dos ingressos',
      'error'
    );
  }

  return (
    <div className="sticky top-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">Informações do Ingresso</h3>
        <p className="mt-2 text-sm text-gray-600">
          Data: {format(new Date(event.date), "dd 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      <div className="mb-6 space-y-4">
        {event.tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center gap-3">
              <Ticket className="h-5 w-5 text-gray-600" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{ticket.name}</p>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : (
                    <Badge variant={availabilityMap[ticket.id] ? "secondary" : "destructive"}>
                      {availabilityMap[ticket.id] ? "Disponível" : "Esgotado"}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {ticket.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(ticket.price)}
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => handleBooking(ticket.id)}
                      className="mt-2"
                      size="sm"
                      disabled={isLoading || isCheckingProfile || !availabilityMap[ticket.id]}
                    >
                      {(isLoading || isCheckingProfile) ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Comprar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {!availabilityMap[ticket.id] 
                      ? "Ingresso esgotado" 
                      : isCheckingProfile
                        ? "Verificando perfil..."
                        : "Clique para comprar"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-gray-600">
        Ingressos limitados. Reserve já o seu!
      </p>
    </div>
  );
} 