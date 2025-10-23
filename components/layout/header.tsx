"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Menu, X, Ticket, Sun, Moon, Home, Shield, CreditCard, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuth } from '@/src/features/auth';
import { UserMenu } from '@/components/UserMenu';
import { useCurrentEventContext } from '@/contexts/CurrentEventContext';
import { useTheme } from 'next-themes';
import { isAdmin } from '@/lib/admin';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { currentEvent } = useCurrentEventContext();

  // Função para verificar se o usuário é admin
  const userIsAdmin = isAdmin(user);

  // Evita problemas de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    ...(userIsAdmin ? [{ name: 'Admin', href: '/admin', icon: Shield }] : []),
    { name: 'Home', href: '/home', icon: Home },
    { name: currentEvent?.name || 'Evento', href: currentEvent ? `/event/${encodeURIComponent(currentEvent.name)}` : '/home', icon: Ticket },
    { name: 'Perfil', href: '/perfil' },
  ];
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const clearCache = () => {
    // Limpar localStorage e sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Tentar limpar service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
    }

    // Recarregar a página
    window.location.href = '/home';
  };
  
  return (
    <header className="bg-background/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 border-b border-border">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2 min-w-0">
            <Ticket className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <span className="font-bold text-base sm:text-lg text-foreground truncate">Feupam</span>
          </Link>
        </div>
        
        {/* Carrinho sempre visível no mobile */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            href="/meus-ingressos"
            className="p-2 rounded-md bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex-shrink-0 shadow-md hover:shadow-lg"
            aria-label="Minhas Inscrições"
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          </button>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-6 xl:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 whitespace-nowrap",
                pathname === item.href ? "text-primary" : "text-foreground/80"
              )}
            >
              {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
          {/* Meus Ingressos sempre visível no desktop também */}
          <Link
            href="/meus-ingressos"
            className={cn(
              "text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-md shadow-md hover:shadow-lg",
              pathname === '/meus-ingressos' 
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white" 
                : "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600"
            )}
          >
            <ShoppingCart className="h-4 w-4 flex-shrink-0" />
            <span className="truncate font-semibold">Meus Ingressos</span>
          </Link>
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-3 xl:gap-4 min-w-0">
          {mounted && (
            <>
              <button
                onClick={clearCache}
                className="p-2 rounded-md text-foreground/80 hover:text-red-500 hover:bg-muted transition-colors flex-shrink-0"
                aria-label="Limpar cache"
                title="Limpar cache"
              >
                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-foreground/80 hover:text-primary hover:bg-muted transition-colors flex-shrink-0"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </>
          )}
          
          <div className="min-w-0 flex-shrink-0">
            {user ? (
              <UserMenu />
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-foreground/80 hover:text-primary whitespace-nowrap"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Slide-out menu */}
          <div className="fixed top-0 right-0 h-full w-64 bg-card border-l border-border shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border bg-card flex-shrink-0">
              <span className="font-semibold text-card-foreground">Menu</span>
              <button
                type="button"
                className="p-2 rounded-md text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            
            <div className="flex-1 p-4 bg-card flex flex-col justify-between">
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md text-base font-medium transition-colors hover:bg-muted",
                      pathname === item.href 
                        ? "text-primary bg-primary/10" 
                        : "text-card-foreground hover:text-card-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
                    <span>{item.name}</span>
                  </Link>
                ))}
                {/* Meus Ingressos também no menu mobile para navegação alternativa */}
                <Link
                  href="/meus-ingressos"
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-md text-base font-medium transition-all duration-200 shadow-md hover:shadow-lg",
                    pathname === '/meus-ingressos' 
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white" 
                      : "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingCart className="h-5 w-5 flex-shrink-0" />
                  <span className="font-semibold">Minhas Inscrições</span>
                </Link>
              </div>
              
              <div className="space-y-2 pt-4 border-t border-border">
                {mounted && (
                  <>
                    <button
                      onClick={() => {
                        clearCache();
                      }}
                      className="flex items-center gap-3 p-3 rounded-md text-base font-medium text-red-500 hover:bg-muted transition-colors w-full text-left"
                    >
                      <Trash2 className="h-5 w-5 flex-shrink-0" />
                      <span>Limpar Cache</span>
                    </button>
                    <button
                      onClick={() => {
                        toggleTheme();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 p-3 rounded-md text-base font-medium text-card-foreground hover:bg-muted transition-colors w-full text-left"
                    >
                      {theme === 'light' ? (
                        <>
                          <Moon className="h-5 w-5 flex-shrink-0" />
                          <span>Modo Escuro</span>
                        </>
                      ) : (
                        <>
                          <Sun className="h-5 w-5 flex-shrink-0" />
                          <span>Modo Claro</span>
                        </>
                      )}
                    </button>
                  </>
                )}
                
                {user ? (
                  <div className="p-3 rounded-md bg-muted/50">
                    <div className="text-sm font-medium text-card-foreground mb-1 truncate">{user.displayName}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-3 p-3 rounded-md text-base font-medium text-card-foreground hover:bg-muted transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Entrar</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}