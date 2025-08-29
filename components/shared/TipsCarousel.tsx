import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface TipsCarouselProps {
  tips: string[];
  interval?: number;
  className?: string;
}

export function TipsCarousel({ 
  tips, 
  interval = 8000, 
  className = "flex items-center space-x-3 rounded-lg bg-white/10 p-4 backdrop-blur-sm" 
}: TipsCarouselProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    if (tips.length === 0) return;
    
    const intervalId = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, [tips.length, interval]);

  if (tips.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <AlertCircle className="h-6 w-6 flex-shrink-0 text-yellow-400" />
      <p className="text-sm text-white">{tips[currentTipIndex]}</p>
    </div>
  );
}
