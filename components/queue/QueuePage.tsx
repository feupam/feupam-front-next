import { BackgroundSlider } from './BackgroundSlider';
import { ProgressAnimation } from './ProgressAnimation';
import { TipsCarousel } from './TipsCarousel';
import { QueueInfo } from './QueueInfo';

export function QueuePage() {
  return (
    <div className="relative min-h-screen">
      <BackgroundSlider />
      
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <h1 className="text-center text-3xl font-bold text-white">
            Fila Virtual
          </h1>
          
          <ProgressAnimation />
          
          <TipsCarousel />
          
          <QueueInfo />
        </div>
      </div>
    </div>
  );
}