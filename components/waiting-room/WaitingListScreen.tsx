'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, Users, AlertCircle, RefreshCw, X, CheckCircle, Loader2 } from 'lucide-react';
import { useWaitingList } from '@/hooks/useWaitingList';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface WaitingListScreenProps {
  eventId: string;
  eventName: string;
  onPromoted?: () => void;
}

export function WaitingListScreen({ eventId, eventName, onPromoted }: WaitingListScreenProps) {
  const router = useRouter();
  const [showPromotedMessage, setShowPromotedMessage] = useState(false);
  const [isLeavingQueue, setIsLeavingQueue] = useState(false);

  const {
    inQueue,
    position,
    totalInQueue,
    loading,
    error,
    leaveQueue,
    refresh,
  } = useWaitingList({
    eventId,
    enabled: true,
    pollingInterval: 30000, // 30 segundos
    onPromoted: () => {
      setShowPromotedMessage(true);
      toast({
        title: '🎉 Vaga Liberada!',
        description: 'Uma vaga foi liberada! Você tem 5 minutos para finalizar o pagamento.',
        variant: 'default',
      });
      
      if (onPromoted) {
        onPromoted();
      }
    },
    onError: (errorMessage) => {
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const handleLeaveQueue = async () => {
    if (confirm('Tem certeza que deseja sair da fila de espera?')) {
      setIsLeavingQueue(true);
      try {
        const result = await leaveQueue();
        
        if (result?.success) {
          toast({
            title: 'Removido da fila',
            description: 'Você foi removido da fila de espera.',
          });
          router.push('/eventos');
        }
      } finally {
        setIsLeavingQueue(false);
      }
    }
  };

  // Se foi promovido, redirecionar para checkout após 3 segundos
  useEffect(() => {
    if (showPromotedMessage) {
      const timeout = setTimeout(() => {
        router.push(`/checkout/${encodeURIComponent(eventName)}`);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [showPromotedMessage, eventName, router]);

  if (showPromotedMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-green-600 dark:text-green-400">
              Vaga Liberada!
            </CardTitle>
            <CardDescription>
              Redirecionando para pagamento...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Você tem 5 minutos para finalizar sua reserva.
            </p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!inQueue) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle>Não está na fila</CardTitle>
            <CardDescription>
              Você não está na fila de espera para este evento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => router.push('/eventos')} 
              className="w-full"
            >
              Ver Eventos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle>Fila de Espera</CardTitle>
          <CardDescription>{eventName}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Posição na fila */}
          <div className="bg-muted rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Sua posição</p>
            <div className="flex items-center justify-center gap-3">
              <Users className="h-6 w-6 text-muted-foreground" />
              <p className="text-4xl font-bold">
                {position || '-'}
              </p>
              <p className="text-muted-foreground">
                de {totalInQueue || '-'}
              </p>
            </div>
          </div>

          {/* Informações */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Aguardando vaga</AlertTitle>
            <AlertDescription>
              Você será notificado automaticamente quando uma vaga for liberada.
              Fique atento ao seu email e mantenha esta página aberta.
            </AlertDescription>
          </Alert>

          {/* Status de verificação */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>
              {loading ? 'Verificando...' : 'Verificando a cada 30 segundos'}
            </span>
          </div>

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Ações */}
          <div className="space-y-3">
            <Button 
              onClick={refresh} 
              variant="outline" 
              className="w-full gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Atualizar Posição
                </>
              )}
            </Button>

            <Button 
              onClick={handleLeaveQueue} 
              variant="destructive" 
              className="w-full gap-2"
              disabled={loading || isLeavingQueue}
            >
              {isLeavingQueue ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saindo...
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  Sair da Fila
                </>
              )}
            </Button>
          </div>

          {/* Link para voltar */}
          <div className="text-center">
            <Button 
              onClick={() => router.push('/eventos')} 
              variant="link"
              className="text-sm"
            >
              Ver outros eventos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
