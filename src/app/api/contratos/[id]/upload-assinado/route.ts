import { NextResponse } from "next/server";
import path from "path";
import { prisma } from "@/lib/prisma";
import { codigoExclusaoValido } from "@/lib/codigo-exclusao";
import {
  removerArquivoContratoPublico,
  salvarArquivoContrato,
} from "@/lib/salvar-arquivo-contrato";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 20 * 1024 * 1024;

const EXTENSOES = new Set([".pdf", ".png", ".jpg", ".jpeg", ".webp"]);

function extensaoSegura(nome: string): string {
  const ext = path.extname(nome).toLowerCase();
  return EXTENSOES.has(ext) ? ext : ".pdf";
}

function mensagemErroBanco(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("pdf_contrato_assinado_url") || msg.includes("column")) {
    return "Banco desatualizado. Execute a migration no Supabase (prisma migrate deploy).";
  }
  if (msg.includes("MaxClients") || msg.includes("max clients")) {
    return "Muitas conexões ao banco. Aguarde alguns segundos e tente de novo.";
  }
  if (msg.toLowerCase().includes("connect") || msg.includes("P1001")) {
    return "Não foi possível conectar ao banco. Verifique o Supabase.";
  }
  return "Erro ao salvar no banco de dados.";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contratoId = parseInt(id, 10);
    if (Number.isNaN(contratoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    let contrato;
    try {
      contrato = await prisma.contrato.findUnique({ where: { id: contratoId } });
    } catch (e) {
      console.error("upload-assinado find:", e);
      return NextResponse.json({ error: mensagemErroBanco(e) }, { status: 503 });
    }

    if (!contrato) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch (e) {
      console.error("upload-assinado formData:", e);
      return NextResponse.json(
        { error: "Não foi possível ler o arquivo. Tente um PDF menor ou recarregue a página." },
        { status: 400 }
      );
    }

    const arquivo = form.get("arquivo");
    if (!arquivo || !(arquivo instanceof File)) {
      return NextResponse.json({ error: "Envie o arquivo do contrato assinado." }, { status: 400 });
    }

    if (arquivo.size > MAX_BYTES) {
      return NextResponse.json({ error: "Arquivo muito grande (máx. 20 MB)." }, { status: 400 });
    }

    const ext = extensaoSegura(arquivo.name);
    const buffer = Buffer.from(await arquivo.arrayBuffer());

    const pdfUrl = await salvarArquivoContrato(
      contratoId,
      buffer,
      ext,
      "assinado-completo"
    );

    try {
      await prisma.contrato.update({
        where: { id: contratoId },
        data: {
          pdf_contrato_assinado_url: pdfUrl,
          status:
            contrato.status === "gerado" || contrato.status === "enviado"
              ? "assinado"
              : contrato.status,
        },
      });
    } catch (e) {
      console.error("upload-assinado update:", e);
      return NextResponse.json({ error: mensagemErroBanco(e) }, { status: 500 });
    }

    return NextResponse.json({ ok: true, pdf_contrato_assinado_url: pdfUrl });
  } catch (e) {
    console.error("upload-assinado POST:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro inesperado ao enviar arquivo." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    await removerArquivoContratoPublico(contrato.pdf_contrato_assinado_url);

    await prisma.contrato.update({
      where: { id: contratoId },
      data: { pdf_contrato_assinado_url: null },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("upload-assinado DELETE:", e);
    return NextResponse.json(
      { error: mensagemErroBanco(e) },
      { status: 500 }
    );
  }
}
