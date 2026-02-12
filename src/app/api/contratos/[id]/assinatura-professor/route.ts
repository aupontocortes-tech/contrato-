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

    // Buscar contrato com timeout para evitar conexões travadas
    let contrato;
    try {
      contrato = await Promise.race([
        prisma.contrato.findUnique({ where: { id: contratoId } }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout ao buscar contrato")), 10000)
        ),
      ]) as Awaited<ReturnType<typeof prisma.contrato.findUnique>>;
    } catch (dbError: any) {
      console.error("Erro ao buscar contrato:", dbError);
      if (dbError.message?.includes("MaxClientsInSessionMode") || dbError.message?.includes("max clients")) {
        return NextResponse.json(
          { error: "Muitas conexões simultâneas ao banco. Tente novamente em alguns segundos." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: "Erro ao conectar ao banco de dados. Tente novamente." },
        { status: 500 }
      );
    }
    
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

    // Atualizar banco de dados com timeout
    try {
      await Promise.race([
        prisma.contrato.update({
          where: { id: contratoId },
          data: {
            assinatura_professor_url: assinaturaUrl,
            data_assinatura_professor: new Date(),
            status: "professor_assinado",
          },
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout ao atualizar contrato")), 10000)
        ),
      ]);
    } catch (updateError: any) {
      console.error("Erro ao atualizar contrato:", updateError);
      if (updateError.message?.includes("MaxClientsInSessionMode") || updateError.message?.includes("max clients")) {
        return NextResponse.json(
          { error: "Muitas conexões simultâneas ao banco. Tente novamente em alguns segundos." },
          { status: 503 }
        );
      }
      throw updateError;
    }

    return NextResponse.json({ ok: true, assinatura_url: assinaturaUrl });
  } catch (error) {
    console.error("Erro ao salvar assinatura do professor:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    
    // Mensagem mais amigável para erro de conexões
    if (errorMessage.includes("MaxClientsInSessionMode") || errorMessage.includes("max clients")) {
      return NextResponse.json(
        { error: "Muitas conexões simultâneas ao banco de dados. Aguarde alguns segundos e tente novamente." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: `Erro ao salvar assinatura: ${errorMessage}` },
      { status: 500 }
    );
  }
}
