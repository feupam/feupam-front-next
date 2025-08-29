'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventService } from '@/services/eventService';
import { useCurrentEventContext } from '@/contexts/CurrentEventContext';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Clock, Users } from 'lucide-react';
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
  price?: number;
  image?: string;
  maxClientMale?: string;
  maxClientFemale?: string;
  cupons?: any[];
  tickets?: any[];
}

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const eventName = params.eventName as string;
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
            // Adiciona propriedades padrão para compatibilidade
            const eventWithDefaults = {
              ...event,
              price: 0, // Valor padrão
              image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', // Imagem padrão
              maxClientMale: '0', // Valor padrão
              maxClientFemale: '0', // Valor padrão  
              cupons: [], // Array vazio
              tickets: [] // Array vazio
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

  if (loading) {
    return <LoadingPage text="Carregando evento..." />;
  }

  if (error || !eventDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Evento não encontrado</h2>
          <Button onClick={() => router.push('/countdown/federa')}>Voltar para Home</Button>
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
    
    if (eventDetails.isOpen) {
      router.push('/perfil');
    } else {
      setShowDialog(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] w-full">
        <div className="absolute inset-0">
          <Image
            src={eventDetails.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'}
            alt={eventDetails.name}
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            {...fadeInUp}
          >
            {eventDetails.name}
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-white/90 max-w-2xl"
            {...fadeInUp}
            transition={{ delay: 0.2 }}
          >
            {eventDetails.description || 'Uma experiência única e inesquecível'}
          </motion.p>
        </div>
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
                  <p className="font-medium">{formatDate(eventDetails.startDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium">{formatTime(eventDetails.startDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Local</p>
                  <p className="font-medium">{eventDetails.location || 'A definir'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Capacidade</p>
                  <p className="font-medium">{getCapacity()} pessoas</p>
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
            <h2 className="text-3xl font-bold">Informações do Ingresso</h2>
            <div className="grid gap-6">
              <div className="p-6 rounded-lg bg-card border border-border">
                <h3 className="text-xl font-semibold mb-4">Valor</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {formatCurrency(eventDetails.price || 0)}
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
                Vagas limitadas! Reserve já seu lugar neste evento incrível.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card border-y border-border py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-center p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Networking</h3>
              <p className="text-muted-foreground">
                Conecte-se com pessoas incríveis
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Programação</h3>
              <p className="text-muted-foreground">
                Atividades cuidadosamente planejadas
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Especial</h3>
              <p className="text-muted-foreground">
                Ambiente escolhido com carinho
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Não perca essa oportunidade!
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Garanta já sua vaga neste evento incrível. Lugares limitados!
          </p>
          <Button 
            size="lg"
            className="text-lg"
            onClick={handleEventClick}
          >
            {eventDetails.isOpen ? "Comprar Ingresso Agora" : "Atualize seus dados"}
          </Button>

          {/* Dialog de evento fechado */}
          <EventClosedDialog
            open={showDialog}
            onClose={() => setShowDialog(false)}
            startDate={eventDetails.startDate}
            endDate={eventDetails.endDate}
          />
        </motion.div>
      </section>
    </div>
  );
}
