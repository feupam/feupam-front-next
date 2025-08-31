"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NetflixHeader() {
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
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="sr-only">Carrinho de compras</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
