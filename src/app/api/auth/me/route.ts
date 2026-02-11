import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { status: 401 });
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, nome: true, email: true, tipo: true },
    });
  } catch (e) {
    console.error("GET /api/auth/me:", e);
    return NextResponse.json(
      { error: "Não foi possível conectar ao banco. Verifique DATABASE_URL." },
      { status: 500 }
    );
  }
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user });
}
