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

    // Processar data URL (formato: data:image/png;base64,...)
    let base64: string;
    if (assinatura.startsWith("data:image")) {
      // Extrair base64 - suporta qualquer formato de imagem
      base64 = assinatura.replace(/^data:image\/[a-z]+;base64,/, "");
    } else {
      // Se não for data URL, assume que já é base64 puro
      base64 = assinatura;
    }

    if (!base64 || base64.trim().length === 0) {
      return NextResponse.json(
        { error: "Dados da imagem inválidos." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(base64, "base64");
    const dir = path.join(process.cwd(), "public", "contratos");
    await fs.mkdir(dir, { recursive: true });
    const fileName = `professor-${contratoId}.png`;
    await fs.writeFile(path.join(dir, fileName), buffer);
    assinaturaUrl = `/contratos/${fileName}`;
  } catch (e) {
    console.error("Erro ao processar assinatura do professor:", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("Detalhes do erro:", errorMessage);
    return NextResponse.json(
      { error: `Erro ao processar assinatura: ${errorMessage}` },
      { status: 400 }
    );
  }

  try {
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
    return NextResponse.json(
      { error: "Erro ao salvar assinatura. Verifique a conexão com o banco." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, assinatura_url: assinaturaUrl });
}
