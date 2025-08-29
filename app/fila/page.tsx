"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEvents } from '@/hooks/useEvents';
import { QueuePage }  from '@/components/queue/QueuePage';
import { QueueProvider } from '@/components/queue/QueueContext';

export default function QueuePageTest() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventUuid = searchParams.get('event');
  const { events, loading, getEventByUuid } = useEvents();

  useEffect(() => {
    if (!eventUuid) {
      router.push('/eventos');
      return;
    }

  }, [eventUuid, router, loading, getEventByUuid]);

  if (loading || !eventUuid) return null;

  const event = getEventByUuid(eventUuid);
  if (!event) return null;

  return  <QueueProvider>
    <QueuePage />
  </QueueProvider>;
}