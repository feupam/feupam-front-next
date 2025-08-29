'use client';

import { ErrorBoundary } from '@/components/error-boundary';
import { OfflineNotice } from '@/components/ui/offline-notice';
import { Toaster } from '@/components/ui/toaster';
import { Suspense } from 'react';
import Header from '@/components/layout/header';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Carregando...</div>}>
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
          <Header />
          <OfflineNotice />
          <main className="flex-1 w-full overflow-x-hidden">
            {children}
          </main>
        </div>
        <Toaster />
      </Suspense>
    </ErrorBoundary>
  );
} 