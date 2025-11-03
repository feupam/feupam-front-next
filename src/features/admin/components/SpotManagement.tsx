'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/src/features/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLoading } from '@/contexts/LoadingContext';
import { useApi } from '@/hooks';
import { eventService, adminService } from '@/services';
import { useAdminEvents } from '../hooks/useAdminEvents';

export function SpotManagement() {
  const { user } = useAuth();
  const { events, loading: eventsLoading } = useAdminEvents();
  const { setLoading: setGlobalLoading } = useLoading();

  // API hooks for each operation
  const checkSpotApi = useApi();
  const discountApi = useApi();
  const freeEventApi = useApi();

  // Check Spot  
  const [checkSpotEventId, setCheckSpotEventId] = useState<string>('');
  const [spotStats, setSpotStats] = useState<any>(null);

  // Discount
  const [discountData, setDiscountData] = useState({
    email: '',
    discount: '0.20',
    event: 'federa'
  });

  // Free Event
  const [freeEventData, setFreeEventData] = useState({
    email: '',
    eventId: ''
  });

  // Preencher emails automaticamente com o email do usuário logado
  useEffect(() => {
    if (user?.email) {
      setDiscountData(prev => ({ ...prev, email: user.email! }));
      setFreeEventData(prev => ({ ...prev, email: user.email! }));
    }
  }, [user]);

  // Sync global loading with local API states
  useEffect(() => {
    const isLoading = checkSpotApi.loading || discountApi.loading || freeEventApi.loading;
    setGlobalLoading(isLoading);
  }, [checkSpotApi.loading, discountApi.loading, freeEventApi.loading, setGlobalLoading]);

  const handleCheckSpot = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = await user?.getIdToken();
    if (!token) return;

    await checkSpotApi.execute(
      () => eventService.getEventStats(checkSpotEventId, token),
      {
        onSuccess: (result) => {
          setSpotStats(result);
          console.log('Response detalhado:', result);
        },
        successMessage: (result) => `Dados atualizados em: ${result.updatedAt ? new Date(result.updatedAt).toLocaleString('pt-BR') : 'N/A'}`,
        errorMessage: 'Erro ao obter estatísticas'
      }
    );
  };

  const handleDiscount = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = await user?.getIdToken();
    if (!token) return;

    await discountApi.execute(
      () => adminService.applyDiscount({
        ...discountData,
        discount: parseFloat(discountData.discount)
      }, token),
      {
        onSuccess: () => {
          setDiscountData({ email: '', discount: '0.20', event: 'federa' });
        },
        successMessage: 'Desconto aplicado com sucesso!',
        errorMessage: 'Erro ao aplicar desconto'
      }
    );
  };

  const handleFreeEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = await user?.getIdToken();
    if (!token) return;

    await freeEventApi.execute(
      () => adminService.registerFreeEvent(freeEventData, token),
      {
        onSuccess: () => {
          setFreeEventData({ email: '', eventId: '' });
        },
        successMessage: 'Inscrição gratuita realizada com sucesso!',
        errorMessage: 'Erro ao realizar inscrição gratuita'
      }
    );
  };

  return (
    <Tabs defaultValue="check-spot" className="space-y-4">
      <TabsList className="w-full h-auto flex flex-wrap justify-start gap-2">
        <TabsTrigger className="flex-none" value="check-spot">Verificar Vagas</TabsTrigger>
        <TabsTrigger className="flex-none" value="discount">Aplicar Desconto</TabsTrigger>
        <TabsTrigger className="flex-none" value="free-event">Inscrição Gratuita</TabsTrigger>
      </TabsList>

      <TabsContent value="check-spot">
        <Card>
          <CardHeader>
            <CardTitle>Verificar Vagas</CardTitle>
            <CardDescription>
              Verificar disponibilidade de vagas em um evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheckSpot} className="space-y-4">
              <div>
                <Label htmlFor="checkSpotEventId">Selecionar Evento</Label>
                <Select
                  value={checkSpotEventId || ""}
                  onValueChange={(value) => {
                    setCheckSpotEventId(value || "");
                    setSpotStats(null); // Limpar estatísticas ao mudar evento
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
                {checkSpotEventId && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Evento selecionado: {events.find(e => e.id === checkSpotEventId)?.name || checkSpotEventId}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={checkSpotApi.loading || !checkSpotEventId}>
                {checkSpotApi.loading ? 'Verificando...' : 'Verificar Vagas'}
              </Button>
            </form>

            {/* Exibir estatísticas detalhadas */}
            {spotStats && (
              <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                <h3 className="text-lg font-semibold mb-4">Estatísticas Detalhadas</h3>
                
                {/* Estatísticas Principais */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Mulheres Pagas</p>
                    <p className="text-2xl font-bold text-green-600">{spotStats.statistics?.femalePaid || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Mulheres Reservadas</p>
                    <p className="text-2xl font-bold text-blue-600">{spotStats.statistics?.femaleReserved || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Homens Pagos</p>
                    <p className="text-2xl font-bold text-green-600">{spotStats.statistics?.malePaid || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Homens Reservados</p>
                    <p className="text-2xl font-bold text-blue-600">{spotStats.statistics?.maleReserved || 0}</p>
                  </div>
                </div>

                {/* Totais */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Inscritos</p>
                    <p className="text-2xl font-bold text-purple-600">{spotStats.statistics?.totalInscritos || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Pagos</p>
                    <p className="text-2xl font-bold text-green-600">{spotStats.statistics?.totalPaid || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Reservados</p>
                    <p className="text-2xl font-bold text-blue-600">{spotStats.statistics?.totalReserved || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Ocupado</p>
                    <p className="text-2xl font-bold text-orange-600">{spotStats.statistics?.totalOccupied || 0}</p>
                  </div>
                </div>
                
                {/* Informações do Evento */}
                <div className="pt-4 border-t">
                  <h4 className="text-md font-semibold mb-3">Informações do Evento</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Nome do Evento</p>
                      <p className="text-sm font-semibold">{spotStats.eventName || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">ID do Evento</p>
                      <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{spotStats.eventId || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Tipo do Evento</p>
                      <p className="text-sm">{spotStats.eventType || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Processamento de Fila</p>
                      <p className="text-sm font-semibold">
                        <span className={`px-2 py-1 rounded ${spotStats.enableQueueProcessing ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {spotStats.enableQueueProcessing ? 'Ativo' : 'Inativo'}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Limite Máximo</p>
                      <p className="text-sm font-semibold text-orange-600">{spotStats.limits?.maxGeneralSpots || 0} vagas</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Vagas Homens</p>
                      <p className="text-sm text-orange-600 font-semibold">{spotStats.vagasDisponiveis?.male || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Vagas Mulheres</p>
                      <p className="text-sm text-orange-600 font-semibold">{spotStats.vagasDisponiveis?.female || 0}</p>
                    </div>
                    <div className="space-y-1 md:col-span-4">
                      <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
                      <p className="text-sm text-muted-foreground">
                        {spotStats.updatedAt 
                          ? new Date(spotStats.updatedAt).toLocaleString('pt-BR', {
                              timeZone: 'America/Sao_Paulo',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="discount">
        <Card>
          <CardHeader>
            <CardTitle>Aplicar Desconto</CardTitle>
            <CardDescription>
              Aplicar desconto para um usuário específico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDiscount} className="space-y-4">
              <div>
                <Label htmlFor="discountEmail">Email do Usuário</Label>
                <Input
                  id="discountEmail"
                  type="email"
                  value={discountData.email}
                  onChange={(e) => setDiscountData({ ...discountData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="discountValue">Desconto (decimal)</Label>
                <Input
                  id="discountValue"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={discountData.discount}
                  onChange={(e) => setDiscountData({ ...discountData, discount: e.target.value })}
                  placeholder="0.20 (20%)"
                  required
                />
              </div>
              <div>
                <Label htmlFor="discountEvent">Evento</Label>
                <Input
                  id="discountEvent"
                  value={discountData.event}
                  onChange={(e) => setDiscountData({ ...discountData, event: e.target.value })}
                  placeholder="federa"
                  required
                />
              </div>
              <Button type="submit" disabled={discountApi.loading}>
                {discountApi.loading ? 'Aplicando...' : 'Aplicar Desconto'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="free-event">
        <Card>
          <CardHeader>
            <CardTitle>Inscrição Gratuita</CardTitle>
            <CardDescription>
              Inscrever usuário gratuitamente em um evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFreeEvent} className="space-y-4">
              <div>
                <Label htmlFor="freeEventEmail">Email do Usuário</Label>
                <Input
                  id="freeEventEmail"
                  type="email"
                  value={freeEventData.email}
                  onChange={(e) => setFreeEventData({ ...freeEventData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="freeEventId">Selecionar Evento</Label>
                <Select
                  value={freeEventData.eventId || ""}
                  onValueChange={(value) => {
                    console.log('Selecionando evento para inscrição gratuita:', value);
                    setFreeEventData({ ...freeEventData, eventId: value || "" });
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
                {freeEventData.eventId && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Evento selecionado: {events.find(e => e.id === freeEventData.eventId)?.name || freeEventData.eventId}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={freeEventApi.loading || !freeEventData.email || !freeEventData.eventId}>
                {freeEventApi.loading ? 'Inscrevendo...' : 'Inscrever Gratuitamente'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
