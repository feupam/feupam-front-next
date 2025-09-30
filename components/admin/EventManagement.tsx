'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUpload } from '@/components/ui/image-upload';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAdminEvents } from '@/hooks/useAdminEvents';
import { formatBrazilianDateTimeToISO, formatToBrazilianDisplay } from '@/lib/utils/brazilian-datetime';
import { useLoading } from '@/contexts/LoadingContext';

export function EventManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { events, loading: eventsLoading, refetch } = useAdminEvents();
  const [loading, setLoading] = useState(false);
  const { setLoading: setGlobalLoading } = useLoading();

  // Create Event Form
  const [createEventData, setCreateEventData] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
    eventType: 'general',
    maxClientMale: '0',
    maxClientFemale: '0',
    maxStaffMale: '0',
    maxStaffFemale: '0',
    maxGeneralSpots: '200',
    startDate: '',
    endDate: '',
    price: '5000',
    isUnlimited: false
  });

  // Image files
  const [imageFiles, setImageFiles] = useState<{
    logo_evento: File | null;
    image_capa: File | null;
  }>({
    logo_evento: null,
    image_capa: null
  });

  // Update Image files
  const [updateImageFiles, setUpdateImageFiles] = useState<{
    logo_evento: File | null;
    image_capa: File | null;
  }>({
    logo_evento: null,
    image_capa: null
  });

  // Image validation errors
  const [imageErrors, setImageErrors] = useState<{
    logo_evento?: string;
    image_capa?: string;
  }>({});

  // Update Image validation errors
  const [updateImageErrors, setUpdateImageErrors] = useState<{
    logo_evento?: string;
    image_capa?: string;
  }>({});

  // Feedback visual de status
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({
    type: 'idle',
    message: ''
  });

  // Update/Delete Event Form
  const [eventId, setEventId] = useState<string>('');
  const [updateEventData, setUpdateEventData] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
    eventType: 'general',
    maxClientMale: '0',
    maxClientFemale: '0',
    maxStaffMale: '0',
    maxStaffFemale: '0',
    maxGeneralSpots: '200',
    startDate: '',
    endDate: '',
    price: '5000',
    isUnlimited: false
  });

  // Função para preencher os campos ao selecionar um evento
  const handleEventSelection = (selectedEventId: string) => {
    setEventId(selectedEventId);
    
    const selectedEvent = events.find(e => e.id === selectedEventId);
    if (selectedEvent) {
      console.log('[EventManagement] Evento selecionado:', selectedEvent);
      console.log('[EventManagement] Price original do evento:', selectedEvent.price);
      console.log('[EventManagement] Price que será usado:', selectedEvent.price || 5000);
      
      // Converter datas para formato de input datetime-local
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Ajustar para timezone local
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().slice(0, 16);
      };

      // Garantir que os valores numéricos sejam tratados corretamente
      const maxGeneralSpots = selectedEvent.maxGeneralSpots || 0;
      const isUnlimited = maxGeneralSpots >= 10000;
      
      console.log('[EventManagement] maxGeneralSpots original:', selectedEvent.maxGeneralSpots);
      console.log('[EventManagement] maxGeneralSpots processado:', maxGeneralSpots);
      console.log('[EventManagement] isUnlimited:', isUnlimited);

      setUpdateEventData({
        name: selectedEvent.name || '',
        date: selectedEvent.date ? selectedEvent.date.split('T')[0] : '',
        location: selectedEvent.location || '',
        description: selectedEvent.description || '',
        eventType: selectedEvent.eventType || 'general',
        maxClientMale: String(selectedEvent.maxClientMale || 0),
        maxClientFemale: String(selectedEvent.maxClientFemale || 0),
        maxStaffMale: String(selectedEvent.maxStaffMale || 0),
        maxStaffFemale: String(selectedEvent.maxStaffFemale || 0),
        maxGeneralSpots: String(maxGeneralSpots),
        startDate: formatDateForInput(selectedEvent.startDate || ''),
        endDate: formatDateForInput(selectedEvent.endDate || ''),
        price: String(selectedEvent.price || 5000),
        isUnlimited: isUnlimited
      });
    }
  };

  // Limpar campos quando nenhum evento está selecionado
  useEffect(() => {
    if (!eventId) {
      setUpdateEventData({
        name: '',
        date: '',
        location: '',
        description: '',
        eventType: 'general',
        maxClientMale: '0',
        maxClientFemale: '0',
        maxStaffMale: '0',
        maxStaffFemale: '0',
        maxGeneralSpots: '200',
        startDate: '',
        endDate: '',
        price: '5000',
        isUnlimited: false
      });
      
      // Limpar também as imagens
      setUpdateImageFiles({
        logo_evento: null,
        image_capa: null
      });
      setUpdateImageErrors({});
    }
  }, [eventId]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGlobalLoading(true);
    setSubmitStatus({ type: 'idle', message: '' });

    try {
      console.log('[EventManagement] Criando evento:', createEventData.name);

      // Validações de data
      if (createEventData.startDate && createEventData.endDate) {
        const startDate = new Date(createEventData.startDate);
        const endDate = new Date(createEventData.endDate);
        
        if (startDate >= endDate) {
          setSubmitStatus({ 
            type: 'error', 
            message: 'A data de início deve ser anterior à data de fim' 
          });
          setLoading(false);
          return;
        }
      }

      // Validar se as imagens obrigatórias foram enviadas
      if (!imageFiles.logo_evento) {
        setImageErrors({ ...imageErrors, logo_evento: 'Logo do evento é obrigatório' });
        setSubmitStatus({ type: 'error', message: 'Logo do evento é obrigatório' });
        setLoading(false);
        return;
      }

      if (!imageFiles.image_capa) {
        console.error('[EventManagement] Imagem de capa não foi selecionada');
        setImageErrors({ ...imageErrors, image_capa: 'Imagem de capa é obrigatória' });
        setSubmitStatus({ type: 'error', message: 'Imagem de capa é obrigatória' });
        setLoading(false);
        return;
      }

      const token = await user?.getIdToken();
      
      // Preparar dados baseado no tipo de evento
      let eventDataToSend = { ...createEventData };
      
      if (createEventData.eventType === 'general') {
        // Para eventos gerais, zera os campos por gênero
        eventDataToSend.maxClientMale = '0';
        eventDataToSend.maxClientFemale = '0';
        eventDataToSend.maxStaffMale = '0';
        eventDataToSend.maxStaffFemale = '0';
        
        // Se é ilimitado, define um número grande
        if (createEventData.isUnlimited) {
          eventDataToSend.maxGeneralSpots = '10000';
        }
      } else {
        // Para eventos por gênero, zera as vagas gerais
        eventDataToSend.maxGeneralSpots = '0';
      }
      
      // Criar FormData para envio multipart
      const formData = new FormData();
      
      // Validar e adicionar campos obrigatórios
      const requiredFields = {
        name: eventDataToSend.name,
        date: eventDataToSend.date,
        location: eventDataToSend.location,
        description: eventDataToSend.description,
        eventType: eventDataToSend.eventType,
        maxClientMale: eventDataToSend.maxClientMale,
        maxClientFemale: eventDataToSend.maxClientFemale,
        maxStaffMale: eventDataToSend.maxStaffMale,
        maxStaffFemale: eventDataToSend.maxStaffFemale,
        maxGeneralSpots: eventDataToSend.maxGeneralSpots,
        price: eventDataToSend.price
      };

      // Verificar se todos os campos obrigatórios estão presentes
      for (const [key, value] of Object.entries(requiredFields)) {
        if (value === undefined || value === null || value === '') {
          throw new Error(`Campo obrigatório '${key}' está vazio`);
        }
        formData.append(key, String(value));
      }
      
      // Converter datas para o formato correto
      const startDateISO = createEventData.startDate ? formatBrazilianDateTimeToISO(createEventData.startDate) : '2024-08-19T00:00:00Z';
      const endDateISO = createEventData.endDate ? formatBrazilianDateTimeToISO(createEventData.endDate) : '2024-09-21T23:59:59Z';
      
      formData.append('startDate', startDateISO);
      formData.append('endDate', endDateISO);

      // Validar arquivos antes de adicionar
      if (!imageFiles.image_capa || !imageFiles.logo_evento) {
        throw new Error('Imagens são obrigatórias para criação do evento');
      }

      // Verificar se os arquivos são válidos
      if (imageFiles.image_capa.size === 0) {
        throw new Error('Arquivo de imagem de capa está corrompido');
      }
      if (imageFiles.logo_evento.size === 0) {
        throw new Error('Arquivo de logo está corrompido');
      }

      // Adicionar imagens (SEMPRE no final e com nomes específicos)
      formData.append('image_capa', imageFiles.image_capa, imageFiles.image_capa.name);
      formData.append('logo_evento', imageFiles.logo_evento, imageFiles.logo_evento.name);

      // Log para debug
      console.log('[EventManagement] FormData criado:');
      console.log('[EventManagement] Campos de texto:');
      for (let [key, value] of formData.entries()) {
        if (!(value instanceof File)) {
          console.log(`  ${key}: ${value}`);
        }
      }
      console.log('[EventManagement] Arquivos:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        }
      }

      console.log('[EventManagement] Enviando evento para criação...');
      console.log('[EventManagement] FormData preparado, iniciando fetch...');
      
      // Chamar diretamente a API externa (pular a API route do Next.js)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://us-central1-federa-api.cloudfunctions.net/api';
      const targetUrl = `${API_URL}/events`;
      
      console.log('[EventManagement] URL de destino:', targetUrl);
      console.log('[EventManagement] Token presente:', token ? 'SIM' : 'NÃO');
      
      console.log('[EventManagement] Executando fetch para API externa...');
      
      let response;
      try {
        response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // Note: Não incluir Content-Type para FormData, o browser define automaticamente
          },
          body: formData
        });
      } catch (fetchError) {
        console.error('[EventManagement] Erro na requisição fetch:', fetchError);
        throw new Error(`Erro de conexão: ${fetchError instanceof Error ? fetchError.message : 'Falha na rede'}`);
      }
      
      console.log('[EventManagement] Fetch executado, response recebido:', response.status);
      
      // Verificar se a resposta é válida
      if (!response) {
        throw new Error('Resposta inválida do servidor');
      }

      if (response.ok) {
        const responseData = await response.json();
        console.log('[EventManagement] Evento criado:', responseData.name || responseData.uuid);
        
        // Define status de sucesso
        setSubmitStatus({ 
          type: 'success', 
          message: 'Evento criado com sucesso! 🎉' 
        });
        
        // Força o toast de sucesso
        setTimeout(() => {
          toast({
            title: "✅ Sucesso!",
            description: "Evento criado com sucesso!",
            duration: 5000,
          });
        }, 100);
        
        // Atualiza a lista de eventos
        refetch();
        // Reset form
        setCreateEventData({
          name: '',
          date: '',
          location: '',
          description: '',
          eventType: 'general',
          maxClientMale: '0',
          maxClientFemale: '0',
          maxStaffMale: '0',
          maxStaffFemale: '0',
          maxGeneralSpots: '200',
          startDate: '',
          endDate: '',
          price: '5000',
          isUnlimited: false
        });
        // Reset images
        setImageFiles({
          logo_evento: null,
          image_capa: null
        });
        setImageErrors({});
      } else {
        let errorData;
        try {
          const responseText = await response.text();
          console.log('[EventManagement] Response raw text:', responseText);
          
          try {
            errorData = JSON.parse(responseText);
          } catch {
            errorData = { message: responseText, error: 'Parse Error' };
          }
        } catch (textError) {
          console.error('[EventManagement] Erro ao ler resposta:', textError);
          errorData = { message: 'Erro desconhecido do servidor', error: 'Response Error' };
        }
        
        console.error('[EventManagement] Erro na resposta:', errorData);
        
        // Tratamento específico para erros de FormData
        if (errorData.message && errorData.message.includes('Multipart')) {
          throw new Error('Erro no envio dos arquivos. Verifique se as imagens foram selecionadas corretamente.');
        }
        
        // Define status de erro
        setSubmitStatus({ 
          type: 'error', 
          message: `Erro: ${errorData.error || errorData.message || 'Falha ao criar evento'}` 
        });
        
        // Força o toast de erro
        setTimeout(() => {
          toast({
            title: "❌ Erro!",
            description: errorData.error || errorData.message || 'Erro ao criar evento',
            variant: "destructive",
            duration: 7000,
          });
        }, 100);
        
        throw new Error(errorData.error || errorData.message || 'Erro ao criar evento');
      }
    } catch (error) {
      console.error('[EventManagement] ERRO CAPTURADO:', error);
      
      // Define status de erro
      setSubmitStatus({ 
        type: 'error', 
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido no frontend'}` 
      });
      
      // Força o toast de erro
      setTimeout(() => {
        toast({
          title: "❌ Erro!",
          description: error instanceof Error ? error.message : "Erro desconhecido no frontend",
          variant: "destructive",
          duration: 7000,
        });
      }, 100);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await user?.getIdToken();
      
      console.log('[EventManagement] Dados antes da preparação:', updateEventData);
      
      // Preparar dados baseado no tipo de evento
      let eventDataToUpdate = { ...updateEventData };
      
      if (updateEventData.eventType === 'general') {
        // Para eventos gerais, zera os campos por gênero (mas mantém maxGeneralSpots do usuário)
        eventDataToUpdate.maxClientMale = '0';
        eventDataToUpdate.maxClientFemale = '0';
        eventDataToUpdate.maxStaffMale = '0';
        eventDataToUpdate.maxStaffFemale = '0';
        
        // Se é ilimitado, define um número grande, senão mantém o valor do usuário
        if (updateEventData.isUnlimited) {
          eventDataToUpdate.maxGeneralSpots = '10000';
        }
        // Não modifica maxGeneralSpots se não for ilimitado - mantém o valor do usuário
      } else {
        // Para eventos por gênero, zera as vagas gerais somente se não foi especificado
        eventDataToUpdate.maxGeneralSpots = '0';
      }

      console.log('[EventManagement] Dados após preparação:', eventDataToUpdate);

      // Preparar dados para JSON (API externa espera JSON, não FormData)
      const updateData: {
        name: string;
        date: string;
        location: string;
        description: string;
        eventType: string;
        maxClientMale: number;
        maxClientFemale: number;
        maxStaffMale: number;
        maxStaffFemale: number;
        maxGeneralSpots: number;
        price: number;
        startDate?: string;
        endDate?: string;
      } = {
        name: eventDataToUpdate.name,
        date: eventDataToUpdate.date,
        location: eventDataToUpdate.location,
        description: eventDataToUpdate.description,
        eventType: eventDataToUpdate.eventType,
        maxClientMale: parseInt(eventDataToUpdate.maxClientMale),
        maxClientFemale: parseInt(eventDataToUpdate.maxClientFemale),
        maxStaffMale: parseInt(eventDataToUpdate.maxStaffMale),
        maxStaffFemale: parseInt(eventDataToUpdate.maxStaffFemale),
        maxGeneralSpots: parseInt(eventDataToUpdate.maxGeneralSpots),
        price: parseInt(eventDataToUpdate.price)
      };

      // Adicionar datas se fornecidas
      if (eventDataToUpdate.startDate) {
        updateData.startDate = new Date(eventDataToUpdate.startDate).toISOString();
      }
      if (eventDataToUpdate.endDate) {
        updateData.endDate = new Date(eventDataToUpdate.endDate).toISOString();
      }

      console.log('[EventManagement] Dados JSON preparados:', updateData);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://us-central1-federa-api.cloudfunctions.net/api';
      const endpoint = `${API_URL}/events/${eventId}`;
      
      console.log('[EventManagement] Enviando PUT para:', endpoint);
      console.log('[EventManagement] EventId:', eventId);
      
      // Primeiro, atualizar dados básicos do evento (JSON)
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      console.log('[EventManagement] Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('[EventManagement] Error response:', errorData);
        throw new Error(`Erro ao atualizar evento: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('[EventManagement] Response data:', responseData);

      // Se há imagens para atualizar, fazer upload separado (se sua API suportar)
      if (updateImageFiles.logo_evento || updateImageFiles.image_capa) {
        console.log('[EventManagement] Tentando upload das imagens...');
        
        const formData = new FormData();
        
        if (updateImageFiles.logo_evento) {
          formData.append('logo_evento', updateImageFiles.logo_evento, updateImageFiles.logo_evento.name);
        }
        
        if (updateImageFiles.image_capa) {
          formData.append('image_capa', updateImageFiles.image_capa, updateImageFiles.image_capa.name);
        }

        // Tentar endpoint de imagens (ajuste conforme sua API)
        const imageEndpoint = `${API_URL}/events/${eventId}/images`;
        
        try {
          const imageResponse = await fetch(imageEndpoint, {
            method: 'POST', // ou PUT dependendo da sua API
            headers: {
              'Authorization': `Bearer ${token}`
              // Não incluir Content-Type para FormData
            },
            body: formData
          });

          if (!imageResponse.ok) {
            console.warn('[EventManagement] Falha no upload das imagens, mas evento foi atualizado');
            toast({
              title: "⚠️ Atenção",
              description: "Evento atualizado, mas falha no upload das imagens",
              variant: "destructive",
              duration: 7000,
            });
          } else {
            console.log('[EventManagement] Imagens atualizadas com sucesso');
          }
        } catch (imageError) {
          console.warn('[EventManagement] Erro no upload de imagens:', imageError);
          // Não quebra o fluxo principal
        }
      }
      
      toast({
        title: "✅ Sucesso!",
        description: "Evento atualizado com sucesso!",
        duration: 5000,
      });
      
      // Atualiza a lista de eventos
      refetch();
      
      // Limpa as imagens selecionadas para upload
      setUpdateImageFiles({
        logo_evento: null,
        image_capa: null
      });
      setUpdateImageErrors({});
      
      // Recarrega os dados do evento atualizado nos campos
      setTimeout(() => {
        handleEventSelection(eventId);
      }, 500);
    } catch (error) {
      console.error('[EventManagement] Erro capturado:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar evento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventId || !confirm('Tem certeza que deseja excluir este evento?')) return;
    
    setLoading(true);

    try {
      const token = await user?.getIdToken();
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://us-central1-federa-api.cloudfunctions.net/api';
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Evento excluído com sucesso!",
        });
        setEventId('');
        refetch(); // Atualiza a lista
      } else {
        throw new Error('Erro ao excluir evento');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir evento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="create" className="space-y-4">
      <TabsList>
        <TabsTrigger value="create">Criar Evento</TabsTrigger>
        <TabsTrigger value="update">Atualizar Evento</TabsTrigger>
        <TabsTrigger value="delete">Excluir Evento</TabsTrigger>
      </TabsList>

      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Evento</CardTitle>
            <CardDescription>Preencha os dados para criar um novo evento</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Evento</Label>
                  <Input
                    id="name"
                    value={createEventData.name}
                    onChange={(e) => setCreateEventData({ ...createEventData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Data do Evento</Label>
                  <Input
                    id="date"
                    type="date"
                    value={createEventData.date}
                    onChange={(e) => setCreateEventData({ ...createEventData, date: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use os campos de data/hora de início e fim para horários específicos
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={createEventData.location}
                  onChange={(e) => setCreateEventData({ ...createEventData, location: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={createEventData.description}
                  onChange={(e) => setCreateEventData({ ...createEventData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventType">Tipo do Evento</Label>
                  <Select
                    value={createEventData.eventType}
                    onValueChange={(value) => setCreateEventData({ ...createEventData, eventType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Geral</SelectItem>
                      <SelectItem value="gender_specific">Por Gênero</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Preço (centavos)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={createEventData.price}
                    onChange={(e) => setCreateEventData({ ...createEventData, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Configuração de Vagas baseada no tipo */}
              {createEventData.eventType === 'general' ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isUnlimited"
                      checked={createEventData.isUnlimited}
                      onCheckedChange={(checked) => setCreateEventData({ 
                        ...createEventData, 
                        isUnlimited: checked,
                        maxGeneralSpots: checked ? '10000' : '200' // Se ilimitado, usa número grande
                      })}
                    />
                    <Label htmlFor="isUnlimited">Vagas Ilimitadas</Label>
                  </div>
                  
                  {!createEventData.isUnlimited && (
                    <div>
                      <Label htmlFor="maxGeneralSpots">Número de Vagas</Label>
                      <Input
                        id="maxGeneralSpots"
                        type="number"
                        value={createEventData.maxGeneralSpots}
                        onChange={(e) => setCreateEventData({ ...createEventData, maxGeneralSpots: e.target.value })}
                        placeholder="Ex: 200"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxClientMale">Vagas Cliente Masculino</Label>
                      <Input
                        id="maxClientMale"
                        type="number"
                        value={createEventData.maxClientMale}
                        onChange={(e) => setCreateEventData({ ...createEventData, maxClientMale: e.target.value })}
                        placeholder="Ex: 100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxClientFemale">Vagas Cliente Feminino</Label>
                      <Input
                        id="maxClientFemale"
                        type="number"
                        value={createEventData.maxClientFemale}
                        onChange={(e) => setCreateEventData({ ...createEventData, maxClientFemale: e.target.value })}
                        placeholder="Ex: 100"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxStaffMale">Vagas Staff Masculino</Label>
                      <Input
                        id="maxStaffMale"
                        type="number"
                        value={createEventData.maxStaffMale}
                        onChange={(e) => setCreateEventData({ ...createEventData, maxStaffMale: e.target.value })}
                        placeholder="Ex: 25"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxStaffFemale">Vagas Staff Feminino</Label>
                      <Input
                        id="maxStaffFemale"
                        type="number"
                        value={createEventData.maxStaffFemale}
                        onChange={(e) => setCreateEventData({ ...createEventData, maxStaffFemale: e.target.value })}
                        placeholder="Ex: 25"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Data e Hora de Início</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={createEventData.startDate}
                    onChange={(e) => setCreateEventData({ ...createEventData, startDate: e.target.value })}
                    required
                  />
                  {createEventData.startDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Preview: {formatToBrazilianDisplay(createEventData.startDate)}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="endDate">Data e Hora de Fim</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={createEventData.endDate}
                    onChange={(e) => setCreateEventData({ ...createEventData, endDate: e.target.value })}
                    required
                  />
                  {createEventData.endDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Preview: {formatToBrazilianDisplay(createEventData.endDate)}
                    </p>
                  )}
                </div>
              </div>

              {/* Upload de Imagens */}
              <div className="space-y-6">
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Imagens do Evento</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ImageUpload
                      label="Logo do Evento"
                      imageType="logo_evento"
                      value={imageFiles.logo_evento}
                      onChange={(file) => {
                        setImageFiles({ ...imageFiles, logo_evento: file });
                        if (file) {
                          setImageErrors({ ...imageErrors, logo_evento: undefined });
                        }
                      }}
                      error={imageErrors.logo_evento}
                      required
                    />
                    
                    <ImageUpload
                      label="Imagem de Capa"
                      imageType="image_capa"
                      value={imageFiles.image_capa}
                      onChange={(file) => {
                        setImageFiles({ ...imageFiles, image_capa: file });
                        if (file) {
                          setImageErrors({ ...imageErrors, image_capa: undefined });
                        }
                      }}
                      error={imageErrors.image_capa}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Status Visual */}
              {submitStatus.type !== 'idle' && (
                <div className={`p-4 rounded-lg border ${
                  submitStatus.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full ${
                        submitStatus.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <p className="font-medium">{submitStatus.message}</p>
                    </div>
                    <button 
                      onClick={() => setSubmitStatus({ type: 'idle', message: '' })}
                      className="text-sm underline hover:no-underline"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}

              {/* Status do upload */}
              {loading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Enviando dados...</p>
                      <p className="text-xs text-blue-600">Isso pode levar alguns segundos</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">                
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Criando evento...
                    </>
                  ) : (
                    'Criar Evento'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="update">
        <Card>
          <CardHeader>
            <CardTitle>Atualizar Evento</CardTitle>
            <CardDescription>Atualize os dados de um evento existente</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <div>
                <Label htmlFor="updateEventId">Selecionar Evento</Label>
                <Select
                  value={eventId || ""}
                  onValueChange={(value) => {
                    console.log('Selecionando evento:', value);
                    if (value) {
                      handleEventSelection(value);
                    }
                  }}
                  disabled={eventsLoading}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        eventsLoading 
                          ? "Carregando eventos..." 
                          : events.length === 0 
                            ? "Nenhum evento encontrado"
                            : "Selecione um evento"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {events.length === 0 ? (
                      <SelectItem value="no-events" disabled>
                        Nenhum evento disponível
                      </SelectItem>
                    ) : (
                      events.filter(event => event && event.id).map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name} - {event.id}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {eventId && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Evento selecionado: {events.find(e => e.id === eventId)?.name || eventId}
                  </p>
                )}
              </div>
              
              {eventId && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="updateName">Nome do Evento</Label>
                      <Input
                        id="updateName"
                        value={updateEventData.name}
                        onChange={(e) => setUpdateEventData({ ...updateEventData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="updateDate">Data do Evento</Label>
                      <Input
                        id="updateDate"
                        type="date"
                        value={updateEventData.date}
                        onChange={(e) => setUpdateEventData({ ...updateEventData, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="updateLocation">Local</Label>
                    <Input
                      id="updateLocation"
                      value={updateEventData.location}
                      onChange={(e) => setUpdateEventData({ ...updateEventData, location: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="updateDescription">Descrição</Label>
                    <Textarea
                      id="updateDescription"
                      value={updateEventData.description}
                      onChange={(e) => setUpdateEventData({ ...updateEventData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="updateEventType">Tipo do Evento</Label>
                      <Select
                        value={updateEventData.eventType}
                        onValueChange={(value) => setUpdateEventData({ ...updateEventData, eventType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Geral</SelectItem>
                          <SelectItem value="gender_specific">Por Gênero</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="updatePrice">Preço (centavos)</Label>
                      <Input
                        id="updatePrice"
                        type="number"
                        min="0"
                        value={updateEventData.price}
                        onChange={(e) => {
                          console.log('[EventManagement] Price input changed:', e.target.value);
                          setUpdateEventData({ ...updateEventData, price: e.target.value });
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Configuração de Vagas baseada no tipo */}
                  {updateEventData.eventType === 'general' ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="updateIsUnlimited"
                          checked={updateEventData.isUnlimited}
                          onCheckedChange={(checked) => setUpdateEventData({ 
                            ...updateEventData, 
                            isUnlimited: checked,
                            maxGeneralSpots: checked ? '10000' : '200'
                          })}
                        />
                        <Label htmlFor="updateIsUnlimited">Vagas Ilimitadas</Label>
                      </div>
                      
                      {!updateEventData.isUnlimited && (
                        <div>
                          <Label htmlFor="updateMaxGeneralSpots">Número de Vagas</Label>
                          <Input
                            id="updateMaxGeneralSpots"
                            type="number"
                            value={updateEventData.maxGeneralSpots}
                            onChange={(e) => setUpdateEventData({ ...updateEventData, maxGeneralSpots: e.target.value })}
                            placeholder="Ex: 200"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="updateMaxClientMale">Vagas Cliente Masculino</Label>
                          <Input
                            id="updateMaxClientMale"
                            type="number"
                            value={updateEventData.maxClientMale}
                            onChange={(e) => setUpdateEventData({ ...updateEventData, maxClientMale: e.target.value })}
                            placeholder="Ex: 100"
                          />
                        </div>
                        <div>
                          <Label htmlFor="updateMaxClientFemale">Vagas Cliente Feminino</Label>
                          <Input
                            id="updateMaxClientFemale"
                            type="number"
                            value={updateEventData.maxClientFemale}
                            onChange={(e) => setUpdateEventData({ ...updateEventData, maxClientFemale: e.target.value })}
                            placeholder="Ex: 100"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="updateMaxStaffMale">Vagas Staff Masculino</Label>
                          <Input
                            id="updateMaxStaffMale"
                            type="number"
                            value={updateEventData.maxStaffMale}
                            onChange={(e) => setUpdateEventData({ ...updateEventData, maxStaffMale: e.target.value })}
                            placeholder="Ex: 25"
                          />
                        </div>
                        <div>
                          <Label htmlFor="updateMaxStaffFemale">Vagas Staff Feminino</Label>
                          <Input
                            id="updateMaxStaffFemale"
                            type="number"
                            value={updateEventData.maxStaffFemale}
                            onChange={(e) => setUpdateEventData({ ...updateEventData, maxStaffFemale: e.target.value })}
                            placeholder="Ex: 25"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="updateStartDate">Data e Hora de Início</Label>
                      <Input
                        id="updateStartDate"
                        type="datetime-local"
                        value={updateEventData.startDate}
                        onChange={(e) => setUpdateEventData({ ...updateEventData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="updateEndDate">Data e Hora de Fim</Label>
                      <Input
                        id="updateEndDate"
                        type="datetime-local"
                        value={updateEventData.endDate}
                        onChange={(e) => setUpdateEventData({ ...updateEventData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Seção de Upload de Imagens */}
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-lg font-semibold">Atualizar Imagens (Opcional)</h3>
                    <p className="text-sm text-muted-foreground">
                      Deixe em branco para manter as imagens atuais do evento
                    </p>
                    
                    {/* Preview das imagens atuais */}
                    {eventId && events.find(e => e.id === eventId) && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Imagens Atuais:</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {events.find(e => e.id === eventId)?.logo_evento && (
                            <div>
                              <Label>Logo Atual</Label>
                              <img 
                                src={events.find(e => e.id === eventId)?.logo_evento} 
                                alt="Logo atual" 
                                className="w-full h-32 object-cover rounded border"
                              />
                            </div>
                          )}
                          {events.find(e => e.id === eventId)?.image_capa && (
                            <div>
                              <Label>Capa Atual</Label>
                              <img 
                                src={events.find(e => e.id === eventId)?.image_capa} 
                                alt="Capa atual" 
                                className="w-full h-32 object-cover rounded border"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="updateLogoEvento">Nova Logo do Evento</Label>
                        <ImageUpload
                          label="Nova Logo do Evento"
                          imageType="logo_evento"
                          value={updateImageFiles.logo_evento}
                          onChange={(file) => {
                            setUpdateImageFiles({ ...updateImageFiles, logo_evento: file });
                            setUpdateImageErrors({ ...updateImageErrors, logo_evento: undefined });
                          }}
                          error={updateImageErrors.logo_evento}
                        />
                        {updateImageErrors.logo_evento && (
                          <p className="text-sm text-red-600 mt-1">{updateImageErrors.logo_evento}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="updateImageCapa">Nova Imagem de Capa</Label>
                        <ImageUpload
                          label="Nova Imagem de Capa"
                          imageType="image_capa"
                          value={updateImageFiles.image_capa}
                          onChange={(file) => {
                            setUpdateImageFiles({ ...updateImageFiles, image_capa: file });
                            setUpdateImageErrors({ ...updateImageErrors, image_capa: undefined });
                          }}
                          error={updateImageErrors.image_capa}
                        />
                        {updateImageErrors.image_capa && (
                          <p className="text-sm text-red-600 mt-1">{updateImageErrors.image_capa}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <Button type="submit" disabled={loading || !eventId}>
                {loading ? (
                  updateImageFiles.logo_evento || updateImageFiles.image_capa 
                    ? 'Atualizando evento e imagens...' 
                    : 'Atualizando evento...'
                ) : (
                  'Atualizar Evento'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="delete">
        <Card>
          <CardHeader>
            <CardTitle>Excluir Evento</CardTitle>
            <CardDescription>Exclua um evento existente (ação irreversível)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="deleteEventId">Selecionar Evento para Excluir</Label>
                <Select
                  value={eventId || ""}
                  onValueChange={(value) => {
                    console.log('Selecionando evento para excluir:', value);
                    setEventId(value || "");
                  }}
                  disabled={eventsLoading}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        eventsLoading 
                          ? "Carregando eventos..." 
                          : events.length === 0 
                            ? "Nenhum evento encontrado"
                            : "Selecione um evento"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {events.length === 0 ? (
                      <SelectItem value="no-events" disabled>
                        Nenhum evento disponível
                      </SelectItem>
                    ) : (
                      events.filter(event => event && event.id).map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name} - {event.id}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {eventId && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Evento selecionado: {events.find(e => e.id === eventId)?.name || eventId}
                  </p>
                )}
              </div>
              <Button 
                onClick={handleDeleteEvent} 
                disabled={loading || !eventId}
                variant="destructive"
              >
                {loading ? 'Excluindo...' : 'Excluir Evento'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
