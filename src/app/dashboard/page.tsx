"use client";

import { useState, useEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, FileText, Clock, CheckCircle2, ChevronRight, X } from "lucide-react";
import {
  isContratoAtivo,
  isContratoPendente,
} from "@/lib/contrato-status";
import { labelPlano } from "@/lib/planos";

const THEME_KEY = "contraton-theme";

type Stats = {
  totalAlunos: number;
  contratosAssinados: number;
  contratosAtivos: number;
  contratosPendentes: number;
};

type ContratoResumo = {
  id: number;
  status: string;
  data_fim: string;
  pdf_contrato_assinado_url: string | null;
  aluno: { nome_completo: string };
  plano: { nome_plano: string; duracao_dias: number };
};

type ListaPainel = "ativos" | "pendentes" | null;

const cardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  backgroundColor: "#fff",
  padding: "12px 10px",
  boxShadow: "0 2px 10px rgba(15,23,42,0.05)",
  minHeight: "88px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
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
  const [contratos, setContratos] = useState<ContratoResumo[]>([]);
  const [listaAberta, setListaAberta] = useState<ListaPainel>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/resumo").then((r) => r.json()),
      fetch("/api/contratos").then((r) => r.json()),
    ])
      .then(([resumo, lista]) => {
        if (resumo && typeof resumo.totalAlunos === "number") {
          setStats({
            totalAlunos: resumo.totalAlunos,
            contratosAssinados: resumo.contratosAssinados ?? 0,
            contratosAtivos: resumo.contratosAtivos ?? 0,
            contratosPendentes: resumo.contratosPendentes ?? 0,
          });
        }
        if (Array.isArray(lista)) setContratos(lista);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const contratosAtivosLista = useMemo(
    () => contratos.filter(isContratoAtivo),
    [contratos]
  );
  const contratosPendentesLista = useMemo(
    () => contratos.filter(isContratoPendente),
    [contratos]
  );

  function toggleLista(tipo: ListaPainel) {
    setListaAberta((atual) => (atual === tipo ? null : tipo));
  }

  return (
    <div className="dash-page" style={{ padding: "8px 4px 20px" }}>
      <style>{`
        .dash-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          width: 100%;
        }
        .dash-logo-wrap {
          margin-bottom: 16px;
          padding: 8px 0 12px;
        }
        .dash-logo-wrap img {
          max-height: 240px;
        }
        @media (min-width: 640px) {
          .dash-logo-wrap {
            margin-bottom: 28px;
            padding: 20px 0 24px;
          }
          .dash-logo-wrap img {
            max-height: 400px;
          }
          .dash-stat-card {
            padding: 16px 14px !important;
            min-height: 100px !important;
          }
          .dash-stat-value {
            font-size: 28px !important;
          }
        }
        .dash-stat-clickable {
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          text-align: left;
          width: 100%;
          font: inherit;
        }
        .dash-stat-clickable:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.1);
          border-color: #c7d2fe !important;
        }
        .dash-stat-clickable.dash-stat-active {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
        }
      `}</style>
      <h1
        className="dash-title"
        style={{
          fontSize: "22px",
          fontWeight: 700,
          marginBottom: "12px",
          color: "#0f172a",
          letterSpacing: "-0.02em",
        }}
      >
        Dashboard
      </h1>

      <div
        className="dash-logo-wrap"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: "520px", width: "100%" }}>
          <Image
            src="/dashboard-logo.png"
            alt="Logo Natália Personal"
            width={600}
            height={400}
            style={{ width: "100%", height: "auto", objectFit: "contain" }}
            priority
            unoptimized
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div className="dash-stats-grid">
          <Link href="/dashboard/alunos" style={{ textDecoration: "none", color: "inherit" }}>
            <StatCard
              label="Total de alunos"
              value={loading ? "…" : stats.totalAlunos}
              icon={<Users style={{ width: 18, height: 18, color: "#4f46e5" }} />}
              iconBg="#eef2ff"
              clickable
            />
          </Link>
          <Link href="/dashboard/contratos-assinados" style={{ textDecoration: "none", color: "inherit" }}>
            <StatCard
              label="Contratos assinados"
              value={loading ? "…" : stats.contratosAssinados}
              icon={<CheckCircle2 style={{ width: 18, height: 18, color: "#16a34a" }} />}
              iconBg="#ecfdf5"
              clickable
            />
          </Link>
          <StatCard
            label="Contratos ativos"
            value={loading ? "…" : stats.contratosAtivos}
            icon={<FileText style={{ width: 18, height: 18, color: "#0891b2" }} />}
            iconBg="#ecfeff"
            clickable
            active={listaAberta === "ativos"}
            onClick={() => toggleLista("ativos")}
          />
          <StatCard
            label="Pendentes"
            value={loading ? "…" : stats.contratosPendentes}
            icon={<Clock style={{ width: 18, height: 18, color: "#ea580c" }} />}
            iconBg="#fff7ed"
            clickable
            active={listaAberta === "pendentes"}
            onClick={() => toggleLista("pendentes")}
          />
        </div>

        {listaAberta === "ativos" && (
          <ListaContratosPainel
            titulo="Contratos ativos"
            contratos={contratosAtivosLista}
            loading={loading}
            onFechar={() => setListaAberta(null)}
            vazio="Nenhum contrato ativo no momento."
          />
        )}
        {listaAberta === "pendentes" && (
          <ListaContratosPainel
            titulo="Contratos pendentes"
            contratos={contratosPendentesLista}
            loading={loading}
            onFechar={() => setListaAberta(null)}
            vazio="Nenhum contrato pendente."
          />
        )}

        <section
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 55%, #eef2ff 100%)",
            padding: "14px",
            boxShadow: "0 4px 16px rgba(79,70,229,0.07)",
          }}
        >
          <h2
            style={{
              margin: "0 0 6px",
              fontSize: "16px",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Contratos assinados
          </h2>
          <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#64748b", lineHeight: 1.45 }}>
            Lista organizada com busca e PDF.
            {!loading && (
              <strong style={{ color: "#4338ca", fontWeight: 600 }}>
                {" "}
                ({stats.contratosAssinados})
              </strong>
            )}
          </p>
          <Link href="/dashboard/contratos-assinados" style={{ textDecoration: "none", display: "block" }}>
            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                width: "100%",
                padding: "12px 16px",
                background: "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(79,70,229,0.3)",
              }}
            >
              Ver contratos assinados
              <ChevronRight size={16} />
            </button>
          </Link>
        </section>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
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

function ListaContratosPainel({
  titulo,
  contratos,
  loading,
  onFechar,
  vazio,
}: {
  titulo: string;
  contratos: ContratoResumo[];
  loading: boolean;
  onFechar: () => void;
  vazio: string;
}) {
  return (
    <section
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        backgroundColor: "#fff",
        padding: "14px",
        boxShadow: "0 4px 16px rgba(15,23,42,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
          {titulo}
        </h2>
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar lista"
          style={{
            border: "none",
            background: "#f1f5f9",
            borderRadius: "8px",
            padding: "6px",
            cursor: "pointer",
            color: "#64748b",
          }}
        >
          <X size={16} />
        </button>
      </div>
      {loading ? (
        <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Carregando...</p>
      ) : contratos.length === 0 ? (
        <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>{vazio}</p>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
          {contratos.map((c) => (
            <li key={c.id}>
              <Link
                href={`/dashboard/contratos/${c.id}`}
                style={{
                  display: "block",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <p style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>
                  {c.aluno.nome_completo}
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                  {labelPlano(c.plano.nome_plano, c.plano.duracao_dias)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/dashboard/contratos"
        style={{
          display: "inline-block",
          marginTop: "12px",
          fontSize: "13px",
          fontWeight: 600,
          color: "#4f46e5",
          textDecoration: "none",
        }}
      >
        Ver todos os contratos →
      </Link>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconBg,
  clickable,
  active,
  onClick,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBg: string;
  clickable?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  const className = [
    "dash-stat-card",
    clickable ? "dash-stat-clickable" : "",
    active ? "dash-stat-active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "6px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: "#64748b",
            margin: 0,
            fontWeight: 600,
            lineHeight: 1.25,
            flex: 1,
          }}
        >
          {label}
        </p>
        <div
          style={{
            padding: "6px",
            backgroundColor: iconBg,
            borderRadius: "8px",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
      <p
        className="dash-stat-value"
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: "#0f172a",
          letterSpacing: "-0.02em",
          margin: "6px 0 0",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={className} style={{ ...cardStyle, border: "1px solid #e2e8f0" }} onClick={onClick}>
        {inner}
      </button>
    );
  }

  return (
    <div className={className} style={cardStyle}>
      {inner}
    </div>
  );
}
