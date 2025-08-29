import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import RootClientLayout from '@/components/RootClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EventFlow - Secure your spot at exciting events',
  description: 'Find and purchase tickets for the best events with our seamless experience, including waiting rooms and virtual queues for high-demand shows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.className)}>
        <Providers>
          <RootClientLayout>
            {children}
          </RootClientLayout>
        </Providers>
      </body>
    </html>
  );
}