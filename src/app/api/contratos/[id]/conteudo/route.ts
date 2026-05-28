import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getContratoEstruturado } from "@/lib/contrato-template";
import { cpfParaExibicao } from "@/lib/cpf-aluno";

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
    console.error("GET /api/contratos/[id]/conteudo:", e);
    return NextResponse.json(
      { error: "Não foi possível conectar ao banco. Verifique DATABASE_URL." },
      { status: 500 }
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
      assinatura_professor_url: contrato.assinatura_professor_url,
      data_assinatura_professor: contrato.data_assinatura_professor?.toISOString() ?? null,
      aluno: contrato.aluno,
      plano: contrato.plano,
    },
    conteudo,
  });
}
