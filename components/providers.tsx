'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { EventsProvider } from '@/contexts/EventsContext';
import { CurrentEventProvider } from '@/contexts/CurrentEventContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { PropsWithChildren, createContext, useState, useContext, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

// Interface para as opções de parcelamento da API
interface ApiInstallmentOption {
  installmentNumber: number;
  valueInCents: number;
  valueWithInterest: string;
}

// Interface para as opções de parcelamento usadas pelos componentes
interface InstallmentOption {
  number: number;
  valueInCents: number;
  formattedValue: string;
}

// Interface para o contexto de parcelamento
interface InstallmentsContextType {
  installmentOptions: InstallmentOption[];
  isLoading: boolean;
  fetchInstallments: (eventId: string) => Promise<void>;
  eventId: string | null;
}

// Criar o contexto
const InstallmentsContext = createContext<InstallmentsContextType>({
  installmentOptions: [],
  isLoading: false,
  fetchInstallments: async () => {},
  eventId: null
});

// Hook para usar o contexto
export function useInstallments() {
  return useContext(InstallmentsContext);
}

// Provider do contexto
export function InstallmentsProvider({ children }: PropsWithChildren) {
  const [installmentOptions, setInstallmentOptions] = useState<InstallmentOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  
  // Referência para controlar requisições em andamento
  const pendingRequests = useRef<Record<string, Promise<any>>>({});
  
  // Cache de resultados para evitar requisições repetidas
  const resultsCache = useRef<Record<string, InstallmentOption[]>>({});
  
  // Timestamp do último acesso para cada eventId
  const lastAccess = useRef<Record<string, number>>({});

  const fetchInstallments = async (newEventId: string) => {
    // Se for o mesmo evento que já está carregado, reutiliza os dados
    if (eventId === newEventId && installmentOptions.length > 0) {
      // Atualiza o timestamp de acesso
      lastAccess.current[newEventId] = Date.now();
      return;
    }
    
    // Se tiver no cache e não estiver expirado (menos de 5 minutos)
    const cacheExpiration = 5 * 60 * 1000; // 5 minutos
    if (
      resultsCache.current[newEventId] && 
      Date.now() - (lastAccess.current[newEventId] || 0) < cacheExpiration
    ) {
      console.log(`[InstallmentsProvider] Usando cache para evento ${newEventId}`);
      setInstallmentOptions(resultsCache.current[newEventId]);
      setEventId(newEventId);
      // Atualiza o timestamp de acesso
      lastAccess.current[newEventId] = Date.now();
      return;
    }
    
    // Se já tem uma requisição em andamento para este evento, aguarda o resultado
    if (pendingRequests.current[newEventId] !== undefined) {
      console.log(`[InstallmentsProvider] Aguardando requisição em andamento para ${newEventId}`);
      try {
        await pendingRequests.current[newEventId];
        // A requisição já atualizou o estado, então não precisamos fazer nada
        return;
      } catch (error) {
        console.error(`[InstallmentsProvider] Erro ao aguardar requisição para ${newEventId}:`, error);
        // Continua para fazer uma nova requisição
      }
    }
    
    // Cria uma nova requisição e armazena a promessa
    setIsLoading(true);
    console.log(`[InstallmentsProvider] Buscando parcelamentos para ${newEventId}`);
    
    const requestPromise = api.events.getInstallments(newEventId)
      .then(apiOptions => {
        if (apiOptions && apiOptions.length > 0) {
          // Convertendo do formato da API para o formato usado pelo componente
          const mappedOptions: InstallmentOption[] = apiOptions.map((option: ApiInstallmentOption) => ({
            number: option.installmentNumber,
            valueInCents: option.valueInCents,
            formattedValue: `${option.installmentNumber}x de ${option.valueWithInterest}`
          }));
          
          // Atualiza o estado e o cache
          setInstallmentOptions(mappedOptions);
          resultsCache.current[newEventId] = mappedOptions;
        } else {
          // Se não houver opções da API, cria lista vazia
          setInstallmentOptions([]);
          resultsCache.current[newEventId] = [];
        }
        
        // Atualiza o id do evento atual e o timestamp de acesso
        setEventId(newEventId);
        lastAccess.current[newEventId] = Date.now();
        
        // Retorna os resultados para que outras chamadas aguardando possam usar
        return resultsCache.current[newEventId];
      })
      .catch(error => {
        console.error(`[InstallmentsProvider] Erro ao buscar parcelamentos para ${newEventId}:`, error);
        setInstallmentOptions([]);
        resultsCache.current[newEventId] = [];
        throw error; // Propaga o erro para quem estiver aguardando
      })
      .finally(() => {
        setIsLoading(false);
        // Remove esta requisição das pendentes
        delete pendingRequests.current[newEventId];
      });
    
    // Armazena a promessa para que outras chamadas possam aguardar
    pendingRequests.current[newEventId] = requestPromise;
    
    // Aguarda o resultado
    await requestPromise;
  };

  // Limpa cache expirado a cada 10 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const cacheExpiration = 10 * 60 * 1000; // 10 minutos
      
      Object.keys(lastAccess.current).forEach(eventId => {
        if (now - lastAccess.current[eventId] > cacheExpiration) {
          delete resultsCache.current[eventId];
          delete lastAccess.current[eventId];
        }
      });
    }, 10 * 60 * 1000); // 10 minutos
    
    return () => clearInterval(interval);
  }, []);

  return (
    <InstallmentsContext.Provider value={{ installmentOptions, isLoading, fetchInstallments, eventId }}>
      {children}
    </InstallmentsContext.Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <EventsProvider>
          <CurrentEventProvider>
            <InstallmentsProvider>
              {children}
              <Toaster />
            </InstallmentsProvider>
          </CurrentEventProvider>
        </EventsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 