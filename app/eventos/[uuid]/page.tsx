import { api } from '@/lib/api';
import { notFound } from 'next/navigation';
import EventPage from './event-page';

// Função para gerar os parâmetros estáticos
export async function generateStaticParams() {
  // Não faz chamada à API no build para evitar erro 401
  // Retorna array vazio para gerar páginas sob demanda
  return [];
}

// Habilita geração sob demanda para páginas não pré-geradas
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
    throw error;
  }
} 