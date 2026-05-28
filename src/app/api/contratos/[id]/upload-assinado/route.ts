import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { codigoExclusaoValido } from "@/lib/codigo-exclusao";

const MAX_BYTES = 20 * 1024 * 1024;

const EXTENSOES = new Set([".pdf", ".png", ".jpg", ".jpeg", ".webp"]);

function extensaoSegura(nome: string): string {
  const ext = path.extname(nome).toLowerCase();
  return EXTENSOES.has(ext) ? ext : ".pdf";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contratoId = parseInt(id, 10);
  if (Number.isNaN(contratoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const contrato = await prisma.contrato.findUnique({ where: { id: contratoId } });
  if (!contrato) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });

  const form = await request.formData();
  const arquivo = form.get("arquivo");
  if (!arquivo || !(arquivo instanceof File)) {
    return NextResponse.json({ error: "Envie o arquivo do contrato assinado." }, { status: 400 });
  }

  if (arquivo.size > MAX_BYTES) {
    return NextResponse.json({ error: "Arquivo muito grande (máx. 20 MB)." }, { status: 400 });
  }

  const ext = extensaoSegura(arquivo.name);
  const buffer = Buffer.from(await arquivo.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "contratos");
  await fs.mkdir(dir, { recursive: true });

  const fileName = `${contratoId}-assinado-completo${ext}`;
  const filePath = path.join(dir, fileName);
  await fs.writeFile(filePath, buffer);

  const pdfUrl = `/contratos/${fileName}`;

  await prisma.contrato.update({
    where: { id: contratoId },
    data: {
      pdf_contrato_assinado_url: pdfUrl,
      status: contrato.status === "gerado" || contrato.status === "enviado" ? "assinado" : contrato.status,
    },
  });

  return NextResponse.json({ ok: true, pdf_contrato_assinado_url: pdfUrl });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contratoId = parseInt(id, 10);
  if (Number.isNaN(contratoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  let body: { codigo?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Envie o código de confirmação." }, { status: 400 });
  }

  if (!codigoExclusaoValido(String(body?.codigo ?? ""))) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 403 });
  }

  const contrato = await prisma.contrato.findUnique({ where: { id: contratoId } });
  if (!contrato) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });

  const url = contrato.pdf_contrato_assinado_url;
  if (url?.startsWith("/contratos/")) {
    const filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
    try {
      await fs.unlink(filePath);
    } catch {
      /* arquivo já removido */
    }
  }

  await prisma.contrato.update({
    where: { id: contratoId },
    data: { pdf_contrato_assinado_url: null },
  });

  return NextResponse.json({ ok: true });
}
