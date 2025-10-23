'use client';

import { useAuth, LogoutButton } from '@/src/features/auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function UserMenu() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita problemas de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!user) return null;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer h-8 w-8 sm:h-9 sm:w-9">
          <AvatarImage src={user.photoURL || undefined} />
          <AvatarFallback className="text-xs sm:text-sm">
            {user.displayName?.charAt(0) || user.email?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mr-2">
        <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
          <span className="font-medium text-sm truncate w-full">{user.displayName}</span>
          <span className="text-xs text-muted-foreground truncate w-full">{user.email}</span>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/perfil" className="cursor-pointer w-full">
            Meu Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {mounted && (
          <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
            <div className="flex items-center gap-2">
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4" />
                  <span>Modo Escuro</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" />
                  <span>Modo Claro</span>
                </>
              )}
            </div>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-0">
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 