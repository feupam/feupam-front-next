"use client";

import { useLoading } from '@/contexts/LoadingContext';
import { LoadingModal } from '@/components/shared/LoadingModal';

export function LoadingModalWrapper() {
  const { loading } = useLoading();
  return <LoadingModal show={loading} />;
}
