import { api } from './api';

export interface EventData {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  startDate: string;
  endDate: string;
  range_date?: string; // Campo opcional para range de datas
  isOpen: boolean;
  image_capa?: string;
  logo_evento?: string;
  price?: number;
  owner?: string | null;
  idadeMinima?: number;
  idadeMaxima?: number;
}

export interface EventStatusResponse {
  currentDate: string;
  events: EventData[];
}

export const eventService = {
  async getEventStatus(eventId: string): Promise<EventStatusResponse> {
    const response = await api.get<EventStatusResponse>(`/events/event-status`);
    const data = response.data;

    // Only return events owned by IPCP. If owner is null/undefined or different, filter out.
    const filtered: EventStatusResponse = {
      ...data,
      events: Array.isArray(data.events) ? data.events.filter((e) => e.owner === 'IPCP') : [],
    };

    return filtered;
  }
};