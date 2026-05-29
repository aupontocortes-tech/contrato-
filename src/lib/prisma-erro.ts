/** Mensagem amigável quando o banco está desatualizado em relação ao schema Prisma. */
export function mensagemErroBanco(e: unknown): string | null {
  const msg =
    e && typeof e === "object" && "message" in e
      ? String((e as { message: unknown }).message)
      : String(e);
  const lower = msg.toLowerCase();
  if (
    lower.includes("cpf_nao_informado") ||
    lower.includes("does not exist") ||
    lower.includes("column") && lower.includes("aluno")
  ) {
    return "O banco precisa de atualização. Aguarde o deploy ou execute: npx prisma migrate deploy";
  }
  return null;
}
