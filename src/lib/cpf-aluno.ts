/** Texto exibido em listagens e contratos quando o CPF não foi informado. */
export const CPF_NAO_INFORMADO_TEXTO = "não informado";

export type AlunoCpfFields = {
  cpf: string | null;
  cpf_nao_informado?: boolean | null;
};

export function normalizarCpfDigitos(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

export function formatarCpfExibicao(cpf: string): string {
  const d = normalizarCpfDigitos(cpf);
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** CPF como deve aparecer no contrato, PDF e telas. */
export function cpfParaExibicao(aluno: AlunoCpfFields): string {
  if (aluno.cpf_nao_informado) return CPF_NAO_INFORMADO_TEXTO;
  if (!aluno.cpf?.trim()) return CPF_NAO_INFORMADO_TEXTO;
  return formatarCpfExibicao(aluno.cpf);
}
