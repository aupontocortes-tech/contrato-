import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { respostaImagemArmazenada } from "@/lib/resposta-imagem";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contratoId = parseInt(id, 10);
  if (Number.isNaN(contratoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const contrato = await prisma.contrato.findUnique({
      where: { id: contratoId },
      select: { assinatura_professor_url: true },
    });
    return respostaImagemArmazenada(contrato?.assinatura_professor_url);
  } catch (e) {
    console.error("GET assinatura-professor/imagem:", e);
    return NextResponse.json(
      { error: "Erro ao carregar assinatura." },
      { status: 503 }
    );
  }
}
