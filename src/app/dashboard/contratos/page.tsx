"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, Download, FileCheck, Clock, Eye, PenTool } from "lucide-react";
import { AssinaturaProfessorModal } from "@/components/assinatura-professor-modal";

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

export default function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [alunoId, setAlunoId] = useState<string>("");
  const [planoId, setPlanoId] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [gerandoId, setGerandoId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [modalAssinaturaOpen, setModalAssinaturaOpen] = useState(false);
  const [contratoParaAssinar, setContratoParaAssinar] = useState<number | null>(null);

  function load() {
    Promise.all([
      fetch("/api/contratos").then((r) => r.json()),
      fetch("/api/alunos").then((r) => r.json()),
      fetch("/api/planos").then((r) => r.json()),
    ])
      .then(([c, a, p]) => {
        if (Array.isArray(c)) setContratos(c);
        if (Array.isArray(a)) setAlunos(a);
        if (Array.isArray(p)) setPlanos(p);
      })
      .catch(() => toast.error("Erro ao carregar dados"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

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
        body: JSON.stringify({
          aluno_id: Number(alunoId),
          plano_id: Number(planoId),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao criar contrato");
        return;
      }
      toast.success("Contrato criado!");
      setAlunoId("");
      setPlanoId("");
      setShowForm(false); // Oculta o formulário após criar
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
        toast.success("Link copiado para a área de transferência.");
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
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(link)}`;
    window.open(whatsappLink, "_blank");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Contratos</h1>

      {/* Formulário de criar contrato - aparece apenas se showForm for true */}
      {showForm && (
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <form onSubmit={handleNovoContrato} className="flex flex-wrap items-end gap-4">
              <div className="space-y-2 flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700">Aluno</label>
                <Select value={alunoId} onValueChange={setAlunoId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {alunos.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.nome_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700">Plano</label>
                <Select value={planoId} onValueChange={setPlanoId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {planos.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nome_plano} ({p.duracao_dias} dias)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={creating} className="bg-blue-600 hover:bg-blue-700">
                  {creating ? "Criando..." : "Criar contrato"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Botão para mostrar formulário novamente */}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="bg-white"
        >
          + Criar novo contrato
        </Button>
      )}

      {/* Lista de contratos - elemento principal */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : contratos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-600 mb-2">Nenhum contrato cadastrado.</p>
              <Button
                variant="outline"
                onClick={() => setShowForm(true)}
                className="mt-2"
              >
                Criar primeiro contrato
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {contratos.map((c) => {
                const assinado = c.status === "assinado";
                const professorAssinou = c.assinatura_professor_url !== null || c.status === "professor_assinado" || c.status === "assinado";
                const podeCopiarLink = professorAssinou && c.link_assinatura;
                
                return (
                  <div
                    key={c.id}
                    className="p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col gap-4">
                      {/* Linha principal: Informações e ações */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Informações do contrato */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="font-semibold text-gray-900">
                              {c.aluno.nome_completo}
                            </span>
                            <span className="text-gray-400">·</span>
                            <span className="text-gray-600 capitalize">
                              {c.plano.nome_plano.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {new Date(c.data_inicio).toLocaleDateString("pt-BR")} a{" "}
                            {new Date(c.data_fim).toLocaleDateString("pt-BR")}
                          </p>
                          <div className="flex items-center gap-2">
                            {assinado ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded">
                                <FileCheck className="h-3.5 w-3.5" />
                                Assinado
                              </span>
                            ) : professorAssinou ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                                <Clock className="h-3.5 w-3.5" />
                                Aguardando aluno
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700 bg-orange-50 px-2.5 py-1 rounded">
                                <Clock className="h-3.5 w-3.5" />
                                Pendente
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <Link href={`/dashboard/contratos/${c.id}`}>
                            <Button size="sm" variant="outline" className="gap-1.5">
                              <Eye className="h-4 w-4" />
                              Ver PDF
                            </Button>
                          </Link>
                          {(c.status === "gerado" || c.status === "enviado") && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={gerandoId === c.id}
                              onClick={() => handleGerar(c.id)}
                              className="gap-1.5"
                            >
                              {gerandoId === c.id ? "Gerando..." : "Gerar PDF e link"}
                            </Button>
                          )}
                          {podeCopiarLink && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyLink(c.link_assinatura!)}
                                className="gap-1.5"
                              >
                                <Copy className="h-4 w-4" />
                                Copiar link
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyWhatsAppLink(c.link_assinatura!)}
                                className="gap-1.5"
                              >
                                Enviar WhatsApp
                              </Button>
                            </>
                          )}
                          {c.pdf_url && (
                            <a href={c.pdf_url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="gap-1.5">
                                <Download className="h-4 w-4" />
                                Baixar PDF
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Linha de assinatura do professor */}
                      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <span className="text-xs font-medium text-gray-600">Assinatura do Professor:</span>
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          {c.assinatura_professor_url ? (
                            <>
                              <img
                                src={c.assinatura_professor_url}
                                alt="Assinatura do professor"
                                className="h-12 w-auto object-contain border border-gray-200 rounded bg-white"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setContratoParaAssinar(c.id);
                                  setModalAssinaturaOpen(true);
                                }}
                                className="text-xs text-gray-600 hover:text-gray-900"
                              >
                                Alterar
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setContratoParaAssinar(c.id);
                                setModalAssinaturaOpen(true);
                              }}
                              className="gap-1.5 text-xs"
                              disabled={!c.link_assinatura}
                            >
                              <PenTool className="h-3.5 w-3.5" />
                              {c.link_assinatura ? "Assinar" : "Aguardando geração"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de assinatura do professor */}
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
    </div>
  );
}
