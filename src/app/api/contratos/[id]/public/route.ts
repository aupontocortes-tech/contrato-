import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      select: {
        id: true,
        status: true,
        aluno: { select: { nome_completo: true } },
        plano: { select: { nome_plano: true } },
      },
    });
  } catch (e) {
    console.error("GET /api/contratos/[id]/public:", e);
    return NextResponse.json(
      { error: "Não foi possível conectar ao banco. Verifique DATABASE_URL." },
      { status: 500 }
    );
  }
  if (!contrato) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
  return NextResponse.json(contrato);
}
