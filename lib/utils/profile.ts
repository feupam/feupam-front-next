import type { UserProfile } from '@/types/user';

/**
 * Verifica se o perfil do usuário está completo para prosseguir com uma compra
 * @param profile O perfil do usuário a ser verificado
 * @returns true se o perfil estiver completo, false caso contrário
 */
export function isProfileComplete(profile: UserProfile | null): boolean {
  if (!profile) return false;

  // Campos obrigatórios para completar uma compra
  const requiredFields: (keyof UserProfile)[] = [
    'name',
    'cpf',
    'ddd',
    'cellphone',
    'email'
  ];

  // Verifica se todos os campos obrigatórios estão preenchidos
  return requiredFields.every(field => 
    profile[field] !== undefined && 
    profile[field] !== null && 
    String(profile[field]).trim() !== ''
  );
} 