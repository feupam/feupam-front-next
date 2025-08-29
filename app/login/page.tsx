'use client';

import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentEventContext } from '@/contexts/CurrentEventContext';

export default function LoginPage() {
  const { currentEvent, isCurrentEventOpen } = useCurrentEventContext();
  
  console.log('[Login] currentEvent:', currentEvent?.name || 'Nenhum evento');
  console.log('[Login] isCurrentEventOpen:', isCurrentEventOpen);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Entrar</CardTitle>
          <CardDescription className="text-center">
            Faça login com sua conta Google para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <GoogleLoginButton />
        </CardContent>
      </Card>
    </div>
  );
} 