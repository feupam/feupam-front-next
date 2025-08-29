'use client';

import { usePathname } from 'next/navigation';
import { ClientLayout } from '@/components/client-layout';

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideLayout = pathname.startsWith('/countdown/');

  return hideLayout ? <>{children}</> : <ClientLayout>{children}</ClientLayout>;
} 