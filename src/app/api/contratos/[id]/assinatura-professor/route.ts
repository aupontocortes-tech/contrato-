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
    // Em Vercel (serverless), /public é somente leitura em runtime
    // Vamos tentar salvar em /tmp (gravável) ou /public/contratos (se existir)
    const buffer = Buffer.from(base64, "base64");
    const fileName = `professor-${contratoId}.png`;
    
    // Tentar salvar em /public/contratos primeiro (desenvolvimento)
    let assinaturaUrl: string;
    const publicDir = path.join(process.cwd(), "public", "contratos");
    const publicPath = path.join(publicDir, fileName);
    
    try {
      // Tentar criar diretório e salvar em public (funciona em desenvolvimento)
      await fs.mkdir(publicDir, { recursive: true });
      await fs.writeFile(publicPath, buffer);
      assinaturaUrl = `/contratos/${fileName}`;
    } catch (error: any) {
      // Se falhar, pode ser ambiente serverless (Vercel)
      // Em produção, vamos salvar a assinatura como data URL no banco
      console.error("Erro ao salvar em public:", error);
      
      // Salvar como data URL diretamente no banco (solução para Vercel)
      // Usar a assinatura original (data URL) como URL
      assinaturaUrl = assinatura; // Usar o data URL completo como URL
    }

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
