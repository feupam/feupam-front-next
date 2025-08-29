'use client';

import { useEffect, useRef, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Ticket, MapPin, Calendar, Loader2, QrCode, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { NotificationToast, NotificationToastRef } from '@/components/notifications/notification-toast';

interface Reservation {
  id: string;
  spotId: string;
  ticketKind: string;
  email: string;
  userType: string;
  gender: string;
  eventId: string;
  price: number;
  status: string;
  updatedAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
  charges?: Array<ChargeInfo>;
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
  const notificationRef = useRef<NotificationToastRef>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Buscar reservas do usuário
        const reservationsData = await api.users.getReservations();
        setReservations(reservationsData);

        // Buscar detalhes dos eventos para cada reserva
        const eventsMap: Record<string, any> = {};
        for (const reservation of reservationsData) {
          if (!eventsMap[reservation.eventId]) {
            try {
              const eventData = await api.events.get(reservation.eventId);
              eventsMap[reservation.eventId] = eventData;
            } catch (err) {
              console.error(`Erro ao buscar evento ${reservation.eventId}:`, err);
              // Evento não encontrado, configurar dados mínimos
              eventsMap[reservation.eventId] = {
                name: reservation.eventId,
                location: "Local não disponível",
                date: new Date().toISOString(),
              };
            }
          }
        }
        setEvents(eventsMap);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Verificação automática de pagamentos pendentes
  useEffect(() => {
    // Verificamos apenas se houver pelo menos uma reserva com pagamento pendente
    const hasPendingPayment = reservations.some(res => res.status !== 'Pago');
    if (!hasPendingPayment || loading) return;

    const checkPaymentStatus = async () => {
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
          
          // Buscar novos detalhes dos eventos para cada reserva
          const eventsMap: Record<string, any> = { ...events };
          for (const reservation of updatedReservations) {
            if (!eventsMap[reservation.eventId]) {
              try {
                const eventData = await api.events.get(reservation.eventId);
                eventsMap[reservation.eventId] = eventData;
              } catch (err) {
                console.error(`Erro ao buscar evento ${reservation.eventId}:`, err);
              }
            }
          }
          setEvents(eventsMap);
          
          // Fechar o modal de PIX se estiver aberto
          if (pixDialogOpen) {
            setPixDialogOpen(false);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status de pagamento:', error);
      }
    };

    // Verificar imediatamente e depois a cada 1 minuto
    const interval = setInterval(checkPaymentStatus, 60000);
    checkPaymentStatus();

    return () => clearInterval(interval);
  }, [reservations, loading, events, pixDialogOpen]);

  const filteredReservations = reservations.filter(reservation => {
    if (activeTab === 'todos') return true;
    if (activeTab === 'pendentes') return reservation.status !== 'Pago';
    if (activeTab === 'pagos') return reservation.status === 'Pago';
    return true;
  });

  const handleViewPixQRCode = (charge: ChargeInfo) => {
    setSelectedCharge(charge);
    setPixDialogOpen(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'Pago': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Processando': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled':
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    }
  };

  return (
    <ProtectedRoute>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Meus Ingressos</h1>
        
        <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
            <TabsTrigger value="pagos">Pagos</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">Nenhum ingresso encontrado</h3>
                <p>Você ainda não possui ingressos {activeTab !== 'todos' ? 'nesta categoria' : ''}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReservations.map((reservation) => {
                  const event = events[reservation.eventId];
                  if (!event) return null;
                  
                  // Verificar se tem pagamento PIX pendente
                  const hasPixPayment = reservation.charges?.some(
                    charge => charge.meio === 'pix' && charge.status !== 'Pago'
                  );
                  
                  const currentCharge = reservation.charges && reservation.charges.length > 0 
                    ? reservation.charges[reservation.charges.length - 1] 
                    : undefined;
                  
                  return (
                    <Card key={reservation.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{event.name}</CardTitle>
                          <div className={cn("px-2 py-1 text-xs rounded-full", getStatusBadgeColor(reservation.status))}>
                            {reservation.status}
                          </div>
                        </div>
                        <CardDescription>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1 opacity-70" />
                            <span className="text-xs">
                              {new Date(event.date).toLocaleDateString('pt-BR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1 opacity-70" />
                            <span className="text-xs">{event.location}</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex flex-col">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Tipo de Ingresso:</span>
                            <span className="text-sm font-medium">{reservation.ticketKind || "Ingresso completo"}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Valor:</span>
                            <span className="text-sm font-medium">{formatCurrency(reservation.price / 100)}</span>
                          </div>
                          {reservation.updatedAt && (
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-muted-foreground">Data da compra:</span>
                              <span className="text-sm font-medium">
                                {new Date(reservation.updatedAt._seconds * 1000).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Status do pagamento */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                          <div className="flex items-center">
                            {reservation.status === 'Pago' ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            ) : (
                              <XCircle className="h-5 w-5 text-orange-500 mr-2" />
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                {reservation.status === 'Pago' 
                                  ? 'Pagamento confirmado' 
                                  : 'Aguardando pagamento'}
                              </p>
                              {currentCharge && currentCharge.meio && (
                                <p className="text-xs text-muted-foreground">
                                  Método: {currentCharge.meio === 'pix' ? 'PIX' : 'Cartão de Crédito'}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Botões de ação */}
                          <div>
                            {/* Botão para visualizar QR Code do PIX (só aparece se o PIX estiver pendente) */}
                            {hasPixPayment && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  const pixCharge = reservation.charges?.find(
                                    charge => charge.meio === 'pix' && charge.status !== 'Pago'
                                  );
                                  if (pixCharge) {
                                    handleViewPixQRCode(pixCharge);
                                  }
                                }}
                              >
                                <QrCode className="h-4 w-4 mr-1" />
                                Ver PIX
                              </Button>
                            )}
                            
                            {/* Botão para continuar pagamento (apenas se não estiver pago e não tiver PIX pendente) */}
                            {reservation.status !== 'Pago' && !hasPixPayment && (
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => window.location.href = `/reserva/${reservation.eventId}/${reservation.ticketKind || 'full'}`}
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                Continuar Pagamento
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
      
      {/* Dialog para exibir QR Code do PIX */}
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
                    alt="QR Code PIX" 
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
                      title="Copiar código PIX"
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
 