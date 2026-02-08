"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DocumentoContrato } from "@/components/DocumentoContrato";
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
          <h1 className="text-xl md:text-2xl font-bold text-center leading-tight uppercase tracking-tight text-neutral-900">
            {conteudo.titulo === "CONTRATO DE CONSULTORIA ONLINE" ? (
              <>
                {conteudo.titulo}
                <br />
                <span className="text-lg md:text-xl font-normal normal-case">Prestação de Serviços de Personal Trainer</span>
              </>
            ) : (
              <>
                {conteudo.titulo.replace(/\s+DE\s+PERSONAL\s+TRAINER$/i, "").trim()}
                <br />
                <span className="text-lg md:text-xl">DE PERSONAL TRAINER</span>
              </>
            )}
          </h1>
          <p className="text-center mt-6 mb-8" aria-hidden> </p>

          <section className="mb-8 text-left">
            <h2 className="text-sm font-bold uppercase tracking-wide mb-4 text-left text-neutral-800">
              Identificação das partes
            </h2>
            <p className="text-sm leading-relaxed mb-4 text-neutral-700">
              {conteudo.identificacaoTexto}
            </p>
            <p className="text-sm text-neutral-800">
              <strong className="font-semibold">Nome completo:</strong> {conteudo.nomeContratante}
            </p>
            <p className="text-sm text-neutral-800">
              <strong className="font-semibold">CPF:</strong> {conteudo.cpfContratante}
            </p>
            {(conteudo.titulo === "CONTRATO DE CONSULTORIA ONLINE" || conteudo.telefone != null || conteudo.email != null) && (
              <>
                {(conteudo.titulo === "CONTRATO DE CONSULTORIA ONLINE" || conteudo.telefone != null) && (
                  <p className="text-sm text-neutral-800">
                    <strong className="font-semibold">Telefone:</strong> {conteudo.telefone || "__________________________"}
                  </p>
                )}
                {(conteudo.titulo === "CONTRATO DE CONSULTORIA ONLINE" || conteudo.email != null) && (
                  <p className="text-sm text-neutral-800">
                    <strong className="font-semibold">E-mail:</strong> {conteudo.email || "_____________________________"}
                  </p>
                )}
              </>
            )}
            <p className="text-xs text-neutral-500 mt-2">
              (Em um contrato real, os dados do aluno aparecem aqui.)
            </p>
          </section>

          <div className="space-y-6 text-left">
            {conteudo.clausulas.map((cl) => (
              <section key={cl.numero}>
                <h3 className="text-sm font-bold uppercase tracking-wide mb-2 text-neutral-800">
                  Cláusula {cl.numero} – {cl.titulo}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-700">{cl.texto}</p>
              </section>
            ))}
          </div>

          {conteudo.blocoAssinaturaDigital != null && conteudo.blocoAssinaturaDigital !== "" && (
            <div className="mt-10 pt-6 space-y-3 whitespace-pre-line text-sm text-neutral-700">
              {conteudo.blocoAssinaturaDigital.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
              <p className="pt-2">Assinatura do(a) CONTRATANTE: ________________________________</p>
              <p>Assinatura da CONTRATADA: _________________________________</p>
            </div>
          )}

          <div className="mt-12 pt-8 grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="border-b border-neutral-400 pb-1 mb-2 min-h-[2rem]" />
              <p className="text-sm font-medium">{conteudo.assinaturaContratada}</p>
              <p className="text-xs text-neutral-500 uppercase">Contratada</p>
              <p className="text-xs text-neutral-500 mt-1">Data: ____/____/________</p>
            </div>
            <div className="text-center">
              <div className="border-b border-neutral-400 pb-1 mb-2 min-h-[2rem]" />
              <p className="text-sm font-medium">{conteudo.assinaturaContratante}</p>
              <p className="text-xs text-neutral-500 uppercase">Contratante</p>
              <p className="text-xs text-neutral-500 mt-1">Data: ____/____/________</p>
            </div>
          </div>
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
