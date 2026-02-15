import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Contraton - Gestão de Contratos",
  description: "Sistema de gestão de contratos para personal trainers",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Contraton",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Contraton" />
        {/* Estilos críticos: garantem interface visível mesmo se o CSS principal atrasar ou falhar */}
        <style dangerouslySetInnerHTML={{ __html: `
          body { background-color: #ffffff !important; color: #171717 !important; min-height: 100vh; font-family: system-ui, -apple-system, sans-serif; }
          button { border-radius: 6px; font-weight: 500; cursor: pointer; padding: 8px 16px; min-height: 36px; }
          [data-slot="select-trigger"] { border: 1px solid #d1d5db !important; background: #fff !important; padding: 8px 12px !important; border-radius: 6px !important; min-height: 36px !important; display: flex !important; align-items: center !important; justify-content: space-between !important; width: 100%; min-width: 8rem; }
          [data-slot="button"] { padding: 8px 16px !important; min-height: 36px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; }
          [data-slot="card"] { background: #fff !important; border: 1px solid #e5e7eb !important; border-radius: 8px !important; padding: 24px !important; box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important; }
          [data-slot="select-content"] { background: #fff !important; border: 1px solid #e5e7eb !important; border-radius: 6px !important; padding: 4px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; z-index: 9999 !important; }
        ` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-full`}
        style={{ backgroundColor: '#fff', color: '#171717' }}
      >
        {children}
        <Toaster richColors position="top-center" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      // Verifica se há atualização disponível
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              // Nova versão disponível, força reload
                              window.location.reload();
                            }
                          });
                        }
                      });
                      
                      // Verifica atualizações periodicamente
                      setInterval(() => {
                        registration.update();
                      }, 60000); // Verifica a cada minuto
                    })
                    .catch(() => {});
                  
                  // Força atualização quando a página ganha foco
                  window.addEventListener('focus', () => {
                    navigator.serviceWorker.getRegistration().then((registration) => {
                      if (registration) {
                        registration.update();
                      }
                    });
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
