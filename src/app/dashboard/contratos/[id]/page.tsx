"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DocumentoContrato } from "@/components/DocumentoContrato";
import { ArrowLeft, FileText, Download } from "lucide-react";

type ContratoEstruturado = {
  titulo: string;
  logoPlaceholder: string;
  contratadaNome: string;
  contratadaTitulo: string;
  identificacaoTexto: string;
  nomeContratante: string;
  cpfContratante: string;
  clausulas: Array<{ numero: string; titulo: string; texto: string }>;
  assinaturaContratada: string;
  assinaturaContratante: string;
};

type ContratoInfo = {
  id: number;
  status: string;
  pdf_url: string | null;
  link_assinatura: string | null;
  assinatura_url: string | null;
  data_assinatura: string | null;
  aluno: { nome_completo: string; cpf: string };
  plano: { nome_plano: string };
};

function formatarData(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return "____/____/________";
  }
}

export default function VerContratoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [contrato, setContrato] = useState<ContratoInfo | null>(null);
  const [conteudo, setConteudo] = useState<ContratoEstruturado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/contratos/${id}/conteudo`)
      .then((r) => r.json())
      .then((data) => {
        if (data.contrato) setContrato(data.contrato);
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
  if (!contrato || !conteudo) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Contrato não encontrado.</p>
        <Link href="/dashboard/contratos">
          <Button variant="outline">Voltar aos contratos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Voltar">
          <ArrowLeft className="size-4" />
        </Button>
        <Link href="/dashboard/contratos">
          <Button variant="outline">Voltar aos contratos</Button>
        </Link>
        {contrato.pdf_url && (
          <a href={contrato.pdf_url} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">
              <Download className="size-4 mr-2" />
              Baixar PDF
            </Button>
          </a>
        )}
      </div>

      <DocumentoContrato>
          {/* Título em duas linhas com traço, estilo formal */}
          <h1 className="text-xl md:text-2xl font-bold text-center leading-tight uppercase tracking-tight text-neutral-900">
            {conteudo.titulo.replace(/\s+DE\s+PERSONAL\s+TRAINER$/i, "").trim()}
            <br />
            <span className="text-lg md:text-xl">DE PERSONAL TRAINER</span>
          </h1>
          <p className="text-center mt-6 mb-8" aria-hidden> </p>

          {/* Identificação das partes */}
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
          </section>

          {/* Cláusulas */}
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

          {/* Assinaturas — sem linha em cima; data e assinaturas quando assinado */}
          <div className="mt-12 pt-8 grid grid-cols-2 gap-8">
            <div className="text-center">
              {/* Coloque a assinatura da Natália em public/assinatura-contratada.png para aparecer em contratos assinados */}
              {contrato.status === "assinado" ? (
                <img src="/assinatura-contratada.png" alt="Assinatura Contratada" className="mx-auto h-14 w-auto object-contain mb-2" />
              ) : (
                <div className="border-b border-neutral-400 pb-1 mb-2 min-h-[2rem]" />
              )}
              <p className="text-sm font-medium">{conteudo.assinaturaContratada}</p>
              <p className="text-xs text-neutral-500 uppercase">Contratada</p>
              <p className="text-xs text-neutral-500 mt-1">Data: {contrato.status === "assinado" && contrato.data_assinatura ? formatarData(contrato.data_assinatura) : "____/____/________"}</p>
            </div>
            <div className="text-center">
              {contrato.status === "assinado" && contrato.assinatura_url ? (
                <img src={contrato.assinatura_url} alt="Assinatura do aluno" className="mx-auto h-14 w-auto object-contain mb-2" />
              ) : (
                <div className="border-b border-neutral-400 pb-1 mb-2 min-h-[2rem]" />
              )}
              <p className="text-sm font-medium">{conteudo.assinaturaContratante}</p>
              <p className="text-xs text-neutral-500 uppercase">Contratante</p>
              <p className="text-xs text-neutral-500 mt-1">Data: {contrato.status === "assinado" && contrato.data_assinatura ? formatarData(contrato.data_assinatura) : "____/____/________"}</p>
            </div>
          </div>
      </DocumentoContrato>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Link href="/dashboard/contratos">
          <Button variant="outline">
            <FileText className="size-4 mr-2" />
            Lista de contratos
          </Button>
        </Link>
      </div>
    </div>
  );
}
