import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { Event } from '@/types/event';
import { auth } from './firebase';

// Verificar se a variável de ambiente está definida
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_TIMEOUT = 15000; // 15 segundos

// Log para debug
console.log('[API Config] API_URL:', API_URL || 'Não definida');

// Se não estiver definida, apenas log de aviso em vez de quebrar a aplicação
if (!API_URL) {
  console.warn('[API Config] AVISO: NEXT_PUBLIC_API_URL não está definida. Algumas funcionalidades podem não funcionar corretamente.');
}

interface RequestOptions extends RequestInit {
  token?: string | null;
}

interface ApiResponse<T> {
  data: T;
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function isOnline(): Promise<boolean> {
  try {
    console.log('[Network Check] Verificando conexão...');
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      const online = navigator.onLine;
      console.log('[Network Check] Status navegador:', online);
      return online;
    }
    return true; // Se não puder verificar, assume que está online
  } catch (error) {
    console.error('[Network Check] Erro ao verificar conexão:', error);
    return true; // Em caso de erro na verificação, assume que está online
  }
}

// Interceptor para adicionar logs e tratamento de erros
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor para adicionar token automaticamente
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getCurrentToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[API Request] Erro ao obter token:', error);
    }
    return config;
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    console.error('[API Response Error]', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    if (error.code === 'ECONNABORTED') {
      throw new ApiError(408, 'TIMEOUT', 'A requisição excedeu o tempo limite');
    }

    if (!error.response) {
      throw new ApiError(
        0,
        'NETWORK_ERROR',
        'Erro de conexão. Verifique sua internet.'
      );
    }

    const status = error.response.status;
    const data = error.response.data as any;

    throw new ApiError(
      status,
      data.code || 'UNKNOWN_ERROR',
      data.message || 'Ocorreu um erro inesperado'
    );
  }
);

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  console.log(`[API Request] Iniciando requisição para ${endpoint}`, { options });

  // Verificar se a URL da API está definida
  if (!API_URL) {
    console.error('[API Request] URL da API não definida');
    throw new Error('Configuração da API incompleta. Contacte o administrador.');
  }

  const online = await isOnline();
  if (!online) {
    console.error('[API Request] Dispositivo offline');
    throw new Error('Sem conexão com a internet. Por favor, verifique sua conexão e tente novamente.');
  }

  const { token, ...restOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  console.log('[API Request] Headers configurados:', { headers });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.warn('[API Request] Timeout atingido');
    }, 30000);

    console.log('[API Request] Fazendo fetch para:', `${API_URL}${endpoint}`);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...restOptions,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      console.error('[API Request] Resposta com erro:', { status: response.status, error });
      throw new Error(error.message || 'Erro na requisição');
    }

    const data = await response.json();
    console.log('[API Request] Resposta bem sucedida:', { endpoint, data });
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('[API Request] Erro na requisição:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.name === 'AbortError') {
        throw new Error('A requisição demorou muito para responder. Por favor, tente novamente.');
      }
      throw error;
    }
    console.error('[API Request] Erro inesperado:', error);
    throw new Error('Ocorreu um erro inesperado. Por favor, tente novamente.');
  }
}

// Função para obter o token atual do usuário
async function getCurrentToken() {
  // Espera o estado de autenticação ser inicializado
  return new Promise<string | null>((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe(); // Remove o listener após a primeira chamada
      if (!user) {
        resolve(null);
        return;
      }
      const token = await user.getIdToken();
      resolve(token);
    });
  });
}

// Funções específicas da API
export const api = {
  // Eventos
  events: {
    list: async () => {
      console.log('[API Events] Listando eventos...');
      try {
        // Verificar se a URL da API está definida
        if (!API_URL) {
          console.error('[API Events] URL da API não definida');
          return []; // Retorna array vazio em vez de quebrar a aplicação
        }
        
        const response = await axiosInstance.get<Event[]>('/events');
        return response.data;
      } catch (error) {
        console.error('[API Events] Erro ao listar eventos:', error);
        // Retorna uma lista vazia em caso de erro
        return [];
      }
    },
    get: async (eventId: string): Promise<Event> => {
      const token = await getCurrentToken();
      const response = await axiosInstance.get<Event>(`/events/${eventId}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
      return response.data;
    },
    checkSpot: async (eventId: string, ticketKind: string) => {
      const token = await getCurrentToken();
      console.log(`[API] Verificando disponibilidade para evento ${eventId} e ingresso ${ticketKind}`);
      try {
        const response = await axiosInstance.get(`/events/${eventId}/check-spot`, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`[API] Resposta da verificação: ${JSON.stringify(response.data)}`);
        return response.data;
      } catch (error) {
        console.error(`[API] Erro ao verificar disponibilidade: ${error}`);
        throw error;
      }
    },
    reserveSpot: async (eventId: string, data: { 
      ticket_kind: string;
      userType: 'client' | 'staff';
    }) => {
      const token = await getCurrentToken();
      console.log(`[API] Reservando vaga para evento ${eventId} com dados:`, data);
      try {
        const response = await axiosInstance.post(`/events/${eventId}/reserve-spot`, 
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`[API] Resposta da reserva: ${JSON.stringify(response.data)}`);
        return response.data;
      } catch (error: any) {
        console.error(`[API] Erro ao reservar vaga:`, error);
        if (error.response?.status === 409) {
          console.log(`[API] Usuário já possui reserva para este evento`);
        }
        throw error;
      }
    },
    getInstallments: async (eventId: string) => {
      const token = await getCurrentToken();
      console.log(`[API] Buscando opções de parcelamento para evento ${eventId}`);
      try {
        const response = await axiosInstance.get(`/events/${eventId}/installments`, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`[API] Resposta do parcelamento: ${JSON.stringify(response.data)}`);
        return response.data;
      } catch (error) {
        console.error(`[API] Erro ao buscar parcelamento:`, error);
        throw error;
      }
    }
  },

  // Ingressos
  tickets: {
    list: async () => {
      console.log('[API Tickets] Listando ingressos...');
      const token = await getCurrentToken();
      return request('/tickets', { token });
    },
    get: async (id: string) => {
      console.log('[API Tickets] Buscando ingresso:', id);
      const token = await getCurrentToken();
      return request(`/tickets/${id}`, { token });
    },
    purchase: async (eventId: string) => {
      const token = await getCurrentToken();
      const response = await axiosInstance.get(`/tickets/${eventId}/purchase`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Garante que a resposta tenha um formato consistente para quem está chamando
      if (typeof response.data === 'string') {
        return response.data; // Retorna o status como string
      } else if (response.data && !response.data.status) {
        // Se a API retornar um objeto sem a propriedade status, adiciona o status default
        return { ...response.data, status: 'reserved' };
      }
      return response.data;
    },
    // Método para verificar o status da reserva expirada
    retryPurchase: async (eventId: string) => {
      const token = await getCurrentToken();
      const response = await axiosInstance.get(`/tickets/${eventId}/retry`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    }
  },

  payments: {
    create: async (data: any) => {
      const token = await getCurrentToken();
      const response = await axiosInstance.post('/payments', 
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    }
  },

  users: {
    get: async () => {
      return request('/users', {
        method: 'GET'
      });
    },
    update: async (data: any) => {
      return request('/users', {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },
    post: async (data: any) => {
      return request('/users', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    getReservations: async () => {
      const token = await getCurrentToken();
      const response = await axiosInstance.get('/users/reservations', 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    cancelReservation: async (reservationIdOrEventId?: string) => {
      const token = await getCurrentToken();
      
      // Se não foi passado um ID, faz a chamada geral
      if (!reservationIdOrEventId) {
        const response = await axiosInstance.patch(`/users/cancel-reservation`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      }
      
     
      
        // É um ID de reserva
        const response = await axiosInstance.patch('/users/cancel-reservation',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      
    }
  }
}; 