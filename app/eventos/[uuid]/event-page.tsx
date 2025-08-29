'use client';

import { Event } from '@/types/event';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCheckSpot } from '@/hooks/useCheckSpot';
import { useReserveSpot } from '@/hooks/useReserveSpot';
import { auth } from '@/lib/firebase';
import userService from '@/services/userService';
import { api } from '@/services/api';
import { useState, useEffect } from 'react';
import { isProfileComplete } from '@/lib/utils/profile';

type PaymentData = any;

interface EventPageProps {
  event: Event;
}

export default function EventPage({ event }: EventPageProps) {
  const router = useRouter();
  const { checkSpot, isChecking } = useCheckSpot();
  const { reserveSpot, isReserving } = useReserveSpot();
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [profileIsComplete, setProfileIsComplete] = useState(false);

  const userEmail = typeof window !== 'undefined' ? auth.currentUser?.email : undefined;

  // Verifica se o perfil do usuário está completo
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

  const handleBooking = async () => {
    // Se o perfil não estiver completo, redireciona para a página de edição com retorno para checkout
    if (!profileIsComplete) {
      router.push(`/perfil/editar/${event.uuid}`);
      return;
    }

    const hasSpot = await checkSpot(event.uuid);
    if (!hasSpot) return;
    try {
      const reservation = await reserveSpot(event.uuid, 'full');
      if (reservation?.spotId) {
        const paymentData: PaymentData & { spotId?: string } = {
          items: [{
            amount: event.price,
            description: event.uuid
          }],
          customer: {
            email: userEmail || reservation.email || '',
          },
          spotId: reservation.spotId
        };
        router.push(`/checkout/${event.uuid}?spotId=${reservation.spotId}`);
      }
    } catch (error: any) {
      // Se já tem reserva, redireciona para o checkout
      if (
        error?.statusCode === 409 &&
        error?.message === 'User already has a reservation for this event'
      ) {
        const spotId = error?.spotId || '';
        const paymentData: PaymentData & { spotId?: string } = {
          items: [{
            amount: event.price,
            description: event.uuid
          }],
          customer: {
            email: userEmail || '',
          },
          spotId: spotId
        };
        router.push(`/checkout/${event.uuid}?spotId=${spotId}`);
        return;
      }
      // O toast já é tratado no hook
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho do Evento */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">{event.name}</h1>
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{event.maxGeneralSpots} vagas totais</span>
            </div>
          </div>
        </div>

        {/* Distribuição de Vagas */}
        <Card className="mb-8 p-6 bg-card border-border">
          <h2 className="text-xl font-semibold text-foreground mb-6">Distribuição de Vagas</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Staff</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Masculino:</span>
                  <span className="text-foreground font-medium">{event.maxStaffMale} vagas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Feminino:</span>
                  <span className="text-foreground font-medium">{event.maxStaffFemale} vagas</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Participantes</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Masculino:</span>
                  <span className="text-foreground font-medium">{event.maxClientMale} vagas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Feminino:</span>
                  <span className="text-foreground font-medium">{event.maxClientFemale} vagas</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Valor do Ingresso */}
        <Card className="p-6 bg-card">
          <h2 className="text-xl font-semibold mb-6">Valor do Ingresso</h2>
          
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium text-foreground">Ingresso</p>
              <p className="text-sm text-muted-foreground">Ingresso para o evento</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(event.price)}
              </p>
              <Button 
                className="mt-2"
                size="sm"
                onClick={handleBooking}
                disabled={isChecking || isReserving || isCheckingProfile}
              >
                {(isChecking || isReserving || isCheckingProfile) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Comprar'
                )}
              </Button>
            </div>
          </div>
          
          {event.cupons && event.cupons.length > 0 && (
            <>
              <h3 className="text-base font-medium mb-3">Cupons Disponíveis</h3>
              <div className="space-y-3 mb-6">
                {event.cupons.map((cupon, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <span className="text-foreground">{cupon.name}</span>
                    <span className="text-primary font-medium">{cupon.discount}% OFF</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
} 