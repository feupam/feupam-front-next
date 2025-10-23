"use client"

import { useEffect } from 'react';

export function CacheBuster() {
  useEffect(() => {
    // Limpar apenas se não estiver no processo de navegação
    const isNavigating = sessionStorage.getItem('navigating');
    
    if (!isNavigating) {
      // Limpar apenas dados antigos, preservando o selectedEvent se for recente
      const selectedEvent = localStorage.getItem('selected_event');
      
      if (selectedEvent) {
        try {
          const parsed = JSON.parse(selectedEvent);
          const savedAt = new Date(parsed.savedAt);
          const now = new Date();
          const hoursDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);
          
          // Se tiver mais de 24 horas, limpar tudo
          if (hoursDiff > 24) {
            localStorage.clear();
            sessionStorage.clear();
          }
        } catch {
          // Se der erro no parse, limpar tudo
          localStorage.clear();
          sessionStorage.clear();
        }
      } else {
        // Se não tiver selectedEvent, pode limpar tudo
        localStorage.clear();
        sessionStorage.clear();
      }
    }

    // Limpar service workers se existirem
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
    }

    // Limpar flag de navegação após um tempo
    setTimeout(() => {
      sessionStorage.removeItem('navigating');
    }, 1000);
  }, []);

  return null; // Componente não renderiza nada
}
