"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Event } from '@/types/event';
import { motion } from 'framer-motion';
import { Ticket, MapPin, Calendar, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import AnimatedBackground from '@/components/ui/animated-background';
import PaymentForm from '@/components/checkout/payment-form';
import { NotificationToast, NotificationToastRef } from '@/components/notifications/notification-toast';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { auth } from '@/lib/firebase';

interface ReservationData {
  spotId: string;
  email: string;
  eventId: string;
  userType: 'client' | 'staff';
  status: string;
}

interface CheckoutClientProps {
  eventId: string;
  spotId?: string;
  ticketKind?: string;
}

export default function CheckoutClient({ eventId, spotId, ticketKind }: CheckoutClientProps) {
  const router = useRouter();
  const notificationRef = useRef<NotificationToastRef>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservationData, setReservationData] = useState<ReservationData | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const data = await api.events.get(eventId);
        setEvent(data);
      } catch (e: any) {
        setError('Evento não encontrado ou acesso expirado.');
      } finally {
        setLoading(false);
      }
    }

    async function fetchReservationStatus() {
      try {
        // Busca o status da reserva
        const response = await api.tickets.purchase(eventId);
        const status = typeof response === 'string' ? response : (response?.status || 'reserved');
        
        // Redireciona com base no status
        if (status === 'waiting') {
          // Redireciona para página da lista de espera
          router.push(`/reserva/${eventId}/${ticketKind || 'full'}`);
          return;
        } else if (status === 'cancelled') {
          // Redireciona para fazer nova reserva
          router.push(`/reserva/${eventId}/${ticketKind || 'full'}`);
          return;
        } else if (status === 'pago') {
          // Redireciona para página de ingressos
          router.push('/meus-ingressos');
          return;
        }
        
        // Se chegou aqui, o status é "available" ou "reserved"
        if (spotId) {
          setReservationData({
            spotId,
            email: auth.currentUser?.email || '',
            eventId,
            userType: 'client',
            status
          });
        }
      } catch (error) {
        console.error('Erro ao buscar status da reserva:', error);
        // Se não conseguir buscar o status, ainda permite continuar com status default
        if (spotId) {
          setReservationData({
            spotId,
            email: auth.currentUser?.email || '',
            eventId,
            userType: 'client',
            status: 'reserved'
          });
        }
      }
    }

    // Observa mudanças no estado de autenticação
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setError('Você precisa estar logado para acessar esta página.');
        setLoading(false);
        return;
      }
      fetchEvent();
      if (spotId) {
        fetchReservationStatus();
      }
    });

    // Cleanup da inscrição quando o componente for desmontado
    return () => unsubscribe();
  }, [eventId, spotId]);

  // Função para processar o pagamento
  const handleProcessPayment = async (paymentData: any) => {
    try {
      await api.payments.create(paymentData);
      notificationRef.current?.showNotification(
        'Pagamento realizado com sucesso! Seu ingresso foi enviado para seu e-mail.',
        'success'
      );
      router.push('/conta/ingressos');
    } catch (error: any) {
      handlePaymentError(error);
    }
  };

  // Função para tratar erros de pagamento
  const handlePaymentError = (error: any) => {
    console.error("Erro no pagamento:", error);
    
    // Verifica o tipo específico de erro
    if (error?.message?.includes("Valor menor que o ingresso")) {
      notificationRef.current?.showNotification(
        'O valor do pagamento é menor que o preço do ingresso. Por favor, tente novamente.',
        'error'
      );
    } else {
      notificationRef.current?.showNotification(
        error?.message || 'Erro ao processar pagamento. Por favor, tente novamente.',
        'error'
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando evento...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-card rounded-lg border border-border p-8 max-w-md w-full text-center space-y-4">
          <h2 className="text-xl font-semibold">Erro</h2>
          <p className="text-muted-foreground">
            {error || 'Não foi possível carregar o evento.'}
          </p>
          <Button onClick={() => router.push('/eventos')}>
            Voltar para Eventos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AnimatedBackground className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <h1 className="text-2xl font-bold mb-6">Finalizar Compra</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Informações do Evento */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <Ticket className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold">{event.name}</h2>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(event.date).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Valor do Ingresso</span>
                    <span className="font-semibold">{formatCurrency(event.price)}</span>
                  </div>
                </div>
              </div>
              {/* Formulário de Pagamento */}
              <div>
                <PaymentForm
                  event={event}
                  spotId={spotId}
                  reservationData={reservationData || undefined}
                  onSubmit={handleProcessPayment}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <NotificationToast ref={notificationRef} />
    </AnimatedBackground>
  );
} 