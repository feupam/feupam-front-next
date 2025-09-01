'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAdminEvents } from '@/hooks/useAdminEvents';

export function EventManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { events, loading: eventsLoading, refetch } = useAdminEvents();
  const [loading, setLoading] = useState(false);

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
    price: '5000'
  });

  // Update/Delete Event Form
  const [eventId, setEventId] = useState<string>('');
  const [updateEventData, setUpdateEventData] = useState({
    name: ''
  });

  // Debug para verificar se o eventId está sendo setado
  useEffect(() => {
    console.log('EventId atual:', eventId);
  }, [eventId]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await user?.getIdToken();
      
      const response = await fetch('/api/admin/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createEventData)
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Evento criado com sucesso!",
        });
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
          price: '5000'
        });
      } else {
        throw new Error('Erro ao criar evento');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar evento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await user?.getIdToken();
      
      const response = await fetch(`/api/admin/update-event`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId, ...updateEventData })
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Evento atualizado com sucesso!",
        });
        refetch(); // Atualiza a lista
      } else {
        throw new Error('Erro ao atualizar evento');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar evento",
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
      
      const response = await fetch(`/api/admin/delete-event`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId })
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
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={createEventData.date}
                    onChange={(e) => setCreateEventData({ ...createEventData, date: e.target.value })}
                    required
                  />
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
                      <SelectItem value="kids">Kids</SelectItem>
                      <SelectItem value="teen">Teen</SelectItem>
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

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="maxClientMale">Max Cliente Masculino</Label>
                  <Input
                    id="maxClientMale"
                    type="number"
                    value={createEventData.maxClientMale}
                    onChange={(e) => setCreateEventData({ ...createEventData, maxClientMale: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxClientFemale">Max Cliente Feminino</Label>
                  <Input
                    id="maxClientFemale"
                    type="number"
                    value={createEventData.maxClientFemale}
                    onChange={(e) => setCreateEventData({ ...createEventData, maxClientFemale: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxStaffMale">Max Staff Masculino</Label>
                  <Input
                    id="maxStaffMale"
                    type="number"
                    value={createEventData.maxStaffMale}
                    onChange={(e) => setCreateEventData({ ...createEventData, maxStaffMale: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxStaffFemale">Max Staff Feminino</Label>
                  <Input
                    id="maxStaffFemale"
                    type="number"
                    value={createEventData.maxStaffFemale}
                    onChange={(e) => setCreateEventData({ ...createEventData, maxStaffFemale: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="maxGeneralSpots">Vagas Gerais</Label>
                <Input
                  id="maxGeneralSpots"
                  type="number"
                  value={createEventData.maxGeneralSpots}
                  onChange={(e) => setCreateEventData({ ...createEventData, maxGeneralSpots: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={createEventData.startDate}
                    onChange={(e) => setCreateEventData({ ...createEventData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Data de Fim</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={createEventData.endDate}
                    onChange={(e) => setCreateEventData({ ...createEventData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Evento'}
              </Button>
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
              <div>
                <Label htmlFor="updateName">Novo Nome</Label>
                <Input
                  id="updateName"
                  value={updateEventData.name}
                  onChange={(e) => setUpdateEventData({ ...updateEventData, name: e.target.value })}
                  placeholder="Novo nome do evento"
                  required
                />
              </div>
              <Button type="submit" disabled={loading || !eventId}>
                {loading ? 'Atualizando...' : 'Atualizar Evento'}
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
