'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Conexão Restaurada",
        description: "Sua conexão com a internet foi restabelecida.",
        variant: "default",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Sem Conexão",
        description: "Verifique sua conexão com a internet.",
        variant: "destructive",
      });
    };

    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [toast]);

  return { isOnline };
} 