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
  range_date?: string; // Campo opcional para range de datas
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
  // Restrições de idade
  idadeMinima?: number;
  idadeMaxima?: number;
}

// Tipos de reserva
export type ReservationStatus = boolean | {
  isAvailable: boolean;
  spotId?: string;
  waitingList?: boolean;
};

export interface ReservationRequest {
  eventId: string;
  ticketKind: string;
}

export interface ReservationResponse {
  spotId: string;
  email: string;
  eventId: string;
  ticketKind: string;
  userType: string;
  status: string;
} 