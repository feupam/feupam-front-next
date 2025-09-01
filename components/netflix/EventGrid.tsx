"use client"

import { Info, Ticket, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventData } from '@/services/eventService'
import { useCurrentEventContext } from '@/contexts/CurrentEventContext'
import { useRouter } from 'next/navigation'

interface EventGridProps {
  events: EventData[]
  onEventSelect: (index: number) => void
  selectedIndex: number
}

export function EventGrid({ events, onEventSelect, selectedIndex }: EventGridProps) {
  const { setCurrentEventFromData } = useCurrentEventContext()
  const router = useRouter()

  const handleEventClick = async (event: EventData) => {
    console.log('[EventGrid] Clique em inscrição para:', event.name);
    setCurrentEventFromData(event);
    
    if (event.isOpen) {
      // Para eventos abertos, redireciona para login e depois para perfil
      const loginParams = new URLSearchParams({
        redirect: `/perfil?eventId=${event.id}&eventName=${encodeURIComponent(event.name)}&isOpen=true`
      });
      console.log('[EventGrid] Redirecionando para login com redirect para perfil...');
      router.push(`/login?${loginParams.toString()}`);
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
      console.log('[EventGrid] Navegando para página do evento...');
      router.push(`/event/${encodeURIComponent(event.name)}`);
    }, 100);
  };

  if (!events || events.length === 0) {
    return null
  }

  return (
    <section className="px-4 pb-12">
      <div className="container mx-auto">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-left text-white">Eventos Disponíveis</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
          {events.map((event, index) => (
            <div 
              key={event.id} 
              className={`group overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer ${
                index === selectedIndex ? 'ring-2 ring-primary' : ''
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEventSelect(index);
                handleEventClick(event);
              }}
            >
              <div className="relative">
                {event.logo_evento ? (
                  <img
                    src={event.logo_evento}
                    alt={event.name}
                    className="w-full aspect-[3/4] object-cover rounded-sm"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 rounded-sm flex items-center justify-center">
                    <div className="text-center p-2">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                      <h3 className="text-xs font-semibold text-emerald-100 line-clamp-2">
                        {event.name}
                      </h3>
                      <p className="text-xs text-emerald-300 mt-1">
                        {new Date(event.startDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                  <div className="flex items-center justify-center gap-3 text-xs">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="p-1 h-auto text-white hover:text-primary flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMoreInfo(event)
                      }}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                    <span className="text-white text-sm">|</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="p-1 h-auto text-white hover:text-primary flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEventClick(event)
                      }}
                      title={event.isOpen ? "Inscrição" : "Atualize seus dados"}
                    >
                      <Ticket className="h-4 w-4" />
                    </Button>
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
