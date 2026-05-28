import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizarCpfDigitos } from "@/lib/cpf-aluno";

const createSchema = z
  .object({
    nome_completo: z.string().min(1, "Nome é obrigatório"),
    cpf_nao_informado: z.boolean().optional().default(false),
    cpf: z.string().optional(),
    email: z.string().email("E-mail inválido"),
    telefone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.cpf_nao_informado) return;
    const raw = data.cpf?.trim() ?? "";
    if (!raw) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cpf"],
        message: "Informe o CPF ou marque como não informado",
      });
      return;
    }
    const digits = normalizarCpfDigitos(raw);
    if (digits.length !== 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cpf"],
        message: "CPF deve ter 11 dígitos",
      });
    }
  });

export async function GET() {
  try {
    const list = await prisma.aluno.findMany({ orderBy: { nome_completo: "asc" } });
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/alunos:", e);
    return NextResponse.json(
      { error: "Erro ao carregar alunos. Verifique a conexão com o banco." },
      { status: 503 }
    );
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

    const cpfNaoInformado = parsed.data.cpf_nao_informado === true;
    const cpf = cpfNaoInformado
      ? null
      : normalizarCpfDigitos(parsed.data.cpf!.trim());

    const aluno = await prisma.aluno.create({
      data: {
        nome_completo: parsed.data.nome_completo,
        cpf,
        cpf_nao_informado: cpfNaoInformado,
        email: parsed.data.email,
        telefone: parsed.data.telefone || null,
      },
    });
    return NextResponse.json(aluno);
  } catch (e: unknown) {
    console.error("POST /api/alunos:", e);
    const code = e && typeof e === "object" && "code" in e ? (e as { code: string }).code : null;
    if (code === "P2002") {
      return NextResponse.json({ error: "CPF ou e-mail já cadastrado." }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao cadastrar. Verifique a conexão com o banco e tente novamente." },
      { status: 500 }
    );
  }
}
