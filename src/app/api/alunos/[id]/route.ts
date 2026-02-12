import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Código válido para confirmar exclusão: 1234 */
const CODIGO_EXCLUSAO = "1234";

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
        { error: "Código incorreto. Digite 1234 para confirmar a exclusão." },
        { status: 403 }
      );
    }

    // Excluir contratos associados primeiro, depois o aluno
    try {
      // Excluir todos os contratos do aluno primeiro
      await prisma.contrato.deleteMany({
        where: { aluno_id: alunoId },
      });

      // Agora excluir o aluno
      await prisma.aluno.delete({ where: { id: alunoId } });
      return NextResponse.json({ ok: true });
    } catch (e: any) {
      console.error("DELETE /api/alunos/[id]:", e);
      if (e.code === "P2025") {
        return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
      }
      // Erro de constraint de chave estrangeira
      if (e.code === "P2003") {
        // Tentar excluir contratos novamente e depois o aluno
        try {
          await prisma.contrato.deleteMany({ where: { aluno_id: alunoId } });
          await prisma.aluno.delete({ where: { id: alunoId } });
          return NextResponse.json({ ok: true });
        } catch (retryError: any) {
          console.error("Erro ao excluir após retry:", retryError);
          return NextResponse.json(
            { error: "Erro ao excluir aluno. Tente novamente." },
            { status: 500 }
          );
        }
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
