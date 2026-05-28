import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getContratoEstruturado } from "@/lib/contrato-template";
import { isConsultoriaOnlinePlano, PLANOS_FALLBACK } from "@/lib/planos";

export const dynamic = "force-dynamic";

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

  let plano: { id: number; nome_plano: string; duracao_dias: number } | null = null;
  try {
    plano = await prisma.plano.findUnique({ where: { id: planoId } });
  } catch {
    plano = PLANOS_FALLBACK.find((p) => p.id === planoId) ?? null;
  }
  if (!plano) {
    const fallback = PLANOS_FALLBACK.find((p) => p.id === planoId);
    if (fallback) plano = fallback;
  }
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

  return NextResponse.json(
    {
      plano: { id: plano.id, nome_plano: plano.nome_plano, duracao_dias: plano.duracao_dias },
      conteudo,
      consultoriaOnline: isConsultoriaOnlinePlano(plano.nome_plano),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
