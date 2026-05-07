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

    // Verifica se o professor já assinou
    if (!contrato.assinatura_professor_url) {
      return NextResponse.json(
        { error: "O professor ainda não assinou este contrato." },
        { status: 400 }
      );
    }

    // Processar assinatura
    const body = await request.json();
    const signature = body?.signature as string | undefined;
    const signedPdf = body?.signed_pdf as string | undefined;
    const signedPdfName = body?.signed_pdf_name as string | undefined;
    const method = body?.method as "gov" | "manual" | undefined;

    const isGovFlow = method === "gov";

    if (isGovFlow) {
      if (!signedPdf || typeof signedPdf !== "string") {
        return NextResponse.json(
          { error: "PDF assinado no GOV é obrigatório." },
          { status: 400 }
        );
      }
      if (!signedPdf.startsWith("data:application/pdf")) {
        return NextResponse.json(
          { error: "Formato inválido. Envie um arquivo PDF assinado." },
          { status: 400 }
        );
      }
    } else if (!signature || typeof signature !== "string") {
      return NextResponse.json(
        { error: "Assinatura de próprio punho é obrigatória." },
        { status: 400 }
      );
    }
    if (!isGovFlow && !signature!.startsWith("data:image")) {
      return NextResponse.json(
        { error: "Formato de assinatura inválido." },
        { status: 400 }
      );
    }

    let assinaturaUrl: string | null = null;
    let pdfUrl: string | null = contrato.pdf_url ?? null;

    if (isGovFlow) {
      // Salva PDF assinado enviado pelo aluno
      const pdfBase64 = signedPdf!.replace(/^data:application\/pdf;base64,/, "");
      if (!pdfBase64 || pdfBase64.trim().length === 0) {
        return NextResponse.json(
          { error: "Dados do PDF inválidos." },
          { status: 400 }
        );
      }

      const pdfBuffer = Buffer.from(pdfBase64, "base64");
      const safeName = (signedPdfName || "").replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileName = safeName
        ? `assinado-gov-${contratoId}-${safeName}`
        : `assinado-gov-${contratoId}.pdf`;

      const publicDir = path.join(process.cwd(), "public", "contratos");
      const publicPath = path.join(publicDir, fileName);

      try {
        await fs.mkdir(publicDir, { recursive: true });
        await fs.writeFile(publicPath, pdfBuffer);
        pdfUrl = `/contratos/${fileName}`;
      } catch (error: any) {
        console.error("Erro ao salvar PDF assinado em public:", error);
        pdfUrl = signedPdf!;
      }
    } else {
      // Fluxo manual: salva assinatura em imagem para compor PDF assinado
      const base64 = signature!.replace(/^data:image\/[a-z]+;base64,/, "");
      if (!base64 || base64.trim().length === 0) {
        return NextResponse.json(
          { error: "Dados da imagem inválidos." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(base64, "base64");
      const fileName = `assinar-${contratoId}.png`;
      const publicDir = path.join(process.cwd(), "public", "contratos");
      const publicPath = path.join(publicDir, fileName);

      try {
        // Tentar criar diretório e salvar em public (funciona em desenvolvimento)
        await fs.mkdir(publicDir, { recursive: true });
        await fs.writeFile(publicPath, buffer);
        assinaturaUrl = `/contratos/${fileName}`;
      } catch (error: any) {
        // Se falhar, pode ser ambiente serverless (Vercel)
        // Em produção, salvar a assinatura como data URL no banco
        console.error("Erro ao salvar em public:", error);
        assinaturaUrl = signature!;
      }
    }

    // Atualizar banco de dados com timeout
    try {
      await Promise.race([
        prisma.contrato.update({
          where: { id: contratoId },
          data: {
            status: "assinado",
            assinatura_url: assinaturaUrl ?? contrato.assinatura_url ?? null,
            pdf_url: pdfUrl,
            data_assinatura: new Date(),
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
    console.error("Erro ao salvar assinatura do aluno:", error);
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
