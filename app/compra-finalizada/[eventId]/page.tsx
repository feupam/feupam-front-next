'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface CompraFinalizadaProps {
  params: {
    eventId: string;
  };
}

export default function CompraFinalizadaPage({ params }: CompraFinalizadaProps) {
  const { eventId } = params;
  const router = useRouter();
  
  useEffect(() => {
    // Limpa os dados da reserva do localStorage já que a compra foi finalizada
    localStorage.removeItem('reservationData');
    localStorage.removeItem('reservationTimestamp');
  }, []);

  return (
    <div className="container min-h-[80vh] py-10 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Compra Finalizada!</CardTitle>
          <CardDescription>
            Seu pagamento foi processado com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            Você receberá um e-mail com os detalhes da sua compra em breve.
            Seu ingresso estará disponível na área &quot;Meus Ingressos&quot;.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button asChild className="w-full">
            <Link href="/meus-ingressos">
              Ver Meus Ingressos
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/eventos/${eventId}`}>
              Voltar ao Evento
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/">
              Voltar à Página Inicial
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 