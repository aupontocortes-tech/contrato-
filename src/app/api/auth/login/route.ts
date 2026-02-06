import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const bodySchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Email e senha obrigatórios" }, { status: 400 });
    }
    const { email, senha } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(senha, user.senha))) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }
    await createSession({ userId: user.id, email: user.email, tipo: user.tipo });
    return NextResponse.json({ ok: true, user: { id: user.id, nome: user.nome, email: user.email } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 });
  }
}
