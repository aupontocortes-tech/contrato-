import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getContratoEstruturado } from "@/lib/contrato-template";
import { cpfParaExibicao } from "@/lib/cpf-aluno";

/** Conteúdo completo do contrato para exibição na página pública de assinatura (sem auth). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contratoId = parseInt(id, 10);
  if (Number.isNaN(contratoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  let contrato;
  try {
    contrato = await prisma.contrato.findUnique({
      where: { id: contratoId },
      include: { aluno: true, plano: true },
    });
  } catch (e) {
    console.error("GET /api/contratos/[id]/public-conteudo:", e);
    return NextResponse.json(
      { error: "Serviço temporariamente indisponível. Tente novamente em alguns minutos." },
      { status: 503 }
    );
  }
  if (!contrato) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });

  const conteudo = getContratoEstruturado({
    nomeAluno: contrato.aluno.nome_completo,
    cpf: cpfParaExibicao(contrato.aluno),
    email: contrato.aluno.email,
    telefone: contrato.aluno.telefone,
    nomePlano: contrato.plano.nome_plano,
    duracaoDias: contrato.plano.duracao_dias,
    dataInicio: contrato.data_inicio,
    dataFim: contrato.data_fim,
  });

  const arquivoCompleto = !!contrato.pdf_contrato_assinado_url;

  return NextResponse.json({
    contrato: {
      id: contrato.id,
      status: arquivoCompleto ? "assinado" : contrato.status,
      assinatura_professor_url: contrato.assinatura_professor_url,
      pdf_contrato_assinado_url: contrato.pdf_contrato_assinado_url,
      aluno: { nome_completo: contrato.aluno.nome_completo },
      plano: { nome_plano: contrato.plano.nome_plano },
    },
    conteudo,
  });
}
