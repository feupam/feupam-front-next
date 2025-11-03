'use client';

import { useEffect, useState } from 'react';
import { eventService, EventData } from '@/services/eventService';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, List, ChevronLeft, ChevronRight, MapPin, Clock, Users, ArrowLeft } from 'lucide-react';
import { formatEventDateLong, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoadingPage } from '@/components/shared/Loading';

interface CalendarEvent {
  id: number;
  name: string;
  date: string;
  range_date?: string;
  isOpen: boolean;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
}

export default function CalendarioEventosPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await eventService.getEventStatus('federa');
        
        // Processar eventos para adicionar range_date quando apropriado
        const eventsWithRange = response.events?.map(event => {
          // Se já tem range_date definido, usar
          if (event.range_date) {
            return event;
          }
          
          // Para eventos específicos que sabemos que têm range, adicionar
          if (event.name.toLowerCase().includes('lideres') || event.name.toLowerCase().includes('líderes')) {
            // Baseado na descrição: "23 a 25 de janeiro de 2026"
            return {
              ...event,
              range_date: '2026-01-25'
            };
          }
          
          return event;
        }) || [];
        
        setEvents(eventsWithRange);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Converter eventos para formato processado
  const processedEvents: CalendarEvent[] = events.map(event => ({
    id: event.id,
    name: event.name,
    date: event.date,
    range_date: event.range_date,
    isOpen: event.isOpen,
    location: event.location,
    description: event.description || '',
    startDate: event.startDate,
    endDate: event.endDate
  }));

  // Ordenar eventos por data (próximos primeiro)
  const sortedEvents = [...processedEvents].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });

  // Filtrar eventos futuros para a lista
  const upcomingEvents = sortedEvents.filter(event => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  const formatEventTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
  };

  // Funções do calendário
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Obter o primeiro e último dia do mês atual
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Criar array de dias para o calendário
  const calendarDays: (number | null)[] = [];
  
  // Adicionar dias em branco no início
  for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
    calendarDays.push(null);
  }
  
  // Adicionar todos os dias do mês
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    calendarDays.push(day);
  }

  const getEventsForDate = (day: number | null) => {
    if (!day) return [];
    return processedEvents.filter(event => {
      // Normaliza ambas as datas para o fuso de Brasília usando utils.formatDate
      const eventNorm = formatDate(event.date, { format: 'full' }); // dd/MM/aaaa em America/Sao_Paulo
      const y = currentDate.getFullYear();
      const m = String(currentDate.getMonth() + 1).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      const checkIso = `${y}-${m}-${d}`; // força YYYY-MM-DD
      const checkNorm = formatDate(checkIso, { format: 'full' });
      return eventNorm === checkNorm;
    });
  };

  if (loading) {
    return <LoadingPage text="Carregando eventos..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Eventos FEUPAM</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'list' | 'calendar')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Próximos Eventos
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-6">
            <div className="space-y-6">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">Nenhum evento próximo</h3>
                  <p>Não há eventos programados para as próximas datas.</p>
                </div>
              ) : (
                upcomingEvents.map(event => (
                  <div key={event.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-card">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Data em destaque */}
                      <div className="flex-shrink-0">
                        <div className="bg-primary/10 rounded-lg p-4 text-center min-w-[100px] border border-primary/20">
                          <div className="text-xs text-primary font-semibold mb-1">
                            EVENTO
                          </div>
                          {(() => {
                            const full = formatDate(event.date, { format: 'full' }); // dd/MM/aaaa
                            const [dd, mm, yyyy] = full.split('/');
                            const monthsShort = ['JAN.', 'FEV.', 'MAR.', 'ABR.', 'MAI.', 'JUN.', 'JUL.', 'AGO.', 'SET.', 'OUT.', 'NOV.', 'DEZ.'];
                            const monthLabel = monthsShort[Number(mm) - 1] ?? '';
                            return (
                              <>
                                <div className="text-2xl font-bold text-primary">{dd}</div>
                                <div className="text-sm text-primary">{monthLabel}</div>
                                <div className="text-xs text-primary">{yyyy}</div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      
                      {/* Informações do evento */}
                      <div className="flex-grow space-y-4">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-semibold">{event.name}</h3>
                            <Badge variant={event.isOpen ? "default" : "secondary"}>
                              {event.isOpen ? 'Aberto' : 'Fechado'}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">
                            {event.description}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                              Evento: {formatEventDateLong(event.date, event.range_date)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Período de inscrições */}
                        <div className="text-xs text-muted-foreground bg-muted/50 rounded px-3 py-2">
                          <strong>Inscrições:</strong> {formatEventTime(event.startDate, event.endDate)}
                        </div>
                        
                        <Button 
                          variant={event.isOpen ? "default" : "outline"}
                          disabled={!event.isOpen}
                          className="w-full sm:w-auto"
                          asChild={event.isOpen}
                        >
                          {event.isOpen ? (
                            <Link href={`/event/${encodeURIComponent(event.name)}`}>
                              Inscrever-se
                            </Link>
                          ) : (
                            "Inscrições Fechadas"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-6">
            <div className="space-y-6">
              {/* Navegação do mês */}
              <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Grid do calendário */}
              <div className="grid grid-cols-7 gap-2">
                {/* Headers dos dias da semana */}
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-3">
                    {day}
                  </div>
                ))}
                
                {/* Dias do calendário */}
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDate(day);
                  const hasEvents = dayEvents.length > 0;
                  const hasOpenEvents = dayEvents.some(event => event.isOpen);
                  
                  return (
                    <div key={index} className="relative">
                      {day ? (
                        <div 
                          className={`
                            h-12 w-12 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all mx-auto
                            ${hasEvents 
                              ? hasOpenEvents 
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                                : 'bg-orange-500 text-white hover:bg-orange-600'
                              : 'hover:bg-muted'
                            }
                          `}
                        >
                          {day}
                          {hasEvents && (
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                              <div className="w-1 h-1 bg-current rounded-full"></div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-12 w-12"></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legenda */}
              <div className="flex flex-wrap gap-4 text-sm justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded"></div>
                  <span>Aberto</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>Fechado</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}