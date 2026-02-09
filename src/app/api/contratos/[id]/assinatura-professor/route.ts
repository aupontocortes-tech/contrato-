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
  if (!contrato) {
    return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
  }

  let assinaturaUrl: string | null = null;
  try {
    const body = await request.json();
    const assinatura = body?.assinatura as string | undefined;
    
    if (!assinatura || typeof assinatura !== "string") {
      return NextResponse.json(
        { error: "Assinatura é obrigatória." },
        { status: 400 }
      );
    }

    // Suporta data URL (base64) ou URL de imagem
    let base64: string;
    if (assinatura.startsWith("data:image")) {
      base64 = assinatura.replace(/^data:image\/[a-z]+;base64,/, "");
    } else if (assinatura.startsWith("http")) {
      // Se for uma URL, baixa a imagem
      const response = await fetch(assinatura);
      const buffer = await response.arrayBuffer();
      base64 = Buffer.from(buffer).toString("base64");
    } else {
      base64 = assinatura;
    }

    const buffer = Buffer.from(base64, "base64");
    const dir = path.join(process.cwd(), "public", "contratos");
    await fs.mkdir(dir, { recursive: true });
    const fileName = `professor-${contratoId}.png`;
    await fs.writeFile(path.join(dir, fileName), buffer);
    assinaturaUrl = `/contratos/${fileName}`;
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao processar assinatura do professor." },
      { status: 400 }
    );
  }

  // Atualiza o contrato com a assinatura do professor e muda status para "professor_assinado"
  await prisma.contrato.update({
    where: { id: contratoId },
    data: {
      assinatura_professor_url: assinaturaUrl,
      data_assinatura_professor: new Date(),
      status: "professor_assinado", // Novo status após professor assinar
    },
  });

  return NextResponse.json({ ok: true, assinatura_url: assinaturaUrl });
}
