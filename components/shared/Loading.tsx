import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  centered?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-16 w-16'
};

export function Loading({ 
  size = 'md', 
  text, 
  className,
  centered = true 
}: LoadingProps) {
  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <span className="text-muted-foreground">{text}</span>}
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        {content}
      </div>
    );
  }

  return content;
}

// Variações específicas para casos comuns
export function LoadingPage({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loading size="lg" text={text} />
    </div>
  );
}

export function LoadingButton({ text = 'Carregando...' }: { text?: string }) {
  return <Loading size="sm" text={text} centered={false} />;
}

export function LoadingCard({ text = 'Carregando...' }: { text?: string }) {
  return <Loading size="md" text={text} />;
}
