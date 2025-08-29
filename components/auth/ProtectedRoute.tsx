'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Preserva os parâmetros da URL atual no redirecionamento
        const currentUrl = window.location.pathname + window.location.search;
        const loginUrl = `/login?redirect=${encodeURIComponent(currentUrl)}`;
        router.push(loginUrl);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Aguarda a verificação inicial de autenticação
  if (auth.currentUser === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
} 