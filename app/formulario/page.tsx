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
import { useCurrentEventContext } from '@/contexts/CurrentEventContext';
import { isAcampamentoEvent, convertAcampamentoToUserProfile } from '@/types/acampamento-form';

export default function FormularioInscricaoPage() {
  const { userData, isLoading: userDataLoading, error: userDataError, isExistingUser } = useUserData();
  const { currentEvent } = useCurrentEventContext();
  
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
      // Limpa máscaras de CPF e documento do responsável antes de enviar ao backend
      cpf: values.cpf ? values.cpf.replace(/\D/g, '') : '',
      documento_responsavel: values.documento_responsavel ? values.documento_responsavel.replace(/\D/g, '') : '',
      responsavel: values.responsavel || '',
      complemento: values.complemento || '',
      info_add: values.info_add || '',
      // Limpa máscara do CEP também
      cep: values.cep ? values.cep.replace(/\D/g, '') : '',
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
      
      // Verifica se é formulário de acampamento
      const isAcampamento = currentEvent ? isAcampamentoEvent(currentEvent.name) : false;
      console.log('É formulário de acampamento?', isAcampamento);
      
      let cleanedData: UserProfile;
      
      if (isAcampamento) {
        // Converte dados do formulário de acampamento
        const acampamentoData = convertAcampamentoToUserProfile(values) as UserProfile;
        
        // Se é usuário existente, preserva campos obrigatórios do perfil
        if (isExistingUser && userData) {
          cleanedData = {
            ...acampamentoData,
            // Preserva campos obrigatórios do perfil existente
            church: userData.church || acampamentoData.church,
            pastor: userData.pastor || acampamentoData.pastor,
            cep: userData.cep || acampamentoData.cep,
            address: userData.address || acampamentoData.address,
            cidade: userData.cidade || acampamentoData.cidade,
            estado: userData.estado || acampamentoData.estado,
            number: userData.number || acampamentoData.number,
            neighborhood: userData.neighborhood || acampamentoData.neighborhood,
          };
          console.log('Dados de acampamento mesclados com perfil existente:', cleanedData);
        } else {
          cleanedData = acampamentoData;
          console.log('Dados de acampamento convertidos:', cleanedData);
        }
      } else {
        // Prepara os dados com valores padrão (formulário normal)
        cleanedData = prepareUserData(values);
        console.log('Dados limpos para envio:', cleanedData);
      }
      
      if (isExistingUser) {
        // Atualiza perfil existente
        console.log('Atualizando perfil existente...');
        await userService.updateProfile(cleanedData);
      } else {
        // Cria novo perfil
        console.log('Criando novo perfil...');
        await userService.createProfile(cleanedData);
      }
      
      // Se é acampamento, envia também para API externa
      if (isAcampamento && currentEvent) {
        console.log('📤 Enviando dados para API externa /events...');
        try {
          const response = await fetch('https://us-central1-federa-api.cloudfunctions.net/api/events', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cleanedData)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Erro da API externa:', errorData);
            throw new Error(errorData.message || 'Erro ao enviar dados para API externa');
          }
          
          const result = await response.json();
          console.log('✅ Resposta da API externa:', result);
        } catch (apiError: any) {
          console.error('❌ Erro ao comunicar com API externa:', apiError);
          // Não bloqueia o fluxo - dados já foram salvos localmente
          // throw apiError; // Descomente se quiser bloquear em caso de erro
        }
      }
      
      console.log('✅ handleSubmit concluído com sucesso - dados salvos!');
      // Redirecionamento é feito no componente MultiStepForm
      // IMPORTANTE: A Promise precisa ser resolvida para o MultiStepForm continuar
      return Promise.resolve();
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
