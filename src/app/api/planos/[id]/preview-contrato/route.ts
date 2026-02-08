import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getContratoEstruturado } from "@/lib/contrato-template";

export const dynamic = "force-dynamic";

const PLACEHOLDER_NOME = "______________________________________________";
const PLACEHOLDER_CPF = "______________________________";

const PLANOS_FALLBACK: { id: number; nome_plano: string; duracao_dias: number }[] = [
  { id: 1, nome_plano: "mensal", duracao_dias: 30 },
  { id: 2, nome_plano: "trimestral", duracao_dias: 90 },
  { id: 3, nome_plano: "semestral", duracao_dias: 180 },
  { id: 4, nome_plano: "anual", duracao_dias: 365 },
  { id: 5, nome_plano: "consultoria_online", duracao_dias: 365 },
];

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
    // Banco indisponível: usar fallback se o id for 1–5
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

  // Forçar contrato do PDF quando for Consultoria Online (por id 5 ou nome)
  const nomeLower = plano.nome_plano.toLowerCase();
  const ehConsultoriaOnline =
    planoId === 5 ||
    (nomeLower.includes("consultoria") && nomeLower.includes("online"));

  const conteudo = getContratoEstruturado({
    nomeAluno: PLACEHOLDER_NOME,
    cpf: PLACEHOLDER_CPF,
    email: "",
    telefone: null,
    nomePlano: ehConsultoriaOnline ? "consultoria online" : plano.nome_plano,
    duracaoDias: plano.duracao_dias,
    dataInicio,
    dataFim,
  });

  return NextResponse.json(
    {
      plano: { id: plano.id, nome_plano: plano.nome_plano, duracao_dias: plano.duracao_dias },
      conteudo,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
