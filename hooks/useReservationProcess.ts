import { useState } from 'react';
import { tickets, events, users } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { ReservationResponse } from '@/services/reservationService';
import { auth } from '@/lib/firebase';

type ReservationStatusType =
  | 'available'
  | 'reserved'
  | 'waiting'
  | 'cancelled'
  | 'expired'
  | 'pago'
  | 'queued'
  | 'waiting-list'
  | null;

interface ReservationStatus {
  status: ReservationStatusType;
  message?: string;
  remainingMinutes?: number;
  id?: string;
  price?: number;
  email?: string;
  eventId?: string;
  ticketKind?: string;
  spotId?: string;
}

interface SpotAvailabilityResponse {
  isAvailable: boolean;
  waitingList?: boolean;
}

interface SpotReservationResponse extends ReservationResponse {
  spotId: string;
  ticketKind: string;
  email: string;
  eventId: string;
}

interface UseReservationProcessProps {
  eventId: string;
  ticketKind: string;
}

export interface ReservationData extends ReservationResponse {
  id?: string;
}

interface UseReservationProcessReturn {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  reservationData: ReservationData | null;
  isWaitingList: boolean;
  reservationStatus: ReservationStatusType;
  checkSpotAvailability: () => Promise<boolean>;
  reserveSpot: () => Promise<ReservationResponse | null>;
  fetchUserReservations: () => Promise<ReservationResponse[]>;
  purchaseTicket: (eventId: string) => Promise<ReservationResponse>;
  checkReservationStatus: () => Promise<ReservationStatus>;
  tryPurchase: (eventId: string) => Promise<ReservationStatus | null>;
}

export function useReservationProcess(
  props?: UseReservationProcessProps
): UseReservationProcessReturn {
  // caso não tenha eventId ou ticketKind, devolve objeto mock
  if (!props?.eventId || !props?.ticketKind) {
    return {
      isLoading: false,
      isError: false,
      errorMessage: null,
      reservationData: null,
      isWaitingList: false,
      reservationStatus: null,
      checkSpotAvailability: async () => false,
      reserveSpot: async () => null,
      fetchUserReservations: async () => [],
      purchaseTicket: async () => {
        throw new Error('No event ID provided');
      },
      checkReservationStatus: async () => ({
        status: null,
        message: 'No reservation to check',
      }),
      tryPurchase: async () => ({
        status: null,
        message: 'No event ID provided',
      }),
    };
  }

  const { eventId, ticketKind } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reservationData, setReservationData] =
    useState<ReservationData | null>(null);
  const [isWaitingList, setIsWaitingList] = useState(false);
  const [reservationStatus, setReservationStatus] =
    useState<ReservationStatusType>(null);
  const { toast } = useToast();

  // 🔹 Verifica se há vagas disponíveis
  const checkSpotAvailability = async (): Promise<boolean> => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const response = await events.checkSpot(eventId, ticketKind);

      if (typeof response === 'boolean') {
        return response;
      }

      const availabilityResponse = response as SpotAvailabilityResponse;
      if (availabilityResponse) {
        setIsWaitingList(!!availabilityResponse.waitingList);
        return !!availabilityResponse.isAvailable;
      }

      return false;
    } catch (error: any) {
      console.error('Erro ao verificar disponibilidade:', error);
      setIsError(true);
      setErrorMessage(
        'Não foi possível verificar a disponibilidade de vagas'
      );
      toast({
        title: 'Erro',
        description: 'Não foi possível verificar a disponibilidade de vagas',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Reserva uma vaga
  const reserveSpot = async (): Promise<SpotReservationResponse | null> => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const response = await events.reserveSpot(eventId, {
        ticket_kind: ticketKind,
        userType: 'client',
      });

      const reservationResponse = response as SpotReservationResponse;
      setReservationData(reservationResponse);

      localStorage.setItem('reservationTimestamp', new Date().toISOString());
      localStorage.setItem(
        'reservationData',
        JSON.stringify(reservationResponse)
      );

      toast({
        title: 'Reserva realizada',
        description: 'Sua vaga foi reservada com sucesso!',
      });

      return reservationResponse;
    } catch (error: any) {
      console.error('Erro ao reservar vaga:', error);

      if (error.response?.status === 409) {
        try {
          await fetchUserReservations();
          return reservationData;
        } catch {
          setIsError(true);
          setErrorMessage('Não foi possível recuperar sua reserva existente');
          toast({
            title: 'Erro',
            description: 'Não foi possível recuperar sua reserva existente',
            variant: 'destructive',
          });
          return null;
        }
      } else {
        setIsError(true);
        setErrorMessage('Não foi possível reservar sua vaga');
        toast({
          title: 'Erro',
          description: 'Não foi possível reservar sua vaga',
          variant: 'destructive',
        });
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Busca reservas do usuário
  const fetchUserReservations = async (): Promise<ReservationResponse[]> => {
    setIsLoading(true);
    setIsError(false);

    try {
      const reservations = await users.getReservations();

      if (reservations && reservations.length > 0) {
        const currentEventReservation = reservations.find(
          (res: any) => res.eventId === eventId
        );

        if (currentEventReservation) {
          setReservationData(currentEventReservation);
          localStorage.setItem(
            'reservationData',
            JSON.stringify(currentEventReservation)
          );
          return [currentEventReservation];
        }
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      setIsError(true);
      setErrorMessage('Não foi possível buscar suas reservas');
      toast({
        title: 'Erro',
        description: 'Não foi possível buscar suas reservas',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Compra o ingresso
  const purchaseTicket = async (): Promise<any> => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      if (!user?.email) {
        throw new Error('Usuário precisa estar logado e ter um email válido');
      }

      const response = await tickets.purchase(eventId, user.email);

      if (response.status) {
        setReservationStatus(response.status);

        if (response.status === 'queued' || response.status === 'waiting-list') {
          window.location.href = `/fila?event=${eventId}`;
          return response;
        }

        toast({
          title: 'Status da Reserva',
          description: response.message || 'Status da reserva verificado',
        });
      }

      return response;
    } catch (error: any) {
      setIsError(true);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Erro ao verificar status da reserva';
      setErrorMessage(message);
      console.error('Erro ao verificar status da reserva:', error);

      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Tenta concluir a compra
  const tryPurchase = async (
    eventId: string
  ): Promise<ReservationStatus | null> => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const response = await tickets.retryPurchase(eventId);

      const reservationStatus = response as ReservationStatus;
      if (reservationStatus?.status) {
        if (
          reservationStatus.status === 'queued' ||
          reservationStatus.status === 'waiting-list'
        ) {
          window.location.href = `/fila?event=${eventId}`;
          return reservationStatus;
        }

        setReservationStatus(reservationStatus.status as ReservationStatusType);

        if (
          reservationStatus.status === 'reserved' &&
          reservationStatus.remainingMinutes
        ) {
          const now = new Date();
          const expiresAt = new Date(
            now.getTime() + reservationStatus.remainingMinutes * 60 * 1000
          );
          const adjustedTimestamp = new Date(
            expiresAt.getTime() - 10 * 60 * 1000
          );

          localStorage.setItem(
            'reservationTimestamp',
            adjustedTimestamp.toISOString()
          );

          toast({
            title: 'Reserva válida',
            description: `Você tem ${reservationStatus.remainingMinutes} minutos para concluir a compra`,
          });
        }

        return reservationStatus;
      }

      return null;
    } catch (error) {
      setIsError(true);
      setErrorMessage('Não foi possível verificar o tempo restante da sua reserva');
      toast({
        title: 'Erro',
        description: 'Não foi possível verificar o tempo restante da sua reserva',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Sempre retorna o hook no final
  return {
    isLoading,
    isError,
    errorMessage,
    reservationData,
    isWaitingList,
    reservationStatus,
    checkSpotAvailability,
    reserveSpot,
    fetchUserReservations,
    purchaseTicket,
    checkReservationStatus: async () => ({
      status: reservationStatus,
      message: errorMessage || 'No reservation status available',
    }),
    tryPurchase,
  };
}
