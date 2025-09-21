'use client';

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, List, ChevronLeft, ChevronRight, MapPin, Clock, Users, X } from 'lucide-react';
import { EventData } from '@/services/eventService';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EventsViewerProps {
  events: EventData[];
}

interface CalendarEvent {
  id: number;
  name: string;
  date: string;
  isOpen: boolean;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
}

export function EventsViewer({ events }: EventsViewerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [showDayModal, setShowDayModal] = useState(false);
  const [dayModalEvents, setDayModalEvents] = useState<CalendarEvent[]>([]);
  const [dayModalDate, setDayModalDate] = useState<string>('');

  // Converter eventos para formato processado
  const processedEvents: CalendarEvent[] = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      name: event.name,
      date: event.date,
      isOpen: event.isOpen,
      location: event.location,
      description: event.description || '',
      startDate: event.startDate,
      endDate: event.endDate
    }));
  }, [events]);

  // Ordenar eventos por data (próximos primeiro)
  const sortedEvents = useMemo(() => {
    return [...processedEvents].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });
  }, [processedEvents]);

  // Filtrar eventos futuros para a lista
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sortedEvents.filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    });
  }, [sortedEvents]);

  // Lógica do calendário (mantida do componente anterior)
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  const calendarDays: (number | null)[] = [];
  
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getEventsForDate = (day: number | null) => {
    if (!day) return [];
    
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    
    return processedEvents.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null); // Reset selected day when changing month
    setSelectedDayEvents([]);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null); // Reset selected day when changing month
    setSelectedDayEvents([]);
  };

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    
    const dayEvents = getEventsForDate(day);
    if (dayEvents.length > 0) {
      // Para mobile: abrir modal simples
      const dateStr = `${day} de ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      setDayModalDate(dateStr);
      setDayModalEvents(dayEvents);
      setShowDayModal(true);
      
      // Para desktop: mostrar na seção abaixo (mantido para compatibilidade)
      setSelectedDay(day);
      setSelectedDayEvents(dayEvents);
    } else {
      setSelectedDay(null);
      setSelectedDayEvents([]);
    }
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const formatEventDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatEventTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 text-emerald-200 hover:text-emerald-400 hover:bg-emerald-500/20"
        >
          <Calendar className="h-6 w-6" />
          <span className="sr-only">Eventos</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Eventos FEUPAM</DialogTitle>
        </DialogHeader>
        
        <div className="flex-grow overflow-hidden">
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'list' | 'calendar')} className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Próximos Eventos
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendário
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="mt-4 flex-grow overflow-hidden">
              <div className="space-y-4 h-full overflow-y-auto pr-2">
                {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum evento próximo encontrado</p>
                </div>
              ) : (
                upcomingEvents.map(event => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Data em destaque - Data do EVENTO */}
                      <div className="flex-shrink-0">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-3 text-center min-w-[80px] border-2 border-emerald-200 dark:border-emerald-800">
                          <div className="text-xs text-emerald-600 dark:text-emerald-500 font-semibold mb-1">
                            EVENTO
                          </div>
                          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                            {new Date(event.date).getDate()}
                          </div>
                          <div className="text-sm text-emerald-600 dark:text-emerald-500">
                            {new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                          </div>
                          <div className="text-xs text-emerald-600 dark:text-emerald-500">
                            {new Date(event.date).getFullYear()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Informações do evento */}
                      <div className="flex-grow space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-semibold">{event.name}</h3>
                          <Badge variant={event.isOpen ? "default" : "secondary"}>
                            {event.isOpen ? "Aberto" : "Fechado"}
                          </Badge>
                        </div>
                        
                        {event.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium text-foreground">
                              Evento: {formatEventDate(event.date)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Período de inscrições */}
                        <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                          <strong>Inscrições:</strong> {formatEventTime(event.startDate, event.endDate)}
                        </div>
                        
                        <div className="pt-2">
                          <Button 
                            size="sm" 
                            variant={event.isOpen ? "default" : "outline"}
                            disabled={!event.isOpen}
                            className="w-full sm:w-auto"
                          >
                            {event.isOpen ? "Inscrever-se" : "Inscrições Fechadas"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-4 h-full overflow-y-auto">
            <div className="space-y-4 pr-2">
              {/* Navegação do mês */}
              <div className="flex items-center justify-between sticky top-0 bg-background py-2 z-10 border-b">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-semibold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Grid do calendário */}
              <div className="grid grid-cols-7 gap-1">
                {/* Headers dos dias da semana */}
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
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
                            h-10 w-10 flex items-center justify-center text-sm rounded-md cursor-pointer transition-all
                            ${hasEvents 
                              ? hasOpenEvents 
                                ? 'bg-emerald-500 text-white font-semibold hover:bg-emerald-600' 
                                : 'bg-orange-500 text-white font-semibold hover:bg-orange-600'
                              : 'hover:bg-muted'
                            }
                            ${selectedDay === day ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                          `}
                          onClick={() => handleDayClick(day)}
                          title={hasEvents ? `${dayEvents.length} evento(s) - Clique para ver detalhes` : `Dia ${day}`}
                        >
                          {day}
                          {hasEvents && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"></div>
                          )}
                        </div>
                      ) : (
                        <div className="h-10 w-10"></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legenda */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                  <span>Aberto</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>Fechado</span>
                </div>
                <div className="text-muted-foreground">
                  💡 Clique nos dias coloridos para ver os eventos
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </DialogContent>
      
      {/* Modal simples para mobile - eventos do dia */}
      <Dialog open={showDayModal} onOpenChange={setShowDayModal}>
        <DialogContent className="max-w-sm mx-4 max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-lg">📅 {dayModalDate}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 flex-grow overflow-y-auto pr-2">
            {dayModalEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-grow">
                  <div className="font-medium text-sm">{event.name}</div>
                  <div className="text-xs text-muted-foreground">📍 {event.location}</div>
                </div>
                <Badge variant={event.isOpen ? "default" : "secondary"} className="text-xs">
                  {event.isOpen ? 'Aberto' : 'Fechado'}
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end pt-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={() => setShowDayModal(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
