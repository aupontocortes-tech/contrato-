import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getContratoEstruturado } from "@/lib/contrato-template";
import { gerarPdfFromContrato } from "@/lib/gerar-pdf";
import { cpfParaExibicao } from "@/lib/cpf-aluno";

type ContratoComAlunoPlano = Prisma.ContratoGetPayload<{ include: { aluno: true; plano: true } }>;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contratoId = parseInt(id, 10);
  if (Number.isNaN(contratoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  let contrato: ContratoComAlunoPlano | null = null;
  try {
    contrato = await prisma.contrato.findUnique({
      where: { id: contratoId },
      include: { aluno: true, plano: true },
    });
  } catch (e) {
    console.error("POST /api/contratos/[id]/gerar:", e);
    return NextResponse.json(
      { error: "Não foi possível conectar ao banco. Verifique DATABASE_URL." },
      { status: 500 }
    );
  }
  if (!contrato) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });

  const contratoParams = {
    nomeAluno: contrato.aluno.nome_completo,
    cpf: cpfParaExibicao(contrato.aluno),
    email: contrato.aluno.email,
    telefone: contrato.aluno.telefone,
    nomePlano: contrato.plano.nome_plano,
    duracaoDias: contrato.plano.duracao_dias,
    dataInicio: contrato.data_inicio,
    dataFim: contrato.data_fim,
  };
  const contratoEstruturado = getContratoEstruturado(contratoParams);

  // Usar a origem da requisição para o link (na Vercel será a URL de produção)
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  if (!baseUrl && request.url) {
    try {
      baseUrl = new URL(request.url).origin;
    } catch {
      baseUrl = "";
    }
  }
  if (!baseUrl) baseUrl = "http://localhost:3000";
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

  try {
    await prisma.contrato.update({
      where: { id: contratoId },
      data: {
        status: "enviado",
        link_assinatura: linkAssinatura,
        pdf_url: pdfUrl ?? undefined,
      },
    });
  } catch (e) {
    console.error("POST /api/contratos/[id]/gerar (update):", e);
    return NextResponse.json(
      { error: "Erro ao atualizar contrato. Verifique a conexão com o banco." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    link_assinatura: linkAssinatura,
    pdf_url: pdfUrl,
  });
}
