"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, FileText, Clock } from "lucide-react";

const THEME_KEY = "contraton-theme";

type Stats = {
  totalAlunos: number;
  contratosAtivos: number;
  contratosPendentes: number;
};

export default function DashboardPage() {
  const [modoMenuOpen, setModoMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "blue">("light");

  useEffect(() => {
    const read = () => {
      const s = localStorage.getItem(THEME_KEY);
      if (s === "light" || s === "blue") setTheme(s);
      else if (s === "dark") setTheme("light");
    };
    read();
    window.addEventListener("contraton-theme-change", read);
    return () => window.removeEventListener("contraton-theme-change", read);
  }, []);

  const applyModo = (t: "light" | "blue") => {
    localStorage.setItem(THEME_KEY, t);
    window.dispatchEvent(new Event("contraton-theme-change"));
    setModoMenuOpen(false);
  };

  const [stats, setStats] = useState<Stats>({
    totalAlunos: 0,
    contratosAtivos: 0,
    contratosPendentes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/alunos").then((r) => r.json()).catch(() => []),
      fetch("/api/contratos").then((r) => r.json()).catch(() => []),
    ])
      .then(([alunos, contratos]) => {
        const alunosArray = Array.isArray(alunos) ? alunos : [];
        const contratosArray = Array.isArray(contratos) ? contratos : [];
        
        setStats({
          totalAlunos: alunosArray.length,
          contratosAtivos: contratosArray.filter((c: any) => c.status === "assinado").length,
          contratosPendentes: contratosArray.filter((c: any) => c.status !== "assinado").length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "24px", color: "#111827" }}>Dashboard</h1>
      
      {/* Seção de boas-vindas com logo e mensagem */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        marginBottom: "32px",
        padding: "24px 0"
      }}>
        <div style={{ 
          maxWidth: "300px",
          width: "100%"
        }}>
          <Image
            src="/dashboard-logo.png"
            alt="Logo Natália Personal"
            width={300}
            height={200}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "contain"
            }}
            priority
            unoptimized
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Cards informativos */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#fff", padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>Total de Alunos</p>
                <p style={{ fontSize: "24px", fontWeight: 700, color: "#111827" }}>
                  {loading ? "..." : stats.totalAlunos}
                </p>
              </div>
              <div style={{ padding: "8px", backgroundColor: "#eff6ff", borderRadius: "8px" }}>
                <Users style={{ width: "20px", height: "20px", color: "#2563eb" }} />
              </div>
            </div>
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#fff", padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>Contratos Ativos</p>
                <p style={{ fontSize: "24px", fontWeight: 700, color: "#111827" }}>
                  {loading ? "..." : stats.contratosAtivos}
                </p>
              </div>
              <div style={{ padding: "8px", backgroundColor: "#f0fdf4", borderRadius: "8px" }}>
                <FileText style={{ width: "20px", height: "20px", color: "#16a34a" }} />
              </div>
            </div>
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#fff", padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>Pendentes</p>
                <p style={{ fontSize: "24px", fontWeight: 700, color: "#111827" }}>
                  {loading ? "..." : stats.contratosPendentes}
                </p>
              </div>
              <div style={{ padding: "8px", backgroundColor: "#fffbeb", borderRadius: "8px" }}>
                <Clock style={{ width: "20px", height: "20px", color: "#ea580c" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Ação principal única */}
        <div style={{ paddingTop: "16px" }}>
          <Link href="/dashboard/contratos" style={{ textDecoration: "none" }}>
            <button
              style={{
                padding: "12px 24px",
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: 500,
                cursor: "pointer",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
            >
              Criar novo contrato
            </button>
          </Link>
        </div>
      </div>

      {/* Três pontinhos no canto inferior esquerdo — abre menu Normal / Azul (só nesta página) */}
      <div style={{ position: "fixed", bottom: 24, left: 24, zIndex: 50 }}>
        {modoMenuOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "100%",
              left: 0,
              marginBottom: 8,
              padding: "8px 0",
              minWidth: 120,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              backgroundColor: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <button
              type="button"
              onClick={() => applyModo("light")}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 16px",
                textAlign: "left",
                fontSize: 14,
                border: "none",
                background: theme === "light" ? "#eff6ff" : "transparent",
                color: theme === "light" ? "#1d4ed8" : "#374151",
                cursor: "pointer",
              }}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => applyModo("blue")}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 16px",
                textAlign: "left",
                fontSize: 14,
                border: "none",
                background: theme === "blue" ? "#1d4ed8" : "transparent",
                color: theme === "blue" ? "#fff" : "#374151",
                cursor: "pointer",
              }}
            >
              Azul
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setModoMenuOpen(!modoMenuOpen)}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "1px solid #e5e7eb",
            background: "#fff",
            color: "#6b7280",
            fontSize: 18,
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
          aria-label="Abrir modo da tela"
        >
          ⋯
        </button>
      </div>
    </div>
  );
}
