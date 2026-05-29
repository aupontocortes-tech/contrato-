/** Evita enviar PDFs/imagens em base64 na listagem (quebra o app no celular). */

import type { Aluno, Contrato, Plano } from "@prisma/client";

export type ContratoComAlunoPlano = Contrato & {
  aluno: Aluno;
  plano: Plano;
};

function isDataUrl(value: string): boolean {
  return value.startsWith("data:");
}

/** Substitui blobs grandes por URLs da API; mantém caminhos curtos (/contratos/1.pdf). */
function urlLeve(
  value: string | null | undefined,
  apiPath: string
): string | null {
  if (!value) return null;
  if (isDataUrl(value) || value.length > 2048) return apiPath;
  return value;
}

export function serializeContratoParaLista(c: ContratoComAlunoPlano) {
  const base = `/api/contratos/${c.id}`;
  return {
    id: c.id,
    aluno_id: c.aluno_id,
    plano_id: c.plano_id,
    status: c.status,
    data_inicio: c.data_inicio,
    data_fim: c.data_fim,
    link_assinatura: c.link_assinatura,
    criado_em: c.criado_em,
    data_assinatura: c.data_assinatura,
    data_assinatura_professor: c.data_assinatura_professor,
    pdf_url: urlLeve(c.pdf_url, `${base}/download-pdf`),
    pdf_contrato_assinado_url: urlLeve(
      c.pdf_contrato_assinado_url,
      `${base}/download-pdf`
    ),
    assinatura_professor_url: urlLeve(
      c.assinatura_professor_url,
      `${base}/assinatura-professor/imagem`
    ),
    assinatura_url: urlLeve(c.assinatura_url, `${base}/assinatura-aluno/imagem`),
    aluno: c.aluno,
    plano: c.plano,
  };
}
