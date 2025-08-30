import React from 'react';
import CountdownTimer from './CountdownTimer';
import { CalendarCheck, MapPin, Clock } from 'lucide-react';
import { TipsCarousel } from './TipsCarousel';
import { useCurrentEventContext } from '@/contexts/CurrentEventContext';

interface EventSectionProps {
  eventId: number;
  eventName: string;
  eventDescription: string;
  eventDate: string;
  eventLocation: string;
  currentDate: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
}

const EventSection: React.FC<EventSectionProps> = ({
  eventId,
  eventName,
  eventDescription,
  eventDate,
  eventLocation,
  currentDate,
  startDate,
  endDate,
  isOpen,
}) => {
  const { setCurrentEventFromData } = useCurrentEventContext();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  console.log('🎯 [EventSection] Renderizando evento:', eventName, 'isOpen:', isOpen);

  // Função para definir contexto e navegar
  const handleEventClick = () => {
    console.log('🔥 CLIQUE NO BOTÃO DE INSCRIÇÃO!', eventName);
    console.log('🔥 DADOS DO EVENTO:', { eventId, eventName, isOpen });
    
    // Define o evento no contexto
    const eventData = {
      id: eventId,
      name: eventName,
      description: eventDescription,
      date: eventDate,
      location: eventLocation,
      startDate: startDate,
      endDate: endDate,
      isOpen: isOpen
    };
    
    console.log('[EventSection] Definindo evento no contexto:', eventData);
    setCurrentEventFromData(eventData);
    
    // Aguarda um pouco antes de navegar para garantir que o contexto foi definido
    setTimeout(() => {
      console.log('[EventSection] Navegando para login...');
      window.location.href = `/login?redirect=/perfil&eventId=${eventId}&eventName=${encodeURIComponent(eventName)}&isOpen=${isOpen}`;
    }, 100);
  };

  // Converte currentDate para um objeto Date
  const currentDateObj = new Date(currentDate);
  const startDateObj = (() => {
    try {
      const date = new Date(startDate);
      if (isNaN(date.getTime())) {
        console.error('startDate inválido, usando data padrão:', startDate);
        return new Date('2025-01-01T00:00:00Z');
      }
      return date;
    } catch (error) {
      console.error('Erro ao processar startDate:', error, 'Valor de startDate:', startDate);
      return new Date('2025-01-01T00:00:00Z');
    }
  })();

  if (isNaN(startDateObj.getTime())) {
    console.error('startDateObj ainda inválido após fallback');
    const fallbackDate = new Date('2025-01-01T00:00:00Z');
    const eventTitle = `Abertura das inscrições: ${eventName} (Data inválida)`;
    const googleCalendarLink = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(eventTitle)}&dates=${fallbackDate.toISOString().replace(/-|:|\.\d+/g, '')}/${fallbackDate.toISOString().replace(/-|:|\.\d+/g, '')}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(eventLocation)}`;
    const appleCalendarLink = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:${encodeURIComponent(eventTitle)}%0ADTSTART:${encodeURIComponent(fallbackDate.toISOString().replace(/-|:|\.\d+/g, ''))}%0ADTEND:${encodeURIComponent(fallbackDate.toISOString().replace(/-|:|\.\d+/g, ''))}%0ADESCRIPTION:${encodeURIComponent(eventDescription)}%0ALOCATION:${encodeURIComponent(eventLocation)}%0AEND:VEVENT%0AEND:VCALENDAR`;
    return (
      <div>Erro: Data inválida. Usando data padrão.</div>
    );
  }

  // Título do evento
  const eventTitle = `Abertura das inscrições: ${eventName}`;

  const googleCalendarLink = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(eventTitle)}&dates=${startDateObj.toISOString().replace(/-|:|\.\d+/g, '')}/${startDateObj.toISOString().replace(/-|:|\.\d+/g, '')}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(eventLocation)}`;

  const appleCalendarLink = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:${encodeURIComponent(eventTitle)}%0ADTSTART:${encodeURIComponent(startDateObj.toISOString().replace(/-|:|\.\d+/g, ''))}%0ADTEND:${encodeURIComponent(startDateObj.toISOString().replace(/-|:|\.\d+/g, ''))}%0ADESCRIPTION:${encodeURIComponent(eventDescription)}%0ALOCATION:${encodeURIComponent(eventLocation)}%0AEND:VEVENT%0AEND:VCALENDAR`;

  return (
    <div className="relative z-10 max-w-full sm:max-w-3xl mx-auto px-2 sm:px-6 py-4 sm:py-8">
      <div className="backdrop-blur-md bg-black/30 rounded-xl p-3 sm:p-10 border border-emerald-400/20 shadow-2xl">
        <span className={`inline-block px-3 py-1 text-white text-xs sm:text-sm font-medium rounded-full mb-3 sm:mb-4 ${currentDateObj > new Date(endDate) ? 'bg-red-500' : isOpen ? 'bg-green-500' : 'bg-emerald-500/80'}`}>
          {currentDateObj > new Date(endDate) ? 'Inscrições encerradas' : isOpen ? 'Inscrições abertas' : 'Em breve'}
        </span>
        
        <h1 className="text-xl sm:text-5xl font-bold text-emerald-300 mb-2 sm:mb-4 break-words">
          {eventName}
        </h1>
        
        <p className="text-emerald-100 text-base sm:text-lg mb-3 sm:mb-6">
          {eventDescription}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <div className="flex items-center text-emerald-200 text-xs sm:text-base">
            <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-400" />
            <span>{eventDate}</span>
          </div>
          <div className="flex items-center text-emerald-200 text-xs sm:text-base">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-400" />
            <span>{eventLocation}</span>
          </div>
            <div className="flex items-center text-emerald-200 sm:col-span-2 text-xs sm:text-base">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-400" />
              <span>{currentDateObj > new Date(endDate) ? "Inscrições encerradas" : isOpen ? "Inscrições abertas:" : "Inscrições abrem em:"}</span>
            </div>
        </div>
        
  {(!isOpen && currentDateObj <= new Date(endDate)) ? (
    <CountdownTimer targetDate={startDateObj} currentDate={currentDateObj} />
  ) : (
    <div style={{visibility: 'hidden', height: '40px'}}>
      <CountdownTimer targetDate={startDateObj} currentDate={currentDateObj} />
    </div>
  )}
        
        <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center w-full">
            <button 
              onClick={(e) => {
                console.log('🔍 CLIQUE NO SAIBA MAIS!', eventName);
                e.preventDefault();
                e.stopPropagation();
                
                // Define o evento no contexto
                const eventData = {
                  id: eventId,
                  name: eventName,
                  description: eventDescription,
                  date: eventDate,
                  location: eventLocation,
                  startDate: startDate,
                  endDate: endDate,
                  isOpen: isOpen
                };
                
                console.log('[EventSection] Definindo evento no contexto para Saiba mais:', eventData);
                setCurrentEventFromData(eventData);
                
                // Aguarda um pouco antes de navegar para garantir que o contexto foi definido
                setTimeout(() => {
                  console.log('[EventSection] Navegando para página do evento...');
                  window.location.href = `/event/${encodeURIComponent(eventName)}`;
                }, 100);
              }}
              className="w-full sm:w-auto px-5 sm:px-8 py-2 sm:py-3 text-xs sm:text-base bg-white/10 backdrop-blur-sm text-emerald-200 border border-emerald-400/20 font-medium rounded-lg shadow-lg hover:bg-emerald-500/20 transition-all duration-300"
            >
              Saiba mais
            </button>
            <button 
              onClick={(e) => {
                console.log('🚨 CLIQUE CAPTURADO!', e);
                e.preventDefault();
                e.stopPropagation();
                handleEventClick();
              }}
              className="w-full sm:w-auto px-5 sm:px-8 py-2 sm:py-3 text-xs sm:text-base bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {isOpen ? "Inscrição" : "Atualize seus dados"}
            </button>
        </div>
      </div>
      <div className="mt-6 sm:mt-10">

      </div>

    </div>
  );
};

export default EventSection;