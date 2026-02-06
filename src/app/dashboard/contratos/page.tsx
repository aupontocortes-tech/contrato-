"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, Copy, Download, FileCheck, Clock } from "lucide-react";

type Aluno = { id: number; nome_completo: string; cpf: string; email: string };
type Plano = { id: number; nome_plano: string; duracao_dias: number };
type Contrato = {
  id: number;
  status: string;
  data_inicio: string;
  data_fim: string;
  link_assinatura: string | null;
  pdf_url: string | null;
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

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Contratos</h1>

      <Card>
        <CardHeader>
          <CardTitle>Novo contrato</CardTitle>
          <CardDescription>
            Escolha o aluno e o plano. Depois clique em &quot;Gerar contrato&quot; na lista para gerar o PDF e o link de assinatura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNovoContrato} className="flex flex-wrap items-end gap-4">
            <div className="space-y-2 min-w-[200px]">
              <label className="text-sm font-medium">Aluno</label>
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
            <div className="space-y-2 min-w-[200px]">
              <label className="text-sm font-medium">Plano</label>
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
            <Button type="submit" disabled={creating}>
              {creating ? "Criando..." : "Criar contrato"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de contratos</CardTitle>
          <CardDescription>{contratos.length} contrato(s).</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : contratos.length === 0 ? (
            <p className="text-muted-foreground">Nenhum contrato. Crie um acima.</p>
          ) : (
            <ul className="space-y-3">
              {contratos.map((c) => {
                const assinado = c.status === "assinado";
                return (
                  <li
                    key={c.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="inline-flex items-center gap-1.5 shrink-0"
                          title={assinado ? "Contrato assinado" : "Aguardando assinatura"}
                        >
                          <span
                            className={`size-3 rounded-full ${assinado ? "bg-emerald-500" : "bg-red-500"}`}
                            aria-hidden
                          />
                          <span className="font-medium text-foreground">
                            {c.aluno.nome_completo}
                          </span>
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground capitalize">
                          {c.plano.nome_plano.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(c.data_inicio).toLocaleDateString("pt-BR")} a{" "}
                        {new Date(c.data_fim).toLocaleDateString("pt-BR")}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {assinado ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                            <FileCheck className="size-3.5" />
                            Assinado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-500/10 px-2 py-0.5 rounded">
                            <Clock className="size-3.5" />
                            Aguardando assinatura
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Link href={`/dashboard/contratos/${c.id}`}>
                        <Button size="sm" variant="outline" className="gap-1.5">
                          <Eye className="size-4" />
                          Visualizar
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
                      {c.link_assinatura && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyLink(c.link_assinatura!)}
                          className="gap-1.5"
                        >
                          <Copy className="size-4" />
                          Copiar link
                        </Button>
                      )}
                      {c.pdf_url && (
                        <a href={c.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="secondary" className="gap-1.5">
                            <Download className="size-4" />
                            Baixar PDF
                          </Button>
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
