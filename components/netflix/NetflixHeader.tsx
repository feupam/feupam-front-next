"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { EventsViewer } from "@/components/calendar/EventsViewer"
import { EventData } from "@/services/eventService"
import { useLoading } from "@/contexts/LoadingContext"

interface NetflixHeaderProps {
  events?: EventData[];
}

export function NetflixHeader({ events = [] }: NetflixHeaderProps) {
  const { user, signInWithGoogle } = useAuth()
  const router = useRouter()
  const { setLoading } = useLoading()

  const handleCartClick = async () => {
    setLoading(true);
    console.log('[NetflixHeader] Clique no carrinho');
    
    try {
      if (user) {
        // Usuário já está logado, vai direto para meus ingressos
        console.log('[NetflixHeader] Usuário logado, indo para /meus-ingressos');
        router.push('/meus-ingressos');
      } else {
        // Usuário não está logado, força login primeiro
        console.log('[NetflixHeader] Usuário não logado, forçando login...');
        await signInWithGoogle();
        console.log('[NetflixHeader] Login bem-sucedido, redirecionando para /meus-ingressos');
        router.push('/meus-ingressos');
      }
    } catch (error) {
      console.log('[NetflixHeader] Login cancelado ou falhou');
    } finally {
      setLoading(false);
    }
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-black/90 backdrop-blur-sm border-b border-emerald-500/20">
      <div className="container flex h-12 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-emerald-400">feupam</h1>
        </div>

        {/* Eventos e Carrinho de compras - mais à direita */}
        <div className="flex items-center gap-2 pr-4">
          {/* Visualizador de eventos */}
          <EventsViewer events={events} />
          
          {/* Carrinho de compras */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 text-emerald-200 hover:text-emerald-400 hover:bg-emerald-500/20"
            onClick={handleCartClick}
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="sr-only">Carrinho de compras</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
