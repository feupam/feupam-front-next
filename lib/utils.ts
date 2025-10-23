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

// Função base para parsing de datas (evita problemas de timezone)
function parseDate(dateStr: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    // Para strings YYYY-MM-DD, criar como horário local
    const [year, month, day] = dateStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  return new Date(dateStr);
}

// Função unificada para formatação de datas
export function formatDate(dateStr: string, options?: {
  format?: 'short' | 'long' | 'full';
  includeTime?: boolean;
  rangeDate?: string;
}): string {
  try {
    const { format = 'short', includeTime = false, rangeDate } = options || {};
    
    // Verificar se a data é válida
    if (!dateStr) {
      return 'Data não informada';
    }
    
    const startDate = parseDate(dateStr);
    
    // Verificar se a data parseada é válida
    if (isNaN(startDate.getTime())) {
      return 'Data inválida';
    }
    
    let endDate: Date | null = null;
    
    if (rangeDate) {
      endDate = parseDate(rangeDate);
      // Se rangeDate é inválida, ignorar e usar apenas startDate
      if (isNaN(endDate.getTime())) {
        endDate = null;
      }
    }
    
    // Configurações de formatação baseadas no tipo
    const formatOptions: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Sao_Paulo'
    };
    
    if (format === 'short') {
      formatOptions.day = '2-digit';
      formatOptions.month = '2-digit';
      formatOptions.year = 'numeric';
    } else if (format === 'long') {
      formatOptions.day = 'numeric';
      formatOptions.month = 'long';
      formatOptions.year = 'numeric';
    } else if (format === 'full') {
      formatOptions.day = '2-digit';
      formatOptions.month = '2-digit';
      formatOptions.year = 'numeric';
    }
    
    if (includeTime) {
      formatOptions.hour = '2-digit';
      formatOptions.minute = '2-digit';
    }
    
    const formatter = new Intl.DateTimeFormat('pt-BR', formatOptions);
    const startFormatted = formatter.format(startDate);
    
    // Se não há range, retorna apenas a data inicial
    if (!endDate) {
      return format === 'long' && includeTime ? 
        startFormatted.replace(' ', ' às ') : 
        startFormatted;
    }
    
    const endFormatted = formatter.format(endDate);
    
    // Se as datas são iguais, mostra apenas uma
    if (startFormatted === endFormatted) {
      return startFormatted;
    }
    
    // Se são diferentes, mostra o range
    if (format === 'long' && rangeDate) {
      // Para formato longo com range, otimizar a exibição
      const startDay = startDate.getDate();
      const endDay = endDate.getDate();
      const startMonth = startDate.getMonth();
      const endMonth = endDate.getMonth();
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      
      // Se são do mesmo mês e ano, mostrar "23 a 25 de janeiro de 2026"
      if (startMonth === endMonth && startYear === endYear) {
        const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
          month: 'long',
          year: 'numeric',
          timeZone: 'America/Sao_Paulo'
        });
        const monthYear = monthFormatter.format(startDate).replace(/^\d+\s+de\s+/, '');
        return `${startDay} a ${endDay} de ${monthYear}`;
      }
      // Se são de meses diferentes, usar formato completo
      return `${startFormatted} a ${endFormatted}`;
    }
    
    return `${startFormatted} a ${endFormatted}`;
    
  } catch {
    return 'A definir';
  }
}

// Funções de conveniência usando a função unificada
export function formatEventDate(startDate: string, rangeDate?: string): string {
  return formatDate(startDate, { format: 'short', rangeDate });
}

export function formatEventDateLong(startDate: string, rangeDate?: string): string {
  return formatDate(startDate, { format: 'long', rangeDate });
}

export function formatEventDateTime(startDate: string, rangeDate?: string): { date: string; time: string } {
  try {
    const dateOnly = formatDate(startDate, { format: 'short', rangeDate });
    
    // Tentar extrair o horário da data
    const parsedDate = parseDate(startDate);
    const hours = parsedDate.getHours();
    const minutes = parsedDate.getMinutes();
    
    // Se tem horário definido (não é meia-noite), mostrar o horário
    if (hours !== 0 || minutes !== 0) {
      const timeOnly = formatDate(startDate, { includeTime: true }).split(' ')[1] || '';
      if (timeOnly) {
        return {
          date: dateOnly,
          time: timeOnly
        };
      }
    }
    
    // Se não tem horário definido, mostrar apenas a data
    return {
      date: dateOnly,
      time: formatDate(startDate, { format: 'short' })
    };
  } catch {
    return { date: 'A definir', time: 'A definir' };
  }
}

export function formatDateTime(dateStr: string): { date: string; time: string } {
  return formatEventDateTime(dateStr);
}

export function formatTime(dateStr: string): string {
  return formatEventDateTime(dateStr).time;
}

export function formatLongDateTime(dateStr: string): string {
  return formatDate(dateStr, { format: 'long', includeTime: true });
}

export function formatFullDateTime(dateStr: string): string {
  return formatDate(dateStr, { format: 'full', includeTime: true });
}

// Função para verificar se um evento já passou
export function isEventExpired(eventDate: string): boolean {
  try {
    const eventDateObj = parseDate(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDateObj.setHours(0, 0, 0, 0);
    
    return eventDateObj < today;
  } catch {
    return false;
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

/**
 * Funções utilitárias para limpeza e formatação de strings
 */

/**
 * Remove todos os caracteres não numéricos de uma string
 * @param value - String a ser limpa
 * @returns String contendo apenas números
 */
export function removeNonNumeric(value: string | undefined | null): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

/**
 * Formata CPF com máscara
 * @param cpf - CPF sem formatação (apenas números)
 * @returns CPF formatado (000.000.000-00)
 */
export function formatCPF(cpf: string | undefined | null): string {
  if (!cpf) return '';
  const cleaned = removeNonNumeric(cpf);
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CEP com máscara
 * @param cep - CEP sem formatação (apenas números)
 * @returns CEP formatado (00000-000)
 */
export function formatCEP(cep: string | undefined | null): string {
  if (!cep) return '';
  const cleaned = removeNonNumeric(cep);
  if (cleaned.length !== 8) return cep;
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Formata telefone com máscara
 * @param phone - Telefone sem formatação (apenas números)
 * @returns Telefone formatado ((00) 00000-0000 ou (00) 0000-0000)
 */
export function formatPhone(phone: string | undefined | null): string {
  if (!phone) return '';
  const cleaned = removeNonNumeric(phone);
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}