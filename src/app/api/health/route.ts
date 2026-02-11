import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, boolean | string | number> = {
    database_url_configured: !!process.env.DATABASE_URL,
    timestamp: new Date().toISOString(),
  };

  // Mostra parte da URL (sem senha) para debug
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    const masked = url.replace(/:([^:@]+)@/, ":****@");
    checks.database_url_preview = masked;
    checks.database_url_length = url.length;
    // Verifica se é pooler ou direct
    if (url.includes("pooler.supabase.com")) {
      checks.connection_type = "Session pooler";
    } else if (url.includes("db.") && url.includes(".supabase.co")) {
      checks.connection_type = "Direct connection";
    } else {
      checks.connection_type = "Unknown";
    }
  }

  // Testa conexão com o banco
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout após 10s")), 10000)),
    ]);
    checks.database_connection = true;
    checks.status = "ok";
    return NextResponse.json(checks, { status: 200 });
  } catch (e: unknown) {
    checks.database_connection = false;
    checks.status = "error";
    
    let errorMsg = "Erro desconhecido";
    let errorCode = "";
    
    if (e && typeof e === "object") {
      if ("message" in e) {
        errorMsg = String((e as { message: unknown }).message);
      }
      if ("code" in e) {
        errorCode = String((e as { code: unknown }).code);
        checks.error_code = errorCode;
      }
    }
    
    checks.error = errorMsg;
    checks.full_error = JSON.stringify(e, Object.getOwnPropertyNames(e));

    // Mensagem clara para o desenvolvedor
    if (!process.env.DATABASE_URL) {
      checks.message = "DATABASE_URL não configurada na Vercel. Configure em Settings → Environment Variables.";
    } else if (errorCode === "P1000" || errorMsg.toLowerCase().includes("auth") || errorMsg.toLowerCase().includes("password")) {
      checks.message = "Falha de autenticação. Verifique usuário e senha na DATABASE_URL. Código: " + errorCode;
    } else if (errorCode === "P1001" || errorMsg.toLowerCase().includes("timeout") || errorMsg.toLowerCase().includes("reach") || errorMsg.toLowerCase().includes("econnrefused")) {
      checks.message = "Não foi possível alcançar o servidor do banco. Verifique host/porta e se o projeto Supabase está ativo. Código: " + errorCode;
    } else {
      checks.message = `Erro de conexão: ${errorMsg} (Código: ${errorCode || "N/A"})`;
    }

    return NextResponse.json(checks, { status: 503 });
  }
}
