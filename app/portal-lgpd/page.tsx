"use client"

import { Shield, Cookie, HelpCircle, Mail } from "lucide-react"
import Link from "next/link"

export default function PortalLGPDPage() {
  return (
    <div className="relative min-h-screen bg-black">
      {/* Background fixo */}
      <div className="fixed inset-0 z-0 bg-black" />
      
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <Shield className="w-12 h-12 text-sky-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Portal LGPD
            </h1>
          </div>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Transparência e segurança no tratamento dos seus dados pessoais
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Política de Privacidade */}
          <div className="group bg-gradient-to-br from-zinc-900/80 via-zinc-800/60 to-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-sky-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-400/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-400/20">
                <Shield className="w-6 h-6 text-sky-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-white mb-3">
                  Política de Privacidade
                </h2>
                <p className="text-white/70 leading-relaxed">
                  Essa política explica os processos de dados pessoais da{" "}
                  <span className="text-sky-400 font-medium">Igreja Presbiteriana Central de Passos</span>, 
                  compreendendo a forma como eles são coletados, utilizados e para quais fins.
                </p>
              </div>
            </div>
            <Link 
              href="/portal-lgpd/politica"
              className="inline-flex items-center gap-2 mt-4 text-sky-400 hover:text-sky-300 transition-colors group-hover:gap-3 duration-200"
            >
              <span className="font-medium">Conheça a Política de Privacidade</span>
              <span className="text-xl">→</span>
            </Link>
          </div>

          {/* Política de Cookies */}
          <div className="group bg-gradient-to-br from-zinc-900/80 via-zinc-800/60 to-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-sky-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-400/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-400/20">
                <Cookie className="w-6 h-6 text-sky-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-white mb-3">
                  Política de Cookies
                </h2>
                <p className="text-white/70 leading-relaxed mb-4">
                  Os cookies são informações geradas quando você acessa um site. Estas informações são 
                  armazenadas em seu navegador, possibilitando a transmissão ao operador do site de 
                  informações como por exemplo o idioma escolhido.
                </p>
                <div className="mb-4">
                  <p className="text-white/60 text-sm mb-2">
                    Cookies utilizados pela Igreja Presbiteriana Central de Passos:
                  </p>
                  <ul className="space-y-1">
                    {["Google Analytics", "Youtube", "Facebook", "Google AdSense", "DoubleClick"].map((cookie) => (
                      <li key={cookie} className="flex items-center gap-2 text-white/50 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-400/60"></div>
                        {cookie}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <Link 
              href="/portal-lgpd/politica#cookies"
              className="inline-flex items-center gap-2 mt-4 text-sky-400 hover:text-sky-300 transition-colors group-hover:gap-3 duration-200"
            >
              <span className="font-medium">Conheça a Política de Cookies</span>
              <span className="text-xl">→</span>
            </Link>
          </div>
        </div>

       

 

        {/* Footer Info */}
        <div className="text-center mt-16 pt-8 border-t border-white/5">
          <p className="text-white/40 text-sm">
            Igreja Presbiteriana Central de Passos - Comprometida com a proteção dos seus dados
          </p>
        </div>
      </main>
    </div>
  )
}
