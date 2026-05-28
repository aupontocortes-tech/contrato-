/** Contrato considerado assinado (fluxo digital ou arquivo das duas partes). */
export function isContratoAssinado(contrato: {
  status: string;
  pdf_contrato_assinado_url?: string | null;
}): boolean {
  return contrato.status === "assinado" || !!contrato.pdf_contrato_assinado_url;
}

export function isContratoPendente(contrato: {
  status: string;
  pdf_contrato_assinado_url?: string | null;
}): boolean {
  return !isContratoAssinado(contrato);
}

/** Assinado e dentro do período (data_fim >= hoje). */
export function isContratoAtivo(contrato: {
  status: string;
  pdf_contrato_assinado_url?: string | null;
  data_fim: string | Date;
}): boolean {
  if (!isContratoAssinado(contrato)) return false;
  const fim = new Date(contrato.data_fim);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  fim.setHours(23, 59, 59, 999);
  return fim >= hoje;
}
