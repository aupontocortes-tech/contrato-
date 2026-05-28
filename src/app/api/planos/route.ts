import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLANOS_FALLBACK } from "@/lib/planos";
import {
  filtrarPlanosParaApp,
  ordenarPlanos,
  syncPlanosNoBanco,
} from "@/lib/sync-planos";

export async function GET() {
  try {
    await syncPlanosNoBanco(prisma);
    const list = await prisma.plano.findMany({ orderBy: { id: "asc" } });
    const planos = ordenarPlanos(filtrarPlanosParaApp(list));
    return NextResponse.json(planos);
  } catch (e) {
    console.error("GET /api/planos:", e);
    return NextResponse.json(
      { error: "Erro ao carregar planos. Verifique a conexão com o banco." },
      { status: 503 }
    );
  }
}
