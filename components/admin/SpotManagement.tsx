'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAdminEvents } from '@/hooks/useAdminEvents';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function SpotManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { events, loading: eventsLoading } = useAdminEvents();
  const [loading, setLoading] = useState(false);

  // Check Spot  
  const [checkSpotEventId, setCheckSpotEventId] = useState<string>('');

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

  // Debug para verificar se os IDs estão sendo setados
  useEffect(() => {
    console.log('CheckSpotEventId atual:', checkSpotEventId);
    console.log('FreeEventData atual:', freeEventData);
    console.log('Events carregados:', events);
    console.log('Events loading:', eventsLoading);
  }, [checkSpotEventId, freeEventData, events, eventsLoading]);

  // Preencher emails automaticamente com o email do usuário logado
  useEffect(() => {
    if (user?.email) {
      setDiscountData(prev => ({ ...prev, email: user.email! }));
      setFreeEventData(prev => ({ ...prev, email: user.email! }));
    }
  }, [user]);

  const handleCheckSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await user?.getIdToken();
      
      const response = await fetch('/api/admin/check-spot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId: checkSpotEventId })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: `Vagas verificadas: ${JSON.stringify(result)}`,
        });
      } else {
        throw new Error('Erro ao verificar vagas');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao verificar vagas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await user?.getIdToken();
      
      const response = await fetch('/api/admin/discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...discountData,
          discount: parseFloat(discountData.discount)
        })
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Desconto aplicado com sucesso!",
        });
        setDiscountData({ email: '', discount: '0.20', event: 'federa' });
      } else {
        throw new Error('Erro ao aplicar desconto');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao aplicar desconto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFreeEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await user?.getIdToken();
      
      const response = await fetch('/api/admin/free-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(freeEventData)
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Inscrição gratuita realizada com sucesso!",
        });
        setFreeEventData({ email: '', eventId: '' });
      } else {
        throw new Error('Erro ao realizar inscrição gratuita');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao realizar inscrição gratuita",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="check-spot" className="space-y-4">
      <TabsList>
        <TabsTrigger value="check-spot">Verificar Vagas</TabsTrigger>
        <TabsTrigger value="discount">Aplicar Desconto</TabsTrigger>
        <TabsTrigger value="free-event">Inscrição Gratuita</TabsTrigger>
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
                    console.log('Selecionando evento para verificar vagas:', value);
                    setCheckSpotEventId(value || "");
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
              <Button type="submit" disabled={loading || !checkSpotEventId}>
                {loading ? 'Verificando...' : 'Verificar Vagas'}
              </Button>
            </form>
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
              <Button type="submit" disabled={loading}>
                {loading ? 'Aplicando...' : 'Aplicar Desconto'}
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
              <Button type="submit" disabled={loading || !freeEventData.email || !freeEventData.eventId}>
                {loading ? 'Inscrevendo...' : 'Inscrever Gratuitamente'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
