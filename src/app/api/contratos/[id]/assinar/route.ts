import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contratoId = parseInt(id, 10);
  if (Number.isNaN(contratoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  const contrato = await prisma.contrato.findUnique({ where: { id: contratoId } });
  if (!contrato) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
  
  // Verifica se o professor já assinou
  if (!contrato.assinatura_professor_url) {
    return NextResponse.json(
      { error: "O professor ainda não assinou este contrato." },
      { status: 400 }
    );
  }

  let assinaturaUrl: string | null = null;
  try {
    const body = await request.json();
    const signature = body?.signature as string | undefined;
    if (!signature || typeof signature !== "string" || !signature.startsWith("data:image/png;base64,")) {
      return NextResponse.json(
        { error: "Assinatura de próprio punho é obrigatória." },
        { status: 400 }
      );
    }
    const base64 = signature.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64, "base64");
    const dir = path.join(process.cwd(), "public", "contratos");
    await fs.mkdir(dir, { recursive: true });
    const fileName = `assinar-${contratoId}.png`;
    await fs.writeFile(path.join(dir, fileName), buffer);
    assinaturaUrl = `/contratos/${fileName}`;
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao processar assinatura." },
      { status: 400 }
    );
  }

  await prisma.contrato.update({
    where: { id: contratoId },
    data: {
      status: "assinado",
      assinatura_url: assinaturaUrl ?? undefined,
      data_assinatura: new Date(),
    },
  });
  return NextResponse.json({ ok: true });
}
