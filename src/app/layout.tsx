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
        {/* Modo da tela — sempre visível no canto inferior esquerdo */}
        <div
          id="modo-da-tela"
          style={{
            position: "fixed",
            bottom: 20,
            left: 20,
            zIndex: 2147483647,
            padding: 16,
            borderRadius: 12,
            border: "3px solid #2563eb",
            backgroundColor: "#fff",
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 12 }}>Modo da tela</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" id="tema-normal" style={{ padding: "10px 16px", fontSize: 14, fontWeight: 500, borderRadius: 8, border: "2px solid #e5e7eb", background: "#eff6ff", color: "#1d4ed8", cursor: "pointer" }}>Normal</button>
            <button type="button" id="tema-escuro" style={{ padding: "10px 16px", fontSize: 14, fontWeight: 500, borderRadius: 8, border: "2px solid #334155", background: "transparent", color: "#374151", cursor: "pointer" }}>Escuro</button>
            <button type="button" id="tema-azul" style={{ padding: "10px 16px", fontSize: 14, fontWeight: 500, borderRadius: 8, border: "2px solid #93c5fd", background: "transparent", color: "#374151", cursor: "pointer" }}>Azul</button>
          </div>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var key = 'contraton-theme';
                var normal = document.getElementById('tema-normal');
                var escuro = document.getElementById('tema-escuro');
                var azul = document.getElementById('tema-azul');
                function apply(t) {
                  try { localStorage.setItem(key, t); } catch (e) {}
                  window.dispatchEvent(new Event('contraton-theme-change'));
                  if (normal && escuro && azul) {
                    normal.style.background = t === 'light' ? '#eff6ff' : 'transparent';
                    normal.style.color = t === 'light' ? '#1d4ed8' : '#374151';
                    escuro.style.background = t === 'dark' ? '#1e3a8a' : 'transparent';
                    escuro.style.color = t === 'dark' ? '#93c5fd' : '#374151';
                    azul.style.background = t === 'blue' ? '#1d4ed8' : 'transparent';
                    azul.style.color = t === 'blue' ? '#fff' : '#374151';
                  }
                }
                if (normal) normal.onclick = function() { apply('light'); };
                if (escuro) escuro.onclick = function() { apply('dark'); };
                if (azul) azul.onclick = function() { apply('blue'); };
                try {
                  var s = localStorage.getItem(key);
                  if (s === 'dark' || s === 'blue' || s === 'light') apply(s);
                } catch (e) {}
              })();
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
