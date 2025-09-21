import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import userService from '@/services/userService';
import { UserProfile } from '@/types/user';

interface UseUserDataReturn {
  userData: UserProfile | null;
  isExistingUser: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useUserData(): UseUserDataReturn {
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('[useUserData] Hook executando...');
  console.log('[useUserData] user:', user);
  console.log('[useUserData] authLoading:', authLoading);
  console.log('[useUserData] isLoading:', isLoading);

  useEffect(() => {
    async function fetchUserData() {
      if (authLoading) {
        console.log('[useUserData] Auth ainda carregando, aguardando...');
        return;
      }

      if (!user) {
        console.log('[useUserData] Usuário não autenticado, formulário para novo usuário');
        setUserData(null);
        setIsExistingUser(false);
        setIsLoading(false);
        setError(null);
        return;
      }

      try {
        console.log('[useUserData] Buscando dados do usuário autenticado...');
        setIsLoading(true);
        setError(null);
        
        const profile = await userService.getProfile();
        
        if (profile) {
          console.log('[useUserData] Perfil encontrado:', profile);
          setUserData(profile);
          setIsExistingUser(true);
        } else {
          console.log('[useUserData] Perfil não encontrado, novo usuário');
          setUserData(null);
          setIsExistingUser(false);
        }
      } catch (err: any) {
        console.error('[useUserData] Erro ao buscar dados:', err);
        if (err.response?.status === 404) {
          // Usuário autenticado mas sem perfil criado
          console.log('[useUserData] Usuário sem perfil, novo usuário');
          setUserData(null);
          setIsExistingUser(false);
        } else {
          setError(err.message || 'Erro ao carregar dados do usuário');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [user, authLoading]);

  return {
    userData,
    isExistingUser,
    isLoading,
    error
  };
}
