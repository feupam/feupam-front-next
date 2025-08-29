'use client';

import { useAuth } from '@/hooks/useAuth';
import { LogoutButton } from './LogoutButton';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import Link from 'next/link';

export function UserMenu() {
  const { user } = useAuth();

  if (!user) return null;

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
        <DropdownMenuItem className="p-0">
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 