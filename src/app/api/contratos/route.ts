import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  aluno_id: z.number().int().positive(),
  plano_id: z.number().int().positive(),
  data_inicio: z.string().optional(),
});

export async function GET() {
  try {
    const list = await prisma.contrato.findMany({
      orderBy: { criado_em: "desc" },
      include: { aluno: true, plano: true },
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/contratos:", e);
    // Retorna array vazio em caso de erro para não quebrar o frontend
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }
    const { aluno_id, plano_id } = parsed.data;
    const [aluno, plano] = await Promise.all([
      prisma.aluno.findUnique({ where: { id: aluno_id } }),
      prisma.plano.findUnique({ where: { id: plano_id } }),
    ]);
    if (!aluno || !plano) {
      return NextResponse.json({ error: "Aluno ou plano não encontrado" }, { status: 404 });
    }
    const dataInicio = parsed.data.data_inicio ? new Date(parsed.data.data_inicio) : new Date();
    const dataFim = new Date(dataInicio);
    dataFim.setDate(dataFim.getDate() + plano.duracao_dias);
    const contrato = await prisma.contrato.create({
      data: {
        aluno_id,
        plano_id,
        data_inicio: dataInicio,
        data_fim: dataFim,
        status: "gerado",
      },
      include: { aluno: true, plano: true },
    });
    return NextResponse.json(contrato);
  } catch (e) {
    console.error("POST /api/contratos:", e);
    const msg =
      e && typeof e === "object" && "message" in e && String((e as { message: unknown }).message).toLowerCase().includes("auth")
        ? "Falha de autenticação no banco. Verifique DATABASE_URL."
        : "Erro ao criar contrato. Verifique a conexão com o banco.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
