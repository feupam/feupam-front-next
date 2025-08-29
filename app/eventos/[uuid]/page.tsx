import { api } from '@/lib/api';
import { notFound } from 'next/navigation';
import EventPage from './event-page';

// Função para gerar os parâmetros estáticos
export async function generateStaticParams() {
  try {
    const events = await api.events.list();
    return events.map((event) => ({
      uuid: event.uuid,
    }));
  } catch (error) {
    console.error('Erro ao gerar parâmetros estáticos:', error);
    return [];
  }
}

interface PageProps {
  params: {
    uuid: string;
  };
}

export default async function Page({ params }: PageProps) {
  try {
    const events = await api.events.list();
    const event = events.find(e => e.uuid === params.uuid);
    
    if (!event) {
      notFound();
    }

    return <EventPage event={event} />;
  } catch (error) {
    console.error('Erro ao carregar evento:', error);
    throw error;
  }
} 