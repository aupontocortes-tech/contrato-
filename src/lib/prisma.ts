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
    // Configurações otimizadas para serverless (Vercel)
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

globalForPrisma.prisma = prisma;
