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
  if (body.status === "assinado") {
    await prisma.contrato.update({
      where: { id: contratoId },
      data: { status: "assinado" },
    });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Status inválido" }, { status: 400 });
}
