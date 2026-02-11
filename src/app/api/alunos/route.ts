import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/** Remove tudo que não for dígito (CPF só números para armazenar e evitar duplicata por formatação). */
function normalizarCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

const createSchema = z.object({
  nome_completo: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().min(11, "CPF deve ter pelo menos 11 dígitos").transform(normalizarCpf).refine((s) => s.length === 11, "CPF deve ter 11 dígitos"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional(),
});

export async function GET() {
  try {
    const list = await prisma.aluno.findMany({ orderBy: { nome_completo: "asc" } });
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/alunos:", e);
    const msg =
      e && typeof e === "object" && "message" in e && String((e as { message: unknown }).message).toLowerCase().includes("auth")
        ? "Falha de autenticação no banco. Verifique DATABASE_URL (usuário e senha)."
        : "Não foi possível conectar ao banco. Verifique DATABASE_URL e se o servidor está acessível.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const msg = first ? `${first.path.join(".")}: ${first.message}` : "Dados inválidos";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const aluno = await prisma.aluno.create({
      data: {
        nome_completo: parsed.data.nome_completo,
        cpf: parsed.data.cpf,
        email: parsed.data.email,
        telefone: parsed.data.telefone || null,
      },
    });
    return NextResponse.json(aluno);
  } catch (e: unknown) {
    const code = e && typeof e === "object" && "code" in e ? (e as { code: string }).code : null;
    const msg = code === "P2002" ? "CPF ou e-mail já cadastrado." : "Erro ao criar aluno. Tente novamente.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
