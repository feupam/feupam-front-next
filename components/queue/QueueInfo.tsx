import { useQueue } from './QueueContext';

export function QueueInfo() {
  const { isReady } = useQueue();

  return (
    <div className="mt-8 text-center">
      {isReady ? (
        <button
          className="rounded-full bg-green-500 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-green-600 hover:shadow-lg"
        >
          Entrar Agora
        </button>
      ) : (
        <div className="rounded-lg bg-white/10 px-6 py-3 text-sm text-white backdrop-blur-sm">
          Aguarde sua vez. Não feche ou atualize esta página.
        </div>
      )}
    </div>
  );
}