import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  isContratoAssinado,
  isContratoAtivo,
  isContratoPendente,
} from "@/lib/contrato-status";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [alunosCount, contratos] = await Promise.all([
      prisma.aluno.count(),
      prisma.contrato.findMany({
        select: {
          id: true,
          status: true,
          pdf_contrato_assinado_url: true,
          data_fim: true,
        },
      }),
    ]);

    let assinados = 0;
    let ativos = 0;
    let pendentes = 0;

    for (const c of contratos) {
      if (isContratoAssinado(c)) assinados++;
      if (isContratoAtivo(c)) ativos++;
      if (isContratoPendente(c)) pendentes++;
    }

    return NextResponse.json({
      totalAlunos: alunosCount,
      contratosAssinados: assinados,
      contratosAtivos: ativos,
      contratosPendentes: pendentes,
    });
  } catch (e) {
    console.error("GET /api/dashboard/resumo:", e);
    return NextResponse.json(
      { error: "Erro ao carregar resumo do dashboard." },
      { status: 503 }
    );
  }
}
