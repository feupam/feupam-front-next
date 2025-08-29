import { Event } from '@/types/event';

export interface EventFilters {
  date?: string;
  location?: string;
  category?: string;
}

export interface QueueStatus {
  position: number;
  estimatedWaitTime: number; // in minutes
  totalAhead: number;
  updated: string; // ISO date string
}

export interface WaitingRoomStatus {
  eventId: string;
  salesStart: string; // ISO date string
  currentTime: string; // ISO date string
  isOpen: boolean;
  message?: string;
}

export interface User {
  id: string;
  token: string;
}