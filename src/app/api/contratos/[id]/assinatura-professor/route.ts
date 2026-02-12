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

  let contrato: Awaited<ReturnType<typeof prisma.contrato.findUnique>>;
  try {
    contrato = await prisma.contrato.findUnique({ where: { id: contratoId } });
  } catch (e) {
    console.error("POST /api/contratos/[id]/assinatura-professor:", e);
    return NextResponse.json(
      { error: "Não foi possível conectar ao banco. Verifique DATABASE_URL." },
      { status: 500 }
    );
  }
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
      // Extrair base64 de data URL
      const base64Match = assinatura.match(/^data:image\/[a-z]+;base64,(.+)$/);
      if (!base64Match || !base64Match[1]) {
        console.error("Formato de data URL inválido");
        return NextResponse.json(
          { error: "Formato de imagem inválido." },
          { status: 400 }
        );
      }
      base64 = base64Match[1];
    } else if (assinatura.startsWith("http")) {
      // Se for uma URL, baixa a imagem
      try {
        const response = await fetch(assinatura);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        base64 = Buffer.from(buffer).toString("base64");
      } catch (fetchError) {
        console.error("Erro ao baixar imagem:", fetchError);
        return NextResponse.json(
          { error: "Erro ao baixar imagem da URL." },
          { status: 400 }
        );
      }
    } else {
      // Assume que já é base64 puro
      base64 = assinatura;
    }

    // Validar base64
    if (!base64 || base64.length === 0) {
      console.error("Base64 vazio ou inválido");
      return NextResponse.json(
        { error: "Dados da imagem inválidos." },
        { status: 400 }
      );
    }

    let buffer: Buffer;
    try {
      buffer = Buffer.from(base64, "base64");
      // Validar se o buffer é válido (tamanho mínimo para PNG)
      if (buffer.length < 100) {
        throw new Error("Buffer muito pequeno para ser uma imagem válida");
      }
    } catch (bufferError) {
      console.error("Erro ao converter base64 para buffer:", bufferError);
      return NextResponse.json(
        { error: "Erro ao processar dados da imagem." },
        { status: 400 }
      );
    }

    // Criar diretório e salvar arquivo
    try {
      const dir = path.join(process.cwd(), "public", "contratos");
      await fs.mkdir(dir, { recursive: true });
      const fileName = `professor-${contratoId}.png`;
      const filePath = path.join(dir, fileName);
      await fs.writeFile(filePath, buffer);
      assinaturaUrl = `/contratos/${fileName}`;
    } catch (fileError) {
      console.error("Erro ao salvar arquivo:", fileError);
      return NextResponse.json(
        { error: "Erro ao salvar arquivo da assinatura." },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error("Erro geral ao processar assinatura:", e);
    return NextResponse.json(
      { error: "Erro ao processar assinatura do professor." },
      { status: 400 }
    );
  }

  try {
    if (!assinaturaUrl) {
      return NextResponse.json(
        { error: "URL da assinatura não foi gerada." },
        { status: 500 }
      );
    }

    await prisma.contrato.update({
      where: { id: contratoId },
      data: {
        assinatura_professor_url: assinaturaUrl,
        data_assinatura_professor: new Date(),
        status: "professor_assinado",
      },
    });
  } catch (e) {
    console.error("POST /api/contratos/[id]/assinatura-professor (update):", e);
    const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
    console.error("Detalhes do erro:", errorMessage);
    return NextResponse.json(
      { error: `Erro ao salvar no banco: ${errorMessage}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, assinatura_url: assinaturaUrl });
}
