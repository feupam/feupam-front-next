import { api } from '@/lib/api';
import { notFound } from 'next/navigation';
import EventPage from './event-page';

export async function generateStaticParams() {
  return [];
}

export const dynamicParams = true;

interface PageProps {
  params: {
    uuid: string;
  };
}

export default async function Page({ params }: PageProps) {
  // Não faz chamada à API no build
  // Renderiza fallback ou mensagem de erro
  return <div>Evento não disponível no build. Faça login para visualizar.</div>;
}