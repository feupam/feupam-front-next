import './globals.css';
import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import RootClientLayout from '@/components/RootClientLayout';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { LoadingModalWrapper } from '@/components/shared/LoadingModalWrapper';
import { WhatsAppFloatButton } from '@/components/shared/whatsapp-float-button';
import { WHATSAPP_CONFIG } from '@/lib/whatsapp-config';

export const metadata: Metadata = {
  title: 'Feupam',
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
        <LoadingProvider>
          <Providers>
            <LoadingModalWrapper />
            <RootClientLayout>
              {children}
            </RootClientLayout>
            {/* Botão Flutuante do WhatsApp */}
            <WhatsAppFloatButton 
              phoneNumber={WHATSAPP_CONFIG.phoneNumber}
              message={WHATSAPP_CONFIG.defaultMessage}
              enabled={WHATSAPP_CONFIG.enabled}
            />
          </Providers>
        </LoadingProvider>
      </body>
    </html>
  );
}