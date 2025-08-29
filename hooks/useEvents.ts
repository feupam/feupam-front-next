import { useEvents as useEventsContext } from '@/contexts/EventsContext';

export function useEvents() {
  return useEventsContext();
} 