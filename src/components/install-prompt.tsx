"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    // Verifica se o usuário já dispensou o prompt (usando localStorage)
    const dismissedKey = "install-prompt-dismissed";
    const dismissedTime = localStorage.getItem(dismissedKey);
    const wasDismissed = dismissedTime && Date.now() - parseInt(dismissedTime) < 7 * 24 * 60 * 60 * 1000; // 7 dias
    
    if (wasDismissed) {
      setDismissed(true);
    }

    // Detecta iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listener para evento de instalação (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Sempre mostra se tiver o evento, mesmo que tenha sido dispensado antes
      setShowPrompt(true);
      setDismissed(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Mostra prompt após 2 segundos se não for iOS e não foi dispensado recentemente
    if (!iOS && !wasDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (iOS && !wasDismissed) {
      // Para iOS, sempre mostra instruções se não foi dispensado
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    } else {
      // Fallback: instruções manuais para Android
      if (!isIOS) {
        alert("Para instalar:\n1. Toque no menu (3 pontos)\n2. Selecione 'Adicionar à tela inicial'\n3. Toque em 'Adicionar'");
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("install-prompt-dismissed", Date.now().toString());
  };

  if (isStandalone || (!showPrompt && dismissed)) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 shadow-lg border-2 border-primary/20 animate-in slide-in-from-bottom-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Instalar App</CardTitle>
              <CardDescription className="text-sm">
                {isIOS ? "Adicione à tela inicial" : "Baixe o aplicativo"}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isIOS ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Para instalar no iPhone/iPad:
            </p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Toque no botão <strong>Compartilhar</strong> <span className="text-lg">⎋</span></li>
              <li>Role e toque em <strong>&quot;Adicionar à Tela de Início&quot;</strong></li>
              <li>Toque em <strong>&quot;Adicionar&quot;</strong></li>
            </ol>
            <div className="flex items-center gap-2 pt-2">
              <Smartphone className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                O app aparecerá na sua tela inicial
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Instale o Contraton no seu dispositivo para acesso rápido e uso offline.
            </p>
            {deferredPrompt ? (
              <Button onClick={handleInstallClick} className="w-full" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Instalar Agora
              </Button>
            ) : (
              <div className="space-y-2">
                <Button onClick={handleInstallClick} className="w-full" size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Instalar Manualmente
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Toque no menu (⋮) → "Adicionar à tela inicial"
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center">
              Funciona em Android e Desktop
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
