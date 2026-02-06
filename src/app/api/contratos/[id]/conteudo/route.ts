import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getContratoEstruturado } from "@/lib/contrato-template";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contratoId = parseInt(id, 10);
  if (Number.isNaN(contratoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const contrato = await prisma.contrato.findUnique({
    where: { id: contratoId },
    include: { aluno: true, plano: true },
  });
  if (!contrato) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });

  const conteudo = getContratoEstruturado({
    nomeAluno: contrato.aluno.nome_completo,
    cpf: contrato.aluno.cpf,
    email: contrato.aluno.email,
    telefone: contrato.aluno.telefone,
    nomePlano: contrato.plano.nome_plano,
    duracaoDias: contrato.plano.duracao_dias,
    dataInicio: contrato.data_inicio,
    dataFim: contrato.data_fim,
  });

  return NextResponse.json({
    contrato: {
      id: contrato.id,
      status: contrato.status,
      data_inicio: contrato.data_inicio,
      data_fim: contrato.data_fim,
      pdf_url: contrato.pdf_url,
      link_assinatura: contrato.link_assinatura,
      assinatura_url: contrato.assinatura_url,
      data_assinatura: contrato.data_assinatura?.toISOString() ?? null,
      aluno: contrato.aluno,
      plano: contrato.plano,
    },
    conteudo,
  });
}
