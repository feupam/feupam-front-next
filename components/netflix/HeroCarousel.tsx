"use client"

import { useState, useEffect } from "react"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventData } from '@/services/eventService'
import { useCurrentEventContext } from '@/contexts/CurrentEventContext'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { isEventExpired, formatDate } from '@/lib/utils'

interface CarouselImage {
  src: string
  alt: string
  event: EventData
}

import { useLoading } from '@/contexts/LoadingContext'
interface HeroCarouselProps {
  events: EventData[]
  onEventSelect: (index: number) => void
  selectedIndex: number
  speed?: number
}

export function HeroCarousel({ events, onEventSelect, selectedIndex, speed = 50 }: HeroCarouselProps) {
  const { setLoading } = useLoading();
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { setCurrentEventFromData } = useCurrentEventContext()
  const { signInWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // CSS personalizado para animação que funciona com qualquer número de imagens
  useEffect(() => {
    if (!mounted || !events.length) return
    
    const imageCount = events.length
    const keyframesName = `scrollLeft-${imageCount}`
    
    // Criar animação CSS dinamicamente
    const keyframes = `
      @keyframes ${keyframesName} {
        0% { transform: translateX(0); }
        100% { transform: translateX(-${imageCount * 100}vw); }
      }
    `
    
    // Criar elemento style e adicionar ao head
    const styleId = `carousel-style-${imageCount}`
    let existingStyle = document.getElementById(styleId)
    
    if (!existingStyle) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = keyframes
      document.head.appendChild(style)
    }
    
    return () => {
      // Cleanup: remover o style quando o componente for desmontado
      const styleElement = document.getElementById(styleId)
      if (styleElement) {
        document.head.removeChild(styleElement)
      }
    }
  }, [mounted, events.length])

  const handleEventClick = async (event: EventData) => {
    setLoading(true);
    console.log('[HeroCarousel] Clique em inscrição para:', event.name);
    setCurrentEventFromData(event);
    
    try {
      if (event.isOpen) {
        // Sempre força login do Google antes de ir para o formulário de inscrição
        console.log('[HeroCarousel] Forçando login do Google...');
        await signInWithGoogle();
        console.log('[HeroCarousel] Login bem-sucedido, redirecionando para formulário de inscrição...');
        router.push('/formulario');
        // Aguarda um pouco antes de desativar o loading para dar tempo da navegação iniciar
        setTimeout(() => setLoading(false), 500);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.log('[HeroCarousel] Login cancelado ou falhou');
      setLoading(false);
    }
  };

  const handleMoreInfo = (event: EventData) => {
    setLoading(true);
    setCurrentEventFromData(event);
    setTimeout(() => {
      router.push(`/event/${encodeURIComponent(event.name)}`);
      // Aguarda um pouco mais antes de desativar o loading
      setTimeout(() => setLoading(false), 300);
    }, 100);
  };

  if (!events || events.length === 0) {
    return null
  }

  // Filtrar eventos que já passaram
  const activeEvents = events.filter(event => !isEventExpired(event.date || event.startDate));
  
  if (activeEvents.length === 0) {
    return null
  }

  // Converte os eventos ativos para o formato CarouselImage
  const images: CarouselImage[] = activeEvents.map(event => ({
    src: event.image_capa || "/placeholder.svg",
    alt: event.name,
    event: event
  }))

  if (!mounted) {
    return (
      <div className="relative overflow-hidden h-[40vh] sm:h-[50vh] md:h-[65vh] lg:h-[70vh] xl:h-[75vh] bg-black p-2 md:p-4">
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
  const adjustedSpeed = isMobile ? speed * 0.5 : speed
  
  // Calcular a largura correta para a animação funcionar
  const imageCount = images.length
  const totalWidth = duplicatedImages.length * 100 // cada imagem ocupa 100vw
  
  // CSS personalizado para animação que funciona com qualquer número de imagens
  const keyframesName = `scrollLeft-${imageCount}`


  return (
  <div className="relative overflow-hidden h-[40vh] sm:h-[50vh] md:h-[65vh] lg:h-[70vh] xl:h-[75vh] bg-black p-2 md:p-4">
      <div
        className="flex gap-2 md:gap-4"
        style={{
          animationDuration: `${adjustedSpeed}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationName: keyframesName,
          width: `${totalWidth}vw`,
        }}
      >
        {duplicatedImages.map((image, index) => (
          <div key={index} className="flex-shrink-0 w-[calc(100vw-1rem)] md:w-[calc(100vw-2rem)]">
            <div
              className="relative h-[calc(40vh-1rem)] sm:h-[calc(50vh-1rem)] md:h-[calc(65vh-2rem)] lg:h-[calc(70vh-2rem)] xl:h-[calc(75vh-2rem)] group cursor-pointer"
              onClick={() => {
                setCurrentEventFromData(image.event);
                router.push(`/event/${encodeURIComponent(image.event.name)}`);
              }}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover rounded-lg border border-emerald-400/20 shadow-2xl"
                loading="lazy"
              />
              {/* Overlay com gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-lg" />
              
              {/* Informações do evento - só aparecem se NÃO houver imagem */}
              {!image.event.image_capa && (
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <div className="max-w-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs md:text-sm text-emerald-200/80">
                        {(() => {
                          const eventDate = image.event.date || image.event.startDate;
                          return new Date(eventDate).getFullYear();
                        })()}
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
                  </div>
                </div>
              )}
              
              {/* Botão Saiba Mais - sempre aparece */}
              <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-black/50 backdrop-blur-sm border-emerald-400 text-emerald-200 hover:bg-emerald-500/20 hover:text-emerald-100 transition-all duration-300"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentEventFromData(image.event);
                    router.push(`/event/${encodeURIComponent(image.event.name)}`);
                  }}
                >
                  <Info className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Saiba mais
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
