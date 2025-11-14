'use client';

import { useEffect, useRef, useState } from 'react';
import { ProtectedRoute } from '@/src/features/auth';
import { Ticket, MapPin, Calendar, Loader2, QrCode, CheckCircle, XCircle, CreditCard, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatEventDateLong } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { NotificationToast, NotificationToastRef } from '@/components/notifications/notification-toast';
import { formatEventPrice } from '@/lib/event-prices';
import { auth } from '@/lib/firebase';
import { isAcampamentoEvent, getTermosDownloadUrl, getTermosFileName } from '@/types/acampamento-form';

interface Reservation {
  id: string;
  spotId: string;
  ticketKind: string;
  email: string;
  userType: string;
  gender: string;
  name?: string; // Nome informado na inscrição (retornado pela API)
  eventId?: string; // Para compatibilidade com API
  eventName: string; // Campo principal após mapeamento
  price: number;
  status: string;
  updatedAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
  chargeId?: Array<ChargeInfo>;
}

interface ChargeInfo {
  event: string;
  status: string;
  amount: number;
  payLink?: string;
  qrcodePix?: string;
  meio: string;
  email: string;
  lote: number;
  envioWhatsapp: boolean;
  chargeId: string;
}

export default function MyTicketsPage() {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [events, setEvents] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState('todos');
  const [selectedCharge, setSelectedCharge] = useState<ChargeInfo | null>(null);
  const [pixDialogOpen, setPixDialogOpen] = useState(false);
  const [reprocessingId, setReprocessingId] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationRef = useRef<NotificationToastRef>(null);
  const [chargeIdHints, setChargeIdHints] = useState<Record<string, string>>({});
  const checkingStatusRef = useRef<boolean>(false);

  // Helper para processar a lista de reservas no formato esperado pela UI
  const processReservations = (reservationsData: any[]): Reservation[] => {
    if (!Array.isArray(reservationsData)) return [] as Reservation[];
    return reservationsData.map((reservation: any) => {
      // Garantir price (usa charge.amount caso price não venha)
      let finalPrice = reservation.price;
      if ((!finalPrice || finalPrice === 0) && reservation.chargeId && reservation.chargeId.length > 0) {
        finalPrice = reservation.chargeId[reservation.chargeId.length - 1]?.amount || reservation.chargeId[0]?.amount;
      }
      if (typeof finalPrice === 'string') {
        const parsed = parseInt(finalPrice, 10);
        if (!Number.isNaN(parsed)) finalPrice = parsed;
      }

      return {
        ...reservation,
        price: finalPrice || 0,
        eventName: reservation.eventName || reservation.eventId,
      } as Reservation;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Primeiro tentar o endpoint de reservas ativas do usuário
        let reservationsData: any[] = [];
        
        try {
          console.log('[MyTickets] Trying user reservations endpoint...');
          reservationsData = await api.users.getReservations();
          console.log('[MyTickets] User reservations data:', reservationsData);
        } catch (error) {
          console.warn('[MyTickets] Failed to get user reservations, trying history endpoint...', error);
          
          // Se falhar, tentar o endpoint de histórico e filtrar pelo usuário atual
          try {
            const historyData = await api.users.getReservationsHistory();
            console.log('[MyTickets] History data:', historyData);
            
            // Extrair apenas as reservas do usuário atual
            if (historyData && historyData.data && Array.isArray(historyData.data)) {
              // Buscar pelo email do usuário atual
              const currentUserEmail = auth.currentUser?.email;
              console.log('[MyTickets] Current user email:', currentUserEmail);
              
              if (currentUserEmail) {
                const currentUserData = historyData.data.find((userData: any) => 
                  userData.email === currentUserEmail || 
                  (userData.reservations && userData.reservations.some((r: any) => r.email === currentUserEmail))
                );
                
                if (currentUserData && currentUserData.reservations) {
                  reservationsData = currentUserData.reservations;
                  console.log('[MyTickets] Filtered user reservations from history:', reservationsData);
                }
              }
            }
          } catch (historyError) {
            console.error('[MyTickets] Both endpoints failed:', historyError);
          }
        }
        
        // Processar dados das reservas para garantir que o price esteja correto
        const processedReservations = reservationsData.map((reservation: any) => {
          console.log('[MyTickets] Processing reservation:', reservation);
          
          // Se não tiver price diretamente, tentar pegar do charges
          let finalPrice = reservation.price;
          if ((!finalPrice || finalPrice === 0) && reservation.chargeId && reservation.chargeId.length > 0) {
            finalPrice = reservation.chargeId[0].amount;
            console.log('[MyTickets] Price taken from charges:', finalPrice);
          }
          
          // Garantir que o valor é um número válido
          if (typeof finalPrice === 'string') {
            finalPrice = parseInt(finalPrice, 10);
          }
          
          console.log('[MyTickets] Final price for reservation:', finalPrice);
          
          return {
            ...reservation,
            // Garantir que o price está definido corretamente
            price: finalPrice || 0,
            // Mapear eventId para eventName se eventName não existir
            eventName: reservation.eventName || reservation.eventId
          };
        });
        
        console.log('[MyTickets] Processed reservations:', processedReservations);
        setReservations(processedReservations);

        // Buscar detalhes dos eventos para cada reserva
        const eventsMap: Record<string, any> = {};

        for (const reservation of processedReservations) {
          const eventKey = reservation.eventName || reservation.eventId;
          if (eventKey && !eventsMap[eventKey]) {
              try {
                const eventData = await api.events.get(eventKey);
                eventsMap[eventKey] = eventData;
                console.log(`[MyTickets] Event ${eventKey} loaded`);
} catch (err) {
              console.error(`Erro ao buscar evento ${eventKey}:`, err);
              // Evento não encontrado, configurar dados mínimos
              eventsMap[eventKey] = {
                name: eventKey,
                location: "Local não disponível",
                date: new Date().toISOString(),
                price: 0
              };
            }
          } else if (!eventKey) {
            console.warn('[MyTickets] Reservation without eventName or eventId:', reservation);
          }
        }

        
        console.log('[MyTickets] Filtered reservations:', filteredReservations);
        setEvents(eventsMap);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Controla contagem regressiva dos "debounces" por reserva
  const hasAnyCooldown = Object.values(cooldowns).some((v) => (v ?? 0) > 0);
  useEffect(() => {
    if (hasAnyCooldown && !cooldownIntervalRef.current) {
      cooldownIntervalRef.current = setInterval(() => {
        setCooldowns((prev) => {
          const next: Record<string, number> = {};
          let changed = false;
          for (const [id, secs] of Object.entries(prev)) {
            const newVal = Math.max((secs ?? 0) - 1, 0);
            next[id] = newVal;
            if (newVal !== secs) changed = true;
          }
          return changed ? next : prev;
        });
      }, 1000);
    }
    if (!hasAnyCooldown && cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = null;
    }
    return () => {
      if (cooldownIntervalRef.current && !hasAnyCooldown) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }
    };
  }, [hasAnyCooldown]);

  // Verificação automática de pagamentos pendentes
  const hasPendingPayment = (() => {
    // Computa fora do effect para poder reduzir dependências
    return reservations.some((res) => {
      const event = events[res.eventName];
      return res.status?.toLowerCase() !== 'pago' && event && event.price > 0;
    });
  })();

  useEffect(() => {
    if (!hasPendingPayment || loading) return;

    const checkPaymentStatus = async () => {
      if (checkingStatusRef.current) return; // evita concorrência/loop
      checkingStatusRef.current = true;
      try {
        // Buscar reservas do usuário
        const updatedReservations = await api.users.getReservations();
        
        // Verificar se algum pagamento que estava pendente agora está confirmado
        const newPaymentConfirmed = updatedReservations.some(newRes => {
          const oldRes = reservations.find(r => r.id === newRes.id);
          return oldRes && oldRes.status !== 'Pago' && newRes.status === 'Pago';
        });
        
        // Se houver uma nova confirmação, atualiza os dados
        if (newPaymentConfirmed) {
          setReservations(updatedReservations);
          
          // Buscar novos detalhes dos eventos somente se necessário
          const eventsMap: Record<string, any> = { ...events };
          let eventsChanged = false;
          for (const reservation of updatedReservations) {
            const key = reservation.eventName || reservation.eventId;
            if (key && !eventsMap[key]) {
              try {
                const eventData = await api.events.get(key);
                eventsMap[key] = eventData;
                eventsChanged = true;
              } catch (err) {
                console.error(`Erro ao buscar evento ${key}:`, err);
              }
            }
          }
          if (eventsChanged) {
            setEvents(eventsMap);
          }
          
          // Fechar o modal de PIX se estiver aberto
          if (pixDialogOpen) {
            setPixDialogOpen(false);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status de pagamento:', error);
      } finally {
        checkingStatusRef.current = false;
      }
    };

    // Verificar imediatamente e depois a cada 1 minuto
    const interval = setInterval(checkPaymentStatus, 60000);
    // Executa uma vez agora
    void checkPaymentStatus();

    return () => clearInterval(interval);
  }, [hasPendingPayment, loading, pixDialogOpen]);

  const filteredReservations = reservations.filter(reservation => {
    console.log('[MyTickets] Filtering reservation:', reservation.id, 'status:', reservation.status, 'activeTab:', activeTab);
    
    if (activeTab === 'todos') return true;
    // Usar comparação case-insensitive para maior compatibilidade
    if (activeTab === 'pendentes') return reservation.status?.toLowerCase() !== 'pago';
    if (activeTab === 'pagos') return reservation.status?.toLowerCase() === 'pago';
    return true;
  });
  
  console.log('[MyTickets] Total reservations:', reservations.length);
  console.log('[MyTickets] Filtered reservations:', filteredReservations.length);
  console.log('[MyTickets] Active tab:', activeTab);

  const handleViewPixQRCode = (charge: ChargeInfo) => {
    setSelectedCharge(charge);
    setPixDialogOpen(true);
  };

  const refreshReservations = async () => {
    try {
      const updatedRaw = await api.users.getReservations();
      const updatedList = Array.isArray(updatedRaw)
        ? updatedRaw
        : (Array.isArray(updatedRaw?.data) ? updatedRaw.data : []);
      const processed = processReservations(updatedList);
      setReservations(processed);

      // Atualiza o mapa de eventos para qualquer evento ainda não carregado
      const eventsMap: Record<string, any> = { ...events };
      for (const reservation of processed) {
        const key = reservation.eventName || reservation.eventId;
        if (key && !eventsMap[key]) {
          try {
            const eventData = await api.events.get(key);
            eventsMap[key] = eventData;
          } catch (err) {
            console.error(`Erro ao buscar evento ${key}:`, err);
          }
        }
      }
      setEvents(eventsMap);
    } catch (err) {
      console.error('[MyTickets] Erro ao atualizar reservas após reprocessar status:', err);
    }
  };

  // Atualiza apenas um card (uma reserva específica) sem refazer todo o grid
  const updateSingleReservation = async (reservationId: string) => {
    try {
      console.log('[MyTickets] Atualizando apenas a reserva:', reservationId);
      const updatedRaw = await api.users.getReservations();
      const updatedList = Array.isArray(updatedRaw)
        ? updatedRaw
        : (Array.isArray(updatedRaw?.data) ? updatedRaw.data : []);
      const processed = processReservations(updatedList);

      const updated = processed.find((r) => r.id === reservationId);
      if (!updated) {
        console.warn('[MyTickets] Reserva não encontrada no refresh parcial, mantendo estado atual:', reservationId);
        return;
      }

      setReservations((prev) => {
        const prevRes = prev.find((r) => r.id === reservationId);
        if (prevRes) {
          // Evita setState se nada relevante mudou
          const same = prevRes.status === updated.status &&
            (prevRes.price ?? 0) === (updated.price ?? 0) &&
            (prevRes.chargeId?.length ?? 0) === (updated.chargeId?.length ?? 0);
          if (same) return prev;
        }
        return prev.map((r) => (r.id === reservationId ? updated : r));
      });

      // Garante que o evento do card atualizado exista no mapa
      const key = updated.eventName || updated.eventId;
      if (key && !events[key]) {
        try {
          const eventData = await api.events.get(key);
          setEvents((prev) => ({ ...prev, [key]: eventData }));
        } catch (err) {
          console.error(`[MyTickets] Erro ao buscar evento ${key} para refresh parcial:`, err);
        }
      }
    } catch (err) {
      console.error('[MyTickets] Erro ao atualizar reserva específica:', err);
    }
  };

  const handleReprocessStatus = async (reservation: Reservation) => {
    try {
      setReprocessingId(reservation.id);
      const currentCharge = reservation.chargeId && reservation.chargeId.length > 0
        ? reservation.chargeId[reservation.chargeId.length - 1]
        : undefined;
      const payload: { email: string; eventId: string; chargeId?: string } = {
        email: reservation.email,
        eventId: reservation.eventName,
      };
      if (currentCharge?.chargeId) payload.chargeId = currentCharge.chargeId;
      if (payload.chargeId) {
        // Guarda um hint local para exibir no card mesmo que a API ainda não retorne o chargeId
        setChargeIdHints((prev) => ({ ...prev, [reservation.id]: payload.chargeId as string }));
      }
      console.log('[MyTickets] POST /payments/reprocessar-status payload:', payload);
      const reprocessResp = await api.payments.reprocessStatus(payload);
      console.log('[MyTickets] Resposta /payments/reprocessar-status:', reprocessResp);
      // Tenta extrair chargeId da resposta (caso a API retorne diretamente)
      try {
        const extractChargeId = (obj: any): string | undefined => {
          if (!obj || typeof obj !== 'object') return undefined;
          if (typeof obj.chargeId === 'string') return obj.chargeId;
          // Alguns formatos possíveis
          if (typeof obj.data?.chargeId === 'string') return obj.data.chargeId;
          if (Array.isArray(obj.chargeId) && obj.chargeId[0]?.chargeId) return obj.chargeId[0].chargeId;
          // Busca rasa nas chaves
          for (const key of Object.keys(obj)) {
            const val: any = (obj as any)[key];
            if (typeof val === 'string' && /^ch_/.test(val)) return val;
            const nested = extractChargeId(val);
            if (nested) return nested;
          }
          return undefined;
        };
        const respChargeId = extractChargeId(reprocessResp);
        if (respChargeId) {
          setChargeIdHints((prev) => ({ ...prev, [reservation.id]: respChargeId }));
        }
      } catch {}
      notificationRef.current?.showNotification('Solicitação de reprocessamento enviada. Aguarde alguns instantes e atualizaremos o status.', 'info');
      // Atualiza apenas o card clicado
      await updateSingleReservation(reservation.id);
    } catch (error: any) {
      console.error('[MyTickets] Erro ao reprocessar status:', error);
      notificationRef.current?.showNotification(error?.message || 'Falha ao reprocessar status. Tente novamente mais tarde.', 'error');
    } finally {
      setReprocessingId(null);
      // Inicia cooldown de 60s para evitar múltiplos reprocessamentos em sequência
      setCooldowns((prev) => ({ ...prev, [reservation.id]: 60 }));
    }
  };

  const getStatusBadgeColor = (status: string, price: number = 0) => {
    // Se for evento gratuito, sempre mostrar como confirmado
    if (price === 0) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
    
    switch(status) {
      case 'Pago': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Processando': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled':
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    }
  };

  const getStatusText = (status: string, price: number = 0) => {
    // Se for evento gratuito, sempre mostrar como confirmado
    if (price === 0) {
      return 'Confirmado';
    }
    return status;
  };

  return (
    <ProtectedRoute>
      <div className="w-full space-y-6">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Minhas Inscrições</h1>
          
          {/* Caixa informativa sobre cancelamentos e transferências */}
          <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-lg text-amber-800 dark:text-amber-400 flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Informações Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800 dark:text-amber-300">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>O valor integral será devolvido caso o cancelamento seja solicitado em até <strong>7 dias após a inscrição</strong> (conforme o Art. 49 do Código de Defesa do Consumidor).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>Após esse período, será cobrada uma taxa administrativa de <strong>R$ 50,00</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>A partir de <strong>31 de dezembro de 2025</strong>, não haverá devolução.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>É possível <strong>transferir a inscrição</strong> para outro participante que ainda não esteja inscrito.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>Para cancelamento ou transferência, entre em contato com a <strong>Ariela</strong> pelo WhatsApp: <a href="https://wa.me/5535998185335" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:no-underline text-blue-600 dark:text-blue-400">(35) 9.9818-5335</a></span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="todos">Todos</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">Nenhum compra realizada</h3>
                <p>Você não fez nenhuma compra ainda {activeTab !== 'todos' ? 'nesta categoria' : ''}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReservations.map((reservation) => {
                  const event = events[reservation.eventName];
                  if (!event) {
                    console.warn('[MyTickets] Event not found for reservation:', reservation.id, 'eventName:', reservation.eventName);
                    return null;
                  }
                  
                  // Verificar se tem pagamento PIX pendente
                  const hasPixPayment = reservation.chargeId?.some(
                    charge => charge.meio === 'pix' && charge.status !== 'Pago'
                  );
                  
                  const currentCharge = reservation.chargeId && reservation.chargeId.length > 0 
                    ? reservation.chargeId[reservation.chargeId.length - 1] 
                    : undefined;
                  // Determinar um Charge ID principal de forma resiliente
                  const mainChargeId = (
                    Array.isArray(reservation.chargeId)
                      ? (reservation.chargeId[0]?.chargeId || reservation.chargeId[reservation.chargeId.length - 1]?.chargeId)
                      : (typeof (reservation as any).chargeId === 'string' ? (reservation as any).chargeId : undefined)
                  ) || chargeIdHints[reservation.id];
                  
                  return (
                    <Card key={reservation.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{event.name}</CardTitle>
                          <div className={cn("px-2 py-1 text-xs rounded-full", getStatusBadgeColor(reservation.status, event.price))}>
                            {getStatusText(reservation.status, event.price)}
                          </div>
                        </div>
                        <CardDescription>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1 opacity-70" />
                            <span className="text-xs">
                              {formatEventDateLong(event.date, event.range_date)}
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1 opacity-70" />
                            <span className="text-xs">{event.location}</span>
                          </div>
                          {mainChargeId && (
                            <div className="flex items-center mt-1">
                              <span className="text-[10px] opacity-70">Charge ID:</span>
                              <span
                                className="ml-1 text-[10px] font-mono truncate max-w-[80%]"
                                title={mainChargeId}
                              >
                                {mainChargeId}
                              </span>
                            </div>
                          )}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex flex-col">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Tipo de Inscrição:</span>
                            <span className="text-sm font-medium">{reservation.ticketKind || "Inscrição Completa"}</span>
                          </div>
                          {reservation.name && (
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-muted-foreground">Nome na inscrição:</span>
                              <span className="text-sm font-medium truncate max-w-[60%]" title={reservation.name}>{reservation.name}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Valor:</span>
                            <span className="text-sm font-medium">
                              {formatEventPrice(reservation.price || event.price, reservation.eventName)}
                            </span>
                          </div>
                          {reservation.updatedAt && (
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-muted-foreground">Data da compra:</span>
                              <span className="text-sm font-medium">
                                {new Date(reservation.updatedAt._seconds * 1000).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Charge ID:</span>
                            <span className="text-xs font-mono font-medium truncate max-w-[60%]" title={mainChargeId || ''}>
                              {mainChargeId || '-'}
                            </span>
                          </div>
                        </div>
                        {/* Aviso especial para eventos de acampamento */}
                        {isAcampamentoEvent(reservation.eventName) && (
                          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
                              📋 Documentos Necessários para o Acampamento:
                            </p>
                            <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1 ml-4 list-disc">
                              <li>RG ou Carteira de Identidade Nacional ou Certidão de Nascimento</li>
                              <li>Autorização dos pais ASSINADA e AUTENTICADA (baixe abaixo)</li>
                            </ul>
                            <p className="text-xs font-semibold text-amber-900 dark:text-amber-100 mt-2">
                              ⚠️ Não será permitida entrada sem essa documentação!
                            </p>
                          </div>
                        )}
                        
                          {/* Botões de ação */}
                          <div className="flex flex-col gap-3">
                          <div className="flex items-center">
                            {event.price === 0 ? (
                              // Evento gratuito - ícone verde com check
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            ) : reservation.status === 'Pago' ? (
                              // Evento pago e pago - ícone verde com check
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            ) : (
                              // Evento pago mas pendente - ícone laranja com X
                              <XCircle className="h-5 w-5 text-orange-500 mr-2" />
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                {event.price === 0
                                  ? 'Inscrição confirmada'
                                  : reservation.status === 'Pago'
                                  ? 'Pagamento confirmado'
                                  : (
                                    <span className="inline-flex items-baseline">
                                      <span>Atualizar pagamento</span>
                                    </span>
                                  )}
                              </p>
                              {currentCharge && currentCharge.meio && event.price > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Método: {currentCharge.meio === 'pix' ? 'PIX' : 'Cartão de Crédito'}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Controles de ação (ocupam toda a largura) */}
                          <div className="flex flex-col gap-2 w-full">
                            {/* Botão para reprocessar status (força atualização) */}
                            {reservation.status !== 'Pago' && event.price > 0 && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleReprocessStatus(reservation)}
                                disabled={reprocessingId === reservation.id || (cooldowns[reservation.id] ?? 0) > 0}
                                className={cn('w-full bg-amber-500 hover:bg-amber-600 text-white', (cooldowns[reservation.id] ?? 0) > 0 && 'opacity-80')}
                              >
                                {reprocessingId === reservation.id ? (
                                  <span className="inline-flex items-center"><Loader2 className="h-4 w-4 mr-1 animate-spin" />Reprocessando...</span>
                                ) : (cooldowns[reservation.id] ?? 0) > 0 ? (
                                  <span>
                                    Aguarde {String(Math.floor((cooldowns[reservation.id] ?? 0)/60)).padStart(2,'0')}:{String((cooldowns[reservation.id] ?? 0)%60).padStart(2,'0')}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-baseline">
                                    <span>Atualizar pagamento</span>
                                    <span className="ml-1 text-[10px] leading-none opacity-90">(confirmar pagamento)</span>
                                  </span>
                                )}
                              </Button>
                            )}
                            {/* Botão para visualizar QR Code do PIX (só aparece se o Pix estiver pendente e não for gratuito) */}
                            {hasPixPayment && event.price > 0 && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  const pixCharge = reservation.chargeId?.find(
                                    charge => charge.meio === 'pix' && charge.status !== 'Pago'
                                  );
                                  if (pixCharge) {
                                    handleViewPixQRCode(pixCharge);
                                  }
                                }}
                              >
                                <QrCode className="h-4 w-4 mr-1" />
                                Ver Pix
                              </Button>
                            )}
                            
                            {/* Botão para continuar pagamento (apenas se não estiver pago, não tiver Pix pendente e não for gratuito) */}
                            {reservation.status !== 'Pago' && !hasPixPayment && event.price > 0 && (
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => window.location.href = `/checkout/${reservation.eventName}?ticket=${reservation.ticketKind || 'full'}&spotId=${reservation.spotId}`}
                                className="w-full sm:w-auto"
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                Continuar Pagamento
                              </Button>
                            )}
                            
                            {/* Botão para baixar autorização de menores (apenas quando pago) */}
                            {(reservation.status === 'Pago' || event.price === 0) && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Download direto do PDF de autorização de menores 2026
                                  const link = document.createElement('a');
                                  link.href = '/docs/Autorizacao_2026.pdf';
                                  link.download = 'Autorizacao_de_Menores_2026.pdf';
                                  link.target = '_blank';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                className="w-full sm:w-auto bg-green-50 hover:bg-green-100 border-green-300 text-green-800 hover:text-green-900"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Autorização de Menores
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </div>
      
      {/* Dialog para exibir QR Code do Pix */}
      <Dialog open={pixDialogOpen} onOpenChange={setPixDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pagamento PIX Pendente</DialogTitle>
            <DialogDescription>
              Escaneie o QR code abaixo ou copie o código PIX para realizar o pagamento.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCharge && (
            <div className="flex flex-col items-center space-y-4">
              {selectedCharge.qrcodePix ? (
                <div className="bg-white p-4 rounded-md border">
                  <img 
                    src={selectedCharge.qrcodePix} 
                    alt="QR Code Pix" 
                    className="w-full max-w-[250px] h-auto mx-auto"
                  />
                </div>
              ) : (
                <div className="p-8 bg-muted rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">QR Code não disponível</p>
                </div>
              )}
              
              {selectedCharge.payLink && (
                <div className="w-full">
                  <p className="text-sm font-medium mb-1">PIX Copia e Cola:</p>
                  <div className="relative">
                    <textarea
                      readOnly
                      value={selectedCharge.payLink}
                      className="w-full h-24 p-2 pr-10 text-xs bg-muted rounded-md border resize-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedCharge.payLink || '');
                        notificationRef.current?.showNotification('Código PIX copiado!', 'success');
                      }}
                      className="absolute right-2 top-2 text-primary hover:text-primary/80"
                      title="Copiar código Pix"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5"
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Após o pagamento, aguarde alguns instantes para a confirmação.
                    A página será atualizada automaticamente quando o pagamento for processado.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <NotificationToast ref={notificationRef} />
    </ProtectedRoute>
  );
} 
 