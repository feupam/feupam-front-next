'use client';

import React, { useState } from 'react';
import MultiStepForm from '@/components/forms/MultiStepForm';
import { useUserData } from '@/hooks/use-user-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import userService from '@/services/userService';
import { UserProfile } from '@/types/user';
import { useSearchParams } from 'next/navigation';

export default function FormularioInscricaoPage() {
  const { userData, isLoading: userDataLoading, error: userDataError, isExistingUser } = useUserData();
  
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const ticketKind = searchParams?.get('ticketKind') || 'full';

  console.log('=== FORMULARIO PAGE ===');
  console.log('userDataLoading:', userDataLoading);
  console.log('userDataError:', userDataError);
  console.log('userData:', userData);
  console.log('isExistingUser:', isExistingUser);

  // Função para reconstruir telefone no formato (xx) xxxxx-xxxx a partir de ddd e numero separados
  const formatPhoneFromParts = (ddd: string, phone: string) => {
    if (!ddd || !phone) return '';
    
    // Remove caracteres não numéricos do telefone
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Formata no padrão (xx) xxxxx-xxxx
    if (cleanPhone.length === 9) {
      return `(${ddd}) ${cleanPhone.substring(0, 5)}-${cleanPhone.substring(5)}`;
    } else if (cleanPhone.length === 8) {
      return `(${ddd}) ${cleanPhone.substring(0, 4)}-${cleanPhone.substring(4)}`;
    }
    
    return `(${ddd}) ${cleanPhone}`;
  };

  // Função para preparar valores iniciais do formulário
  const prepareInitialValues = (userData: any) => {
    console.log('Preparando valores iniciais com userData:', userData);
    
    // Se não há userData, retorna apenas os valores padrão
    if (!userData) {
      return {
        estado: 'MG' // Valor padrão para estado
      };
    }
    
    return {
      ...userData,
      // Reconstrói o telefone principal com DDD
      cellphone: formatPhoneFromParts(userData.ddd, userData.cellphone),
      // Reconstrói o telefone do responsável com DDD
      cellphone_responsavel: formatPhoneFromParts(userData.ddd_responsavel, userData.cellphone_responsavel),
      // Garante que o estado tenha valor padrão se não existir
      estado: userData.estado || 'MG'
    };
  };

  // Função para extrair DDD e número de telefone do formato (xx) xxxxx-xxxx
  const extractPhoneData = (formattedPhone: string) => {
    if (!formattedPhone) return { ddd: '', phone: '' };
    
    // Remove todos os caracteres não numéricos
    const numbersOnly = formattedPhone.replace(/\D/g, '');
    
    if (numbersOnly.length >= 10) {
      const ddd = numbersOnly.substring(0, 2);
      const phone = numbersOnly.substring(2);
      return { ddd, phone };
    }
    
    return { ddd: '', phone: numbersOnly };
  };

  // Função para limpar e validar dados antes do envio
  const prepareUserData = (values: Record<string, any>): UserProfile => {
    // Extrai DDD e telefone principal
    const mainPhone = extractPhoneData(values.cellphone);
    
    // Extrai DDD e telefone do responsável
    const responsavelPhone = extractPhoneData(values.cellphone_responsavel);
    
    return {
      ...values,
      userType: 'client', // Força o userType como client
      ddd: mainPhone.ddd, // DDD extraído do telefone principal
      cellphone: mainPhone.phone, // Número sem DDD
      ddd_responsavel: responsavelPhone.ddd || '', // DDD do responsável
      cellphone_responsavel: responsavelPhone.phone || '', // Número do responsável sem DDD
      documento_responsavel: values.documento_responsavel || '',
      responsavel: values.responsavel || '',
      complemento: values.complemento || '',
      info_add: values.info_add || '',
      lgpdConsentAccepted: Boolean(values.lgpdConsentAccepted), // Força conversão para boolean
      wantShirt: Boolean(values.wantShirt),
      isStaff: Boolean(values.isStaff),
      staffPassword: values.staffPassword || ''
    } as UserProfile;
  };

  const handleSubmit = async (values: Record<string, any>) => {
    setIsLoading(true);
    try {
      console.log('Dados do formulário:', values);
      
      // Prepara os dados com valores padrão
      const cleanedData = prepareUserData(values);
      console.log('Dados limpos para envio:', cleanedData);
      
      if (isExistingUser) {
        // Atualiza perfil existente
        console.log('Atualizando perfil existente...');
        await userService.updateProfile(cleanedData);
      } else {
        // Cria novo perfil
        console.log('Criando novo perfil...');
        await userService.createProfile(cleanedData);
      }
      // Redirecionamento é feito no componente MultiStepForm
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      throw error; // Propaga o erro para que o MultiStepForm possa tratá-lo
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state para dados do usuário
  if (userDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-lg">Carregando dados do usuário...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (userDataError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar dados</h2>
          <p className="text-muted-foreground mb-4">{userDataError}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </Card>
      </div>
    );
  }

  // Para novos usuários (userData = null), mostra formulário vazio para preenchimento
  // Para usuários existentes (userData preenchido), mostra formulário com dados pré-preenchidos
  const formInitialValues = prepareInitialValues(userData);
  
  console.log('Valores iniciais do formulário:', formInitialValues);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {isExistingUser ? 'Atualizar Dados' : 'Formulário de Inscrição'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isExistingUser 
              ? 'Atualize suas informações para o evento. Seus dados atuais estão pré-preenchidos.'
              : 'Complete suas informações para finalizar a inscrição no evento. Você pode salvar o progresso e continuar depois.'
            }
          </p>
          {isExistingUser && (
            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 rounded-lg inline-block">
              ✅ Usuário cadastrado - Modo atualização
            </div>
          )}
        </div>

        <MultiStepForm
          initialValues={formInitialValues}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isExistingUser={isExistingUser}
          ticketKind={ticketKind}
        />
      </div>
    </div>
  );
}
