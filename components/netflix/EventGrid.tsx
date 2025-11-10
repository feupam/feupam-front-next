"use client"

import { Info, Ticket, Calendar } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { EventData } from '@/services/eventService'
import { useCurrentEventContext } from '@/contexts/CurrentEventContext'
import { useRouter } from 'next/navigation'
import { useLoading } from '@/contexts/LoadingContext'
import { isEventExpired, formatEventDate } from '@/lib/utils'
import { useEventStorage } from '@/hooks/useEventStorage'

interface EventGridProps {
  events: EventData[]
  onEventSelect: (index: number) => void
  selectedIndex: number
}

export function EventGrid({ events, onEventSelect, selectedIndex }: EventGridProps) {
  const { setCurrentEventFromData } = useCurrentEventContext()
  const { setSelectedEvent } = useEventStorage()
  const router = useRouter()
  const { setLoading } = useLoading()

  // Tilt/Parallax handlers
  const MAX_TILT = 4 // graus
  const IMG_PARALLAX = 8 // px

  const handleTiltMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Evita tilt em dispositivos touch (pointer coarse)
    if (typeof window !== 'undefined') {
      try {
        if (!window.matchMedia('(pointer: fine)').matches) return
      } catch {}
    }
    const wrapper = e.currentTarget
    const card = wrapper.querySelector<HTMLDivElement>('.tilt')
    const img = wrapper.querySelector<HTMLImageElement>('.tilt-img')
    if (!card) return

    const rect = wrapper.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rx = (py - 0.5) * -2 * MAX_TILT
    const ry = (px - 0.5) * 2 * MAX_TILT

    card.style.willChange = 'transform'
    card.style.transform = `perspective(800px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`
    card.style.transition = 'transform 80ms ease-out'

    if (img) {
      const tx = (px - 0.5) * IMG_PARALLAX
      const ty = (py - 0.5) * IMG_PARALLAX
      img.style.willChange = 'transform'
      img.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(1.03)`
      img.style.transition = 'transform 80ms ease-out'
    }
  }

  const handleTiltLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const wrapper = e.currentTarget
    const card = wrapper.querySelector<HTMLDivElement>('.tilt')
    const img = wrapper.querySelector<HTMLImageElement>('.tilt-img')
    if (card) {
      card.style.transform = ''
      card.style.transition = 'transform 200ms ease'
    }
    if (img) {
      img.style.transform = ''
      img.style.transition = 'transform 200ms ease'
    }
  }

  const handleEventClick = async (event: EventData) => {
    setLoading(true);
    console.log('[EventGrid] Clique em inscrição para:', event.name);
    
    // Salvar no contexto
    setCurrentEventFromData(event);
    
    // Salvar no localStorage
    sessionStorage.setItem('navigating', 'true');
    setSelectedEvent({
      id: String(event.id),
      name: event.name,
      eventStatus: event,
    });
    console.log('[EventGrid] Evento salvo no localStorage:', event.name);
    
    try {
      if (event.isOpen) {
        // Para eventos abertos, redireciona para login e depois para formulário de inscrição
        const loginParams = new URLSearchParams({
          redirect: `/formulario?eventId=${event.id}&eventName=${encodeURIComponent(event.name)}&isOpen=true`
        });
        console.log('[EventGrid] Redirecionando para login com redirect para formulário de inscrição...');
        router.push(`/login?${loginParams.toString()}`);
      } else {
        router.push(`/event/${encodeURIComponent(event.name)}?fromProfile=true`);
      }
    } catch (error) {
      console.log('[EventGrid] Erro na navegação:', error);
    } finally {
      // Aguarda um pouco antes de desativar o loading para dar tempo da navegação iniciar
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleMoreInfo = (event: EventData) => {
    setLoading(true);
    console.log('🔍 CLIQUE NO SAIBA MAIS!', event.name);
    
    // Define o evento no contexto
    setCurrentEventFromData(event);
    
    // Salvar no localStorage
    sessionStorage.setItem('navigating', 'true');
    setSelectedEvent({
      id: String(event.id),
      name: event.name,
      eventStatus: event,
    });
    console.log('[EventGrid] Evento salvo no localStorage (Saiba Mais):', event.name);
    
    // Aguarda um pouco antes de navegar para garantir que o contexto foi definido
    setTimeout(() => {
      console.log('[EventGrid] Navegando para página do evento...');
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
    return (
      <section className="px-4 pb-12">
        <div className="container mx-auto">

          <div className="text-center py-8 text-white/70">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum evento ativo no momento</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 pb-12">
      <div className="container mx-auto">

        <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8">
          {activeEvents.map((event, index) => (
            <div 
              key={event.id} 
              className={`group relative rounded-xl p-[1px] cursor-pointer transform-gpu transition-all duration-300 
                bg-gradient-to-br from-emerald-500/30 via-emerald-400/10 to-transparent hover:from-emerald-400/60 hover:via-emerald-300/20 
                w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.667rem)] md:w-[220px] lg:w-[240px] flex-shrink-0
                ${index === selectedIndex ? 'ring-2 ring-emerald-400/60' : ''}
              `}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEventSelect(index);
                handleEventClick(event);
              }}
              onMouseMove={handleTiltMove}
              onMouseLeave={handleTiltLeave}
            >

              <div className="relative rounded-[12px] overflow-hidden bg-zinc-900/80 backdrop-blur-md 
                              shadow-[0_8px_24px_rgba(16,185,129,0.15)] group-hover:shadow-[0_12px_40px_rgba(16,185,129,0.35)] 
                              transition-all duration-300 group-hover:-translate-y-1 tilt">
                {/* Badge Inscrições Abertas */}
                {event.isOpen && (
                  <div className="absolute top-1 right-1 md:top-2 md:right-2 z-20">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/90 text-white 
                                      border border-emerald-500 px-2.5 py-1 text-[10px] md:text-xs font-semibold tracking-wide 
                                      shadow-[0_6px_22px_rgba(16,185,129,0.45)] ring-1 ring-emerald-600">
                      INSCRIÇÕES ABERTAS
                    </span>
                  </div>
                )}

                {/* Imagem / placeholder */}
                <div className="relative">
                  {event.logo_evento ? (
                    <img
                      src={event.logo_evento}
                      alt={event.name}
                      className="w-full aspect-[3/4] object-cover rounded-[12px] 
                                 transition-transform duration-500 ease-out 
                                 group-hover:scale-[1.03] tilt-img"
                    />
                  ) : (
                    <div className="w-full aspect-[3/4] rounded-[12px] 
                                    bg-[radial-gradient(120%_120%_at_10%_10%,rgba(16,185,129,0.20),rgba(0,0,0,0))] 
                                    bg-zinc-900 flex items-center justify-center">
                      <div className="text-center p-3">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                        <h3 className="text-xs font-semibold text-emerald-100 line-clamp-2">
                          {event.name}
                        </h3>
                        <p className="text-xs text-emerald-300 mt-1">
                          {formatEventDate(event.date || event.startDate, event.range_date)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Overlay de gradiente e infos */}
                  <div className="pointer-events-none absolute inset-0 rounded-[12px] 
                                  bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                  {/* Conteúdo inferior: título + data */}
                  <div className="absolute inset-x-0 bottom-0 p-2">
                    <div className="flex items-end justify-between gap-2">
                      <div className="max-w-[60%] sm:max-w-[70%]">
                        <h3 className="text-[11px] font-semibold text-emerald-50 line-clamp-2 drop-shadow">
                          {event.name}
                        </h3>
                        <p className="text-[10px] text-emerald-200/80">
                          {formatEventDate(event.date || event.startDate, event.range_date)}
                        </p>
                      </div>

                      {/* Ações flutuantes */}
                      <div className="pointer-events-auto flex items-stretch gap-1 flex-col sm:flex-row self-end">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-2 bg-black/40 border-emerald-400/40 text-emerald-100 
                                     hover:bg-emerald-500/15 hover:text-emerald-50 backdrop-blur-md"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMoreInfo(event)
                          }}
                          title="Saiba mais"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="h-7 px-2 bg-emerald-500/90 text-emerald-50 
                                     hover:bg-emerald-500 shadow-[0_6px_24px_rgba(16,185,129,0.45)]"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEventClick(event)
                          }}
                          title={event.isOpen ? "Inscrição" : "Atualize seus dados"}
                        >
                          <Ticket className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
