"use client"

import { useState, useEffect } from 'react';
import { reservationService } from '@/services';
import { auth } from '@/lib/firebase';

export interface ReservationStatusData {
  id: string;
  status: 'pending' | 'confirmed' | 'expired' | 'cancelled' | 'payment_pending';
  expiresAt?: Date;
  eventId: string;
  ticketKind?: string;
  spotNumber?: number;
}

interface UseReservationStatusOptions {
  reservationId?: string;
  pollInterval?: number; // milliseconds
  onStatusChange?: (status: ReservationStatusData['status']) => void;
}

export function useReservationStatus({
  reservationId,
  pollInterval = 5000,
  onStatusChange,
}: UseReservationStatusOptions = {}) {
  const [reservation, setReservation] = useState<ReservationStatusData | null>(null);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = async () => {
    if (!reservationId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Get specific reservation
      const data = await reservationService.getReservation(reservationId, token);
      
      if (data) {
        setReservation(data as ReservationStatusData);
        
        // Check if status changed
        if (previousStatus && previousStatus !== data.status) {
          onStatusChange?.(data.status);
        }
        setPreviousStatus(data.status);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Poll for status updates
  useEffect(() => {
    if (!reservationId) return;

    fetchStatus();

    if (pollInterval > 0) {
      const interval = setInterval(() => {
        fetchStatus();
      }, pollInterval);

      return () => clearInterval(interval);
    }
  }, [reservationId, pollInterval]);

  const isExpired = reservation?.status === 'expired';
  const isConfirmed = reservation?.status === 'confirmed';
  const isPending = reservation?.status === 'pending' || reservation?.status === 'payment_pending';
  const isCancelled = reservation?.status === 'cancelled';

  return {
    reservation,
    loading,
    error,
    isExpired,
    isConfirmed,
    isPending,
    isCancelled,
    refetch: fetchStatus,
  };
}
