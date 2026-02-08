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
  { numero: "11ª", titulo: "USO DE IMAGEM", texto: "Ao assinar este contrato, o CONTRATANTE autoriza automaticamente o uso de sua imagem para fins profissionais da CONTRATADA." },
];

/** Cláusulas do contrato de Consultoria Online (conteúdo do PDF enviado). */
const CLAUSULAS_CONSULTORIA_ONLINE = [
  { numero: "1ª", titulo: "DO OBJETO", texto: "Prestação de serviços de consultoria online em treinamento físico, incluindo prescrição, ajustes, acompanhamento remoto e suporte, sem a realização de aulas presenciais e sem garantia de resultados." },
  { numero: "2ª", titulo: "DAS OBRIGAÇÕES DA CONTRATADA", texto: "Elaborar treinos personalizados, realizar ajustes conforme evolução do aluno e oferecer suporte online dentro dos canais e horários definidos." },
  { numero: "3ª", titulo: "DAS OBRIGAÇÕES DO CONTRATANTE", texto: "Executar os treinos conforme orientação, informar condições de saúde e assumir total responsabilidade pela execução das atividades." },
  { numero: "4ª", titulo: "RESPONSABILIDADE MÉDICA", texto: "A consultoria online não substitui acompanhamento médico. O CONTRATANTE declara-se apto à prática de atividade física." },
  { numero: "5ª", titulo: "PAGAMENTO", texto: "Pagamento antecipado conforme plano contratado. A inadimplência suspende o serviço, sem reembolso." },
  { numero: "6ª", titulo: "SUPORTE E LIMITES", texto: "O suporte será prestado de forma online, não incluindo acompanhamento presencial, correção em tempo real ou responsabilidade por execução inadequada dos exercícios." },
  { numero: "7ª", titulo: "CANCELAMENTO", texto: "Cancelamento mediante aviso prévio por escrito de 30 dias." },
  { numero: "8ª", titulo: "USO DE IMAGEM", texto: "Ao assinar este contrato, o CONTRATANTE autoriza automaticamente o uso de sua imagem para fins profissionais da CONTRATADA." },
  { numero: "9ª", titulo: "VIGÊNCIA", texto: "Contrato com vigência por prazo indeterminado, válido até solicitação formal de cancelamento." },
];

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
    titulo: "CONTRATO DE CONSULTORIA ONLINE",
    logoPlaceholder: "SUA LOGO AQUI",
    contratadaNome: CONTRATADA_NOME,
    contratadaTitulo: CONTRATADA_TITULO,
    identificacaoTexto: `CONTRATADA: ${CONTRATADA_NOME}, ${CONTRATADA_TITULO}. CONTRATANTE:`,
    nomeContratante: params.nomeAluno,
    cpfContratante: params.cpf,
    telefone: params.telefone ?? null,
    email: params.email,
    clausulas: [...CLAUSULAS_CONSULTORIA_ONLINE],
    vigenciaClausula12: "Contrato com vigência por prazo indeterminado, válido até solicitação formal de cancelamento.",
    assinaturaContratada: CONTRATADA_NOME,
    assinaturaContratante: "CONTRATANTE",
    blocoAssinaturaDigital: "Local e data: _______________________________________________\n\nASSINATURA DIGITAL (WhatsApp):\nDeclaro que li e concordo com todos os termos deste contrato.",
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

/** Considera consultoria online se o nome do plano contiver "consultoria" e "online". */
function isConsultoriaOnline(nomePlano: string): boolean {
  const n = nomePlano.toLowerCase().replace(/\s+/g, " ");
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
