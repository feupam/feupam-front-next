'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { eventService } from '@/services/eventService';
import { useCurrentEventContext } from '@/contexts/CurrentEventContext';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Clock, Users, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { EventClosedDialog } from '@/components/events/event-closed-dialog';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';
import { LoadingPage } from '@/components/shared/Loading';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

interface EventDetails {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
  image_capa?: string;
  logo_evento?: string;
  price?: number;
  maxClientMale?: string;
  maxClientFemale?: string;
  cupons?: any[];
  tickets?: any[];
}

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventName = params.eventName as string;
  const fromProfile = searchParams.get('fromProfile') === 'true';
  const { currentEvent, setCurrentEventFromData } = useCurrentEventContext();
  
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    async function fetchEventDetails() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('[EventPage] Buscando detalhes do evento:', eventName);
        
        // Busca todos os eventos para encontrar o específico
        const response = await eventService.getEventStatus('federa');
        
        if (response.events && response.events.length > 0) {
          const event = response.events.find(e => 
            e.name.toLowerCase() === decodeURIComponent(eventName).toLowerCase()
          );
          
          if (event) {
            console.log('[EventPage] Evento encontrado:', event);
            // Usa os dados da API diretamente, apenas adiciona propriedades que não existem na API
            const eventWithDefaults = {
              ...event,
              cupons: [], // Array vazio (não vem da API)
              tickets: [] // Array vazio (não vem da API)
            };
            
            setEventDetails(eventWithDefaults);
            
            // Define no contexto se não estiver definido ou for diferente
            if (!currentEvent || currentEvent.name !== event.name) {
              console.log('[EventPage] Atualizando contexto com evento:', event.name);
              setCurrentEventFromData(event);
            }
          } else {
            setError(`Evento "${decodeURIComponent(eventName)}" não encontrado`);
          }
        } else {
          setError('Nenhum evento disponível');
        }
      } catch (err) {
        console.error('[EventPage] Erro ao buscar evento:', err);
        setError('Erro ao carregar detalhes do evento');
      } finally {
        setLoading(false);
      }
    }

    if (eventName) {
      fetchEventDetails();
    }
  }, [eventName, currentEvent, setCurrentEventFromData]);

  // Mostrar diálogo automaticamente se evento estiver fechado
  useEffect(() => {
    if (eventDetails && !eventDetails.isOpen) {
      console.log('[EventPage] Mostrando diálogo - evento fechado');
      // Pequeno delay para garantir que a página carregou completamente
      const timer = setTimeout(() => {
        setShowDialog(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [eventDetails]);

  if (loading) {
    return <LoadingPage text="Carregando evento..." />;
  }

  if (error || !eventDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Evento não encontrado</h2>
          <Button onClick={() => router.push('/home')}>Voltar para Home</Button>
        </div>
      </div>
    );
  }

  const getCapacity = () => {
    const maxMale = Number(eventDetails?.maxClientMale || '0');
    const maxFemale = Number(eventDetails?.maxClientFemale || '0');
    return maxMale + maxFemale;
  };

  const handleEventClick = () => {
    console.log('[EventPage] Clique em inscrição para:', eventDetails.name);
    setCurrentEventFromData(eventDetails);

    router.push('/formulario');

  };

  return (
    <>
      {eventDetails && !eventDetails.isOpen && (
        <EventClosedDialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          startDate={eventDetails.startDate}
          endDate={eventDetails.endDate}
        />
      )}
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] w-full">
        <div className="absolute inset-0">
          <Image
            src={eventDetails.image_capa || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'}
            alt={eventDetails.name}
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        {/* Animated scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="cursor-pointer bg-black/20 rounded-full p-2 backdrop-blur-sm"
            onClick={() => {
              const nextSection = document.querySelector('.container');
              nextSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <ChevronDown className="h-6 w-6 text-white hover:text-white/80 transition-colors" />
          </motion.div>
        </motion.div>

      </section>

      {/* Event Info */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Event Details */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold">Sobre o Evento</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {eventDetails.description || `Um evento incrível que você não pode perder! 
              Uma oportunidade única de vivenciar momentos especiais.`}
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">{formatDate(eventDetails.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium">{formatTime(eventDetails.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Local</p>
                  <p className="font-medium">{eventDetails.location || 'A definir'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Highlights & CTA */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold">Informações da Inscrição</h2>
            <div className="grid gap-6">
              <div className="p-6 rounded-lg bg-card border border-border">
                <h3 className="text-xl font-semibold mb-4">Valor</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {formatCurrency((eventDetails.price || 0) / 100)}
                  </span>
                  <span className="text-muted-foreground">/pessoa</span>
                </div>
                {eventDetails.cupons && eventDetails.cupons.length > 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Cupons de desconto disponíveis!
                  </p>
                )}
              </div>

              <Button 
                size="lg" 
                className="w-full text-lg py-6"
                onClick={handleEventClick}
              >
                {eventDetails.isOpen ? "Garantir Minha Vaga" : "Atualize seus dados"}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Faça sua inscrição para este evento.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      </div>
    </>
  );
}
