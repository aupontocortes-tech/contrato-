"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DocumentoContrato } from "@/components/DocumentoContrato";
import { ContratoCorpoVisual } from "@/components/ContratoCorpoVisual";
import { ArrowLeft, FileText } from "lucide-react";

type ContratoEstruturado = {
  titulo: string;
  logoPlaceholder?: string;
  contratadaNome: string;
  contratadaTitulo: string;
  identificacaoTexto: string;
  nomeContratante: string;
  cpfContratante: string;
  telefone?: string | null;
  email?: string;
  clausulas: Array<{ numero: string; titulo: string; texto: string }>;
  assinaturaContratada: string;
  assinaturaContratante: string;
  blocoAssinaturaDigital?: string;
};

type PlanoInfo = {
  id: number;
  nome_plano: string;
  duracao_dias: number;
};

export default function PreviewContratoPlanoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [plano, setPlano] = useState<PlanoInfo | null>(null);
  const [conteudo, setConteudo] = useState<ContratoEstruturado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/planos/${id}/preview-contrato?t=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        if (data.plano) setPlano(data.plano);
        if (data.conteudo) setConteudo(data.conteudo);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground">Carregando contrato...</p>
      </div>
    );
  }
  if (!plano || !conteudo) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Plano ou contrato não encontrado.</p>
        <Link href="/dashboard/planos">
          <Button variant="outline">Voltar aos planos</Button>
        </Link>
      </div>
    );
  }

  const planoLabel = plano.nome_plano.replace(/_/g, " ");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Voltar">
          <ArrowLeft className="size-4" />
        </Button>
        <Link href="/dashboard/planos">
          <Button variant="outline">Voltar aos planos</Button>
        </Link>
        <span className="text-sm text-muted-foreground capitalize">
          Prévia do contrato — Plano {planoLabel}
        </span>
      </div>

      <DocumentoContrato>
        <ContratoCorpoVisual
          conteudo={conteudo}
          nomePlano={plano.nome_plano}
          notaIdentificacao="(Em um contrato real, os dados do aluno aparecem aqui.)"
        />
      </DocumentoContrato>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Link href="/dashboard/planos">
          <Button variant="outline">
            <FileText className="size-4 mr-2" />
            Lista de planos
          </Button>
        </Link>
      </div>
    </div>
  );
}
