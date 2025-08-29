'use client';

import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EventSection from './EventSection';

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
}

interface EventCarouselProps {
  currentDate: string;
  events: Event[];
  onEventSelect: (index: number) => void;
  selectedIndex: number;
}

export default function EventCarousel({
  currentDate,
  events,
  onEventSelect,
  selectedIndex,
}: EventCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const scrollLeft = useCallback(() => {
    const container = document.getElementById('event-carousel');
    if (container) {
      const newIndex = Math.max(0, selectedIndex - 1);
      container.scrollTo({
        left: container.offsetWidth * newIndex,
        behavior: 'smooth'
      });
      onEventSelect(newIndex);
      setScrollPosition(newIndex);
    }
  }, [selectedIndex, onEventSelect]);

  const scrollRight = useCallback(() => {
    const container = document.getElementById('event-carousel');
    if (container) {
      const newIndex = Math.min(events.length - 1, selectedIndex + 1);
      container.scrollTo({
        left: container.offsetWidth * newIndex,
        behavior: 'smooth'
      });
      onEventSelect(newIndex);
      setScrollPosition(newIndex);
    }
  }, [selectedIndex, onEventSelect, events.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      scrollRight();
    } else if (isRightSwipe) {
      scrollLeft();
    }
  }, [touchStart, touchEnd, scrollLeft, scrollRight]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Navigation Menu */}
      <div className="w-full mb-8">
        <div className="flex justify-center gap-2 md:gap-4">
          {events.map((event, index) => (
            <button
              key={event.id}
              onClick={(e) => {
                console.log('🔥 CLIQUE DETECTADO!', event.name, index);
                e.preventDefault();
                e.stopPropagation();
                console.log('[EventCarousel] Botão clicado para evento:', event.name, 'index:', index);
                setScrollPosition(index);
                onEventSelect(index);
                const container = document.getElementById('event-carousel');
                if (container) {
                  container.scrollTo({
                    left: container.offsetWidth * index,
                    behavior: 'smooth'
                  });
                }
              }}
              className={`text-sm px-4 py-2 rounded-full transition-all transform hover:scale-105 ${
                selectedIndex === index
                  ? 'bg-emerald-400 text-white shadow-lg bg-emerald-200/50'
                  : 'bg-black/50 text-emerald-200 hover:bg-emerald-400 hover:text-white'
              }`}
            >
              {event.name}
            </button>
          ))}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative w-full max-w-5xl">
        {/* Navigation Arrows */}
        <button
          onClick={scrollLeft}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-emerald-500/70 hover:bg-emerald-500/90 transition-all transform hover:scale-110"
          aria-label="Previous event"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>

        <button
          onClick={scrollRight}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-emerald-500/70 hover:bg-emerald-500/90 transition-all transform hover:scale-110"
          aria-label="Next event"
        >
          <ChevronRight size={24} className="text-white" />
        </button>

        {/* Carousel Track */}
        <div
          id="event-carousel"
          className="flex overflow-x-hidden snap-x snap-mandatory rounded-2xl"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {events.map((event, index) => (
            <div
              key={event.id}
              className="min-w-full w-full flex-shrink-0 snap-center px-8 md:px-12"
            >
              <EventSection
                eventId={event.id}
                eventName={event.name}
                eventDescription={event.description}
                eventDate={event.date}
                eventLocation={event.location}
                currentDate={currentDate}
                startDate={event.startDate}
                endDate={event.endDate}
                isOpen={event.isOpen}
              />
            </div>
          ))}
        </div>

        {/* Progress Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                console.log('[EventCarousel] Indicador clicado para index:', index);
                const container = document.getElementById('event-carousel');
                if (container) {
                  setScrollPosition(index);
                  onEventSelect(index);
                  container.scrollTo({
                    left: container.offsetWidth * index,
                    behavior: 'smooth',
                  });
                }
              }}
              className={`w-3 h-3 rounded-full transition-all transform ${
                selectedIndex === index ? 'bg-primary scale-125' : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
