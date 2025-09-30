import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Event } from '@/types/event';
import { QueueStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = 'BRL'): string {
  // Garantir que o valor é um número válido
  if (typeof value !== 'number' || isNaN(value)) {
    console.warn('[formatCurrency] Invalid value received:', value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(0);
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(value);
}

// Função para verificar se um evento já passou
export function isEventExpired(eventDate: string): boolean {
  try {
    let eventDateObj: Date;
    
    // Se a string for no formato YYYY-MM-DD (apenas data), adiciona horário local para evitar timezone issues
    if (/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      const [year, month, day] = eventDate.split('-');
      eventDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      eventDateObj = new Date(eventDate);
    }
    
    // Compara com a data atual (apenas o dia, sem horário)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove horário para comparar apenas datas
    
    eventDateObj.setHours(0, 0, 0, 0); // Remove horário do evento também
    
    return eventDateObj < today;
  } catch {
    return false; // Em caso de erro, não filtra o evento
  }
}

// Funções de formatação de data e hora padronizadas
export function formatDate(dateStr: string): string {
  try {
    // Se a string for no formato YYYY-MM-DD (apenas data), adiciona horário local para evitar timezone issues
    let dateToFormat: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      // Para strings no formato YYYY-MM-DD, cria a data como horário local
      const [year, month, day] = dateStr.split('-');
      dateToFormat = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      dateToFormat = new Date(dateStr);
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateToFormat);
  } catch {
    return 'A definir';
  }
}

export function formatTime(dateStr: string): string {
  try {
    // Se a string for no formato YYYY-MM-DD (apenas data), adiciona horário local para evitar timezone issues
    let dateToFormat: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      // Para strings no formato YYYY-MM-DD, cria a data como horário local
      const [year, month, day] = dateStr.split('-');
      dateToFormat = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      dateToFormat = new Date(dateStr);
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateToFormat);
  } catch {
    return 'A definir';
  }
}

export function formatDateTime(dateStr: string): { date: string; time: string } {
  try {
    // Se a string for no formato YYYY-MM-DD (apenas data), adiciona horário local para evitar timezone issues
    let dateToFormat: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      // Para strings no formato YYYY-MM-DD, cria a data como horário local
      const [year, month, day] = dateStr.split('-');
      dateToFormat = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      dateToFormat = new Date(dateStr);
    }
    
    return {
      date: new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(dateToFormat),
      time: new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateToFormat)
    };
  } catch {
    return { date: 'A definir', time: 'A definir' };
  }
}

// Função para formato longo com horário: "23 de janeiro de 2026 às 21:00"
export function formatLongDateTime(dateStr: string): string {
  try {
    // Se a string for no formato YYYY-MM-DD (apenas data), adiciona horário local para evitar timezone issues
    let dateToFormat: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      // Para strings no formato YYYY-MM-DD, cria a data como horário local
      const [year, month, day] = dateStr.split('-');
      dateToFormat = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      dateToFormat = new Date(dateStr);
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    }).format(dateToFormat).replace(' ', ' às ');
  } catch {
    return 'A definir';
  }
}

export function formatFullDateTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'A definir';
  }
}

export function getTimeRemaining(targetDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const total = new Date(targetDate).getTime() - new Date().getTime();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  
  return {
    total,
    days,
    hours,
    minutes,
    seconds,
  };
}

export function formatWaitTime(minutes: number): string {
  if (minutes < 1) return 'menos de 1 minuto';
  if (minutes === 1) return '1 minuto';
  if (minutes < 60) return `${minutes} minutos`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 1) {
    if (remainingMinutes === 0) return '1 hora';
    if (remainingMinutes === 1) return '1 hora e 1 minuto';
    return `1 hora e ${remainingMinutes} minutos`;
  }
  
  if (remainingMinutes === 0) return `${hours} horas`;
  if (remainingMinutes === 1) return `${hours} horas e 1 minuto`;
  return `${hours} horas e ${remainingMinutes} minutos`;
}

export function getEventAvailabilityStatus(event: Event): {
  status: 'available' | 'limited' | 'sold_out' | 'waiting_room';
  text: string;
} {
  const now = new Date();
  
  // Check if waiting room is open
  if (event.waitingRoomOpens && new Date(event.waitingRoomOpens) <= now && 
      event.salesStart && new Date(event.salesStart) > now) {
    return {
      status: 'waiting_room',
      text: 'Sala de espera aberta'
    };
  }
  
  if (event.availability !== undefined && event.availability === 0) {
    return {
      status: 'sold_out',
      text: 'Esgotado'
    };
  }
  
  if (event.availability !== undefined && event.availability < 50) {
    return {
      status: 'limited',
      text: 'Últimos ingressos'
    };
  }
  
  return {
    status: 'available',
    text: 'Disponível'
  };
}

// Mock function to simulate generated queue statuses
export function generateMockQueueStatus(eventUuid: string): QueueStatus {
  // Simulate different positions and wait times
  const position = Math.floor(Math.random() * 5000) + 1;
  const estimatedWaitTime = Math.ceil(position / 10); // Rough estimate: 10 people per minute
  
  return {
    position,
    estimatedWaitTime,
    totalAhead: position - 1,
    updated: new Date().toISOString()
  };
}