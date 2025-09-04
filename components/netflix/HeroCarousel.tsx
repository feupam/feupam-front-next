"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Play, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventData } from '@/services/eventService'
import { useCurrentEventContext } from '@/contexts/CurrentEventContext'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface HeroCarouselProps {
  events: EventData[]
  onEventSelect: (index: number) => void
  selectedIndex: number
}

export function HeroCarousel({ events, onEventSelect, selectedIndex }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(selectedIndex)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const { setCurrentEventFromData } = useCurrentEventContext()
  const { signInWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setCurrentSlide(selectedIndex)
  }, [selectedIndex])

  const nextSlide = () => {
    const newIndex = (currentSlide + 1) % events.length
    setCurrentSlide(newIndex)
    onEventSelect(newIndex)
  }

  const prevSlide = () => {
    const newIndex = (currentSlide - 1 + events.length) % events.length
    setCurrentSlide(newIndex)
    onEventSelect(newIndex)
  }

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [currentSlide, events.length])

  if (!events || events.length === 0) {
    return null
  }

  return (
    <div 
      className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {events.map((event, index) => (
        <div
          key={event.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? "translate-x-0" : index < currentSlide ? "-translate-x-full" : "translate-x-full"
          }`}
        >
          <div className="relative w-full h-full">
            <img 
              src={event.image_capa || "/placeholder.svg"} 
              alt={event.name} 
              className="w-full h-full object-cover" 
            />
            
            {/* Botão Saiba Mais - sempre visível */}
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-black/50 backdrop-blur-sm border-emerald-400 text-emerald-200 hover:bg-emerald-500/20 hover:text-emerald-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMoreInfo(event);
                }}
              >
                <Info className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Saiba mais
              </Button>
            </div>

            {!event.image_capa && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                  <div className="max-w-2xl ml-4 mr-4 md:ml-16 md:mr-0 mb-16 md:mb-20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs md:text-sm text-muted-foreground">
                        {new Date(event.startDate).getFullYear()}
                      </span>
                      <span className="text-xs md:text-sm text-muted-foreground">•</span>
                      <span className="text-xs md:text-sm text-muted-foreground">Evento</span>
                    </div>

                    <h2 className="text-lg md:text-3xl font-bold mb-2 md:mb-4 text-balance text-emerald-100">{event.name}</h2>

                    <p className="text-xs md:text-lg text-emerald-200 mb-3 md:mb-4 text-pretty line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Navigation Buttons - Hidden */}
      {events.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-200 hover:text-emerald-100 border border-emerald-400/50 opacity-0 pointer-events-none"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-200 hover:text-emerald-100 border border-emerald-400/50 opacity-0 pointer-events-none"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {events.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? "bg-emerald-400" : "bg-emerald-200/50"
                }`}
                onClick={() => {
                  setCurrentSlide(index)
                  onEventSelect(index)
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
