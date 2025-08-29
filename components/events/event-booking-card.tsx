"use client";

import { useRouter } from 'next/navigation';
import { Event } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Ticket, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import userService from '@/services/userService';
import { auth } from '@/lib/firebase';
import { isProfileComplete } from '@/lib/utils/profile';

interface EventBookingCardProps {
  event: Event;
}

export function EventBookingCard({ event }: EventBookingCardProps) {
  const router = useRouter();
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [profileIsComplete, setProfileIsComplete] = useState(false);

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

  const handleBooking = () => {
    // Se o perfil não estiver completo, redireciona para a página de edição com retorno para checkout
    if (!profileIsComplete) {
      router.push(`/perfil/editar/${event.uuid}?ticketKind=full`);
      return;
    }

    // Se o perfil estiver completo, redireciona para a página de reserva
    router.push(`/reserva/${event.uuid}/full`);
  };

  return (
    <Card className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Valor do Ingresso</h2>

      {event.cupons && event.cupons.length > 0 && (
        <>
          <h3 className="text-base font-medium mb-3">Cupons Disponíveis</h3>
          <div className="mb-6">
            {event.cupons.map((cupon, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-900">{cupon.name}</span>
                </div>
                <span className="text-green-600 font-medium">{cupon.discount}% OFF</span>
              </div>
            ))}
          </div>
        </>
      )}

      <Button 
        className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
        size="lg"
        onClick={handleBooking}
        disabled={isCheckingProfile}
      >
        {isCheckingProfile ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verificando...
          </>
        ) : (
          'Comprar Ingresso'
        )}
      </Button>
    </Card>
  );
}