'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';

export function LogoutButton() {
  const { logout } = useAuth();
  const { setLoading } = useLoading();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sair
    </Button>
  );
} 