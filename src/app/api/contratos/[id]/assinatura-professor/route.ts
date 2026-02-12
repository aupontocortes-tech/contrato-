import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contratoId = parseInt(id, 10);
    
    if (Number.isNaN(contratoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Buscar contrato
    const contrato = await prisma.contrato.findUnique({ where: { id: contratoId } });
    if (!contrato) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    // Processar assinatura
    const body = await request.json();
    const assinatura = body?.assinatura as string | undefined;
    
    if (!assinatura || typeof assinatura !== "string") {
      return NextResponse.json(
        { error: "Assinatura é obrigatória." },
        { status: 400 }
      );
    }

    // Extrair base64
    let base64: string;
    if (assinatura.startsWith("data:image")) {
      base64 = assinatura.replace(/^data:image\/[a-z]+;base64,/, "");
    } else {
      base64 = assinatura;
    }

    if (!base64 || base64.trim().length === 0) {
      return NextResponse.json(
        { error: "Dados da imagem inválidos." },
        { status: 400 }
      );
    }

    // Salvar arquivo
    const buffer = Buffer.from(base64, "base64");
    const dir = path.join(process.cwd(), "public", "contratos");
    await fs.mkdir(dir, { recursive: true });
    const fileName = `professor-${contratoId}.png`;
    const filePath = path.join(dir, fileName);
    await fs.writeFile(filePath, buffer);
    const assinaturaUrl = `/contratos/${fileName}`;

    // Atualizar banco de dados
    await prisma.contrato.update({
      where: { id: contratoId },
      data: {
        assinatura_professor_url: assinaturaUrl,
        data_assinatura_professor: new Date(),
        status: "professor_assinado",
      },
    });

    return NextResponse.json({ ok: true, assinatura_url: assinaturaUrl });
  } catch (error) {
    console.error("Erro ao salvar assinatura do professor:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: `Erro ao salvar assinatura: ${errorMessage}` },
      { status: 500 }
    );
  }
}
