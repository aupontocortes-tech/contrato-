import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getContratoEstruturado } from "@/lib/contrato-template";
import { gerarPdfFromContrato } from "@/lib/gerar-pdf";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contratoId = parseInt(id, 10);
  if (Number.isNaN(contratoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const contrato = await prisma.contrato.findUnique({
    where: { id: contratoId },
    include: { aluno: true, plano: true },
  });
  if (!contrato) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });

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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const linkAssinatura = `${baseUrl}/assinar/${contratoId}`;

  let pdfUrl: string | null = null;
  try {
    const buffer = await gerarPdfFromContrato(contratoEstruturado);
    const dir = path.join(process.cwd(), "public", "contratos");
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, `${contratoId}.pdf`);
    await fs.writeFile(filePath, Buffer.from(buffer));
    pdfUrl = `/contratos/${contratoId}.pdf`;
  } catch (e) {
    console.error("Erro ao gerar PDF:", e);
  }

  await prisma.contrato.update({
    where: { id: contratoId },
    data: {
      status: "enviado",
      link_assinatura: linkAssinatura,
      pdf_url: pdfUrl ?? undefined,
    },
  });

  return NextResponse.json({
    ok: true,
    link_assinatura: linkAssinatura,
    pdf_url: pdfUrl,
  });
}
