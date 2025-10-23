'use client';

import { useUserProfile } from '@/hooks/useUserProfile';
import { UserProfileCard } from '@/components/profile/UserProfileCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingCard } from '@/components/shared/Loading';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/src/features/auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ProfilePage() {
  const { profile, loading: profileLoading, error: profileError } = useUserProfile();
  const router = useRouter();

  const handleEditProfile = () => {
    router.push('/formulario');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <ProtectedRoute>
      {profileLoading ? (
        <LoadingCard text="Carregando dados do perfil..." />
      ) : profileError ? (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold text-red-600">Erro ao carregar dados</h2>
            <p className="mt-2 text-muted-foreground">
              {profileError}
            </p>
            <Button onClick={() => {
              router.refresh();
            }} className="mt-4 w-full">
              Tentar novamente
            </Button>
          </Card>
        </div>
      ) : (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto py-4 px-4 max-w-4xl">
            <div className="space-y-6">
              {/* Cartão do Perfil do Usuário */}
              {profile && (
                <UserProfileCard 
                  profile={profile} 
                  onEditProfile={handleEditProfile}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
} 