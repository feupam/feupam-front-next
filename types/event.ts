export interface Ticket {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
}

export interface Event {
  uuid: string;
  name: string;
  location: string;
  description: string;
  date: string;
  maxGeneralSpots: string;
  price: number;
  endDate: string;
  startDate: string;
  cupons?: {
    name: string;
    discount: number;
  }[];
  maxStaffMale?: string;
  maxStaffFemale?: string;
  maxClientFemale?: string;
  maxClientMale?: string;
  eventType: 'general' | 'gender_specific';
  title: string;
  time: string;
  image: string;
  tickets: Ticket[];
  // Campos adicionais apenas para o sistema de fila
  waitingRoomOpens?: string;
  salesStart?: string;
  availability?: number;
  isHighDemand?: boolean;
  isOpen: boolean;
} 