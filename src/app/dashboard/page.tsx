"use client";

import { useState, useEffect, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, FileText, Clock, CheckCircle2, ChevronRight } from "lucide-react";

const THEME_KEY = "contraton-theme";

type Stats = {
  totalAlunos: number;
  contratosAssinados: number;
  contratosAtivos: number;
  contratosPendentes: number;
};

const cardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  backgroundColor: "#fff",
  padding: "18px",
  boxShadow: "0 6px 24px rgba(15,23,42,0.06)",
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
    contratosAssinados: 0,
    contratosAtivos: 0,
    contratosPendentes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/resumo")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.totalAlunos === "number") {
          setStats({
            totalAlunos: data.totalAlunos,
            contratosAssinados: data.contratosAssinados ?? 0,
            contratosAtivos: data.contratosAtivos ?? 0,
            contratosPendentes: data.contratosPendentes ?? 0,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "8px 4px 20px" }}>
      <h1
        style={{
          fontSize: "30px",
          fontWeight: 700,
          marginBottom: "24px",
          color: "#0f172a",
          letterSpacing: "-0.02em",
        }}
      >
        Dashboard
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "32px",
          padding: "20px 0 28px",
        }}
      >
        <div style={{ maxWidth: "300px", width: "100%" }}>
          <Image
            src="/dashboard-logo.png"
            alt="Logo Natália Personal"
            width={300}
            height={200}
            style={{ width: "100%", height: "auto", objectFit: "contain" }}
            priority
            unoptimized
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <StatCard
            label="Total de Alunos"
            value={loading ? "..." : stats.totalAlunos}
            icon={<Users style={{ width: 20, height: 20, color: "#4f46e5" }} />}
            iconBg="#eef2ff"
          />
          <StatCard
            label="Contratos Assinados"
            value={loading ? "..." : stats.contratosAssinados}
            icon={<CheckCircle2 style={{ width: 20, height: 20, color: "#16a34a" }} />}
            iconBg="#ecfdf5"
          />
          <StatCard
            label="Contratos Ativos"
            value={loading ? "..." : stats.contratosAtivos}
            subtitle="Vigência em andamento"
            icon={<FileText style={{ width: 20, height: 20, color: "#0891b2" }} />}
            iconBg="#ecfeff"
          />
          <StatCard
            label="Pendentes"
            value={loading ? "..." : stats.contratosPendentes}
            icon={<Clock style={{ width: 20, height: 20, color: "#ea580c" }} />}
            iconBg="#fff7ed"
          />
        </div>

        <section
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #eef2ff 100%)",
            padding: "24px",
            boxShadow: "0 8px 28px rgba(79,70,229,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div style={{ flex: "1 1 280px" }}>
              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Contratos assinados
              </h2>
              <p style={{ margin: 0, fontSize: "14px", color: "#64748b", lineHeight: 1.5 }}>
                Visualize todos os contratos já assinados (digital ou arquivo enviado), com busca
                por aluno e acesso rápido ao PDF.
              </p>
              {!loading && (
                <p
                  style={{
                    margin: "12px 0 0",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#4338ca",
                  }}
                >
                  {stats.contratosAssinados} contrato(s) na lista
                </p>
              )}
            </div>
            <Link href="/dashboard/contratos-assinados" style={{ textDecoration: "none" }}>
              <button
                type="button"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 22px",
                  background: "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(79,70,229,0.35)",
                }}
              >
                Ver contratos assinados
                <ChevronRight size={18} />
              </button>
            </Link>
          </div>
        </section>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", paddingTop: "8px" }}>
          <Link href="/dashboard/contratos" style={{ textDecoration: "none" }}>
            <button
              type="button"
              style={{
                padding: "12px 22px",
                backgroundColor: "#fff",
                color: "#334155",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
              }}
            >
              Criar novo contrato
            </button>
          </Link>
          <Link href="/dashboard/contratos" style={{ textDecoration: "none" }}>
            <button
              type="button"
              style={{
                padding: "12px 22px",
                backgroundColor: "#fff",
                color: "#334155",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Gerenciar contratos
            </button>
          </Link>
        </div>
      </div>

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
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              backgroundColor: "#fff",
              boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
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
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: "#6b7280",
            fontSize: 18,
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(15,23,42,0.12)",
          }}
          aria-label="Abrir modo da tela"
        >
          ⋯
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  icon,
  iconBg,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconBg: string;
}) {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "6px", fontWeight: 500 }}>
            {label}
          </p>
          <p style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>{subtitle}</p>
          )}
        </div>
        <div style={{ padding: "10px", backgroundColor: iconBg, borderRadius: "12px" }}>{icon}</div>
      </div>
    </div>
  );
}
