"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const THEME_KEY = "contraton-theme";
type Theme = "light" | "dark" | "blue";

export function ThemeSwitcher() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored && (stored === "light" || stored === "dark" || stored === "blue")) {
      setTheme(stored);
    }
  }, [pathname]);

  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem(THEME_KEY) as Theme | null;
      if (stored && (stored === "light" || stored === "dark" || stored === "blue")) {
        setTheme(stored);
      }
    };
    window.addEventListener("storage", handler);
    window.addEventListener("contraton-theme-change", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("contraton-theme-change", handler);
    };
  }, []);

  const apply = (t: Theme) => {
    localStorage.setItem(THEME_KEY, t);
    setTheme(t);
    window.dispatchEvent(new Event("contraton-theme-change"));
  };

  const colors = {
    light: { border: "#e5e7eb", bg: "#fff", text: "#374151", activeBg: "#eff6ff", activeText: "#1d4ed8" },
    dark: { border: "#334155", bg: "#0f172a", text: "#e2e8f0", activeBg: "#1e3a8a", activeText: "#93c5fd" },
    blue: { border: "#93c5fd", bg: "#dbeafe", text: "#1e3a8a", activeBg: "#1d4ed8", activeText: "#fff" },
  };
  const c = colors[theme];

  return (
    <div
      data-theme-switcher
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        zIndex: 2147483647,
        padding: 16,
        borderRadius: 12,
        border: `3px solid #2563eb`,
        backgroundColor: "#ffffff",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 12 }}>
        Modo da tela
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => apply("light")}
          style={{
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 8,
            border: `2px solid ${c.border}`,
            background: theme === "light" ? c.activeBg : "transparent",
            color: theme === "light" ? c.activeText : c.text,
            cursor: "pointer",
          }}
        >
          Normal
        </button>
        <button
          type="button"
          onClick={() => apply("dark")}
          style={{
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 8,
            border: `2px solid ${c.border}`,
            background: theme === "dark" ? c.activeBg : "transparent",
            color: theme === "dark" ? c.activeText : c.text,
            cursor: "pointer",
          }}
        >
          Escuro
        </button>
        <button
          type="button"
          onClick={() => apply("blue")}
          style={{
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 8,
            border: `2px solid ${c.border}`,
            background: theme === "blue" ? c.activeBg : "transparent",
            color: theme === "blue" ? c.activeText : c.text,
            cursor: "pointer",
          }}
        >
          Azul
        </button>
      </div>
    </div>
  );
}
