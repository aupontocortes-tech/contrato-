import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getContratoEstruturado } from "@/lib/contrato-template";

const PLACEHOLDER_NOME = "______________________________________________";
const PLACEHOLDER_CPF = "______________________________";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const planoId = parseInt(id, 10);
  if (Number.isNaN(planoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const plano = await prisma.plano.findUnique({ where: { id: planoId } });
  if (!plano) return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });

  const dataInicio = new Date();
  const dataFim = new Date(dataInicio);
  dataFim.setDate(dataFim.getDate() + plano.duracao_dias);

  const conteudo = getContratoEstruturado({
    nomeAluno: PLACEHOLDER_NOME,
    cpf: PLACEHOLDER_CPF,
    email: "",
    telefone: null,
    nomePlano: plano.nome_plano,
    duracaoDias: plano.duracao_dias,
    dataInicio,
    dataFim,
  });

  return NextResponse.json({
    plano: { id: plano.id, nome_plano: plano.nome_plano, duracao_dias: plano.duracao_dias },
    conteudo,
  });
}
