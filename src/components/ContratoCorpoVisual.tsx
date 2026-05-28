"use client";

import type { ReactNode } from "react";
import {
  isContratoConsultoriaOnlineByTitulo,
  isConsultoriaOnline,
  rotuloClausula,
} from "@/lib/contrato-template";

export type ContratoCorpoProps = {
  conteudo: {
    titulo: string;
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
  /** Nome do plano (prévia por plano); se omitido, detecta pelo título. */
  nomePlano?: string;
  tituloClassName?: string;
  compact?: boolean;
  notaIdentificacao?: string;
  childrenAfterClausulas?: ReactNode;
  blocoAssinaturaExtra?: ReactNode;
  /** Oculta o grid padrão de assinaturas (ex.: tela de assinatura do aluno). */
  hideAssinaturasGrid?: boolean;
};

export function ContratoCorpoVisual({
  conteudo,
  nomePlano,
  tituloClassName = "text-xl md:text-2xl font-bold text-center leading-tight uppercase tracking-tight text-neutral-900",
  compact = false,
  notaIdentificacao,
  childrenAfterClausulas,
  blocoAssinaturaExtra,
  hideAssinaturasGrid = false,
}: ContratoCorpoProps) {
  const consultoriaOnline =
    (nomePlano && isConsultoriaOnline(nomePlano)) ||
    isContratoConsultoriaOnlineByTitulo(conteudo.titulo);

  return (
    <>
      <h1 className={tituloClassName}>
        {consultoriaOnline ? (
          conteudo.titulo
        ) : conteudo.titulo.includes("\n") ? (
          conteudo.titulo.split("\n").map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))
        ) : (
          <>
            {conteudo.titulo.replace(/\s+DE\s+PERSONAL\s+TRAINER$/i, "").trim()}
            <br />
            <span className={compact ? "text-base md:text-lg" : "text-lg md:text-xl"}>
              DE PERSONAL TRAINER
            </span>
          </>
        )}
      </h1>
      <p className={compact ? "text-center mt-4 mb-6" : "text-center mt-6 mb-8"} aria-hidden>
        {" "}
      </p>

      <section className={compact ? "mb-6 text-left" : "mb-8 text-left"}>
        <h2
          className={`text-sm font-bold uppercase tracking-wide text-left text-neutral-800 ${
            compact ? "mb-3" : "mb-4"
          }`}
        >
          Identificação das partes
        </h2>
        <p className={`text-sm leading-relaxed text-neutral-700 ${compact ? "mb-3" : "mb-4"}`}>
          {conteudo.identificacaoTexto}
        </p>
        <p className="text-sm text-neutral-800">
          <strong className="font-semibold">Nome completo:</strong> {conteudo.nomeContratante}
        </p>
        <p className="text-sm text-neutral-800">
          <strong className="font-semibold">CPF:</strong> {conteudo.cpfContratante}
        </p>
        {(consultoriaOnline || conteudo.telefone) && (
          <p className="text-sm text-neutral-800">
            <strong className="font-semibold">Telefone:</strong>{" "}
            {conteudo.telefone || "__________________________"}
          </p>
        )}
        {(consultoriaOnline || conteudo.email) && (
          <p className="text-sm text-neutral-800">
            <strong className="font-semibold">E-mail:</strong>{" "}
            {conteudo.email || "_____________________________"}
          </p>
        )}
        {notaIdentificacao && (
          <p className="text-xs text-neutral-500 mt-2">{notaIdentificacao}</p>
        )}
      </section>

      <div className={compact ? "space-y-4 text-left" : "space-y-6 text-left"}>
        {conteudo.clausulas.map((cl) => (
          <section key={cl.numero}>
            <h3
              className={`text-sm font-bold uppercase tracking-wide text-neutral-800 ${
                compact ? "mb-1" : "mb-2"
              }`}
            >
              {rotuloClausula(cl.numero, cl.titulo, conteudo.titulo)}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-700">{cl.texto}</p>
          </section>
        ))}
      </div>

      {childrenAfterClausulas}

      {conteudo.blocoAssinaturaDigital != null && conteudo.blocoAssinaturaDigital !== "" && (
        <div
          className={`whitespace-pre-line text-sm text-neutral-700 ${
            compact ? "mt-6 pt-4 space-y-2" : "mt-10 pt-6 space-y-3"
          }`}
        >
          {conteudo.blocoAssinaturaDigital.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          {blocoAssinaturaExtra}
        </div>
      )}

      {!hideAssinaturasGrid && (
        <div className={compact ? "mt-8 pt-6 grid grid-cols-2 gap-6" : "mt-12 pt-8 grid grid-cols-2 gap-8"}>
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
      )}
    </>
  );
}
