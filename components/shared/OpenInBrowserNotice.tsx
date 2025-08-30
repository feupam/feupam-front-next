import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Smartphone } from "lucide-react";

const isWebView = (): boolean => {
  // Verificação adicional para SSR
  if (typeof window === 'undefined') return false;
  
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  const webViewRegex = /(Instagram|FBAN|FBAV|FB_IAB|Line|Twitter|TikTok|WebView|wv)/i;
  return webViewRegex.test(ua);
};

const OpenInBrowserNotice: React.FC = () => {
  const [inWebView, setInWebView] = useState(false);
  const [autoTried, setAutoTried] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (isWebView()) {
      setInWebView(true);

      // Tentativa automática após 500ms
      const timer = setTimeout(() => {
        handleOpenInBrowser();
        setAutoTried(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleOpenInBrowser = () => {
    if (typeof window === 'undefined') return;
    
    const currentUrl = window.location.href;

    if (/Android/i.test(navigator.userAgent)) {
      // Android: tentar abrir no Chrome
      window.location.href =
        "intent://" +
        window.location.host +
        window.location.pathname +
        window.location.search +
        "#Intent;scheme=https;package=com.android.chrome;end";
    } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // iOS: abrir em nova aba
      window.open(currentUrl, "_blank");
    } else {
      // Outros sistemas: abrir em nova aba
      window.open(currentUrl, "_blank");
    }
  };

  // Não renderizar no lado do servidor ou se não estiver em webview
  if (!mounted || !inWebView) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center text-center p-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Melhor experiência no navegador</h2>
          <p className="text-muted-foreground">
            Para garantir que todos os recursos funcionem corretamente, 
            recomendamos abrir esta página no seu navegador principal.
          </p>
        </div>

        {autoTried && (
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Se a página não abriu automaticamente, toque no botão abaixo para tentar novamente.
            </p>
          </div>
        )}

        <Button
          onClick={handleOpenInBrowser}
          className="w-full"
          size="lg"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Abrir no navegador
        </Button>

        <p className="text-xs text-muted-foreground">
          Detectamos que você está usando um navegador integrado. 
          Para a melhor experiência, use Chrome, Safari ou outro navegador principal.
        </p>
      </div>
    </div>
  );
};

export default OpenInBrowserNotice;
