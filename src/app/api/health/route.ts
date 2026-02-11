import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, boolean | string> = {
    database_url_configured: !!process.env.DATABASE_URL,
    timestamp: new Date().toISOString(),
  };

  // Testa conexão com o banco
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database_connection = true;
    checks.status = "ok";
    return NextResponse.json(checks, { status: 200 });
  } catch (e: unknown) {
    checks.database_connection = false;
    checks.status = "error";
    const errorMsg =
      e && typeof e === "object" && "message" in e
        ? String((e as { message: unknown }).message)
        : "Erro desconhecido";
    checks.error = errorMsg;

    // Mensagem clara para o desenvolvedor
    if (!process.env.DATABASE_URL) {
      checks.message = "DATABASE_URL não configurada na Vercel. Configure em Settings → Environment Variables.";
    } else if (errorMsg.toLowerCase().includes("auth") || errorMsg.toLowerCase().includes("password")) {
      checks.message = "Falha de autenticação. Verifique usuário e senha na DATABASE_URL.";
    } else if (errorMsg.toLowerCase().includes("timeout") || errorMsg.toLowerCase().includes("reach")) {
      checks.message = "Não foi possível alcançar o servidor do banco. Verifique host/porta e se o projeto Supabase está ativo.";
    } else {
      checks.message = `Erro de conexão: ${errorMsg}`;
    }

    return NextResponse.json(checks, { status: 503 });
  }
}
