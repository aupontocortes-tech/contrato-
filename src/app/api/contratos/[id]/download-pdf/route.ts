import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getContratoEstruturado } from "@/lib/contrato-template";
import { gerarPdfAssinado, gerarPdfFromContrato } from "@/lib/gerar-pdf";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contratoId = parseInt(id, 10);
    if (Number.isNaN(contratoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Buscar contrato com assinaturas
    const contrato = await prisma.contrato.findUnique({
      where: { id: contratoId },
      include: { aluno: true, plano: true },
    });

    if (!contrato) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    const urlArquivo =
      contrato.pdf_contrato_assinado_url ?? contrato.pdf_url;

    if (urlArquivo) {
      if (urlArquivo.startsWith("data:application/pdf")) {
        const base64 = urlArquivo.replace(/^data:application\/pdf;base64,/, "");
        const pdfBuffer = Buffer.from(base64, "base64");
        return new NextResponse(Buffer.from(pdfBuffer), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="contrato-${contratoId}.pdf"`,
          },
        });
      }

      if (urlArquivo.startsWith("/")) {
        const filePath = path.join(process.cwd(), "public", urlArquivo.replace(/^\//, ""));
        try {
          const pdfBuffer = await fs.readFile(filePath);
          return new NextResponse(Buffer.from(pdfBuffer), {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="contrato-${contratoId}.pdf"`,
            },
          });
        } catch {
          // continua para geração
        }
      }
    }

    // Preparar dados do contrato
    const contratoParams = {
      nomeAluno: contrato.aluno.nome_completo,
      cpf: contrato.aluno.cpf,
      email: contrato.aluno.email,
      telefone: contrato.aluno.telefone,
      nomePlano: contrato.plano.nome_plano,
      duracaoDias: contrato.plano.duracao_dias,
      dataInicio: contrato.data_inicio,
      dataFim: contrato.data_fim,
    };
    const contratoEstruturado = getContratoEstruturado(contratoParams);

    // Se ainda não estiver assinado, retorna o PDF base do contrato
    if (contrato.status !== "assinado") {
      const pdfBuffer = await gerarPdfFromContrato(contratoEstruturado);
      return new NextResponse(Buffer.from(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="contrato-${contratoId}.pdf"`,
        },
      });
    }

    // Converter datas (Prisma retorna Date) para string para gerarPdfAssinado
    const dataProfessor =
      contrato.data_assinatura_professor instanceof Date
        ? contrato.data_assinatura_professor.toISOString()
        : contrato.data_assinatura_professor;
    const dataAluno =
      contrato.data_assinatura instanceof Date
        ? contrato.data_assinatura.toISOString()
        : contrato.data_assinatura;

    // Gerar PDF com assinaturas
    const pdfBuffer = await gerarPdfAssinado(
      contratoEstruturado,
      contrato.assinatura_professor_url,
      dataProfessor,
      contrato.assinatura_url,
      dataAluno
    );

    // Retornar PDF como resposta (Buffer é BodyInit válido; Uint8Array não no tipo do NextResponse)
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contrato-${contratoId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar PDF assinado:", error);
    return NextResponse.json(
      { error: "Erro ao gerar PDF. Tente novamente." },
      { status: 500 }
    );
  }
}
