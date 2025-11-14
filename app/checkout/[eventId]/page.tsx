'use client';

export const dynamic = "force-dynamic";

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Event } from '@/types/event';
import { motion } from 'framer-motion';
import { Ticket, MapPin, Calendar, Loader2, Clock, QrCode, CreditCard } from 'lucide-react';
import { formatCurrency, formatEventDateTime } from '@/lib/utils';
import AnimatedBackground from '@/components/ui/animated-background';
import PaymentForm from '@/components/checkout/payment-form';
import { NotificationToast, NotificationToastRef } from '@/components/notifications/notification-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useInstallments } from '@/components/providers';
import { EventsProvider } from '@/contexts/EventsContext';
import { useCurrentEventContext } from '@/contexts/CurrentEventContext';

interface CheckoutPageProps {
  params: {
    eventId: string; // Na verdade sempre contém o nome do evento, não o ID numérico
  };
  searchParams: {
    spotId?: string;
    ticket?: string;
  };
}

interface ReservationData {
  id?: string;
  spotId: string;
  email: string;
  eventId: string;
  userType: 'client' | 'staff';
  status: string;
  price?: number;
}

interface InstallmentOption {
  number: number;
  valueInCents: number;
  formattedValue: string;
}

// Tempo limite em segundos (10 minutos)
const TIME_LIMIT_SECONDS = 10 * 60;

export default function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const router = useRouter();
  const notificationRef = useRef<NotificationToastRef>(null);
  
  // IMPORTANTE: Sempre usar currentEvent do contexto
  // O params.eventId contém o nome do evento (não ID numérico)
  const { currentEvent, setCurrentEventByName, loading: eventLoading } = useCurrentEventContext();
  
  // Log para debug dos dados do evento
  useEffect(() => {
    if (currentEvent) {
      console.log('[CheckoutPage] Current event data:', currentEvent);
      console.log('[CheckoutPage] Current event price:', currentEvent.price, 'Type:', typeof currentEvent.price);
      console.log('[CheckoutPage] Price comparison (currentEvent.price <= 0):', currentEvent.price <= 0);
      console.log('[CheckoutPage] Price comparison (Number(currentEvent.price) <= 0):', Number(currentEvent.price) <= 0);
      console.log('[CheckoutPage] Current event startDate:', currentEvent.startDate);
      console.log('[CheckoutPage] Current event date:', currentEvent.date);
    }
  }, [currentEvent]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingPix, setProcessingPix] = useState(false);
  const [paymentBlocked, setPaymentBlocked] = useState(false); // Bloqueia todos os tipos de pagamento
  const [error, setError] = useState<string | null>(null);
  const [reservationData, setReservationData] = useState<ReservationData | null>(null);
  const [activeTab, setActiveTab] = useState('cartao');
  const [timer, setTimer] = useState<number | null>(null);
  const [timerStarted, setTimerStarted] = useState<number | null>(null);
  const [timerProgress, setTimerProgress] = useState(100); // Porcentagem restante
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixCopiaECola, setPixCopiaECola] = useState<string | null>(null);
  // Cooldown para evitar várias tentativas no cartão no curto prazo
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Modal de erro do cartão
  const [showCardErrorModal, setShowCardErrorModal] = useState(false);
  const [cardErrorDetails, setCardErrorDetails] = useState<{
    status?: number;
    code?: string;
    message: string;
    details?: any;
    requestId?: string;
  } | null>(null);
  // Flag para erro específico de reserva expirada
  const isReservationExpiredError = !!(cardErrorDetails?.message || cardErrorDetails?.details?.message)
    && (cardErrorDetails?.message?.toLowerCase?.().includes('reserva expirou')
      || cardErrorDetails?.details?.message?.toLowerCase?.().includes('reserva expirou'));
  // Flag para erro de transação do Firestore (ordem de leituras/escritas)
  const isFirestoreTxnOrderError = !!(cardErrorDetails?.message || cardErrorDetails?.details?.message)
    && (
      cardErrorDetails?.message?.toLowerCase?.().includes('firestore transactions require all reads to be executed before all writes') ||
      cardErrorDetails?.details?.message?.toLowerCase?.().includes('firestore transactions require all reads to be executed before all writes')
    );
  
  const handleRedoReservation = () => {
    try {
      const eventIdForRedirect = currentEvent?.name;
      if (eventIdForRedirect) {
        // Limpa estados locais e storages relacionados à reserva anterior
        localStorage.removeItem('reservationData');
        localStorage.removeItem('reservationTimestamp');
        const pixDataKey = `pixData-${eventIdForRedirect}`;
        localStorage.removeItem(pixDataKey);
      }
      setShowCardErrorModal(false);
      setCooldownRemaining(0);
      // Redireciona para página de nova reserva
      if (eventIdForRedirect) {
        router.push(`/reserva/${eventIdForRedirect}/${searchParams.ticket || 'full'}`);
      } else {
        router.push('/reserva');
      }
    } catch (e) {
      // fallback simples
      router.push('/reserva');
    }
  };
  
  // Referência para verificar se já está processando o tempo expirado
  const isHandlingExpiredTimer = useRef(false);

  // Use o contexto de parcelamento em vez de estado local
  const { installmentOptions, isLoading: loadingInstallments, fetchInstallments } = useInstallments();

  // Ref para controlar se já buscou o evento
  const eventFetched = useRef(false);

  // Função para obter o tempo restante com base no timestamp salvo
  const getRemainingTime = (): number => {
    const timestamp = localStorage.getItem('reservationTimestamp');
    if (!timestamp) return TIME_LIMIT_SECONDS;
    
    const reservedAt = new Date(timestamp).getTime();
    const now = new Date().getTime();
    const elapsed = now - reservedAt;
    const timeLimit = TIME_LIMIT_SECONDS * 1000; // 10 minutos em milissegundos
    const remaining = Math.max(0, timeLimit - elapsed);
    
    return Math.floor(remaining / 1000);
  };
  
  // Função para lidar com a expiração do timer
  const handleExpiredTimer = async () => {
    // Evita chamadas múltiplas
    if (isHandlingExpiredTimer.current) return;
    isHandlingExpiredTimer.current = true;
    
    try {
      console.log("Timer expirado. Verificando status da reserva...");
      
      // Busca todas as reservas do usuário
      const reservations = await api.users.getReservations();
      const eventIdToCheck = currentEvent?.name;
      if (!eventIdToCheck) {
        console.error("Nome do evento não encontrado no contexto");
        setError('Evento não encontrado.');
        return;
      }
      const currentReservation = reservations.find((res: any) => res.eventId === eventIdToCheck);
      
      // Limpa os dados do PIX no localStorage
      const pixDataKey = `pixData-${eventIdToCheck}`;
      localStorage.removeItem(pixDataKey);
      
      if (currentReservation && currentReservation.status === 'Pago') {
        // Já está pago, redireciona para ingressos
        notificationRef.current?.showNotification(
          'Sua Inscrição já está confirmado!',
          'success'
        );
        
        router.push('/meus-ingressos');
        return;
      }
      
      // Se não for pago, verifica o status
      if (currentReservation && currentReservation.status === 'reserved') {
        // Calcular tempo restante (10 minutos padrão)
        const remainingMinutes = 10;
        
        // A reserva ainda está válida, atualiza o timer
        console.log(`Reserva ainda válida. Tempo restante: ${remainingMinutes} minutos`);
        
        // Calcula o novo tempo em segundos
        const newRemainingTime = remainingMinutes * 60;
        
        // Atualiza o temporizador e o progresso
        setTimer(newRemainingTime);
        setTimerStarted(TIME_LIMIT_SECONDS);
        setTimerProgress((newRemainingTime / TIME_LIMIT_SECONDS) * 100);
        
        // Atualiza o timestamp no localStorage
        localStorage.setItem('reservationTimestamp', new Date().toISOString());
        
        // Notifica o usuário
        notificationRef.current?.showNotification(
          `Reserva renovada. Você tem mais ${remainingMinutes} minutos para concluir o pagamento.`,
          'info'
        );
      } else {
        // Reserva expirada ou não encontrada
        // Limpa dados do localStorage
        localStorage.removeItem('reservationData');
        localStorage.removeItem('reservationTimestamp');
        
        // Exibe notificação de reserva expirada
        notificationRef.current?.showNotification(
          'Sua reserva expirou. Você será redirecionado para fazer uma nova reserva.',
          'error'
        );
        
        // Redireciona para a página de reserva
        setTimeout(() => {
          const eventIdForRedirect = currentEvent?.name;
          if (eventIdForRedirect) {
            router.push(`/reserva/${eventIdForRedirect}/${searchParams.ticket || 'full'}`);
          } else {
            router.push('/eventos');
          }
        }, 3000);
      }
    } catch (error) {
      console.error("Erro ao verificar status de expiração:", error);
      // Mesmo com erro, redireciona o usuário
      notificationRef.current?.showNotification(
        'Erro ao verificar sua reserva. Você será redirecionado para fazer uma nova reserva.',
        'error'
      );
      setTimeout(() => {
        const eventIdForFallback = currentEvent?.name;
        if (eventIdForFallback) {
          router.push(`/reserva/${eventIdForFallback}/${searchParams.ticket || 'full'}`);
        } else {
          router.push('/eventos');
        }
      }, 3000);
    } finally {
      isHandlingExpiredTimer.current = false;
    }
  };

  // Função para sincronizar o timer com o servidor
  const syncTimer = async () => {
    const eventIdToCheck = currentEvent?.name;
    if (!eventIdToCheck) return false;
    
    try {
      // Busca todas as reservas do usuário
      const reservations = await api.users.getReservations();
      const currentReservation = reservations.find((res: any) => res.eventId === eventIdToCheck);
      
      if (currentReservation && currentReservation.status === 'Pago') {
        // Já está pago, redireciona para ingressos
        notificationRef.current?.showNotification(
          'Sua Inscrição já está confirmado!',
          'success'
        );
        
        // Limpa dados do localStorage
        const pixDataKey = `pixData-${eventIdToCheck}`;
        localStorage.removeItem(pixDataKey);
        localStorage.removeItem('reservationData');
        localStorage.removeItem('reservationTimestamp');
        
        router.push('/meus-ingressos');
        return true;
      }
      
      if (currentReservation && currentReservation.status === 'reserved') {
        // Reserva ainda válida, usa um tempo padrão
        const remainingMinutes = 10; // 10 minutos padrão
        const newRemainingTime = remainingMinutes * 60;
        
        setTimer(newRemainingTime);
        setTimerStarted(TIME_LIMIT_SECONDS);
        setTimerProgress((newRemainingTime / TIME_LIMIT_SECONDS) * 100);
        
        // Atualiza timestamp para refletir o novo tempo
        localStorage.setItem('reservationTimestamp', new Date().toISOString());
        
        // Também atualiza os dados da reserva no localStorage
        if (currentReservation) {
          const updatedData: ReservationData = {
            spotId: currentReservation.spotId || searchParams.spotId || '',
            email: currentReservation.email || auth.currentUser?.email || '',
            eventId: eventIdToCheck,
            userType: currentReservation.userType || 'client',
            status: currentReservation.status || 'reserved',
            price: currentReservation.price || currentEvent?.price,
            id: currentReservation.id
          };
          
          // Atualiza o estado e o localStorage
          setReservationData(updatedData);
          localStorage.setItem('reservationData', JSON.stringify(updatedData));
        }
        
        console.log(`Timer sincronizado. Tempo restante estimado: ${remainingMinutes} minutos`);
        return true;
      } else if (!currentReservation || currentReservation.status === 'expired') {
        // Se a reserva estiver expirada ou não existir, chama a função de expiração
        handleExpiredTimer();
        return false;
      }
    } catch (error) {
      console.error("Erro ao sincronizar timer com o servidor:", error);
    }
    
    return false;
  };

  useEffect(() => {
    async function loadEventFromContext() {
      // Se já buscou o evento, não busca novamente
      if (eventFetched.current) return;
      eventFetched.current = true;
      
      console.log('[loadEventFromContext] params.eventId (nome do evento):', params.eventId);
      console.log('[loadEventFromContext] currentEvent já carregado?', !!currentEvent);
      
      // Se o evento já está carregado no contexto, não precisa buscar novamente
      if (currentEvent) {
        setLoading(false);
        return;
      }
      
      try {
        // params.eventId sempre contém o nome do evento, não o ID numérico
        console.log('[loadEventFromContext] Usando setCurrentEventByName com:', params.eventId);
        await setCurrentEventByName(params.eventId);
      } catch (e: any) {
        console.error('Erro ao carregar evento:', e);
        setError('Evento não encontrado ou acesso expirado.');
      } finally {
        setLoading(false);
      }
    }

    async function fetchReservationData() {
      try {
        // Tenta obter do localStorage
        const savedData = localStorage.getItem('reservationData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          const eventIdToCheck = currentEvent?.name;
          if (eventIdToCheck && parsedData.eventId === eventIdToCheck) {
            setReservationData(parsedData);
            
            // Verifica se o tempo já expirou localmente
            const remainingTime = getRemainingTime();
            
            if (remainingTime <= 0) {
              // Se expirou localmente, verifica com o servidor
              handleExpiredTimer();
            } else if (remainingTime < 60) { // Se tiver menos de 1 minuto, verifica com o servidor
              // Tenta sincronizar com o servidor
              const syncSuccess = await syncTimer();
              
              // Se não conseguiu sincronizar, usa o tempo local
              if (!syncSuccess) {
                setTimer(remainingTime);
                setTimerStarted(TIME_LIMIT_SECONDS);
                setTimerProgress((remainingTime / TIME_LIMIT_SECONDS) * 100);
              }
            } else {
              // Se ainda tiver um bom tempo, usa o cálculo local
              setTimer(remainingTime);
              setTimerStarted(TIME_LIMIT_SECONDS);
              setTimerProgress((remainingTime / TIME_LIMIT_SECONDS) * 100);
            }
          }
        } else if (searchParams.spotId) {
          // Se não tiver no localStorage mas tiver spotId na URL
          // Verifica o status atual com o servidor
          const syncSuccess = await syncTimer();
          
          if (!syncSuccess) {
            // Se não conseguiu obter os dados pela rota /retry, usa o método anterior
            const eventIdToUse = currentEvent?.name;
            if (!eventIdToUse) {
              setError('Evento não encontrado.');
              return;
            }
            const response = await api.tickets.purchase(eventIdToUse);
            
            // Monta os dados da reserva
            const reservationStatus = typeof response === 'string' ? response : response?.status || 'reserved';
            
            if (reservationStatus === 'pago') {
              notificationRef.current?.showNotification(
                'Este ingresso já foi pago. Você será redirecionado.',
                'info'
              );
              setTimeout(() => {
                router.push('/meus-ingressos');
              }, 3000);
              return;
            }
            
            if (reservationStatus === 'cancelled' || reservationStatus === 'expired') {
              notificationRef.current?.showNotification(
                'Sua reserva foi cancelada ou expirou. Você será redirecionado para fazer uma nova reserva.',
                'error'
              );
              setTimeout(() => {
                router.push(`/reserva/${eventIdToUse}/${searchParams.ticket || 'full'}`);
              }, 3000);
              return;
            }
            
            // Se chegou aqui o status é válido para pagamento
            setReservationData({
              spotId: searchParams.spotId,
              email: auth.currentUser?.email || '',
              eventId: eventIdToUse,
              userType: 'client',
              status: reservationStatus,
              price: currentEvent?.price
            });
            
            // Usa o tempo padrão de 10 minutos
            setTimer(TIME_LIMIT_SECONDS);
            setTimerStarted(TIME_LIMIT_SECONDS);
            setTimerProgress(100);
            
            // Salva os dados no localStorage
            const eventIdToSave = currentEvent?.name;
            if (eventIdToSave) {
              localStorage.setItem('reservationData', JSON.stringify({
                spotId: searchParams.spotId,
                email: auth.currentUser?.email || '',
                eventId: eventIdToSave,
                userType: 'client',
                status: reservationStatus,
                price: currentEvent?.price
              }));
              localStorage.setItem('reservationTimestamp', new Date().toISOString());
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados da reserva:', error);
        setError('Não foi possível recuperar os dados da sua reserva.');
      }
    }

    // Observa mudanças no estado de autenticação
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setError('Você precisa estar logado para acessar esta página.');
        setLoading(false);
        return;
      }
      
      // Busca os dados em paralelo para reduzir tempo de carregamento
      loadEventFromContext();
      fetchReservationData();
    });
    
    // Configura um contador para o timer
    const timerInterval = setInterval(() => {
      setTimer((prev) => {
        if (prev === null) {
          clearInterval(timerInterval);
          return null;
        }
        
        if (prev <= 0) {
          clearInterval(timerInterval);
          // Quando o timer chega a zero, chama a função para lidar com a expiração
          handleExpiredTimer();
          return 0;
        }
        
        // Atualiza o progresso da barra
        if (timerStarted) {
          setTimerProgress((prev / timerStarted) * 100);
        }
        
        return prev - 1;
      });
    }, 1000);
    
    // Configura uma sincronização periódica com o servidor a cada 60 segundos
    const syncInterval = setInterval(() => {
      if (timer && timer > 0) {
        syncTimer();
      }
    }, 60000); // Sincroniza a cada minuto

    // Cleanup
    return () => {
      unsubscribe();
      clearInterval(timerInterval);
      clearInterval(syncInterval);
    };
  }, [params.eventId, searchParams.spotId]);

  // UseEffect separado para buscar installments quando o evento estiver carregado
  useEffect(() => {
    if (currentEvent && currentEvent.name && !loadingInstallments) {
      console.log(`[Checkout] Buscando installments para evento: ${currentEvent.name}`);
      fetchInstallments(currentEvent.name);
    }
  }, [currentEvent, fetchInstallments, loadingInstallments]);

  // Proteção adicional contra cliques duplos a nível de documento
  useEffect(() => {
    const handleGlobalClick = (event: any) => {
      if (paymentBlocked || processingPayment) {
        event.preventDefault?.();
        event.stopPropagation?.();
        return false;
      }
    };

    if (paymentBlocked || processingPayment) {
      document.addEventListener('click', handleGlobalClick, { capture: true });
      document.addEventListener('submit', handleGlobalClick, { capture: true });
    }

    return () => {
      document.removeEventListener('click', handleGlobalClick, { capture: true });
      document.removeEventListener('submit', handleGlobalClick, { capture: true });
    };
  }, [paymentBlocked, processingPayment]);

  // Função para lidar com o pagamento via PIX
  const handlePixPayment = async () => {
    // Bloqueia imediatamente para evitar cliques duplos
    setPaymentBlocked(true);
    setProcessingPayment(true);
    setProcessingPix(true);
    
    try {
      // Primeiro verificamos o status da reserva usando a rota /retry
      try {
        console.log("Verificando status da reserva antes de gerar Pix...");
        // params.eventId sempre contém o nome do evento
        const eventNameForAPI = currentEvent?.name || params.eventId;
        console.log("eventNameForAPI que será usado:", eventNameForAPI);
        const reservationStatus = await api.tickets.retryPurchase(eventNameForAPI);
        
        // Verifica se o status é válido para continuar com o pagamento
        if (reservationStatus && reservationStatus.status === "expired") {
          notificationRef.current?.showNotification(
            'Sua reserva expirou. Você será redirecionado para fazer uma nova reserva.',
            'error'
          );
          
          // Limpa dados do localStorage
          localStorage.removeItem('reservationData');
          localStorage.removeItem('reservationTimestamp');
          
          setTimeout(() => {
            router.push(`/reserva/${eventNameForAPI}/${searchParams.ticket || 'full'}`);
          }, 3000);
          return;
        }
        
        // Se o status for "reserved" com tempo restante, atualiza o timer
        if (reservationStatus && reservationStatus.status === "reserved" && reservationStatus.remainingMinutes) {
          console.log(`Reserva válida. Tempo restante: ${reservationStatus.remainingMinutes} minutos`);
          
          // Calcula o novo tempo em segundos
          const newRemainingTime = reservationStatus.remainingMinutes * 60;
          
          // Atualiza o temporizador e o progresso
          setTimer(newRemainingTime);
          setTimerStarted(TIME_LIMIT_SECONDS);
          setTimerProgress((newRemainingTime / TIME_LIMIT_SECONDS) * 100);
          
          // Atualiza o timestamp no localStorage
          localStorage.setItem('reservationTimestamp', new Date().toISOString());
        }
      } catch (error) {
        console.error("Erro ao verificar status da reserva para Pix:", error);
        // Continuamos mesmo se ocorrer erro na verificação
      }
      
      // ✅ CORRIGIDO: Usar email como identificador (email é o ID da reserva)
      const reservationEmail = reservationData?.email || auth.currentUser?.email;
      if (!reservationEmail) {
        throw new Error('Email da reserva não encontrado');
      }
      
      console.log('[Pix Payment] Email da reserva:', reservationEmail);
      
      // Garante que usamos o valor correto para o pagamento
      const eventPrice = currentEvent?.price || 0;
      
      console.log('[Pix Payment] Debug valores:');
      console.log('- eventPrice (valor correto para Pix):', eventPrice);
      console.log('- currentEvent:', currentEvent);
      console.log('- activeTab:', activeTab);
      
      // ✅ CORRIGIDO: Valor fixo para parcela 4x
      // Pix normal: valor total | Pix parcela 4x: R$ 110,00 fixo
      const valueToUse = activeTab === 'parcela4x' 
        ? 11000  // R$ 110,00 fixo em centavos
        : eventPrice; // Valor total do evento
      
      console.log('[Pix Payment] Valor final para Pix:', valueToUse);
      console.log('[Pix Payment] É parcela 4x?', activeTab === 'parcela4x');
      
      if (valueToUse <= 0) {
        throw new Error('Valor do pagamento inválido: ' + valueToUse);
      }
      
      // ✅ CORRIGIDO: Payload correto - descrição sempre o nome simples do evento
      const paymentData = {
        items: [{
          amount: valueToUse,
          description: currentEvent?.name || 'Evento' // Sempre nome simples, sem sufixos
        }],
        customer: {
          email: reservationEmail,
        },
        payments: {
          payment_method: 'pix'
        }
      };
      
      console.log('[Pix Payment] ==================== DEBUG COMPLETO ====================');
      console.log('[Pix Payment] Dados enviados para API:', JSON.stringify(paymentData, null, 2));
      console.log('[Pix Payment] Current Event completo:', JSON.stringify(currentEvent, null, 2));
      console.log('[Pix Payment] Reservation Data completo:', JSON.stringify(reservationData, null, 2));
      console.log('[Pix Payment] params.eventId:', params.eventId);
      console.log('[Pix Payment] currentEvent?.name:', currentEvent?.name);
      console.log('[Pix Payment] currentEvent?.uuid:', currentEvent?.uuid);
      console.log('[Pix Payment] Email usado:', reservationEmail);
      console.log('[Pix Payment] SpotId usado:', reservationData?.spotId);
      console.log('[Pix Payment] ActiveTab:', activeTab);
      console.log('[Pix Payment] ====================================================');
      
      const response = await api.payments.create(paymentData);
      
      // Extrai os dados do Pix da resposta
      if (response) {
        // Verifica todos os possíveis formatos da resposta
        if (response.qrcodePix && response.payLink) {
          // Formato preferido
          setPixQrCode(response.qrcodePix);
          setPixCopiaECola(response.payLink);
          // Salva no localStorage
          const eventNameForStorage = currentEvent?.name;
          if (eventNameForStorage) {
            const pixDataKey = `pixData-${eventNameForStorage}`;
            localStorage.setItem(pixDataKey, JSON.stringify({
              qrCode: response.qrcodePix,
              copiaECola: response.payLink
            }));
          }
          setActiveTab(activeTab === 'parcela4x' ? 'parcela4x' : 'pix');
          notificationRef.current?.showNotification(
            activeTab === 'parcela4x' 
              ? '1ª Parcela gerada! Escaneie o código para pagar a primeira parcela.'
              : 'Pix gerado com sucesso! Escaneie o código para pagar.',
            'success'
          );
        } 
        // Verifica formato alternativo com qr_code_url
        else if (response.last_transaction && response.last_transaction.qr_code_url) {
          setPixQrCode(response.last_transaction.qr_code_url);
          setPixCopiaECola(response.last_transaction.qr_code);
          // Salva no localStorage
          const pixDataKey = `pixData-${currentEvent?.name}`;
          localStorage.setItem(pixDataKey, JSON.stringify({
            qrCode: response.last_transaction.qr_code_url,
            copiaECola: response.last_transaction.qr_code
          }));
          setActiveTab(activeTab === 'parcela4x' ? 'parcela4x' : 'pix');
          notificationRef.current?.showNotification(
            activeTab === 'parcela4x' 
              ? '1ª Parcela gerada! Escaneie o código para pagar a primeira parcela.'
              : 'Pix gerado com sucesso! Escaneie o código para pagar.',
            'success'
          );
        } else {
          throw new Error('Não foi possível gerar o QR Code do Pix');
        }
      } else {
        throw new Error('Não foi possível gerar o QR Code do Pix');
      }
    } catch (error: any) {
      console.error('Erro ao gerar Pix:', error);
      handlePaymentError(error);
    } finally {
      setProcessingPayment(false);
      setProcessingPix(false);
      // Desbloqueia pagamentos após 2 segundos para evitar cliques muito rápidos
      setTimeout(() => {
        setPaymentBlocked(false);
      }, 2000);
    }
  };

  // Função para processar o pagamento com cartão
  const handleProcessPayment = async (paymentData: any) => {
    if (paymentBlocked || processingPayment) return;
    
    try {
      // Bloqueia imediatamente para evitar cliques duplos
      setPaymentBlocked(true);
      setProcessingPayment(true);
      await api.payments.create(paymentData);
      notificationRef.current?.showNotification(
        'Pagamento realizado com sucesso! Sua Inscrição foi enviado para seu e-mail.',
        'success'
      );
      router.push('/meus-ingressos');
    } catch (error: any) {
      // Extrai detalhes estruturados do erro (ApiError)
      const status = error?.status || error?.response?.status;
      const code = error?.code || error?.response?.data?.code;
      const message = error?.message || 'Erro ao processar pagamento';
      const details = error?.details || error?.response?.data;
      const requestId = error?.requestId || error?.response?.headers?.['x-request-id'];

      setCardErrorDetails({ status, code, message, details, requestId });
      setShowCardErrorModal(true);

      // Inicia cooldown (ex.: 60s) para não acionar antifraude em repetidas tentativas
      const COOLDOWN_SECONDS = 60;
      setCooldownRemaining(COOLDOWN_SECONDS);
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Também notifica de forma resumida
      handlePaymentError(error);
    } finally {
      setProcessingPayment(false);
      // Desbloqueia pagamentos após 2 segundos para evitar cliques muito rápidos
      setTimeout(() => {
        setPaymentBlocked(false);
      }, 2000);
    }
  };

  // Função para tratar erros de pagamento
  const handlePaymentError = (error: any) => {
    console.error("Erro no pagamento:", error);
    
    notificationRef.current?.showNotification(
      error?.message || 'Erro ao processar pagamento. Por favor, tente novamente.',
      'error'
    );
  };

  // Formata o tempo restante (segundos) para MM:SS
  const formatTime = (timeInSeconds: number | null) => {
    if (timeInSeconds === null) return '--:--';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Retorna a cor do timer com base no tempo restante
  const getTimerColor = () => {
    if (timer === null) return 'bg-primary';
    if (timer <= 60) return 'bg-red-500'; // Último minuto em vermelho
    if (timer <= 180) return 'bg-orange-500'; // Últimos 3 minutos em laranja
    return 'bg-green-600'; // Resto do tempo em verde
  };
  
  // Retorna a cor do texto do timer com base no tempo restante
  const getTimerTextColor = () => {
    if (timer === null) return 'text-primary';
    if (timer <= 60) return 'text-red-500'; // Último minuto em vermelho
    if (timer <= 180) return 'text-orange-500'; // Últimos 3 minutos em laranja
    return 'text-green-600'; // Resto do tempo em verde
  };

  if (loading || eventLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !currentEvent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-card rounded-lg border border-border p-8 max-w-md w-full text-center space-y-4">
          <h2 className="text-xl font-semibold">Erro</h2>
          <p className="text-muted-foreground">
            {error || 'Não foi possível carregar o evento.'}
          </p>
          <Button onClick={() => router.push('/eventos')}>
            Voltar para Eventos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AnimatedBackground className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto relative"
        >
          {/* Overlay de bloqueio de pagamento */}
          {paymentBlocked && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40 rounded-lg flex items-center justify-center">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="font-medium">Processando pagamento...</span>
              </div>
            </div>
          )}
          
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Finalizar Compra</h1>
              {timer !== null && (
                <div className="flex flex-col">
                  <div className="flex items-center bg-muted dark:bg-muted/30 px-4 py-2 rounded-md">
                    <Clock className={cn("h-5 w-5 mr-2", getTimerTextColor())} />
                    <span className={cn("font-medium", getTimerTextColor())}>{formatTime(timer)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted dark:bg-muted/30 rounded-full mt-1 overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full", getTimerColor())}
                      style={{ width: `${timerProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Informações do Evento */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <Ticket className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold">{currentEvent.name}</h2>
                    <p className="text-sm text-muted-foreground">{currentEvent.location}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatEventDateTime(currentEvent.date, currentEvent.range_date).date} • {formatEventDateTime(currentEvent.date, currentEvent.range_date).time}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{currentEvent.location}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Valor da Inscrição</span>
                    <span className="font-semibold">
                      {formatCurrency(currentEvent.price / 100)}
                    </span>
                  </div>
                </div>

                {/* Exibe o QR Code do PIX quando disponível */}
                {(activeTab === 'pix' || activeTab === 'parcela4x') && pixQrCode && (
                  <div className="mt-4 p-4 border rounded-lg bg-muted/30 dark:bg-card/50 flex flex-col items-center">
                    <h3 className="font-semibold mb-2">
                      {activeTab === 'parcela4x' ? 'QR Code Pix - 1ª Parcela' : 'QR Code PIX'}
                    </h3>
                    <div className="bg-white dark:bg-white p-2 rounded-lg border mb-2">
                      <img 
                        src={pixQrCode} 
                        alt="QR Code Pix" 
                        className="w-full max-w-[180px] h-auto"
                      />
                    </div>
                    {pixCopiaECola && (
                      <div className="w-full">
                        <p className="text-xs text-muted-foreground mb-1">PIX Copia e Cola:</p>
                        <div className="relative">
                          <textarea 
                            readOnly 
                            value={pixCopiaECola}
                            className="w-full text-xs p-2 bg-white dark:bg-white border rounded h-16 overflow-auto text-black"
                          />
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="absolute right-1 top-1"
                            onClick={() => {
                              navigator.clipboard.writeText(pixCopiaECola);
                              notificationRef.current?.showNotification('Código PIX copiado!', 'success');
                            }}
                          >
                            Copiar
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Aviso de expiração do QR Code PIX */}
                    <div className="mt-4 p-3 border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 rounded-md w-full">
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-500">
                            Este QR Code expirará em breve!
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                            Realize o pagamento o mais rápido possível para garantir sua vaga na inscrição.
                            Caso o tempo expire, você perderá sua reserva e precisará iniciar o processo novamente.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Métodos de Pagamento ou Finalização Gratuita */}
              <div>
                {(!currentEvent.price || Number(currentEvent.price) <= 0) ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-md p-4">
                      <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">Evento Gratuito</h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                        Este evento é gratuito. Clique no botão abaixo para finalizar sua inscrição.
                      </p>
                      <Button 
                        onClick={async () => {
                          if (paymentBlocked || processingPayment) return;
                          
                          try {
                            // Bloqueia imediatamente para evitar cliques duplos
                            setPaymentBlocked(true);
                            setProcessingPayment(true);
                            
                            // Para eventos gratuitos, marcar como "Pago" diretamente
                            // Isso pode precisar de uma API específica para inscrições gratuitas
                            // Por enquanto, vamos simular o comportamento
                            
                            notificationRef.current?.showNotification(
                              'Inscrição realizada com sucesso! Sua Inscrição foi gerado.',
                              'success'
                            );
                            
                            setTimeout(() => {
                              router.push('/meus-ingressos');
                            }, 2000);
                          } catch (error) {
                            notificationRef.current?.showNotification(
                              'Erro ao finalizar inscrição. Tente novamente.',
                              'error'
                            );
                          } finally {
                            setProcessingPayment(false);
                            // Desbloqueia pagamentos após 2 segundos
                            setTimeout(() => {
                              setPaymentBlocked(false);
                            }, 2000);
                          }
                        }}
                        className={`w-full bg-green-600 hover:bg-green-700 text-white ${(processingPayment || paymentBlocked) ? 'pointer-events-none' : ''}`}
                        disabled={processingPayment || paymentBlocked}
                      >
                        {processingPayment ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Finalizando inscrição...
                          </div>
                        ) : (
                          'Finalizar Inscrição Gratuita'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Tabs defaultValue="cartao" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="cartao" className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Cartão
                      </TabsTrigger>
                      <TabsTrigger value="pix" className="flex items-center" disabled={processingPix && !pixQrCode}>
                        <QrCode className="h-4 w-4 mr-2" />
                        Pix
                      </TabsTrigger>
                      <TabsTrigger value="parcela4x" className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Parcela 4x
                      </TabsTrigger>
                    </TabsList>
                  
                  <TabsContent value="cartao">
                    <PaymentForm
                      event={currentEvent}
                      spotId={searchParams.spotId}
                      reservationData={reservationData ? reservationData : undefined}
                      onSubmit={handleProcessPayment}
                      processing={processingPayment}
                      disabled={cooldownRemaining > 0 || paymentBlocked}
                      disabledMessage={
                        paymentBlocked
                          ? 'Processando pagamento... Aguarde.'
                          : cooldownRemaining > 0
                          ? `Muitas tentativas próximas podem acionar antifraude. Aguarde ${Math.floor(cooldownRemaining/60).toString().padStart(2,'0')}:${(cooldownRemaining%60).toString().padStart(2,'0')} antes de tentar o mesmo cartão ou utilize outro cartão/Pix.`
                          : undefined
                      }
                    />
                  </TabsContent>
                  
                  <TabsContent value="pix">
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-md p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <QrCode className="h-5 w-5 text-blue-800 dark:text-blue-400" />
                          <h3 className="font-semibold text-blue-800 dark:text-blue-400">Pagamento via PIX</h3>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                          Pague instantaneamente utilizando o PIX. Após o pagamento, Sua Inscrição será enviado para seu e-mail.
                        </p>
                        <div className="flex justify-between items-center font-medium mt-2">
                          <span className="text-blue-800 dark:text-blue-400">Valor total:</span>
                          <span className="text-lg text-blue-800 dark:text-blue-300">
                            {formatCurrency(currentEvent.price / 100)}
                          </span>
                        </div>
                      </div>

                      {!pixQrCode ? (
                        <Button 
                          onClick={handlePixPayment} 
                          disabled={processingPayment || paymentBlocked}
                          className={`w-full ${(processingPayment || paymentBlocked) ? 'pointer-events-none' : ''}`}
                        >
                          {processingPix ? (
                            <div className="flex items-center justify-center w-full">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span>Gerando Pix...</span>
                              <div className="ml-2 w-full max-w-[120px] bg-primary-foreground/20 h-1 rounded-full overflow-hidden">
                                <div className="h-full bg-primary/70 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <QrCode className="mr-2 h-4 w-4" />
                              Gerar QR Code Pix
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="text-center text-sm text-muted-foreground">
                          <p>Escaneie o QR Code acima ou copie o código Pix para pagar.</p>
                          <p className="mt-2">Após o pagamento, aguarde alguns instantes para receber a confirmação.</p>
                          {processingPayment && (
                            <div className="flex items-center justify-center mt-4">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                              <span className="text-primary">Verificando pagamento...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="parcela4x">
                    <div className="space-y-4">
                      <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-md p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="h-5 w-5 text-purple-800 dark:text-purple-400" />
                          <h3 className="font-semibold text-purple-800 dark:text-purple-400">Pagamento Parcelado - 4x</h3>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                          Pague a primeira parcela agora via PIX. As próximas parcelas devem ser feitas nos próximos 3 meses.
                          <br />
                          <span className="text-xs italic">Valor parcelado: R$ 110,00 cada parcela (4x R$ 110,00 = R$ 440,00 total).</span>
                        </p>
                        <div className="flex justify-between items-center font-medium mt-2">
                          <span className="text-purple-800 dark:text-purple-400">1ª parcela (hoje):</span>
                          <span className="text-lg text-purple-800 dark:text-purple-300">
                            {formatCurrency(110)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-md p-4 mb-4">
                        <h4 className="font-medium text-amber-800 dark:text-amber-400 mb-2">📅 Cronograma das próximas parcelas</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                          As próximas parcelas devem ser feitas até o 5º dia útil de cada mês:
                        </p>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-amber-300 dark:border-amber-700">
                                <th className="text-left py-2 font-medium text-amber-800 dark:text-amber-400">Parcela</th>
                                <th className="text-left py-2 font-medium text-amber-800 dark:text-amber-400">Mês</th>
                                <th className="text-left py-2 font-medium text-amber-800 dark:text-amber-400">Data limite</th>
                                <th className="text-right py-2 font-medium text-amber-800 dark:text-amber-400">Valor</th>
                              </tr>
                            </thead>
                            <tbody className="text-amber-700 dark:text-amber-300">
                              <tr className="border-b border-amber-200 dark:border-amber-800">
                                <td className="py-2">2ª</td>
                                <td className="py-2">Dezembro</td>
                                <td className="py-2">5 de dezembro (sex)</td>
                                <td className="py-2 text-right font-medium">{formatCurrency(110)}</td>
                              </tr>
                              <tr className="border-b border-amber-200 dark:border-amber-800">
                                <td className="py-2">3ª</td>
                                <td className="py-2">Janeiro</td>
                                <td className="py-2">8 de janeiro (qui)</td>
                                <td className="py-2 text-right font-medium">{formatCurrency(110)}</td>
                              </tr>
                              <tr>
                                <td className="py-2">4ª</td>
                                <td className="py-2">Fevereiro</td>
                                <td className="py-2">5 de fevereiro (qui)</td>
                                <td className="py-2 text-right font-medium">{formatCurrency(110)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-amber-300 dark:border-amber-700">
                          <div className="flex justify-between items-center font-medium">
                            <span className="text-amber-800 dark:text-amber-400">Valor total:</span>
                            <span className="text-lg text-amber-800 dark:text-amber-300">
                              {formatCurrency(440)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {!pixQrCode || activeTab !== 'parcela4x' ? (
                        <Button 
                          onClick={() => {
                            // Usar a mesma função do PIX mas com contexto de parcela 4x
                            handlePixPayment();
                          }} 
                          disabled={processingPayment || paymentBlocked}
                          className={`w-full bg-purple-600 hover:bg-purple-700 ${(processingPayment || paymentBlocked) ? 'pointer-events-none' : ''}`}
                        >
                          {processingPix ? (
                            <div className="flex items-center justify-center w-full">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span>Gerando Pix para 1ª parcela...</span>
                            </div>
                          ) : (
                            <>
                              <QrCode className="mr-2 h-4 w-4" />
                              Gerar Pix - 1ª Parcela ({formatCurrency(110)})
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="text-center text-sm text-muted-foreground">
                          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-md p-3 mb-3">
                            <p className="font-medium text-green-800 dark:text-green-400">✅ Pagando 1ª parcela via Pix</p>
                            <p className="text-green-700 dark:text-green-300">Escaneie o QR Code acima para pagar a primeira parcela.</p>
                          </div>
                          <p>Após o pagamento da 1ª parcela, você receberá instruções para as próximas parcelas.</p>
                          {processingPayment && (
                            <div className="flex items-center justify-center mt-4">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                              <span className="text-primary">Verificando pagamento da 1ª parcela...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <NotificationToast ref={notificationRef} />
      {/* Modal fixo com detalhes do erro do cartão */}
      <Dialog open={showCardErrorModal} onOpenChange={setShowCardErrorModal}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isReservationExpiredError
                ? 'Reserva expirada'
                : isFirestoreTxnOrderError
                  ? 'Erro no processamento do pagamento'
                  : 'Falha no pagamento com cartão'}
            </DialogTitle>
            <DialogDescription>
              {isReservationExpiredError
                ? 'Sua reserva expirou. Por favor, faça uma nova reserva para continuar.'
                : isFirestoreTxnOrderError
                  ? 'Houve um problema interno ao processar seu pagamento. Recomendamos usar Pix para confirmação imediata ou tentar novamente em alguns instantes.'
                  : 'O pagamento não foi aprovado. Para evitar acionamento do antifraude, aguarde alguns minutos antes de tentar novamente com o mesmo cartão.'}
            </DialogDescription>
          </DialogHeader>

          {cardErrorDetails && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/40 rounded p-3">
                  <div className="text-muted-foreground">Status</div>
                  <div className="font-medium">{cardErrorDetails.status ?? '-'}</div>
                </div>
                <div className="bg-muted/40 rounded p-3">
                  <div className="text-muted-foreground">Código</div>
                  <div className="font-medium">{cardErrorDetails.code ?? '-'}</div>
                </div>
                <div className="bg-muted/40 rounded p-3 col-span-2">
                  <div className="text-muted-foreground">Mensagem</div>
                  <div className="font-medium break-words">{cardErrorDetails.message}</div>
                </div>
                {cardErrorDetails.requestId && (
                  <div className="bg-muted/40 rounded p-3 col-span-2">
                    <div className="text-muted-foreground">Request ID</div>
                    <div className="font-mono text-xs break-all">{cardErrorDetails.requestId}</div>
                  </div>
                )}
              </div>

              {/* Logs/Detalhes da API (sanitizados do lado do backend) */}
              {cardErrorDetails.details && (
                <div className="border rounded-md p-3 bg-card/50">
                  <div className="text-sm font-medium mb-2">Detalhes da API</div>
                  <pre className="text-xs whitespace-pre-wrap break-words max-h-64 overflow-auto">
{JSON.stringify(cardErrorDetails.details, null, 2)}
                  </pre>
                </div>
              )}

              {isReservationExpiredError ? (
                <div className="text-xs text-muted-foreground">
                  Sua reserva expirou. Clique em “Fazer reserva novamente” para iniciar uma nova reserva e então concluir o pagamento.
                </div>
              ) : isFirestoreTxnOrderError ? (
                <div className="text-xs text-muted-foreground">
                  Estamos com instabilidade no processamento do cartão. Use Pix para confirmar imediatamente, ou tente novamente mais tarde.
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Dicas: aguarde ~1 minutos antes de tentar o mesmo cartão. Se possível, tente outro cartão ou use Pix para confirmação imediata.
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {isReservationExpiredError ? (
                  <Button
                    className="w-full sm:w-auto"
                    variant="destructive"
                    onClick={handleRedoReservation}
                  >
                    Fazer reserva novamente
                  </Button>
                ) : isFirestoreTxnOrderError ? (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => setActiveTab('pix')}
                      className="w-full sm:w-auto"
                    >
                      Pagar com Pix
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => setShowCardErrorModal(false)}
                    >
                      Entendi
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="default"
                      onClick={() => setShowCardErrorModal(false)}
                    >
                      Entendi
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setActiveTab('pix')}
                    >
                      Pagar com Pix
                    </Button>
                    <Button
                      disabled={cooldownRemaining > 0}
                      onClick={() => setShowCardErrorModal(false)}
                    >
                      Tentar novamente {cooldownRemaining > 0 ? `(${Math.floor(cooldownRemaining/60).toString().padStart(2,'0')}:${(cooldownRemaining%60).toString().padStart(2,'0')})` : ''}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AnimatedBackground>
  );
}