import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  nome_completo: z.string().min(1),
  cpf: z.string().min(11),
  email: z.string().email(),
  telefone: z.string().optional(),
});

export async function GET() {
  const list = await prisma.aluno.findMany({ orderBy: { nome_completo: "asc" } });
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }
    const aluno = await prisma.aluno.create({ data: parsed.data });
    return NextResponse.json(aluno);
  } catch (e: unknown) {
    const msg = e && typeof e === "object" && "code" in e && e.code === "P2002" ? "CPF ou email já cadastrado" : "Erro ao criar aluno";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
