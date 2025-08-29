import { api } from './api';

export interface EventData {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
}

export interface EventStatusResponse {
  currentDate: string;
  events: EventData[];
}

export const eventService = {
  async getEventStatus(eventId: string): Promise<EventStatusResponse> {
    const response = await api.get<EventStatusResponse>(`/events/event-status`);
    return response.data;
  }
};