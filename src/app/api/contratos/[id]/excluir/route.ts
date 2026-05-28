import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { codigoExclusaoValido } from "@/lib/codigo-exclusao";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contratoId = parseInt(id, 10);
  if (Number.isNaN(contratoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  let body: { codigo?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Envie o código de confirmação" }, { status: 400 });
  }

  const codigo = String(body?.codigo ?? "").trim();
  if (!codigoExclusaoValido(codigo)) {
    return NextResponse.json({ error: "Código incorreto. Contrato não excluído." }, { status: 403 });
  }

  try {
    await prisma.contrato.delete({ where: { id: contratoId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/contratos/[id]/excluir:", e);
    return NextResponse.json(
      { error: "Erro ao excluir contrato. Verifique a conexão com o banco." },
      { status: 500 }
    );
  }
}
