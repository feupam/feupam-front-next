'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <Button
      onClick={logout}
      variant="ghost"
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sair
    </Button>
  );
} 