const CONTRATADA_NOME = "Natália Marques Carvalho";
const CONTRATADA_TITULO = "Personal Trainer";

const CLAUSULAS_FIXAS = [
  { numero: "1ª", titulo: "DO OBJETO", texto: "Prestação de serviços de acompanhamento, orientação e prescrição de treinos físicos, na modalidade presencial e/ou online." },
  { numero: "2ª", titulo: "DAS OBRIGAÇÕES DA CONTRATADA", texto: "Elaborar e orientar os treinos conforme os objetivos, limitações e condições físicas do CONTRATANTE, respeitando os princípios de segurança." },
  { numero: "3ª", titulo: "DAS OBRIGAÇÕES DO CONTRATANTE", texto: "Seguir as orientações repassadas, informar qualquer condição de saúde, lesão ou alteração física, bem como apresentar liberação médica quando solicitado." },
  { numero: "4ª", titulo: "DA RESPONSABILIDADE MÉDICA", texto: "A CONTRATADA não substitui acompanhamento médico ou fisioterapêutico. O CONTRATANTE declara estar apto à prática de atividades físicas e assume total responsabilidade por sua condição de saúde." },
  { numero: "5ª", titulo: "DO PAGAMENTO", texto: "O valor, forma de pagamento e periodicidade serão definidos previamente entre as partes, sendo condição obrigatória para a continuidade do serviço." },
  { numero: "6ª", titulo: "DAS FALTAS, ATRASOS E REPOSIÇÕES", texto: "Atrasos do CONTRATANTE não geram compensação de tempo, encerrando-se a aula no horário previamente agendado. Faltas não avisadas com antecedência mínima de 24 horas serão consideradas aulas dadas. O CONTRATANTE terá direito a, no máximo, 02 (duas) reposições por mês, com prazo máximo de 30 (trinta) dias para realizá-las. Em caso de viagem previamente informada, será permitido até 05 (cinco) reposições, conforme disponibilidade da agenda." },
  { numero: "7ª", titulo: "DOS FERIADOS", texto: "Aulas agendadas em feriados são consideradas aulas dadas, não sendo passíveis de reposição." },
  { numero: "8ª", titulo: "DA PAUSA OU INTERRUPÇÃO", texto: "Pausas por motivos pessoais, doença, viagens ou mudança de rotina não prorrogam automaticamente a vigência do contrato." },
  { numero: "9ª", titulo: "DO CANCELAMENTO DO CONTRATO", texto: "O cancelamento deverá ser comunicado com antecedência mínima de 30 (trinta) dias." },
  { numero: "10ª", titulo: "DO REAJUSTE DE VALORES", texto: "Os valores poderão ser reajustados mediante aviso prévio ao CONTRATANTE." },
  { numero: "11ª", titulo: "DO USO DE IMAGEM", texto: "O uso de imagem do CONTRATANTE para fins profissionais somente ocorrerá mediante autorização prévia e expressa." },
  { numero: "13ª", titulo: "DO FORO", texto: "Fica eleito o foro da comarca de residência da CONTRATADA para dirimir quaisquer dúvidas oriundas deste contrato." },
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
  clausulas: Array<{ numero: string; titulo: string; texto: string }>;
  vigenciaClausula12: string;
  assinaturaContratada: string;
  assinaturaContratante: string;
};

export function getContratoEstruturado(params: ContratoParams): ContratoEstruturado {
  const vigencia = getVigenciaByPlano(params.nomePlano);
  const clausulas = [
    ...CLAUSULAS_FIXAS.slice(0, 11),
    { numero: "12ª", titulo: "DA VIGÊNCIA", texto: vigencia },
    ...CLAUSULAS_FIXAS.slice(11),
  ];
  return {
    titulo: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PERSONAL TRAINER",
    logoPlaceholder: "SUA LOGO AQUI",
    contratadaNome: CONTRATADA_NOME,
    contratadaTitulo: CONTRATADA_TITULO,
    identificacaoTexto: `De um lado, ${CONTRATADA_NOME}, ${CONTRATADA_TITULO}, doravante denominada CONTRATADA. De outro lado, o(a) aluno(a) identificado(a) abaixo, doravante denominado(a) CONTRATANTE:`,
    nomeContratante: params.nomeAluno,
    cpfContratante: params.cpf,
    clausulas,
    vigenciaClausula12: vigencia,
    assinaturaContratada: CONTRATADA_NOME,
    assinaturaContratante: "Aluno(a)",
  };
}

/** Gera o texto completo do contrato para o PDF (formato linear). */
export function gerarTextoContrato(params: ContratoParams): string {
  const c = getContratoEstruturado(params);
  const linhas: string[] = [
    c.logoPlaceholder,
    "",
    c.titulo,
    "",
    "IDENTIFICAÇÃO DAS PARTES",
    c.identificacaoTexto,
    "",
    `Nome completo: ${c.nomeContratante}`,
    `CPF: ${c.cpfContratante}`,
    "",
  ];
  for (const cl of c.clausulas) {
    linhas.push(`CLÁUSULA ${cl.numero} – ${cl.titulo}`);
    linhas.push(cl.texto);
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
