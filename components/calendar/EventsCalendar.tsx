'use client';

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { EventData } from '@/services/eventService';

interface EventsCalendarProps {
  events: EventData[];
}

interface CalendarEvent {
  id: number;
  name: string;
  date: string;
  isOpen: boolean;
  location: string;
}

export function EventsCalendar({ events }: EventsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  // Converter eventos para formato do calendário
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      name: event.name,
      date: event.date,
      isOpen: event.isOpen,
      location: event.location
    }));
  }, [events]);

  // Obter o primeiro e último dia do mês atual
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Obter o dia da semana do primeiro dia (0 = domingo, 1 = segunda, etc.)
  const firstDayWeekday = firstDayOfMonth.getDay();
  
  // Criar array com todos os dias do mês
  const daysInMonth = lastDayOfMonth.getDate();
  const calendarDays: (number | null)[] = [];
  
  // Adicionar dias vazios do início
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  
  // Adicionar dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Função para verificar se um dia tem eventos
  const getEventsForDate = (day: number | null) => {
    if (!day) return [];
    
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  // Navegar entre meses
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 text-emerald-200 hover:text-emerald-400 hover:bg-emerald-500/20"
        >
          <Calendar className="h-6 w-6" />
          <span className="sr-only">Calendário de eventos</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Calendário de Eventos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Navegação do mês */}
          <div className="flex items-center justify-between">
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
                        h-10 w-10 flex items-center justify-center text-sm rounded-md cursor-pointer
                        ${hasEvents 
                          ? hasOpenEvents 
                            ? 'bg-emerald-500 text-white font-semibold' 
                            : 'bg-orange-500 text-white font-semibold'
                          : 'hover:bg-muted'
                        }
                      `}
                      title={dayEvents.map(e => `${e.name} (${e.location})`).join(', ')}
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
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span>Eventos abertos para inscrição</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Eventos fechados</span>
            </div>
          </div>

          {/* Lista de eventos do mês */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <h4 className="font-semibold">Eventos em {monthNames[currentDate.getMonth()]}</h4>
            {calendarEvents
              .filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getMonth() === currentDate.getMonth() && 
                       eventDate.getFullYear() === currentDate.getFullYear();
              })
              .map(event => (
                <div key={event.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{event.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.location} • {new Date(event.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    event.isOpen 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {event.isOpen ? 'Aberto' : 'Fechado'}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
