import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Código fixo para confirmar exclusão */
const CODIGO_EXCLUSAO = "40";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alunoId = parseInt(id, 10);
    if (Number.isNaN(alunoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    let body: { codigo?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Envie o código de confirmação" }, { status: 400 });
    }

    const codigo = String(body?.codigo ?? "").trim();
    if (codigo !== CODIGO_EXCLUSAO) {
      return NextResponse.json(
        { error: "Código de confirmação inválido." },
        { status: 403 }
      );
    }

    // Não verificar contratos - excluir sempre, mesmo que tenha contratos associados

    try {
      await prisma.aluno.delete({ where: { id: alunoId } });
      return NextResponse.json({ ok: true });
    } catch (e: any) {
      console.error("DELETE /api/alunos/[id]:", e);
      if (e.code === "P2025") {
        return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Erro ao excluir aluno. Verifique a conexão com o banco." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro ao excluir aluno:", error);
    return NextResponse.json(
      { error: "Erro ao processar exclusão do aluno." },
      { status: 500 }
    );
  }
}
