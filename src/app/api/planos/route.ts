import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Planos padrão (mesmos do seed) — usados quando o banco não está configurado ou está vazio
const PLANOS_FALLBACK = [
  { id: 1, nome_plano: "mensal", duracao_dias: 30, descricao: "Plano mensal" },
  { id: 2, nome_plano: "trimestral", duracao_dias: 90, descricao: "Plano trimestral" },
  { id: 3, nome_plano: "semestral", duracao_dias: 180, descricao: "Plano semestral" },
  { id: 4, nome_plano: "anual", duracao_dias: 365, descricao: "Plano anual" },
  { id: 5, nome_plano: "consultoria_online", duracao_dias: 365, descricao: "Consultoria online" },
];

export async function GET() {
  try {
    const list = await prisma.plano.findMany({ orderBy: { id: "asc" } });
    if (list.length > 0) return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/planos:", e);
    // Banco não configurado ou indisponível — retorna fallback para não quebrar o frontend
  }
  return NextResponse.json(PLANOS_FALLBACK);
}
