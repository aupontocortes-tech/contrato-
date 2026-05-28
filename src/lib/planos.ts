/** Planos padrão quando o banco está vazio ou em fallback de API. */
export const PLANOS_FALLBACK = [
  { id: 1, nome_plano: "mensal", duracao_dias: 30, descricao: "Plano mensal (presencial)" },
  { id: 2, nome_plano: "trimestral", duracao_dias: 90, descricao: "Plano trimestral (presencial)" },
  { id: 3, nome_plano: "semestral", duracao_dias: 180, descricao: "Plano semestral (presencial)" },
  { id: 4, nome_plano: "anual", duracao_dias: 365, descricao: "Plano anual (presencial)" },
  { id: 5, nome_plano: "consultoria_online_mensal", duracao_dias: 30, descricao: "Consultoria online – mensal" },
  { id: 6, nome_plano: "consultoria_online_trimestral", duracao_dias: 90, descricao: "Consultoria online – trimestral" },
  { id: 7, nome_plano: "consultoria_online_semestral", duracao_dias: 180, descricao: "Consultoria online – semestral" },
] as const;

export function isConsultoriaOnlinePlano(nomePlano: string): boolean {
  const n = nomePlano.toLowerCase().replace(/\s+/g, "_");
  return n.includes("consultoria") && n.includes("online");
}

/** Título do card (Mensal, Trimestral, Semestral, Anual) — igual presencial e online. */
export function tituloCardPlano(nomePlano: string, _duracaoDias?: number): string {
  const n = nomePlano.toLowerCase().replace(/\s+/g, "_");
  if (n.includes("mensal")) return "Mensal";
  if (n.includes("trimestral")) return "Trimestral";
  if (n.includes("semestral")) return "Semestral";
  if (n.includes("anual")) return "Anual";
  return nomePlano.replace(/_/g, " ");
}

export function labelPlano(nomePlano: string, duracaoDias?: number): string {
  if (isConsultoriaOnlinePlano(nomePlano)) {
    return `Consultoria online – ${tituloCardPlano(nomePlano, duracaoDias)}`;
  }
  return tituloCardPlano(nomePlano, duracaoDias);
}

export type TipoPeriodoPlano = "mensal" | "trimestral" | "semestral";

/** Mensal, trimestral ou semestral — por nome do plano ou duração em dias. */
export function tipoPeriodoConsultoriaOnline(
  nomePlano: string,
  duracaoDias: number
): TipoPeriodoPlano {
  const n = nomePlano.toLowerCase().replace(/\s+/g, "_");
  if (n.includes("trimestral")) return "trimestral";
  if (n.includes("semestral")) return "semestral";
  if (n.includes("mensal")) return "mensal";
  if (duracaoDias >= 150) return "semestral";
  if (duracaoDias >= 60) return "trimestral";
  return "mensal";
}

export function rotuloPeriodoContrato(tipo: TipoPeriodoPlano): string {
  switch (tipo) {
    case "mensal":
      return "MENSAL";
    case "trimestral":
      return "TRIMESTRAL";
    case "semestral":
      return "SEMESTRAL";
  }
}

export function textoExplicitoPeriodo(tipo: TipoPeriodoPlano): string {
  switch (tipo) {
    case "mensal":
      return "contrato mensal de consultoria online personalizada";
    case "trimestral":
      return "contrato trimestral de consultoria online personalizada";
    case "semestral":
      return "contrato semestral de consultoria online personalizada";
  }
}
