"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileCheck,
  Search,
} from "lucide-react";
import { isContratoAssinado } from "@/lib/contrato-status";
import { labelPlano } from "@/lib/planos";

type Contrato = {
  id: number;
  status: string;
  data_inicio: string;
  data_fim: string;
  pdf_url: string | null;
  pdf_contrato_assinado_url: string | null;
  criado_em: string;
  aluno: { nome_completo: string };
  plano: { nome_plano: string; duracao_dias: number };
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default function ContratosAssinadosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    fetch("/api/contratos")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setContratos(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const assinados = useMemo(() => {
    const lista = contratos.filter(isContratoAssinado);
    const q = busca.trim().toLowerCase();
    const filtrada = q
      ? lista.filter(
          (c) =>
            c.aluno.nome_completo.toLowerCase().includes(q) ||
            labelPlano(c.plano.nome_plano, c.plano.duracao_dias).toLowerCase().includes(q)
        )
      : lista;
    return filtrada.sort(
      (a, b) => new Date(b.data_fim).getTime() - new Date(a.data_fim).getTime()
    );
  }, [contratos, busca]);

  return (
    <div style={{ padding: "8px 4px 32px" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "#64748b",
              textDecoration: "none",
              marginBottom: "8px",
            }}
          >
            <ArrowLeft size={16} />
            Voltar ao Dashboard
          </Link>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Contratos assinados
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#64748b" }}>
            {loading ? "Carregando..." : `${assinados.length} contrato(s) assinado(s)`}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#fff",
            minWidth: "260px",
            boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
          }}
        >
          <Search size={18} color="#94a3b8" />
          <input
            type="search"
            placeholder="Buscar aluno ou plano..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              flex: 1,
              fontSize: "14px",
              background: "transparent",
            }}
          />
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#64748b" }}>Carregando contratos...</p>
      ) : assinados.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            borderRadius: "16px",
            border: "1px dashed #cbd5e1",
            backgroundColor: "#f8fafc",
          }}
        >
          <FileCheck size={40} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
          <p style={{ color: "#475569", fontWeight: 600, marginBottom: "8px" }}>
            Nenhum contrato assinado ainda
          </p>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>
            Os contratos aparecem aqui após assinatura completa ou envio do arquivo assinado.
          </p>
          <Link
            href="/dashboard/contratos"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 18px",
              borderRadius: "10px",
              background: "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "14px",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(79,70,229,0.3)",
            }}
          >
            Ir para Contratos
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {assinados.map((c) => {
            const pdfAbrir = `/api/contratos/${c.id}/download-pdf`;
            return (
              <article
                key={c.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  backgroundColor: "#fff",
                  padding: "18px 20px",
                  boxShadow: "0 4px 16px rgba(15,23,42,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                >
                  <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "6px",
                      }}
                    >
                      <CheckCircle2 size={18} color="#16a34a" />
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "#047857",
                          backgroundColor: "#ecfdf5",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          border: "1px solid #a7f3d0",
                        }}
                      >
                        Assinado
                      </span>
                      {c.pdf_contrato_assinado_url && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#4338ca",
                            backgroundColor: "#eef2ff",
                            padding: "3px 8px",
                            borderRadius: "6px",
                          }}
                        >
                          Arquivo completo
                        </span>
                      )}
                    </div>
                    <h2
                      style={{
                        margin: "0 0 4px",
                        fontSize: "17px",
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {c.aluno.nome_completo}
                    </h2>
                    <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#475569" }}>
                      {labelPlano(c.plano.nome_plano, c.plano.duracao_dias)}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "#64748b",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Calendar size={14} />
                      {formatDate(c.data_inicio)} — {formatDate(c.data_fim)}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <Link
                      href={`/dashboard/contratos/${c.id}`}
                      className="dash-link-btn"
                      style={linkBtnStyle}
                    >
                      Ver contrato
                    </Link>
                    {pdfAbrir && (
                      <a
                        href={pdfAbrir}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={linkBtnStyle}
                      >
                        <ExternalLink size={14} />
                        Abrir PDF
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <style>{`
        .dash-link-btn:hover { border-color: #c7d2fe !important; color: #3730a3 !important; background: #eef2ff !important; }
        a[style]:hover { border-color: #c7d2fe !important; color: #3730a3 !important; background: #eef2ff !important; }
      `}</style>
    </div>
  );
}

const linkBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "9px 14px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  backgroundColor: "#fff",
  color: "#334155",
  fontWeight: 600,
  fontSize: "13px",
  textDecoration: "none",
  boxShadow: "0 1px 2px rgba(15,23,42,0.05)",
};
