import { useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from './use-toast';

export function useCheckSpot() {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkSpot = async (eventId: string) => {
    try {
      setIsChecking(true);
      const response = await api.events.checkSpot(eventId, 'client');
      if (typeof response === 'boolean') return response;
      return response?.available;
    } catch (error) {
      toast({
        title: 'Erro ao verificar vagas',
        description: 'Não foi possível verificar a disponibilidade de vagas. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  return { checkSpot, isChecking };
} 