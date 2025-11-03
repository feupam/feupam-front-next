import './globals.css';
import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import RootClientLayout from '@/components/RootClientLayout';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { LoadingModalWrapper } from '@/components/shared/LoadingModalWrapper';
import { WhatsAppFloatButton } from '@/components/shared/whatsapp-float-button';
import { WHATSAPP_CONFIG } from '@/lib/whatsapp-config';
import { CacheBuster } from '@/components/CacheBuster';
import { Manrope } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Feupam',
  description: 'Federação unida da mocidade de MG.',
  other: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
};

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
  style: ['normal'],
  preload: true,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
  <body className={cn(manrope.variable, 'min-h-screen bg-background font-sans antialiased scroll-smooth')}>
        <CacheBuster />
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