const CONTRATADA_NOME = "Natália Marques Carvalho";
const CONTRATADA_TITULO = "Personal Trainer";

/** Cláusulas do contrato presencial (mensal, trimestral, semestral, anual) – Contrato_Personal_Trainer_Natalia_Final. */
const CLAUSULAS_PRESENCIAL = [
  { numero: "1ª", titulo: "DO OBJETO", texto: "Prestação de serviços de acompanhamento, orientação e prescrição de treinamentos físicos, presenciais e/ou online, sem garantia de resultados." },
  { numero: "2ª", titulo: "OBRIGAÇÕES DA CONTRATADA", texto: "Elaborar e orientar os treinos conforme objetivos, respeitando normas técnicas e de segurança." },
  { numero: "3ª", titulo: "OBRIGAÇÕES DO CONTRATANTE", texto: "Seguir orientações, informar condições de saúde e apresentar liberação médica quando solicitado." },
  { numero: "4ª", titulo: "RESPONSABILIDADE MÉDICA", texto: "A CONTRATADA não substitui acompanhamento médico. O CONTRATANTE declara-se apto à prática de atividade física." },
  { numero: "5ª", titulo: "PAGAMENTO", texto: "Pagamento antecipado. A falta de pagamento implica suspensão dos serviços, sem reembolso." },
  { numero: "6ª", titulo: "FALTAS E REPOSIÇÕES", texto: "Faltas sem aviso prévio de 24h são consideradas aulas dadas. Máximo de 2 reposições mensais." },
  { numero: "7ª", titulo: "FERIADOS", texto: "Aulas em feriados são consideradas aulas normalmente dadas." },
  { numero: "8ª", titulo: "PAUSAS", texto: "Pausas não prorrogam o contrato sem acordo formal." },
  { numero: "9ª", titulo: "CANCELAMENTO", texto: "Cancelamento mediante aviso prévio por escrito de 30 dias." },
  { numero: "10ª", titulo: "REAJUSTE", texto: "Valores poderão ser reajustados mediante aviso prévio." },
  { numero: "11ª", titulo: "USO DE IMAGEM", texto: "O CONTRATANTE autoriza a utilização de sua imagem, eventualmente registrada durante o acompanhamento da consultoria, para fins exclusivamente profissionais e de divulgação dos serviços da CONTRATADA, de forma gratuita e respeitosa." },
];

/** Texto da duração do plano (modelo consultoria online personalizada). */
function textoDuracaoPlano(duracaoDias: number): string {
  if (duracaoDias >= 365) {
    return "12 (doze) meses, contados a partir da data de início do acompanhamento.";
  }
  if (duracaoDias >= 180) {
    return "6 (seis) meses, contados a partir da data de início do acompanhamento.";
  }
  if (duracaoDias >= 90) {
    return "03 (três) meses, contados a partir da data de início do acompanhamento.";
  }
  if (duracaoDias >= 30) {
    return "01 (um) mês, contado a partir da data de início do acompanhamento.";
  }
  return `${duracaoDias} dias, contados a partir da data de início do acompanhamento.`;
}

/** Cláusulas do contrato de Consultoria Online Personalizada (texto do modelo; sem dados de terceiros). */
function clausulasConsultoriaOnline(duracaoDias: number) {
  return [
    {
      numero: "1",
      titulo: "OBJETO DO CONTRATO",
      texto:
        "O presente contrato tem como objetivo a prestação de serviços de consultoria online personalizada, incluindo acompanhamento físico, orientação de treinos, avaliações e suporte online.",
    },
    {
      numero: "2",
      titulo: "DURAÇÃO DO PLANO",
      texto: `O plano contratado terá duração de ${textoDuracaoPlano(duracaoDias)}`,
    },
    {
      numero: "3",
      titulo: "SERVIÇOS INCLUSOS",
      texto:
        "Treino personalizado de acordo com os objetivos do CONTRATANTE; ajustes e atualizações periódicas do treino; acompanhamento online; suporte via aplicativo e/ou WhatsApp em horário comercial; avaliações físicas online; orientações gerais relacionadas ao treino; monitoramento da evolução física.",
    },
    {
      numero: "4",
      titulo: "RESPONSABILIDADES DA CONTRATANTE",
      texto:
        "A CONTRATANTE se compromete a: seguir corretamente as orientações passadas; informar qualquer limitação física, lesão ou problema de saúde; enviar fotos, medidas e avaliações quando solicitado; manter compromisso e constância com o acompanhamento.",
    },
    {
      numero: "5",
      titulo: "PAGAMENTO",
      texto:
        "O valor do plano será acordado entre as partes no momento da contratação. O não pagamento poderá acarretar suspensão do acompanhamento até regularização.",
    },
    {
      numero: "6",
      titulo: "CANCELAMENTO",
      texto:
        "Em caso de desistência por parte da CONTRATANTE antes do término do plano, não haverá reembolso dos valores já pagos, salvo acordo entre ambas as partes.",
    },
    {
      numero: "7",
      titulo: "CONSIDERAÇÕES FINAIS",
      texto:
        "A CONTRATADA não garante resultados específicos, uma vez que os resultados dependem diretamente da disciplina, alimentação, rotina e comprometimento da CONTRATANTE.",
    },
  ];
}

function getVigenciaByPlano(nomePlano: string): string {
  const p = nomePlano.toLowerCase().replace(/\s+/g, "_");
  switch (p) {
    case "mensal":
      return "Contrato com vigência mensal e renovação automática, salvo manifestação contrária.";
    case "trimestral":
      return "Contrato com vigência trimestral (90 dias), a partir da data de assinatura, salvo manifestação contrária.";
    case "semestral":
      return "Contrato com vigência semestral (180 dias), a partir da data de assinatura, salvo manifestação contrária.";
    case "anual":
      return "Contrato com vigência anual (365 dias), a partir da data de assinatura, salvo manifestação contrária.";
    case "consultoria_online":
      return "Contrato de consultoria online com vigência de 365 (trezentos e sessenta e cinco) dias, a partir da data de assinatura, salvo manifestação contrária.";
    default:
      return "Contrato com vigência conforme plano contratado, salvo manifestação contrária.";
  }
}

export type ContratoParams = {
  nomeAluno: string;
  cpf: string;
  email: string;
  telefone: string | null;
  /** Opcional; usado no contrato presencial (Data de nascimento). */
  dataNascimento?: string | null;
  nomePlano: string;
  duracaoDias: number;
  dataInicio: Date;
  dataFim: Date;
};

export type ContratoEstruturado = {
  titulo: string;
  logoPlaceholder: string;
  contratadaNome: string;
  contratadaTitulo: string;
  identificacaoTexto: string;
  nomeContratante: string;
  cpfContratante: string;
  /** Exibido na identificação do CONTRATANTE (ex.: consultoria online). */
  telefone?: string | null;
  /** Exibido na identificação do CONTRATANTE. */
  email?: string;
  /** Data de nascimento (contrato presencial). */
  dataNascimento?: string | null;
  clausulas: Array<{ numero: string; titulo: string; texto: string }>;
  vigenciaClausula12: string;
  assinaturaContratada: string;
  assinaturaContratante: string;
  /** Bloco de texto antes das linhas de assinatura (ex.: assinatura digital WhatsApp). */
  blocoAssinaturaDigital?: string;
};

function getContratoConsultoriaOnline(params: ContratoParams): ContratoEstruturado {
  return {
    titulo: "CONTRATO DE CONSULTORIA ONLINE PERSONALIZADA",
    logoPlaceholder: "SUA LOGO AQUI",
    contratadaNome: CONTRATADA_NOME,
    contratadaTitulo: CONTRATADA_TITULO,
    identificacaoTexto: `CONTRATADA: ${CONTRATADA_NOME}, ${CONTRATADA_TITULO}.\nCONTRATANTE:`,
    nomeContratante: params.nomeAluno,
    cpfContratante: params.cpf,
    telefone: params.telefone ?? null,
    email: params.email,
    clausulas: clausulasConsultoriaOnline(params.duracaoDias),
    vigenciaClausula12: textoDuracaoPlano(params.duracaoDias),
    assinaturaContratada: CONTRATADA_NOME,
    assinaturaContratante: params.nomeAluno,
    blocoAssinaturaDigital:
      "Ao assinar este contrato, ambas as partes declaram estar de acordo com todos os termos descritos acima.\n\nData: ____/____/________",
  };
}

/** Contrato presencial (mensal, trimestral, semestral, anual) – Contrato_Personal_Trainer_Natalia_Final. */
function getContratoPresencial(params: ContratoParams): ContratoEstruturado {
  const vigencia = getVigenciaByPlano(params.nomePlano);
  const clausulas = [
    ...CLAUSULAS_PRESENCIAL,
    { numero: "12ª", titulo: "VIGÊNCIA", texto: vigencia },
  ];
  return {
    titulo: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PERSONAL TRAINER",
    logoPlaceholder: "SUA LOGO AQUI",
    contratadaNome: CONTRATADA_NOME,
    contratadaTitulo: CONTRATADA_TITULO,
    identificacaoTexto: `CONTRATADA: ${CONTRATADA_NOME}, ${CONTRATADA_TITULO}. CONTRATANTE:`,
    nomeContratante: params.nomeAluno,
    cpfContratante: params.cpf,
    telefone: params.telefone ?? null,
    email: params.email,
    dataNascimento: params.dataNascimento ?? null,
    clausulas,
    vigenciaClausula12: vigencia,
    assinaturaContratada: CONTRATADA_NOME,
    assinaturaContratante: "CONTRATANTE",
    blocoAssinaturaDigital: "Local e data: _______________________________________________",
  };
}

/** Considera consultoria online se o nome do plano indicar consultoria online. */
function isConsultoriaOnline(nomePlano: string): boolean {
  const n = nomePlano.toLowerCase().replace(/\s+/g, "_");
  return n.includes("consultoria") && n.includes("online");
}

export function getContratoEstruturado(params: ContratoParams): ContratoEstruturado {
  if (isConsultoriaOnline(params.nomePlano)) {
    return getContratoConsultoriaOnline(params);
  }
  return getContratoPresencial(params);
}

/** Gera o texto completo do contrato para o PDF (formato linear). */
export function gerarTextoContrato(params: ContratoParams): string {
  const c = getContratoEstruturado(params);
  const dados = [`Nome completo: ${c.nomeContratante}`, `CPF: ${c.cpfContratante}`];
  if (c.dataNascimento !== undefined) {
    dados.push(`Data de nascimento: ${c.dataNascimento || "____ / ____ / ______"}`);
  }
  if (c.telefone) dados.push(`Telefone: ${c.telefone}`);
  if (c.email) dados.push(`E-mail: ${c.email}`);
  const linhas: string[] = [
    c.logoPlaceholder,
    "",
    c.titulo,
    "",
    "IDENTIFICAÇÃO DAS PARTES",
    c.identificacaoTexto,
    "",
    ...dados.map((d) => d),
    "",
  ];
  for (const cl of c.clausulas) {
    linhas.push(`CLÁUSULA ${cl.numero} – ${cl.titulo}`);
    linhas.push(cl.texto);
    linhas.push("");
  }
  if (c.blocoAssinaturaDigital) {
    linhas.push(c.blocoAssinaturaDigital);
    linhas.push("");
    linhas.push("Assinatura do(a) CONTRATANTE: ________________________________");
    linhas.push("Assinatura da CONTRATADA: _________________________________");
    linhas.push("");
  }
  linhas.push(
    "__________________________________ __________________________________",
    `${c.assinaturaContratada} ${c.assinaturaContratante}`,
    "CONTRATADA CONTRATANTE",
    "Data: ____/____/________ Data: ____/____/________"
  );
  return linhas.join("\n");
}
