'use client';

import { useUserProfile } from '@/hooks/useUserProfile';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useEffect, useState } from 'react';
import { UserProfile } from '@/types/user';

interface EditProfileForEventPageProps {
  params: {
    eventId: string;
  };
}

export default function EditProfileForEventPage({ params }: EditProfileForEventPageProps) {
  const { profile: rawProfile, loading, error } = useUserProfile();
  const [processedProfile, setProcessedProfile] = useState<UserProfile | null>(null);
  const router = useRouter();
  const { eventId } = params;
  const searchParams = useSearchParams();
  const ticketKind = searchParams?.get('ticketKind') || 'full';

  useEffect(() => {
    if (rawProfile) {
      try {
        console.log('Perfil recebido:', rawProfile);
        
        const cleanedProfile = { ...rawProfile };
        
        // Converte idade para número
        if (typeof cleanedProfile.idade === 'string') {
          const idadeValue = String(cleanedProfile.idade).trim();
          // Verifica se é uma string que pode ser convertida para número
          if (/^\d+$/.test(idadeValue)) {
            cleanedProfile.idade = parseInt(idadeValue, 10);
          } else {
            // Se não for um número válido, definimos um valor padrão
            console.warn('Idade inválida recebida:', cleanedProfile.idade);
            cleanedProfile.idade = 0;
          }
        }
        
        // Formata os campos para exibição
        if (cleanedProfile.cellphone) {
          const numericOnly = cleanedProfile.cellphone.replace(/\D/g, '').slice(-9);
          if (numericOnly.length === 9) {
            cleanedProfile.cellphone = `${numericOnly.slice(0, 5)}-${numericOnly.slice(5)}`;
          }
        }
        
        if (cleanedProfile.ddd) {
          cleanedProfile.ddd = cleanedProfile.ddd.replace(/\D/g, '').slice(0, 2);
        }
        
        if (cleanedProfile.cep) {
          const numericOnly = cleanedProfile.cep.replace(/\D/g, '').slice(0, 8);
          if (numericOnly.length === 8) {
            cleanedProfile.cep = `${numericOnly.slice(0, 2)}.${numericOnly.slice(2, 5)}-${numericOnly.slice(5)}`;
          }
        }
        
        if (cleanedProfile.cpf) {
          const numericOnly = cleanedProfile.cpf.replace(/\D/g, '').slice(0, 11);
          if (numericOnly.length === 11) {
            cleanedProfile.cpf = `${numericOnly.slice(0, 3)}.${numericOnly.slice(3, 6)}.${numericOnly.slice(6, 9)}-${numericOnly.slice(9)}`;
          }
        }
        
        if (cleanedProfile.data_nasc) {
          const numericOnly = cleanedProfile.data_nasc.replace(/\D/g, '').slice(0, 8);
          if (numericOnly.length === 8) {
            cleanedProfile.data_nasc = `${numericOnly.slice(0, 2)}/${numericOnly.slice(2, 4)}/${numericOnly.slice(4)}`;
          }
        }
        
        // Formata campos do responsável
        if (cleanedProfile.cellphone_responsavel) {
          const numericOnly = cleanedProfile.cellphone_responsavel.replace(/\D/g, '').slice(-9);
          if (numericOnly.length === 9) {
            cleanedProfile.cellphone_responsavel = `${numericOnly.slice(0, 5)}-${numericOnly.slice(5)}`;
          }
        }
        
        if (cleanedProfile.ddd_responsavel) {
          cleanedProfile.ddd_responsavel = cleanedProfile.ddd_responsavel.replace(/\D/g, '').slice(0, 2);
        }
        
        if (cleanedProfile.documento_responsavel) {
          const numericOnly = cleanedProfile.documento_responsavel.replace(/\D/g, '').slice(0, 11);
          if (numericOnly.length === 11) {
            cleanedProfile.documento_responsavel = `${numericOnly.slice(0, 3)}.${numericOnly.slice(3, 6)}.${numericOnly.slice(6, 9)}-${numericOnly.slice(9)}`;
          }
        }

        console.log('Perfil processado:', cleanedProfile);
        setProcessedProfile({...cleanedProfile});
      } catch (err) {
        console.error('Erro ao processar perfil:', err);
        setProcessedProfile({...rawProfile} as UserProfile);
      }
    }
  }, [rawProfile]);

  // Renderiza o formulário apenas quando os dados estiverem prontos
  const renderForm = () => {
    if (!processedProfile) return null;
    
    return (
      <ProfileForm 
        key={JSON.stringify(processedProfile)} // Força re-renderização quando os dados mudarem
        initialData={processedProfile} 
        redirectToEvent={eventId}
        ticketKind={ticketKind}
        isOpen={true} // Na página de edição, sempre consideramos que está aberto pois o usuário já está no fluxo de compra
      />
    );
  };

  return (
    <ProtectedRoute>
      {loading ? (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex min-h-screen items-center justify-center">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-red-600">Erro ao carregar perfil</h2>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <Button onClick={() => router.refresh()} className="mt-4">
              Tentar novamente
            </Button>
          </Card>
        </div>
      ) : (
        <div className="container py-10">
          <h1 className="text-2xl font-bold mb-6 text-center">Atualize seus dados para continuar com a compra</h1>
          <p className="text-center text-muted-foreground mb-8">
            Precisamos garantir que suas informações estão atualizadas antes de prosseguir com a compra do ingresso.
          </p>
          {renderForm()}
        </div>
      )}
    </ProtectedRoute>
  );
}