import { api } from './api';
import * as apiService from "./api";
import type { UserProfile } from '@/types/user';

/**
 *          // Se o erro for de autenticação (401), deixa o interceptor do axios tratar
      if (error.response?.status === 401) {
        throw error;
      }

      // Se a resposta for JSON, usa a mensagem da API
        if (responseData.message || typeof responseData === 'string') {
          const message = typeof responseData === 'string' 
            ? responseData 
            : responseData.message || 'Erro ao salvar o perfil.';
            
          const customError = new Error(message);
          customError.name = 'ApiError';
          // @ts-ignore
          customError.statusCode = error.response?.status || 500;
          // @ts-ignore
          customError.originalError = error;
          // @ts-ignore
          customError.apiResponse = responseData;
          
          throw customError;
        }ormato de resposta do servidor para o formato usado na aplicação
 */
const processUserResponse = (data: any): UserProfile => {
  // Se tiver no formato enviado pelo servidor com _fieldsProto
  if (data.userId && data.userId._fieldsProto) {
    const userData = data.userId._fieldsProto;
    const processedData: Record<string, any> = {};
    
    // Processa cada campo convertendo para o tipo apropriado
    Object.keys(userData).forEach(key => {
      const field = userData[key];
      if (field.integerValue) {
        processedData[key] = parseInt(field.integerValue, 10);
      } else if (field.stringValue) {
        processedData[key] = field.stringValue;
      } else if (field.booleanValue !== undefined) {
        processedData[key] = field.booleanValue;
      }
    });
    
    return processedData as UserProfile;
  }
  
  // Se já estiver no formato esperado, retorna diretamente
  return data as UserProfile;
};

/**
 * Serviço para gerenciar operações relacionadas ao usuário
 */
const userService = {
  /**
   * Busca o perfil do usuário atual
   */
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await api.get('/users');
      return processUserResponse(response.data);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // Retorna um perfil vazio se o usuário não existir
        throw error; // Propaga o erro para ser tratado pelo caller
      }
      throw error;
    }
  },

  /**
   * Verifica se o perfil do usuário existe
   */
  checkProfileExists: async (): Promise<boolean> => {
    try {
      await api.get('/users');
      return true;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return false;
      }
      throw error;
    }
  },

  /**
   * Cria um novo perfil de usuário
   */
  createProfile: async (profileData: UserProfile): Promise<UserProfile> => {
    try {
      console.log('Criando novo perfil com método POST');
      
      // Garantir que campos opcionais estejam presentes como strings vazias
      const dataToSend = {
        ...profileData,
        complemento: profileData.complemento || '',
        info_add: profileData.info_add || '',
        responsavel: profileData.responsavel || '',
        documento_responsavel: profileData.documento_responsavel || '',
        ddd_responsavel: profileData.ddd_responsavel || '',
        cellphone_responsavel: profileData.cellphone_responsavel || ''
      };

      const response = await apiService.users.createUser(dataToSend);
      
      // Verifica se a resposta é HTML em vez de JSON
      const contentType = response.headers?.['content-type'];
      if (contentType?.includes('text/html')) {
        throw new Error('Servidor retornou HTML em vez de JSON. Possível erro de servidor.');
      }
      
      return processUserResponse(response.data);
    } catch (error: any) {
      console.error('Erro ao criar perfil:', error);
      
      // Se a resposta contiver HTML, trata como erro de servidor
      if (error.response?.data && typeof error.response.data === 'string' && 
          (error.response.data.includes('<!DOCTYPE') || error.response.data.includes('<html'))) {
        throw new Error('O servidor está indisponível no momento. Por favor, tente novamente mais tarde.');
      }
      
      // Se o content-type indica que é HTML, também trata como erro de servidor
      const contentType = error.response?.headers?.['content-type'];
      if (contentType?.includes('text/html')) {
        throw new Error('O servidor está indisponível no momento. Por favor, tente novamente mais tarde.');
      }

      // Captura a mensagem de erro da API para melhor tratamento
      if (error.response?.data) {
        const responseData = error.response.data;
        
        // Se a resposta for JSON, usa a mensagem da API
        if (responseData.message) {
          const customError = new Error(responseData.message);
          customError.name = 'ApiError';
          // @ts-ignore
          customError.statusCode = responseData.statusCode || error.response.status;
          // @ts-ignore
          customError.originalError = error;
          // @ts-ignore
          customError.apiResponse = responseData;
          
          throw customError;
        }
      }
      
      // Se não conseguimos extrair uma mensagem específica, usa uma mensagem genérica
      throw new Error('Não foi possível se comunicar com o servidor. Verifique sua conexão e tente novamente.');
    }
  },

  /**
   * Atualiza o perfil do usuário ou cria se não existir
   */
  updateProfile: async (profileData: UserProfile): Promise<UserProfile> => {
    try {
      // Verifica se o perfil existe
      const profileExists = await userService.checkProfileExists();
      
      // Se o perfil não existe, usa POST (criar), senão usa PATCH (atualizar)
      if (!profileExists) {
        console.log('Perfil não existe, redirecionando para createProfile');
        return await userService.createProfile(profileData);
      }
      
      // Filtra apenas os campos que serão atualizados
      const fieldsToUpdate = {
        name: profileData.name,
        email: profileData.email,
        gender: profileData.gender,
        church: profileData.church,
        pastor: profileData.pastor,
        data_nasc: profileData.data_nasc,
        cpf: profileData.cpf,
        alergia: profileData.alergia,
        medicamento: profileData.medicamento,
        ddd: profileData.ddd,
        cellphone: profileData.cellphone,
        cep: profileData.cep,
        address: profileData.address,
        cidade: profileData.cidade,
        estado: profileData.estado,
        idade: profileData.idade,
        complemento: profileData.complemento,
        info_add: profileData.info_add,
        userType: profileData.userType
      };

      console.log('Atualizando perfil existente com PATCH');
      try {
        const dataToUpdate = {
          ...fieldsToUpdate,
          complemento: fieldsToUpdate.complemento || '',
          info_add: fieldsToUpdate.info_add || ''
        };

        const response = await apiService.users.updateUser(dataToUpdate);
        return processUserResponse(response.data);
      } catch (error: any) {
        console.error('Erro ao atualizar perfil com PATCH:', error);
        
        // Captura a mensagem de erro da API para melhor tratamento
        if (error.response && error.response.data) {
          const responseData = error.response.data;
          
          // Repassamos o erro com a mensagem original da API
          if (responseData.message) {
            const customError = new Error(responseData.message);
            // Preservamos os dados originais para análise
            customError.name = 'ApiError';
            // @ts-ignore
            customError.statusCode = responseData.statusCode || error.response.status;
            // @ts-ignore
            customError.originalError = error;
            // @ts-ignore
            customError.apiResponse = responseData;
            
            throw customError;
          }
        }
        
        // Se não conseguimos extrair uma mensagem específica, propagamos o erro original
        throw error;
      }
    } catch (error: any) {
      console.error('Erro ao processar operação de perfil:', error);
      throw error;
    }
  }
};

export default userService;