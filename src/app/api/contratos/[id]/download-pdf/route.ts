import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getContratoEstruturado } from "@/lib/contrato-template";
import { gerarPdfAssinado } from "@/lib/gerar-pdf";

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

    // Verificar se o contrato está assinado
    if (contrato.status !== "assinado") {
      return NextResponse.json(
        { error: "Contrato ainda não foi assinado" },
        { status: 400 }
      );
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
