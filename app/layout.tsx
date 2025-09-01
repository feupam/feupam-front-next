import './globals.css';
import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import RootClientLayout from '@/components/RootClientLayout';

export const metadata: Metadata = {
  title: 'Feupam - Secure your spot at exciting events',
  description: 'Find and purchase tickets for the best events with our seamless experience, including waiting rooms and virtual queues for high-demand shows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        <Providers>
          <RootClientLayout>
            {children}
          </RootClientLayout>
        </Providers>
      </body>
    </html>
  );
}