'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string | ((data: T) => string);
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

interface UseApiReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  loading: boolean; // Alias for isLoading
  execute: (apiCall: () => Promise<T>, options?: UseApiOptions<T>) => Promise<T>;
  reset: () => void;
}

/**
 * useApi - Hook para gerenciar chamadas de API com loading, error e success states
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error, execute } = useApi<EventData>({
 *   successMessage: 'Evento carregado!',
 *   onSuccess: (data) => console.log(data)
 * });
 * 
 * const fetchEvent = async () => {
 *   await execute(() => eventService.getEvent(id));
 * };
 * ```
 */
export function useApi<T = any>(options: UseApiOptions<T> = {}): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const execute = useCallback(
    async (apiCall: () => Promise<T>, executeOptions?: UseApiOptions<T>): Promise<T> => {
      // Merge default options with execute-time options
      const mergedOptions = { ...options, ...executeOptions };
      
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiCall();
        setData(result);

        // Handle dynamic success message
        const finalSuccessMessage = typeof mergedOptions.successMessage === 'function'
          ? mergedOptions.successMessage(result)
          : mergedOptions.successMessage;

        if (mergedOptions.showSuccessToast !== false && finalSuccessMessage) {
          toast({
            title: 'Sucesso',
            description: finalSuccessMessage,
          });
        }

        mergedOptions.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erro desconhecido');
        setError(error);

        if (mergedOptions.showErrorToast !== false) {
          toast({
            title: 'Erro',
            description: mergedOptions.errorMessage || error.message,
            variant: 'destructive',
          });
        }

        mergedOptions.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options, toast]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { 
    data, 
    error, 
    isLoading, 
    loading: isLoading, // Alias
    execute, 
    reset 
  };
}
