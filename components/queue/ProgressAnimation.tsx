import { Clock, Users } from 'lucide-react';
import { useQueue } from './QueueContext';

export function ProgressAnimation() {
  const { position, estimatedTime } = useQueue();

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="relative h-32 w-32">
        <div className="absolute inset-0 animate-ping rounded-full bg-purple-500 opacity-20" />
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-purple-600">
          <Users className="h-12 w-12 text-white" />
        </div>
      </div>

      <div className="flex items-center space-x-2 text-white">
        <Clock className="h-6 w-6" />
        <span className="text-lg">
          Tempo estimado: {Math.ceil(estimatedTime)} minutos
        </span>
      </div>

      <div className="text-center">
        <div className="text-4xl font-bold text-white">Posição: {position}</div>
        <div className="mt-2 text-sm text-gray-300">
          Pessoas na sua frente
        </div>
      </div>
    </div>
  );
}