import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contratoId = parseInt(id, 10);
  if (Number.isNaN(contratoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const body = await request.json();
  if (body.status !== "assinado") {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }
  try {
    await prisma.contrato.update({
      where: { id: contratoId },
      data: { status: "assinado" },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/contratos/[id]:", e);
    const msg =
      e && typeof e === "object" && "message" in e && String((e as { message: unknown }).message).toLowerCase().includes("auth")
        ? "Falha de autenticação no banco. Verifique DATABASE_URL."
        : "Erro ao atualizar contrato. Verifique a conexão com o banco.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
