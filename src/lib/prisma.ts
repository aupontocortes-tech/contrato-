import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Validação da DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error("⚠️ DATABASE_URL não encontrada. Configure em Vercel → Settings → Environment Variables");
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;

// Helper para verificar conexão
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
