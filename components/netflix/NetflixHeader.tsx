"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export function NetflixHeader() {
  const { user, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleCartClick = async () => {
    console.log('[NetflixHeader] Clique no carrinho');
    
    if (user) {
      // Usuário já está logado, vai direto para o perfil
      console.log('[NetflixHeader] Usuário logado, indo para /perfil');
      router.push('/perfil');
    } else {
      // Usuário não está logado, força login primeiro
      console.log('[NetflixHeader] Usuário não logado, forçando login...');
      const loginSuccess = await signInWithGoogle();
      
      if (loginSuccess) {
        console.log('[NetflixHeader] Login bem-sucedido, redirecionando para /perfil');
        router.push('/perfil');
      } else {
        console.log('[NetflixHeader] Login cancelado ou falhou');
      }
    }
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-black/90 backdrop-blur-sm border-b border-emerald-500/20">
      <div className="container flex h-12 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-emerald-400">feupam</h1>
        </div>

        {/* Carrinho de compras - mais à direita */}
        <div className="flex items-center pr-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 text-emerald-200 hover:text-emerald-400 hover:bg-emerald-500/20"
            onClick={handleCartClick}
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="sr-only">Carrinho de compras</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
