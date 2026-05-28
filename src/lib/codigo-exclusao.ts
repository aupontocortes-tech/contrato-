/** Código para confirmar exclusões sensíveis (alterável via CODIGO_EXCLUSAO_CONTRATO). */
export const CODIGO_EXCLUSAO_CONTRATO = process.env.CODIGO_EXCLUSAO_CONTRATO || "1234";

export function codigoExclusaoValido(codigo: string): boolean {
  return String(codigo).trim() === CODIGO_EXCLUSAO_CONTRATO;
}
