import { useEffect, useState } from 'react';
import { backgroundImages } from './data/images';

export function BackgroundSlider() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      {backgroundImages.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-black/90" />
          <img
            src={image}
            alt="Background"
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}