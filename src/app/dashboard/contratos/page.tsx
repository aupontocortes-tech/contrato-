"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toast } from "sonner";

const AssinaturaProfessorModal = dynamic(
  () => import("@/components/assinatura-professor-modal").then((m) => ({ default: m.AssinaturaProfessorModal })),
  { ssr: false }
);

type Aluno = { id: number; nome_completo: string; cpf: string; email: string };
type Plano = { id: number; nome_plano: string; duracao_dias: number };
type Contrato = {
  id: number;
  status: string;
  data_inicio: string;
  data_fim: string;
  link_assinatura: string | null;
  pdf_url: string | null;
  assinatura_professor_url: string | null;
  criado_em: string;
  aluno: Aluno;
  plano: Plano;
};

type ScreenState = "loading" | "error" | "empty" | "success";

function isContratoList(value: unknown): value is Contrato[] {
  return Array.isArray(value) && value.every((item) => item != null && typeof item.id === "number");
}
function isAlunoList(value: unknown): value is Aluno[] {
  return Array.isArray(value) && value.every((item) => item != null && typeof item.id === "number");
}
function isPlanoList(value: unknown): value is Plano[] {
  return Array.isArray(value) && value.every((item) => item != null && typeof item.id === "number");
}

const btnPrimary = { padding: "10px 18px", borderRadius: "10px", border: "none", backgroundColor: "#4f46e5", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "14px", boxShadow: "0 8px 20px rgba(79,70,229,0.25)" };
const btnSecondary = { padding: "10px 18px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#fff", color: "#1f2937", fontWeight: 600, cursor: "pointer", fontSize: "14px" };
const inputSelect = { padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontSize: "14px", minWidth: "200px", width: "100%" };
const card = { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px", marginBottom: "18px", boxShadow: "0 8px 24px rgba(15,23,42,0.07)" };

export default function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorContratos, setErrorContratos] = useState<string | null>(null);
  const [errorAlunos, setErrorAlunos] = useState<string | null>(null);
  const [errorPlanos, setErrorPlanos] = useState<string | null>(null);
  const [alunoId, setAlunoId] = useState<string>("");
  const [planoId, setPlanoId] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [gerandoId, setGerandoId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [modalAssinaturaOpen, setModalAssinaturaOpen] = useState(false);
  const [contratoParaAssinar, setContratoParaAssinar] = useState<number | null>(null);
  const [modalExcluirOpen, setModalExcluirOpen] = useState(false);
  const [contratoParaExcluir, setContratoParaExcluir] = useState<number | null>(null);
  const [codigoExcluir, setCodigoExcluir] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorContratos(null);
    setErrorAlunos(null);
    setErrorPlanos(null);

    const fetchContratos = async (): Promise<Contrato[]> => {
      try {
        const res = await fetch("/api/contratos");
        const data = await res.json();
        if (!res.ok) {
          setErrorContratos("Não foi possível carregar os contratos.");
          return [];
        }
        if (isContratoList(data)) return data;
        setErrorContratos("Resposta inválida dos contratos.");
        return [];
      } catch {
        setErrorContratos("Não foi possível carregar os contratos.");
        return [];
      }
    };
    const fetchAlunos = async (): Promise<Aluno[]> => {
      try {
        const res = await fetch("/api/alunos");
        const data = await res.json();
        if (!res.ok) {
          setErrorAlunos("Não foi possível carregar os alunos.");
          return [];
        }
        if (isAlunoList(data)) return data;
        setErrorAlunos("Resposta inválida dos alunos.");
        return [];
      } catch {
        setErrorAlunos("Não foi possível carregar os alunos.");
        return [];
      }
    };
    const fetchPlanos = async (): Promise<Plano[]> => {
      try {
        const res = await fetch("/api/planos");
        const data = await res.json();
        if (!res.ok) {
          setErrorPlanos("Não foi possível carregar os planos.");
          return [];
        }
        if (isPlanoList(data)) return data;
        setErrorPlanos("Resposta inválida dos planos.");
        return [];
      } catch {
        setErrorPlanos("Não foi possível carregar os planos.");
        return [];
      }
    };

    const [c, a, p] = await Promise.all([fetchContratos(), fetchAlunos(), fetchPlanos()]);
    setContratos(c);
    setAlunos(a);
    setPlanos(p);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const screenState: ScreenState = loading
    ? "loading"
    : errorContratos
      ? "error"
      : contratos.length === 0
        ? "empty"
        : "success";

  const canCreateContract = !errorAlunos && !errorPlanos && alunos.length > 0 && planos.length > 0;
  const loadingOrErrorAlunosPlanos = errorAlunos != null || errorPlanos != null;

  async function handleNovoContrato(e: React.FormEvent) {
    e.preventDefault();
    if (!alunoId || !planoId) {
      toast.error("Selecione aluno e plano");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/contratos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aluno_id: Number(alunoId), plano_id: Number(planoId) }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao criar contrato");
        return;
      }
      toast.success("Contrato criado!");
      setAlunoId("");
      setPlanoId("");
      setShowForm(false);
      load();
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setCreating(false);
    }
  }

  async function handleGerar(id: number) {
    setGerandoId(id);
    try {
      const res = await fetch(`/api/contratos/${id}/gerar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao gerar contrato");
        return;
      }
      toast.success("Contrato gerado! PDF e link disponíveis.");
      if (data.link_assinatura) {
        await navigator.clipboard.writeText(data.link_assinatura);
        toast.success("Link copiado.");
      }
      load();
    } catch {
      toast.error("Erro ao gerar");
    } finally {
      setGerandoId(null);
    }
  }

  function copyLink(link: string) {
    navigator.clipboard.writeText(link).then(() => toast.success("Link copiado!"));
  }

  function copyWhatsAppLink(link: string) {
    window.open(`https://wa.me/?text=${encodeURIComponent(link)}`, "_blank");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>Contratos</h1>
        <span style={{ fontSize: "12px", backgroundColor: "#e0e7ff", color: "#3730a3", padding: "6px 10px", borderRadius: "999px", fontWeight: 700 }}>
          Gestão profissional
        </span>
      </div>

      {!loading && loadingOrErrorAlunosPlanos && (
        <div style={{ ...card, backgroundColor: "#fffbeb", borderColor: "#fcd34d" }}>
          <p style={{ fontSize: "14px", color: "#92400e" }}>
            {errorAlunos && errorPlanos
              ? "Não foi possível carregar alunos e planos. Não é possível criar novo contrato."
              : errorAlunos
                ? "Não foi possível carregar os alunos. Crie um aluno primeiro ou tente recarregar."
                : "Não foi possível carregar os planos. Cadastre planos ou tente recarregar."}
          </p>
        </div>
      )}

      {showForm && (
        <div style={card}>
          <form
            onSubmit={handleNovoContrato}
            style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-end" }}
          >
            <div style={{ flex: "1 1 200px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>
                Aluno
              </label>
              <select
                value={alunoId}
                onChange={(e) => setAlunoId(e.target.value)}
                required
                disabled={!!errorAlunos}
                style={inputSelect}
              >
                <option value="">Selecione o aluno</option>
                {alunos.map((a) => (
                  <option key={a.id} value={String(a.id)}>
                    {a.nome_completo}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>
                Plano
              </label>
              <select
                value={planoId}
                onChange={(e) => setPlanoId(e.target.value)}
                required
                disabled={!!errorPlanos}
                style={inputSelect}
              >
                <option value="">Selecione o plano</option>
                {planos.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.nome_plano} ({p.duracao_dias} dias)
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" disabled={creating || !canCreateContract} style={btnPrimary}>
                {creating ? "Criando..." : "Criar contrato"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={btnSecondary}>
          + Criar novo contrato
        </button>
      )}

      <div style={card}>
        {screenState === "loading" && (
          <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>Carregando...</div>
        )}
        {screenState === "error" && (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ marginBottom: "8px", color: "#374151" }}>{errorContratos ?? "Erro ao carregar contratos."}</p>
            <button onClick={() => load()} style={btnSecondary}>
              Tentar novamente
            </button>
          </div>
        )}
        {screenState === "empty" && (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ marginBottom: "8px", color: "#374151" }}>Nenhum contrato cadastrado.</p>
            <button onClick={() => setShowForm(true)} style={btnSecondary}>
              Criar primeiro contrato
            </button>
          </div>
        )}
        {screenState === "success" && (
          <div style={{ borderTop: "1px solid #e2e8f0" }}>
            {contratos.map((c) => {
              const assinado = c.status === "assinado";
              const professorAssinou = !!c.assinatura_professor_url || c.status === "professor_assinado" || c.status === "assinado";
              const podeCopiarLink = professorAssinou && c.link_assinatura;

              return (
                <div
                  key={c.id}
                  style={{
                    padding: "20px",
                    borderBottom: "1px solid #e2e8f0",
                    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px", letterSpacing: "-0.01em" }}>
                          {c.aluno.nome_completo} · {c.plano.nome_plano.replace(/_/g, " ")}
                        </div>
                        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "10px" }}>
                          {new Date(c.data_inicio).toLocaleDateString("pt-BR")} a {new Date(c.data_fim).toLocaleDateString("pt-BR")}
                        </p>
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "12px",
                            fontWeight: 500,
                            padding: "5px 12px",
                            borderRadius: "999px",
                            backgroundColor: assinado ? "#dcfce7" : professorAssinou ? "#e0e7ff" : "#ffedd5",
                            color: assinado ? "#166534" : professorAssinou ? "#4338ca" : "#c2410c",
                          }}
                        >
                          {assinado ? "Assinado" : professorAssinou ? "Aguardando aluno" : "Pendente"}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        <Link
                          href={`/dashboard/contratos/${c.id}`}
                          style={{ ...btnSecondary, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                        >
                          Ver PDF
                        </Link>
                        {(c.status === "gerado" || c.status === "enviado") && (
                          <button
                            type="button"
                            disabled={gerandoId === c.id}
                            onClick={() => handleGerar(c.id)}
                            style={btnSecondary}
                          >
                            {gerandoId === c.id ? "Gerando..." : "Gerar PDF e link"}
                          </button>
                        )}
                        {podeCopiarLink && (
                          <>
                            <button
                              type="button"
                              onClick={() => copyLink(`${typeof window !== "undefined" ? window.location.origin : ""}/assinar/${c.id}`)}
                              style={btnSecondary}
                            >
                              Copiar link
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                copyWhatsAppLink(`${typeof window !== "undefined" ? window.location.origin : ""}/assinar/${c.id}`)
                              }
                              style={btnSecondary}
                            >
                              Enviar WhatsApp
                            </button>
                          </>
                        )}
                        {c.pdf_url && (
                          <a
                            href={c.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ ...btnSecondary, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                          >
                            Baixar PDF
                          </a>
                        )}
                      </div>
                    </div>
                    <div style={{ paddingTop: "10px", borderTop: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Assinatura do Professor:</span>
                        {c.assinatura_professor_url ? (
                          <>
                            <img
                              src={c.assinatura_professor_url}
                              alt="Assinatura do professor"
                              style={{ height: "48px", border: "1px solid #cbd5e1", borderRadius: "8px", backgroundColor: "#fff" }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setContratoParaAssinar(c.id);
                                setModalAssinaturaOpen(true);
                              }}
                              style={{ ...btnSecondary, padding: "6px 10px", fontSize: "12px" }}
                            >
                              Alterar
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={!c.link_assinatura}
                            onClick={() => {
                              setContratoParaAssinar(c.id);
                              setModalAssinaturaOpen(true);
                            }}
                            style={btnSecondary}
                          >
                            {c.link_assinatura ? "Assinar" : "Aguardando geração"}
                          </button>
                        )}
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setContratoParaExcluir(c.id);
                            setCodigoExcluir("");
                            setModalExcluirOpen(true);
                          }}
                          style={{ ...btnSecondary, color: "#b91c1c", borderColor: "#b91c1c", minWidth: "auto", width: "auto" }}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {contratoParaAssinar !== null && (
        <AssinaturaProfessorModal
          open={modalAssinaturaOpen}
          onOpenChange={setModalAssinaturaOpen}
          contratoId={contratoParaAssinar}
          onSuccess={() => {
            load();
            setContratoParaAssinar(null);
          }}
        />
      )}

      {modalExcluirOpen && contratoParaExcluir !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setModalExcluirOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "16px",
              maxWidth: "360px",
              width: "90%",
              boxShadow: "0 20px 45px rgba(15,23,42,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 600, color: "#111827" }}>
              Excluir contrato
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#6b7280" }}>
              Digite o código de confirmação 1234 para excluir este contrato.
            </p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Código"
              value={codigoExcluir}
              onChange={(e) => setCodigoExcluir(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "16px",
                marginBottom: "16px",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => {
                  setModalExcluirOpen(false);
                  setContratoParaExcluir(null);
                  setCodigoExcluir("");
                }}
                style={btnSecondary}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={excluindo || !codigoExcluir.trim()}
                onClick={async () => {
                  setExcluindo(true);
                  try {
                    const res = await fetch(`/api/contratos/${contratoParaExcluir}/excluir`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ codigo: codigoExcluir.trim() }),
                    });
                    const data = await res.json();
                    if (res.ok && data.ok) {
                      toast.success("Contrato excluído.");
                      setModalExcluirOpen(false);
                      setContratoParaExcluir(null);
                      setCodigoExcluir("");
                      load();
                    } else {
                      toast.error(data.error || "Código incorreto.");
                    }
                  } catch {
                    toast.error("Erro ao excluir.");
                  } finally {
                    setExcluindo(false);
                  }
                }}
                style={{ ...btnPrimary, backgroundColor: "#b91c1c", boxShadow: "0 8px 20px rgba(185,28,28,0.25)" }}
              >
                {excluindo ? "Excluindo..." : "Confirmar exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}

      <p style={{ marginTop: "24px", fontSize: "12px", color: "#9ca3af" }}>
        Contratos · versão atualizada
      </p>
    </div>
  );
}
