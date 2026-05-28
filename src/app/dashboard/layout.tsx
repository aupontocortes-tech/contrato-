"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { InstallPrompt } from "@/components/install-prompt";

const THEME_KEY = "contraton-theme";
type Theme = "light" | "dark" | "blue";

const themes: Record<
  Theme,
  {
    bg: string;
    sidebar: string;
    border: string;
    text: string;
    textMuted: string;
    linkActiveBg: string;
    linkActiveText: string;
    linkActiveBorder: string;
    overlay: string;
  }
> = {
  light: {
    bg: "#f8fafc",
    sidebar: "#ffffff",
    border: "#e2e8f0",
    text: "#1f2937",
    textMuted: "#64748b",
    linkActiveBg: "#e0e7ff",
    linkActiveText: "#3730a3",
    linkActiveBorder: "#6366f1",
    overlay: "rgba(0,0,0,0.5)",
  },
  dark: {
    bg: "#0f172a",
    sidebar: "#0f172a",
    border: "#334155",
    text: "#e2e8f0",
    textMuted: "#94a3b8",
    linkActiveBg: "#1e3a8a",
    linkActiveText: "#93c5fd",
    linkActiveBorder: "#3b82f6",
    overlay: "rgba(0,0,0,0.7)",
  },
  blue: {
    bg: "#eef4ff",
    sidebar: "#e5efff",
    border: "#bfd3ff",
    text: "#1e3a8a",
    textMuted: "#3654b5",
    linkActiveBg: "#2563eb",
    linkActiveText: "#ffffff",
    linkActiveBorder: "#1d4ed8",
    overlay: "rgba(0,0,0,0.5)",
  },
};

function linkStyle(active: boolean, t: (typeof themes)[Theme]) {
  return {
    display: "block",
    width: "100%",
    padding: "8px 12px",
    marginBottom: "2px",
    textAlign: "left" as const,
    fontSize: "14px",
    fontWeight: 600,
    color: active ? t.linkActiveText : t.text,
    backgroundColor: active ? t.linkActiveBg : "transparent",
    border: "none",
    borderLeft: active ? `3px solid ${t.linkActiveBorder}` : "3px solid transparent",
    cursor: "pointer",
    textDecoration: "none",
    borderRadius: "10px",
  };
}

export default function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const read = () => {
      const stored = localStorage.getItem(THEME_KEY) as Theme | null;
      if (stored && (stored === "light" || stored === "dark" || stored === "blue")) setTheme(stored);
    };
    read();
    window.addEventListener("contraton-theme-change", read);
    return () => window.removeEventListener("contraton-theme-change", read);
  }, []);

  const applyTheme = (t: Theme) => {
    setTheme(t);
    localStorage.setItem(THEME_KEY, t);
  };

  const t = themes[theme];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: t.bg }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 1024px) {
          .dash-mobile { display: none !important; }
          .dash-desktop { display: flex !important; }
          .dash-wrap { flex-direction: row !important; align-items: stretch !important; }
        }
        @media (max-width: 1023px) {
          .dash-desktop { display: none !important; }
        }
      ` }} />
      <div className="dash-wrap" style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        {/* Mobile Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "12px 16px",
            borderBottom: `1px solid ${t.border}`,
            backgroundColor: t.sidebar,
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
          className="dash-mobile"
        >
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              padding: "8px",
              border: `1px solid ${t.border}`,
              borderRadius: "6px",
              background: t.sidebar,
              color: t.text,
              cursor: "pointer",
            }}
            aria-label="Abrir menu"
          >
            <span style={{ fontSize: "18px" }}>☰</span>
          </button>
        </header>

        {menuOpen && (
          <div
            className="dash-mobile"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: t.overlay,
              zIndex: 40,
            }}
            onClick={() => setMenuOpen(false)}
          />
        )}
        <aside
          className="dash-mobile"
          style={{
            display: menuOpen ? "flex" : "none",
            flexDirection: "column",
            position: "fixed",
            top: 0,
            left: 0,
            width: "260px",
            height: "100%",
            backgroundColor: t.sidebar,
            borderRight: `1px solid ${t.border}`,
            zIndex: 50,
            padding: "16px",
            boxShadow: "8px 0 24px rgba(15,23,42,0.12)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexShrink: 0 }}>
            <strong style={{ fontSize: "12px", color: t.text, textTransform: "uppercase" }}>Menu</strong>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              style={{ padding: "4px", border: "none", background: "none", color: t.text, cursor: "pointer", fontSize: "18px" }}
            >
              ✕
            </button>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minHeight: 0 }}>
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={linkStyle(pathname === "/dashboard", t)}>
              Dashboard
            </Link>
            <Link href="/dashboard/alunos" onClick={() => setMenuOpen(false)} style={linkStyle(pathname === "/dashboard/alunos", t)}>
              Alunos
            </Link>
            <Link href="/dashboard/planos" onClick={() => setMenuOpen(false)} style={linkStyle(pathname === "/dashboard/planos", t)}>
              Planos
            </Link>
            <Link href="/dashboard/contratos" onClick={() => setMenuOpen(false)} style={linkStyle(pathname === "/dashboard/contratos", t)}>
              Contratos
            </Link>
            <Link
              href="/dashboard/contratos-assinados"
              onClick={() => setMenuOpen(false)}
              style={linkStyle(pathname === "/dashboard/contratos-assinados", t)}
            >
              Assinados
            </Link>
          </nav>
        </aside>

        {/* Desktop Sidebar */}
        <aside
          className="dash-desktop"
          style={{
            display: "none",
            width: "240px",
            minHeight: "100vh",
            borderRight: `1px solid ${t.border}`,
            backgroundColor: t.sidebar,
            flexDirection: "column",
            padding: "18px",
          }}
        >
          <div style={{ padding: "16px", borderBottom: `1px solid ${t.border}`, marginBottom: "8px", flexShrink: 0 }}>
            <h2 style={{ fontSize: "12px", fontWeight: 600, color: t.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Menu
            </h2>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minHeight: 0 }}>
            <Link href="/dashboard" style={linkStyle(pathname === "/dashboard", t)}>
              Dashboard
            </Link>
            <Link href="/dashboard/alunos" style={linkStyle(pathname === "/dashboard/alunos", t)}>
              Alunos
            </Link>
            <Link href="/dashboard/planos" style={linkStyle(pathname === "/dashboard/planos", t)}>
              Planos
            </Link>
            <Link href="/dashboard/contratos" style={linkStyle(pathname === "/dashboard/contratos", t)}>
              Contratos
            </Link>
            <Link
              href="/dashboard/contratos-assinados"
              style={linkStyle(pathname === "/dashboard/contratos-assinados", t)}
            >
              Assinados
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <main
          style={{
            flex: 1,
            padding: "28px",
            overflow: "auto",
            backgroundColor: t.bg,
            minHeight: "100vh",
            color: t.text,
          }}
        >
          <div style={{ maxWidth: "1152px", margin: "0 auto" }}>{children}</div>
        </main>
      </div>
      <InstallPrompt />
    </div>
  );
}
