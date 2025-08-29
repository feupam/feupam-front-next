import { useState } from 'react';

/**
 * Utilitários para navegação de carrossel
 */

export interface CarouselScrollOptions {
  containerId: string;
  totalItems: number;
  onPositionChange: (position: number) => void;
  currentPosition: number;
}

export class CarouselNavigation {
  private options: CarouselScrollOptions;

  constructor(options: CarouselScrollOptions) {
    this.options = options;
  }

  scrollLeft = () => {
    const container = document.getElementById(this.options.containerId);
    if (container) {
      const newPosition = this.options.currentPosition - 1;
      const finalPosition = newPosition < 0 ? this.options.totalItems - 1 : newPosition;
      this.options.onPositionChange(finalPosition);

      if (newPosition < 0) {
        container.scrollTo({
          left: container.scrollWidth - container.offsetWidth,
          behavior: 'smooth',
        });
      } else {
        container.scrollBy({ left: -container.offsetWidth, behavior: 'smooth' });
      }
    }
  };

  scrollRight = () => {
    const container = document.getElementById(this.options.containerId);
    if (container) {
      const newPosition = this.options.currentPosition + 1;
      const finalPosition = newPosition >= this.options.totalItems ? 0 : newPosition;
      this.options.onPositionChange(finalPosition);

      if (newPosition >= this.options.totalItems) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: container.offsetWidth, behavior: 'smooth' });
      }
    }
  };

  scrollToPosition = (position: number) => {
    const container = document.getElementById(this.options.containerId);
    if (container) {
      this.options.onPositionChange(position);
      container.scrollTo({
        left: container.offsetWidth * position,
        behavior: 'smooth'
      });
    }
  };
}

/**
 * Hook para gestos de toque em carrossel
 */
export function useTouchGestures(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      onSwipeLeft();
    } else {
      onSwipeRight();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}
