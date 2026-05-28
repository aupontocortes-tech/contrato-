import path from "path";
import fs from "fs/promises";

const MIME_POR_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

/** Ambientes serverless (Vercel) não persistem arquivos em `public/`. */
export function usarArmazenamentoNoBanco(): boolean {
  return process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null;
}

export function mimePorExtensao(ext: string): string {
  return MIME_POR_EXT[ext.toLowerCase()] ?? "application/octet-stream";
}

/**
 * Salva em `public/contratos` no servidor local; em produção serverless grava como data URL (campo no banco).
 */
export async function salvarArquivoContrato(
  contratoId: number,
  buffer: Buffer,
  ext: string,
  sufixoArquivo: string
): Promise<string> {
  const extNorm = ext.startsWith(".") ? ext : `.${ext}`;
  const mime = mimePorExtensao(extNorm);

  if (!usarArmazenamentoNoBanco()) {
    try {
      const dir = path.join(process.cwd(), "public", "contratos");
      await fs.mkdir(dir, { recursive: true });
      const fileName = `${contratoId}-${sufixoArquivo}${extNorm}`;
      await fs.writeFile(path.join(dir, fileName), buffer);
      return `/contratos/${fileName}`;
    } catch (e) {
      console.warn("Falha ao gravar em disco, usando banco:", e);
    }
  }

  const base64 = buffer.toString("base64");
  return `data:${mime};base64,${base64}`;
}

export async function removerArquivoContratoPublico(url: string | null | undefined): Promise<void> {
  if (!url?.startsWith("/contratos/")) return;
  try {
    const filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
    await fs.unlink(filePath);
  } catch {
    /* ignorar */
  }
}
