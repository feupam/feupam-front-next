'use client';

import { useUserProfile } from '@/hooks/useUserProfile';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingCard } from '@/components/shared/Loading';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ProfilePage() {
  const { profile, loading, error } = useUserProfile();
  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const eventId = searchParams.get('eventId');
  const eventName = searchParams.get('eventName');
  const isOpenParam = searchParams.get('isOpen');
  const isOpen = isOpenParam === 'true';

  return (
    <ProtectedRoute>
      {loading ? (
        <LoadingCard text="Carregando perfil..." />
      ) : error ? (
        <div className="flex min-h-screen items-center justify-center">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-red-600">Erro ao carregar perfil</h2>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <Button onClick={() => router.refresh()} className="mt-4">
              Tentar novamente
            </Button>
          </Card>
        </div>
      ) : (
        <div className="container mx-auto py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <ProfileForm 
              initialData={profile} 
              redirectToEvent={eventName || eventId || undefined}
              isOpen={isOpen}
            />
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
} 