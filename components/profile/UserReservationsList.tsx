'use client';

import { useState } from 'react';
import { 
  CreditCard, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  Download,
  RotateCcw,
  QrCode
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { UserReservation } from '@/hooks/useUserReservations';
import { useLoading } from '@/contexts/LoadingContext';

interface UserReservationsListProps {
  reservations: UserReservation[];
  loading: boolean;
  error: string | null;
  onRefetch: () => void;
}

export function UserReservationsList({ reservations, loading, error, onRefetch }: UserReservationsListProps) {
  const { setLoading } = useLoading();
  
  console.log('[UserReservationsList] Reservations recebidas:', reservations);
  console.log('[UserReservationsList] Loading:', loading);
  console.log('[UserReservationsList] Error:', error);

  const handleRefetch = () => {
    setLoading(true);
    onRefetch();
    setTimeout(() => setLoading(false), 1000);
  };
  const [expandedReservations, setExpandedReservations] = useState<Set<string>>(new Set());

  const toggleExpanded = (reservationId: string) => {
    const newExpanded = new Set(expandedReservations);
    if (newExpanded.has(reservationId)) {
      newExpanded.delete(reservationId);
    } else {
      newExpanded.add(reservationId);
    }
    setExpandedReservations(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return <CheckCircle className="h-4 w-4" />;
      case 'pendente':
        return <Clock className="h-4 w-4" />;
      case 'cancelado':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null || isNaN(price)) {
      return 'R$ --,--';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    let date: Date;
    if (timestamp._seconds) {
      // Formato da API externa: { _seconds: number, _nanoseconds: number }
      date = new Date(timestamp._seconds * 1000);
    } else if (timestamp.seconds) {
      // Formato Firebase: { seconds: number, nanoseconds: number }
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return '';
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTicketKindLabel = (ticketKind: string) => {
    switch (ticketKind) {
      case 'full':
        return 'Inscrição Completa';
      case 'day':
        return 'Inscrição Diário';
      case 'student':
        return 'Estudante';
      default:
        return ticketKind;
    }
  };

  const getPaymentMethodLabel = (meio: string) => {
    switch (meio.toLowerCase()) {
      case 'pix':
        return 'PIX';
      case 'credit_card':
        return 'Cartão de Crédito';
      case 'boleto':
        return 'Boleto';
      default:
        return meio;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
            <span>Carregando suas compras...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar compras</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefetch} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reservations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma compra encontrada</h3>
            <p className="text-gray-500">Você ainda não fez nenhuma compra.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Minhas Compras</h2>
        <Button variant="ghost" size="sm" onClick={handleRefetch}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {reservations.map((reservation, index) => {
        const reservationId = `${reservation.eventId}-${reservation.spotId}`;
        const isExpanded = expandedReservations.has(reservationId);
        const mainCharge = reservation.charges?.[0];

        return (
          <Card key={reservationId} className="overflow-hidden">
            <Collapsible 
              open={isExpanded} 
              onOpenChange={() => toggleExpanded(reservationId)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(reservation.status)}
                        >
                          {getStatusIcon(reservation.status)}
                          <span className="ml-1">{reservation.status}</span>
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {reservation.eventId.toUpperCase()}
                        </span>
                      </div>
                      <CardTitle className="text-base">
                        {reservation.eventId} - {getTicketKindLabel(reservation.ticketKind || 'full')}
                      </CardTitle>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-lg">
                          {formatPrice(reservation.price)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(reservation.createdAt)}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  {/* Detalhes da Reserva */}
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <h4 className="font-semibold text-sm">Detalhes da Reserva</h4>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">ID da Reserva:</span>
                        <p className="font-mono text-xs">{reservation.id || reservation.spotId}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tipo:</span>
                        <p>{getTicketKindLabel(reservation.ticketKind || 'full')}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Evento:</span>
                        <p>{reservation.eventId}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Gênero:</span>
                        <p>{reservation.gender === 'male' ? 'Masculino' : 'Feminino'}</p>
                      </div>
                      {reservation.position && (
                        <div>
                          <span className="text-gray-600">Posição:</span>
                          <p>{reservation.position}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Criado em:</span>
                        <p>{formatDate(reservation.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Informações de Pagamento */}
                  {mainCharge && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg space-y-3">
                      <h4 className="font-semibold text-sm flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pagamento
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Valor:</span>
                          <p className="font-semibold">{formatPrice(mainCharge.amount)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Método:</span>
                          <p>{getPaymentMethodLabel(mainCharge.meio)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <p className="flex items-center">
                            {getStatusIcon(mainCharge.status)}
                            <span className="ml-1">{mainCharge.status}</span>
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">ID da Cobrança:</span>
                          <p className="font-mono text-xs">{mainCharge.chargeId}</p>
                        </div>
                      </div>

                      {/* Ações de Pagamento */}
                      <div className="flex space-x-2 pt-2">
                        {mainCharge.qrcodePix && reservation.status.toLowerCase() === 'pendente' && (
                          <Button variant="outline" size="sm">
                            <QrCode className="h-4 w-4 mr-2" />
                            Ver QR Code PIX
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Comprovante
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Ações Gerais */}
                  <div className="flex space-x-2 pt-2">
                    {reservation.status.toLowerCase() === 'pago' && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Inscrição
                      </Button>
                    )}
                    {reservation.status.toLowerCase() !== 'cancelado' && (
                      <Button variant="outline" size="sm">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reagendar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}
