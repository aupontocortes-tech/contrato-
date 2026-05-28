"use client";

import { useState, useEffect, useCallback, useMemo, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toast } from "sonner";
import { isConsultoriaOnlinePlano, labelPlano, tituloCardPlano } from "@/lib/planos";

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
  pdf_contrato_assinado_url: string | null;
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
const btnAction: CSSProperties = {
  padding: "0 14px",
  minHeight: "40px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  backgroundColor: "#fff",
  color: "#334155",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "13px",
  lineHeight: 1.2,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  textDecoration: "none",
};
const btnDanger: CSSProperties = {
  ...btnAction,
  color: "#b91c1c",
  borderColor: "#fecaca",
  backgroundColor: "#fff",
};
const inputSelect = { padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontSize: "14px", minWidth: "200px", width: "100%" };
const card = { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px", marginBottom: "18px", boxShadow: "0 8px 24px rgba(15,23,42,0.07)" };
const contratoItemCard: CSSProperties = {
  padding: "20px 22px",
  borderBottom: "1px solid #e2e8f0",
  backgroundColor: "#fff",
};
const contratoRowGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto auto",
  gap: "20px 16px",
  alignItems: "end",
};
const contratoBtnRow: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  alignItems: "center",
  justifyContent: "flex-end",
};
const contratoUploadBox: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  alignItems: "flex-end",
  minWidth: "min(100%, 240px)",
};

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
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [modalExcluirArquivoOpen, setModalExcluirArquivoOpen] = useState(false);
  const [contratoParaExcluirArquivo, setContratoParaExcluirArquivo] = useState<number | null>(null);
  const [codigoExcluirArquivo, setCodigoExcluirArquivo] = useState("");
  const [excluindoArquivo, setExcluindoArquivo] = useState(false);

  async function handleUploadContratoAssinado(contratoId: number, file: File) {
    setUploadingId(contratoId);
    try {
      const fd = new FormData();
      fd.append("arquivo", file);
      const res = await fetch(`/api/contratos/${contratoId}/upload-assinado`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Erro ao enviar arquivo.");
        return;
      }
      toast.success("Contrato assinado salvo no aplicativo.");
      load();
    } catch {
      toast.error("Erro de conexão ao enviar arquivo.");
    } finally {
      setUploadingId(null);
    }
  }

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

  const { planosPresenciais, planosOnline } = useMemo(() => {
    const pres: Plano[] = [];
    const onl: Plano[] = [];
    for (const p of planos) {
      if (isConsultoriaOnlinePlano(p.nome_plano)) onl.push(p);
      else pres.push(p);
    }
    onl.sort((a, b) => a.duracao_dias - b.duracao_dias);
    return { planosPresenciais: pres, planosOnline: onl };
  }, [planos]);

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
      <style>{`
        @media (max-width: 960px) {
          .contrato-card-top {
            grid-template-columns: 1fr !important;
          }
          .contrato-card-top .contrato-col-upload,
          .contrato-card-top .contrato-col-actions {
            align-items: flex-start !important;
          }
          .contrato-card-top .contrato-col-upload span,
          .contrato-card-top .contrato-col-actions span {
            text-align: left !important;
          }
          .contrato-card-top .contrato-btn-row {
            justify-content: flex-start !important;
          }
        }
      `}</style>
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
                {planosPresenciais.length > 0 && (
                  <optgroup label="Planos presenciais">
                    {planosPresenciais.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {tituloCardPlano(p.nome_plano)} ({p.duracao_dias} dias)
                      </option>
                    ))}
                  </optgroup>
                )}
                {planosOnline.length > 0 && (
                  <optgroup label="Consultoria online">
                    {planosOnline.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {tituloCardPlano(p.nome_plano)} ({p.duracao_dias} dias)
                      </option>
                    ))}
                  </optgroup>
                )}
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
              const temArquivoAssinado = !!c.pdf_contrato_assinado_url;
              const assinado = c.status === "assinado" || temArquivoAssinado;
              const professorAssinou = !!c.assinatura_professor_url || c.status === "professor_assinado" || c.status === "assinado";
              const podeCopiarLink = professorAssinou && c.link_assinatura;
              const inputUploadId = `upload-contrato-assinado-${c.id}`;

              return (
                <article key={c.id} style={contratoItemCard}>
                  <div
                    className="contrato-card-top"
                    style={{
                      ...contratoRowGrid,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <h3
                        style={{
                          margin: "0 0 6px",
                          fontWeight: 700,
                          fontSize: "16px",
                          color: "#0f172a",
                          letterSpacing: "-0.02em",
                          lineHeight: 1.35,
                        }}
                      >
                        {c.aluno.nome_completo}
                      </h3>
                      <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#475569", fontWeight: 500 }}>
                        {labelPlano(c.plano.nome_plano, c.plano.duracao_dias)}
                      </p>
                      <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#64748b" }}>
                        {new Date(c.data_inicio).toLocaleDateString("pt-BR")} —{" "}
                        {new Date(c.data_fim).toLocaleDateString("pt-BR")}
                      </p>
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          backgroundColor: assinado ? "#ecfdf5" : professorAssinou ? "#eef2ff" : "#fff7ed",
                          color: assinado ? "#047857" : professorAssinou ? "#4338ca" : "#c2410c",
                          border: `1px solid ${assinado ? "#a7f3d0" : professorAssinou ? "#c7d2fe" : "#fed7aa"}`,
                        }}
                      >
                        {temArquivoAssinado
                          ? "Arquivo assinado salvo"
                          : assinado
                            ? "Assinado"
                            : professorAssinou
                              ? "Aguardando aluno"
                              : "Pendente"}
                      </span>
                    </div>

                    <div className="contrato-col-upload" style={contratoUploadBox}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          alignSelf: "stretch",
                          textAlign: "right",
                        }}
                      >
                        Contrato assinado
                      </span>
                      <input
                        id={inputUploadId}
                        type="file"
                        accept=".pdf,application/pdf,image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadContratoAssinado(c.id, file);
                          e.target.value = "";
                        }}
                      />
                      <div className="contrato-btn-row" style={contratoBtnRow}>
                        {temArquivoAssinado ? (
                          <>
                            <a href={c.pdf_contrato_assinado_url!} target="_blank" rel="noopener noreferrer" style={btnAction}>
                              Ver arquivo salvo
                            </a>
                            <button
                              type="button"
                              style={btnDanger}
                              onClick={() => {
                                setContratoParaExcluirArquivo(c.id);
                                setCodigoExcluirArquivo("");
                                setModalExcluirArquivoOpen(true);
                              }}
                            >
                              Excluir arquivo
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={uploadingId === c.id}
                            onClick={() => document.getElementById(inputUploadId)?.click()}
                            style={{
                              ...btnAction,
                              opacity: uploadingId === c.id ? 0.65 : 1,
                              cursor: uploadingId === c.id ? "wait" : "pointer",
                            }}
                          >
                            {uploadingId === c.id ? "Salvando..." : "Enviar contrato assinado"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="contrato-col-actions" style={contratoUploadBox}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          alignSelf: "stretch",
                          textAlign: "right",
                        }}
                      >
                        Ações
                      </span>
                      <div className="contrato-btn-row" style={contratoBtnRow}>
                        <Link href={`/dashboard/contratos/${c.id}`} style={btnAction}>
                          Ver PDF
                        </Link>
                        {(c.status === "gerado" || c.status === "enviado") && (
                          <button
                            type="button"
                            disabled={gerandoId === c.id}
                            onClick={() => handleGerar(c.id)}
                            style={{
                              ...btnAction,
                              opacity: gerandoId === c.id ? 0.65 : 1,
                              cursor: gerandoId === c.id ? "wait" : "pointer",
                            }}
                          >
                            {gerandoId === c.id ? "Gerando..." : "Gerar PDF e link"}
                          </button>
                        )}
                        {podeCopiarLink && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                copyLink(`${typeof window !== "undefined" ? window.location.origin : ""}/assinar/${c.id}`)
                              }
                              style={btnAction}
                            >
                              Copiar link
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                copyWhatsAppLink(
                                  `${typeof window !== "undefined" ? window.location.origin : ""}/assinar/${c.id}`
                                )
                              }
                              style={btnAction}
                            >
                              Enviar WhatsApp
                            </button>
                          </>
                        )}
                        {c.pdf_url && (
                          <a href={c.pdf_url} target="_blank" rel="noopener noreferrer" style={btnAction}>
                            Baixar PDF
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "18px",
                      paddingTop: "16px",
                      borderTop: "1px solid #e2e8f0",
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Assinatura do professor
                      </span>
                      {c.assinatura_professor_url ? (
                        <>
                          <img
                            src={c.assinatura_professor_url}
                            alt="Assinatura do professor"
                            style={{
                              height: "44px",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              backgroundColor: "#f8fafc",
                              padding: "4px 8px",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setContratoParaAssinar(c.id);
                              setModalAssinaturaOpen(true);
                            }}
                            style={btnAction}
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
                          style={{
                            ...btnAction,
                            opacity: !c.link_assinatura ? 0.5 : 1,
                            cursor: !c.link_assinatura ? "not-allowed" : "pointer",
                          }}
                        >
                          {c.link_assinatura ? "Assinar" : "Aguardando geração"}
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setContratoParaExcluir(c.id);
                        setCodigoExcluir("");
                        setModalExcluirOpen(true);
                      }}
                      style={btnDanger}
                    >
                      Excluir
                    </button>
                  </div>
                </article>
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
              Digite a senha <strong>1234</strong> para excluir este contrato.
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

      {modalExcluirArquivoOpen && contratoParaExcluirArquivo !== null && (
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
          onClick={() => setModalExcluirArquivoOpen(false)}
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
              Excluir arquivo do contrato
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#6b7280" }}>
              Digite a senha <strong>1234</strong> para remover o contrato assinado salvo. O contrato continua na lista.
            </p>
            <input
              type="password"
              inputMode="numeric"
              placeholder="Senha"
              value={codigoExcluirArquivo}
              onChange={(e) => setCodigoExcluirArquivo(e.target.value)}
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
                  setModalExcluirArquivoOpen(false);
                  setContratoParaExcluirArquivo(null);
                  setCodigoExcluirArquivo("");
                }}
                style={btnSecondary}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={excluindoArquivo || !codigoExcluirArquivo.trim()}
                onClick={async () => {
                  setExcluindoArquivo(true);
                  try {
                    const res = await fetch(
                      `/api/contratos/${contratoParaExcluirArquivo}/upload-assinado`,
                      {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ codigo: codigoExcluirArquivo.trim() }),
                      }
                    );
                    const data = await res.json();
                    if (res.ok && data.ok) {
                      toast.success("Arquivo removido.");
                      setModalExcluirArquivoOpen(false);
                      setContratoParaExcluirArquivo(null);
                      setCodigoExcluirArquivo("");
                      load();
                    } else {
                      toast.error(data.error || "Senha incorreta.");
                    }
                  } catch {
                    toast.error("Erro ao excluir arquivo.");
                  } finally {
                    setExcluindoArquivo(false);
                  }
                }}
                style={{ ...btnPrimary, backgroundColor: "#b91c1c", boxShadow: "0 8px 20px rgba(185,28,28,0.25)" }}
              >
                {excluindoArquivo ? "Excluindo..." : "Confirmar"}
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
