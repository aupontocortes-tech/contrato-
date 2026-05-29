import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Validação da DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error("⚠️ DATABASE_URL não encontrada. Configure em Vercel → Settings → Environment Variables");
}

function databaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  // Em serverless (Vercel), limita conexões por instância
  if (process.env.NODE_ENV === "production" && !url.includes("connection_limit=")) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}connection_limit=1`;
  }
  return url;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: databaseUrl(),
      },
    },
  });

// Garantir que conexões sejam fechadas adequadamente
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
} else {
  // Em produção, garantir desconexão adequada
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}

// Helper para verificar conexão
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
