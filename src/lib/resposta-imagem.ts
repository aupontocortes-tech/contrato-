import { NextResponse } from "next/server";

/** Responde com imagem a partir de data URL ou caminho em /public. */
export async function respostaImagemArmazenada(
  valor: string | null | undefined,
  fallbackContentType = "image/png"
): Promise<NextResponse> {
  if (!valor) {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }

  if (valor.startsWith("data:")) {
    const match = /^data:([^;]+);base64,(.+)$/.exec(valor);
    if (!match) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }
    const buffer = Buffer.from(match[2], "base64");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": match[1] || fallbackContentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  }

  if (valor.startsWith("/")) {
    const { readFile } = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "public", valor.replace(/^\//, ""));
    try {
      const buffer = await readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const type =
        ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".webp"
            ? "image/webp"
            : "image/png";
      return new NextResponse(buffer, {
        headers: { "Content-Type": type, "Cache-Control": "private, max-age=3600" },
      });
    } catch {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }
  }

  return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
}
