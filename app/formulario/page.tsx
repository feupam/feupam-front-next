'use client';

import React, { useState, useEffect } from 'react';
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
import { auth } from '@/lib/firebase';
import { useEventStorage } from '@/hooks/useEventStorage';

export default function FormularioInscricaoPage() {
  const { userData, isLoading: userDataLoading, error: userDataError, isExistingUser } = useUserData();
  const { currentEvent, setCurrentEventByName, setCurrentEventFromData } = useCurrentEventContext();
  const { selectedEvent } = useEventStorage();
  
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const ticketKind = searchParams?.get('ticketKind') || 'full';
  const eventNameFromUrl = searchParams?.get('eventName');

  console.log('=== FORMULARIO PAGE ===');
  console.log('userDataLoading:', userDataLoading);
  console.log('userDataError:', userDataError);
  console.log('userData:', userData);
  console.log('isExistingUser:', isExistingUser);
  console.log('eventNameFromUrl:', eventNameFromUrl);
  console.log('currentEvent:', currentEvent?.name);
  console.log('selectedEvent:', selectedEvent?.name);

  // Carregar evento do localStorage ou URL
  useEffect(() => {
    console.log('[Formulario] Verificando evento...');
    console.log('[Formulario] eventNameFromUrl:', eventNameFromUrl);
    console.log('[Formulario] selectedEvent:', selectedEvent?.name);
    console.log('[Formulario] currentEvent:', currentEvent?.name);

    // Prioridade 1: localStorage (selected_event)
    if (selectedEvent && selectedEvent.eventStatus) {
      const eventName = selectedEvent.name;
      
      // Se o currentEvent não existe ou é diferente do selectedEvent, atualizar
      if (!currentEvent || currentEvent.name !== eventName) {
        console.log('[Formulario] Carregando evento do localStorage:', eventName);
        setCurrentEventFromData(selectedEvent.eventStatus);
      }
    }
    // Prioridade 2: URL params
    else if (eventNameFromUrl && (!currentEvent || currentEvent.name !== eventNameFromUrl)) {
      console.log('[Formulario] Carregando evento da URL:', eventNameFromUrl);
      setCurrentEventByName(eventNameFromUrl);
    }
  }, [eventNameFromUrl, selectedEvent, currentEvent, setCurrentEventByName, setCurrentEventFromData]);

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
    const normalizeYesNo = (v: any) => {
      if (v === undefined || v === null) return '';
      const s = String(v).trim().toLowerCase();
      if (['sim', 's', 'true', '1', 'yes', 'y'].includes(s)) return 'Sim';
      if (['não', 'nao', 'n', 'false', '0', 'no'].includes(s)) return 'Não';
      // Se vier um texto livre, mantém, mas evita valores vazios
      return s.length > 0 ? (v as string) : '';
    };
    
    // Se não há userData, retorna apenas os valores padrão
    if (!userData) {
      return {
        estado: 'MG', // Valor padrão para estado
        // Valores padrão seguros para selects obrigatórios da seção de saúde
        alergia: 'Não',
        medicamento: 'Não',
      };
    }
    
    return {
      ...userData,
      // Reconstrói o telefone principal com DDD
      cellphone: formatPhoneFromParts(userData.ddd, userData.cellphone),
      // Reconstrói o telefone do responsável com DDD
      cellphone_responsavel: formatPhoneFromParts(userData.ddd_responsavel, userData.cellphone_responsavel),
      // Garante que o estado tenha valor padrão se não existir
      estado: userData.estado || 'MG',
      // Normaliza valores vindos do backend para opções válidas do Select
      alergia: userData.alergia ? normalizeYesNo(userData.alergia) || 'Não' : 'Não',
      medicamento: userData.medicamento ? normalizeYesNo(userData.medicamento) || 'Não' : 'Não',
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
        // Captura email do Firebase Auth
        const currentUser = auth.currentUser;
        const userEmail = currentUser?.email || userData?.email || '';
        
        // Converte dados do formulário de acampamento
        const acampamentoData = convertAcampamentoToUserProfile({
          ...values,
          email: userEmail // Email vem do Firebase Auth, não do formulário
        }) as UserProfile;
        
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
        // Captura email do Firebase Auth para formulário normal
        const currentUser = auth.currentUser;
        const userEmail = currentUser?.email || userData?.email || '';
        
        // Prepara os dados com valores padrão (formulário normal)
        cleanedData = {
          ...prepareUserData(values),
          email: userEmail // Email vem do Firebase Auth, não do formulário
        };
        console.log('Dados limpos para envio:', cleanedData);
      }
      
      // Pega o nome do evento atual do contexto
      const eventNameToAdd = currentEvent?.name;
      console.log('Nome do evento atual para adicionar:', eventNameToAdd);
      
      if (isExistingUser) {
        // Atualiza perfil existente
        console.log('Atualizando perfil existente...');
        await userService.updateProfile(cleanedData, eventNameToAdd);
      } else {
        // Cria novo perfil
        console.log('Criando novo perfil...');
        await userService.createProfile(cleanedData, eventNameToAdd);
      }
      
      // Se é acampamento, envia também para API externa
      if (isAcampamento && currentEvent) {
        console.log('📤 Enviando dados para API externa /events...');
        try {
          // Usa o cliente centralizado que injeta Authorization (dev token ou Firebase)
          const { request } = await import('@/lib/api');
          const result = await request<any>('/events', {
            method: 'POST',
            body: JSON.stringify(cleanedData),
          });
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
