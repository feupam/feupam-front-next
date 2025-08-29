import axios from 'axios';
import { auth } from '@/lib/firebase';
import { apiLogger } from '@/lib/debug';

// Custom error type for payment errors
interface PaymentError extends Error {
  response?: any;
}

// Verificar a variável de ambiente
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Se não estiver definida, apenas log de aviso
if (!API_URL) {
  console.warn('[API Service] AVISO: NEXT_PUBLIC_API_URL não está definida. A API não funcionará corretamente.');
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error('Erro ao obter token:', error);
    return config;
  }
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Se for erro 401, tenta renovar o token
    if (error.response?.status === 401) {
      const user = auth.currentUser;
      if (!user) {
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Força renovação do token
        const newToken = await user.getIdToken(true);
        error.config.headers.Authorization = `Bearer ${newToken}`;
        // Refaz a requisição com o novo token
        return axios(error.config);
      } catch (refreshError: any) {
        if (refreshError.code === 'auth/requires-recent-login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Trata erros específicos do fluxo de reserva
    if (error.response?.status === 400) {
      const responseData = error.response.data;
      
      if (responseData.code === 'SPOT_ALREADY_RESERVED') {
        error.message = 'Este lugar já está reservado. Por favor, escolha outro.';
      } else if (responseData.code === 'INVALID_TICKET_KIND') {
        error.message = 'Tipo de ingresso inválido.';
      } else if (responseData.message) {
        error.message = responseData.message;
      }
      
      error.apiResponse = responseData;
    }

    // Log detalhado do erro
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

// Log API request
api.interceptors.request.use(config => {
  console.log('[API Request]', config.method?.toUpperCase(), config.url);
  return config;
});

// Log API response
api.interceptors.response.use(
  response => {
    console.log('[API Response]', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('[API Response Error]', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const tickets = {
  // Purchase ticket check
  purchase: async (eventId: string, email: string) => {
    try {
      const response = await api.get(`/tickets/${eventId}/purchase`);
      return response.data;
    } catch (error: any) {
      // Improve error handling for specific cases
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Erro ao verificar o ticket';
        const customError = new Error(message);
        customError.name = 'ApiError';
        throw customError;
      }
      console.error('[API Error] Failed to verify ticket:', error.message);
      throw error;
    }
  },

  // Retry purchase with existing reservation
  retryPurchase: async (eventId: string) => {
    try {
      const response = await api.get(`/tickets/${eventId}/retry`);
      return response.data;
    } catch (error: any) {
      console.error('[API Error] Failed to retry purchase:', error.message);
      throw error;
    }
  }
};

export const users = {
  // User management
  createOrUpdate: async (userData: any) => {
    try {
      // Try to get user profile first
      try {
        const getResponse = await api.get('/users');
        // If successful, user exists, so update
        const response = await api.patch('/users', userData);
        return {
          data: response.data,
          headers: response.headers
        };
      } catch (error: any) {
        // If 404, user doesn't exist, so create
        if (error.response?.status === 404) {
          const response = await api.post('/users', userData);
          return {
            data: response.data,
            headers: response.headers
          };
        }
        throw error;
      }
    } catch (error: any) {
      console.error('[API Error] Failed to create/update user:', error.message);
      throw error;
    }
  },

  // Create a new user
  createUser: async (userData: any) => {
    const response = await api.post('/users', userData);
    return {
      data: response.data,
      headers: response.headers
    };
  },

  // Update existing user
  updateUser: async (userData: any) => {
    const response = await api.patch('/users', userData);
    return {
      data: response.data,
      headers: response.headers
    };
  },

  // Get user's reservations
  getReservations: async () => {
    try {
      const response = await api.get('/users/reservations');
      return response.data;
    } catch (error: any) {
      console.error('[API Error] Failed to get reservations:', error.message);
      throw error;
    }
  }
};

export const payments = {
  // Process payment
  process: async (paymentData: {
    eventId: string;
    method: 'PIX' | 'CREDIT_CARD';
    installments?: number;
    cardToken?: string;
    cpfCnpj: string;
    email: string;
    phone: string;
  }) => {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Erro ao processar o pagamento';
        const customError = new Error(message) as PaymentError;
        customError.name = 'PaymentError';
        customError.response = error.response;
        throw customError;
      }
      console.error('[API Error] Failed to process payment:', error.message);
      throw error;
    }
  },

  // Get installment options
  getInstallments: async (eventId: string, amount: number) => {
    try {
      const response = await api.get(`/payments/${eventId}/installments`, {
        params: { amount }
      });
      return response.data;
    } catch (error: any) {
      console.error('[API Error] Failed to get installment options:', error.message);
      throw error;
    }
  },

  // Validate coupon
  validateCoupon: async (eventId: string, code: string) => {
    try {
      const response = await api.get(`/payments/${eventId}/coupon/${code}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Cupom inválido';
        const customError = new Error(message);
        customError.name = 'CouponError';
        throw customError;
      }
      console.error('[API Error] Failed to validate coupon:', error.message);
      throw error;
    }
  }
};

export const events = {
  // Check spot availability
  checkSpot: async (eventId: string, ticketKind: string) => {
    try {
      const response = await api.get(`/events/${eventId}/check-spot?ticket_kind=${ticketKind}`);
      return response.data;
    } catch (error: any) {
      console.error('[API Error] Failed to check spot availability:', error.message);
      throw error;
    }
  },

  // Reservation
  reserveSpot: async (eventId: string, ticketData: { ticket_kind: string, userType: string }) => {
    try {
      const response = await api.post(`/events/${eventId}/reserve-spot`, ticketData);
      return response.data;
    } catch (error: any) {
      console.error('[API Error] Failed to reserve spot:', error.message);
      throw error;
    }
  },

  // Direct to checkout after successful reservation
  goToCheckout: async (eventId: string) => {
    try {
      const response = await api.get(`/events/${eventId}/checkout`);
      return response.data;
    } catch (error: any) {
      console.error('[API Error] Failed to proceed to checkout:', error.message);
      throw error;
    }
  }
};
export function createOrUpdateUser(fieldsToUpdate: { name: string; email: string; gender: "male" | "female"; church: string; pastor: string; data_nasc: string; cpf: string; alergia: string; medicamento: string; ddd: string; cellphone: string; cep: string; address: string; cidade: string; estado: string; idade: number; complemento: string | undefined; info_add: string | undefined; userType: "client" | "staff"; }) {
  throw new Error('Function not implemented.');
}

