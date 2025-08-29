'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types/user';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import userService from '@/services/userService';

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: UserProfile) => Promise<void>;
  isProfileComplete: boolean;
}

export function useUserProfile(): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        try {
          const profileData = await userService.getProfile();
          setProfile(profileData);
        } catch (err: any) {
          // Verifica se o erro é 404 (usuário não encontrado)
          if (err.response && err.response.status === 404) {
            console.log('Usuário não encontrado. Criando formulário vazio...');
            // Em vez de mostrar erro, apenas configura um perfil vazio para novo usuário
            setProfile({
              userType: 'client',
              name: '',
              email: user.email || '',
              church: '',
              pastor: '',
              ddd: '',
              cellphone: '',
              gender: 'male',
              cep: '',
              cpf: '',
              data_nasc: '',
              idade: 0,
              address: '',
              cidade: '',
              estado: '',
              alergia: 'Não',
              medicamento: 'Não'
            } as UserProfile);
          } else {
            // Outros erros ainda mostram mensagem
            console.error('Erro ao carregar perfil:', err);
            setError('Erro ao carregar perfil');
          }
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
        setError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const updateProfile = async (data: UserProfile) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProfile = await userService.updateProfile(data);
      setProfile(updatedProfile);
    } catch (err) {
      setError('Erro ao atualizar perfil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isProfileComplete = Boolean(
    profile?.name &&
    profile?.church &&
    profile?.pastor &&
    profile?.ddd &&
    profile?.cellphone &&
    profile?.gender &&
    profile?.cep &&
    profile?.cpf &&
    profile?.data_nasc &&
    profile?.idade &&
    profile?.address &&
    profile?.cidade &&
    profile?.estado &&
    profile?.alergia &&
    profile?.medicamento
  );

  return {
    profile,
    loading,
    error,
    updateProfile,
    isProfileComplete,
  };
} 