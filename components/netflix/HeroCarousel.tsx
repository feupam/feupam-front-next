"use client"

import { useState, useEffect } from "react"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventData } from '@/services/eventService'
import { useCurrentEventContext } from '@/contexts/CurrentEventContext'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface CarouselImage {
  src: string
  alt: string
  event: EventData
}

interface HeroCarouselProps {
  events: EventData[]
  onEventSelect: (index: number) => void
  selectedIndex: number
  speed?: number
}

export function HeroCarousel({ events, onEventSelect, selectedIndex, speed = 50 }: HeroCarouselProps) {
  const [mounted, setMounted] = useState(false)
  const { setCurrentEventFromData } = useCurrentEventContext()
  const { signInWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEventClick = async (event: EventData) => {
    console.log('[HeroCarousel] Clique em inscrição para:', event.name);
    setCurrentEventFromData(event);
    
    if (event.isOpen) {
      // Sempre força login do Google antes de ir para o formulário de inscrição
      console.log('[HeroCarousel] Forçando login do Google...');
      const loginSuccess = await signInWithGoogle();
      
      if (loginSuccess) {
        console.log('[HeroCarousel] Login bem-sucedido, redirecionando para formulário de inscrição...');
        router.push('/formulario');
      } else {
        console.log('[HeroCarousel] Login cancelado ou falhou');
      }
    } else {
      router.push(`/event/${encodeURIComponent(event.name)}?fromProfile=true`);
    }
  };

  const handleMoreInfo = (event: EventData) => {
    console.log('🔍 CLIQUE NO SAIBA MAIS!', event.name);
    
    // Define o evento no contexto
    setCurrentEventFromData(event);
    
    // Aguarda um pouco antes de navegar para garantir que o contexto foi definido
    setTimeout(() => {
      console.log('[HeroCarousel] Navegando para página do evento...');
      router.push(`/event/${encodeURIComponent(event.name)}`);
    }, 100);
  };

  if (!events || events.length === 0) {
    return null
  }

  // Converte os eventos para o formato CarouselImage
  const images: CarouselImage[] = events.map(event => ({
    src: event.image_capa || "/placeholder.svg",
    alt: event.name,
    event: event
  }))

  if (!mounted) {
    return (
      <div className="relative overflow-hidden h-[45vh] sm:h-[55vh] md:h-[70vh] lg:h-[75vh] xl:h-[80vh] bg-black p-2 md:p-4">
        <div className="flex gap-2 md:gap-4">
          {images.slice(0, 3).map((image, index) => (
            <div key={index} className="flex-shrink-0 w-[calc(100vw-1rem)] md:w-[calc(100vw-2rem)]">
              <div className="relative h-[calc(45vh-1rem)] sm:h-[calc(55vh-1rem)] md:h-[calc(70vh-2rem)] lg:h-[calc(75vh-2rem)] xl:h-[calc(80vh-2rem)] bg-muted animate-pulse rounded-lg border border-emerald-400/20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const duplicatedImages = [...images, ...images]

  return (
    <div className="relative overflow-hidden h-[45vh] sm:h-[55vh] md:h-[70vh] lg:h-[75vh] xl:h-[80vh] bg-black p-2 md:p-4">
      <div
        className="flex animate-scroll-left gap-2 md:gap-4"
        style={{
          animationDuration: `${speed}s`,
          width: `${duplicatedImages.length * 100}vw`,
        }}
      >
        {duplicatedImages.map((image, index) => (
          <div key={index} className="flex-shrink-0 w-[calc(100vw-1rem)] md:w-[calc(100vw-2rem)]">
            <div className="relative h-[calc(45vh-1rem)] sm:h-[calc(55vh-1rem)] md:h-[calc(70vh-2rem)] lg:h-[calc(75vh-2rem)] xl:h-[calc(80vh-2rem)] group">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover rounded-lg border border-emerald-400/20 shadow-2xl"
                loading="lazy"
              />
              
              {/* Overlay com gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-lg" />
              
              {/* Informações do evento */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs md:text-sm text-emerald-200/80">
                      {new Date(image.event.startDate).getFullYear()}
                    </span>
                    <span className="text-xs md:text-sm text-emerald-200/80">•</span>
                    <span className="text-xs md:text-sm text-emerald-200/80">Evento</span>
                  </div>

                  <h2 className="text-lg md:text-2xl font-bold mb-2 text-emerald-100 line-clamp-2">
                    {image.event.name}
                  </h2>

                  <p className="text-xs md:text-sm text-emerald-200/90 mb-4 line-clamp-2">
                    {image.event.description}
                  </p>

                  {/* Botão Saiba Mais */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-black/50 backdrop-blur-sm border-emerald-400 text-emerald-200 hover:bg-emerald-500/20 hover:text-emerald-100 transition-all duration-300"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMoreInfo(image.event);
                    }}
                  >
                    <Info className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    Saiba mais
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
