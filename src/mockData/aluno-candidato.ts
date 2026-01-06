/**
 * Mock de dados para Aluno/Candidato
 * Usado na visão geral do dashboard
 */

export interface MockCursoData {
  id: string;
  nome: string;
  descricao: string;
  imagemUrl: string;
  status: "EM_PROGRESSO" | "CONCLUIDO" | "NAO_INICIADO";
  percentualConcluido: number;
  dataInicio: string;
  dataFim?: string;
}

export interface MockNotaData {
  cursoId: string;
  cursoPorcentagem: number;
  cursoBimestre?: number;
  nota: number;
  status: "APROVADO" | "REPROVADO" | "PENDENTE";
}

export interface MockFrequenciaData {
  cursoId: string;
  cursoNome: string;
  percentualFrequencia: number;
  presencas: number;
  faltas: number;
}

export interface MockCertificadoData {
  id: string;
  cursoNome: string;
  dataEmissao: string;
  dataValidade?: string;
  url?: string;
}

export interface MockCertificadoItemData {
  id: string;
  key: string;
  codigo: string;
  cursoId: string;
  cursoNome: string;
  turmaId: string;
  turmaNome: string;
  inscricaoId: string;
  alunoId: string;
  emitidoEm: string;
  pdfUrl?: string | null;
  templateId?: string;
  cargaHoraria?: number;
  dataInicio?: string;
  dataFim?: string;
}

export interface MockCurriculoData {
  id: string;
  titulo: string;
  dataAtualizacao: string;
  completo: boolean;
}

export interface MockVagaData {
  id: string;
  titulo: string;
  empresa: string;
  localizacao: string;
  tipoContrato: string;
  dataPostagem: string;
}

export interface MockNotaItemData {
  key: string;
  cursoId: string;
  cursoNome: string;
  turmaId: string;
  turmaNome: string;
  inscricaoId?: string;
  alunoId: string;
  nota: number | null;
  atualizadoEm: string;
  motivo?: string | null;
  origem?: {
    tipo: "PROVA" | "ATIVIDADE" | "AULA" | "OUTRO";
    id?: string | null;
    titulo?: string | null;
  } | null;
  isManual: boolean;
  history: Array<{
    id: string;
    action: "ADDED" | "REMOVED";
    at: string;
    nota: number | null;
    motivo?: string | null;
    origem?: {
      tipo: "PROVA" | "ATIVIDADE" | "AULA" | "OUTRO";
      id?: string | null;
      titulo?: string | null;
    } | null;
  }>;
}

export interface MockFrequenciaItemData {
  id: string;
  key: string;
  cursoId: string;
  cursoNome: string;
  turmaId: string;
  turmaNome: string;
  aulaId: string;
  aulaNome: string;
  inscricaoId: string;
  alunoId: string;
  statusAtual: "PRESENTE" | "AUSENTE" | "JUSTIFICADO" | "ATRASADO";
  justificativa?: string | null;
  observacoes?: string | null;
  dataReferencia: string;
  evidence?: {
    ultimoLogin?: string | null;
    tempoAoVivoMin?: number | null;
  } | null;
}

export interface AlunoCandidatoOverviewData {
  cursos: MockCursoData[];
  vagas: MockVagaData[];
  notas: MockNotaItemData[];
  frequencias: MockFrequenciaItemData[];
  certificados: MockCertificadoItemData[];
  estatisticas: {
    totalCursos: number;
    cursosEmProgresso: number;
    cursosConcluidos: number;
    vagasSalvas: number;
  };
}

// Dados mockados para o aluno/candidato
export const MOCK_ALUNO_CANDIDATO_DATA: AlunoCandidatoOverviewData = {
  cursos: [
    {
      id: "curso-001",
      nome: "React Avançado",
      descricao:
        "Aprenda React avançado, hooks, context API, performance e padrões modernos.",
      imagemUrl: "/academia/cursos/react-avancado.jpg",
      status: "EM_PROGRESSO",
      percentualConcluido: 65,
      dataInicio: "2024-01-15",
    },
    {
      id: "curso-002",
      nome: "TypeScript Essencial",
      descricao:
        "Domine os fundamentos do TypeScript para projetos robustos e escaláveis.",
      imagemUrl: "/academia/cursos/typescript-essencial.jpg",
      status: "EM_PROGRESSO",
      percentualConcluido: 42,
      dataInicio: "2024-02-01",
    },
    {
      id: "curso-003",
      nome: "Node.js Backend",
      descricao:
        "Construa APIs e serviços backend eficientes com Node.js e Express.",
      imagemUrl: "/academia/cursos/nodejs-backend.jpg",
      status: "CONCLUIDO",
      percentualConcluido: 100,
      dataInicio: "2024-01-01",
      dataFim: "2024-12-20",
    },
    {
      id: "curso-004",
      nome: "Design UX/UI",
      descricao:
        "Conceitos essenciais de UX/UI para criar interfaces intuitivas e atraentes.",
      imagemUrl: "/academia/cursos/design-uxui.jpg",
      status: "NAO_INICIADO",
      percentualConcluido: 0,
      dataInicio: "2025-02-01",
    },
    {
      id: "curso-005",
      nome: "Python para Data Science",
      descricao:
        "Aprenda Python do zero e domine bibliotecas essenciais para análise de dados.",
      imagemUrl: "/academia/cursos/python-datascience.jpg",
      status: "EM_PROGRESSO",
      percentualConcluido: 30,
      dataInicio: "2024-12-10",
    },
    {
      id: "curso-006",
      nome: "Docker e Kubernetes",
      descricao:
        "Containerização e orquestração de aplicações com Docker e Kubernetes.",
      imagemUrl: "/academia/cursos/docker-kubernetes.jpg",
      status: "EM_PROGRESSO",
      percentualConcluido: 55,
      dataInicio: "2024-11-20",
    },
    {
      id: "curso-007",
      nome: "GraphQL Avançado",
      descricao:
        "Domine GraphQL com Apollo, subscriptions e otimizações de performance.",
      imagemUrl: "/academia/cursos/graphql-avancado.jpg",
      status: "CONCLUIDO",
      percentualConcluido: 100,
      dataInicio: "2024-10-01",
      dataFim: "2024-12-15",
    },
    {
      id: "curso-008",
      nome: "AWS Cloud Practitioner",
      descricao:
        "Fundamentos da AWS e serviços essenciais para deploy e infraestrutura na nuvem.",
      imagemUrl: "/academia/cursos/aws-cloud.jpg",
      status: "NAO_INICIADO",
      percentualConcluido: 0,
      dataInicio: "2025-03-01",
    },
  ],
  vagas: [
    {
      id: "vaga-001",
      titulo: "Desenvolvedor React Sênior",
      empresa: "Tech Company XYZ",
      localizacao: "São Paulo, SP",
      tipoContrato: "CLT",
      dataPostagem: "2025-01-03",
    },
    {
      id: "vaga-002",
      titulo: "Desenvolvedor Full Stack",
      empresa: "Startup ABCD",
      localizacao: "Remoto",
      tipoContrato: "PJ",
      dataPostagem: "2025-01-02",
    },
    {
      id: "vaga-003",
      titulo: "Frontend Developer",
      empresa: "E-commerce Solutions",
      localizacao: "Rio de Janeiro, RJ",
      tipoContrato: "CLT",
      dataPostagem: "2025-01-01",
    },
    {
      id: "vaga-004",
      titulo: "Backend Developer Python",
      empresa: "Fintech Solutions",
      localizacao: "São Paulo, SP",
      tipoContrato: "CLT",
      dataPostagem: "2024-12-28",
    },
    {
      id: "vaga-005",
      titulo: "DevOps Engineer",
      empresa: "Cloud Tech",
      localizacao: "Remoto",
      tipoContrato: "PJ",
      dataPostagem: "2024-12-25",
    },
    {
      id: "vaga-006",
      titulo: "Mobile Developer React Native",
      empresa: "App Innovations",
      localizacao: "Belo Horizonte, MG",
      tipoContrato: "CLT",
      dataPostagem: "2024-12-20",
    },
    {
      id: "vaga-007",
      titulo: "QA Engineer",
      empresa: "Quality Systems",
      localizacao: "Curitiba, PR",
      tipoContrato: "CLT",
      dataPostagem: "2024-12-15",
    },
    {
      id: "vaga-008",
      titulo: "Tech Lead",
      empresa: "Enterprise Solutions",
      localizacao: "São Paulo, SP",
      tipoContrato: "CLT",
      dataPostagem: "2024-12-10",
    },
  ],
  notas: [
    {
      key: "curso-001::turma-001::aluno-001",
      cursoId: "curso-001",
      cursoNome: "React Avançado",
      turmaId: "turma-001",
      turmaNome: "Turma A - Manhã",
      inscricaoId: "inscricao-001",
      alunoId: "aluno-001",
      nota: 8.5,
      atualizadoEm: "2025-01-15T10:30:00.000Z",
      motivo: "Avaliação prática de componentes",
      origem: {
        tipo: "PROVA",
        id: "prova-001",
        titulo: "Prova Final - Componentes React",
      },
      isManual: false,
      history: [
        {
          id: "hist-001",
          action: "ADDED",
          at: "2025-01-15T10:30:00.000Z",
          nota: 8.5,
          motivo: "Avaliação prática de componentes",
          origem: {
            tipo: "PROVA",
            id: "prova-001",
            titulo: "Prova Final - Componentes React",
          },
        },
      ],
    },
    {
      key: "curso-001::turma-001::aluno-001-atividade",
      cursoId: "curso-001",
      cursoNome: "React Avançado",
      turmaId: "turma-001",
      turmaNome: "Turma A - Manhã",
      inscricaoId: "inscricao-001",
      alunoId: "aluno-001",
      nota: 9.0,
      atualizadoEm: "2025-01-10T14:20:00.000Z",
      motivo: "Trabalho prático entregue",
      origem: {
        tipo: "ATIVIDADE",
        id: "atividade-001",
        titulo: "Projeto: Dashboard Interativo",
      },
      isManual: false,
      history: [
        {
          id: "hist-002",
          action: "ADDED",
          at: "2025-01-10T14:20:00.000Z",
          nota: 9.0,
          motivo: "Trabalho prático entregue",
          origem: {
            tipo: "ATIVIDADE",
            id: "atividade-001",
            titulo: "Projeto: Dashboard Interativo",
          },
        },
      ],
    },
    {
      key: "curso-002::turma-002::aluno-001",
      cursoId: "curso-002",
      cursoNome: "TypeScript Essencial",
      turmaId: "turma-002",
      turmaNome: "Turma B - Tarde",
      inscricaoId: "inscricao-002",
      alunoId: "aluno-001",
      nota: 7.5,
      atualizadoEm: "2025-01-20T09:15:00.000Z",
      motivo: "Avaliação de tipos e interfaces",
      origem: {
        tipo: "PROVA",
        id: "prova-002",
        titulo: "Prova: Tipos e Interfaces TypeScript",
      },
      isManual: false,
      history: [
        {
          id: "hist-003",
          action: "ADDED",
          at: "2025-01-20T09:15:00.000Z",
          nota: 7.5,
          motivo: "Avaliação de tipos e interfaces",
          origem: {
            tipo: "PROVA",
            id: "prova-002",
            titulo: "Prova: Tipos e Interfaces TypeScript",
          },
        },
      ],
    },
    {
      key: "curso-003::turma-003::aluno-001",
      cursoId: "curso-003",
      cursoNome: "Node.js Backend",
      turmaId: "turma-003",
      turmaNome: "Turma C - Noite",
      inscricaoId: "inscricao-003",
      alunoId: "aluno-001",
      nota: 9.5,
      atualizadoEm: "2024-12-20T16:45:00.000Z",
      motivo: "Projeto final de API REST",
      origem: {
        tipo: "ATIVIDADE",
        id: "atividade-002",
        titulo: "Projeto Final: API REST Completa",
      },
      isManual: false,
      history: [
        {
          id: "hist-004",
          action: "ADDED",
          at: "2024-12-20T16:45:00.000Z",
          nota: 9.5,
          motivo: "Projeto final de API REST",
          origem: {
            tipo: "ATIVIDADE",
            id: "atividade-002",
            titulo: "Projeto Final: API REST Completa",
          },
        },
      ],
    },
    {
      key: "curso-005::turma-005::aluno-001",
      cursoId: "curso-005",
      cursoNome: "Python para Data Science",
      turmaId: "turma-005",
      turmaNome: "Turma A - Manhã",
      inscricaoId: "inscricao-005",
      alunoId: "aluno-001",
      nota: 6.5,
      atualizadoEm: "2025-01-05T11:00:00.000Z",
      motivo: "Avaliação de bibliotecas pandas e numpy",
      origem: {
        tipo: "PROVA",
        id: "prova-003",
        titulo: "Prova: Pandas e NumPy",
      },
      isManual: false,
      history: [
        {
          id: "hist-005",
          action: "ADDED",
          at: "2025-01-05T11:00:00.000Z",
          nota: 6.5,
          motivo: "Avaliação de bibliotecas pandas e numpy",
          origem: {
            tipo: "PROVA",
            id: "prova-003",
            titulo: "Prova: Pandas e NumPy",
          },
        },
      ],
    },
    {
      key: "curso-006::turma-006::aluno-001",
      cursoId: "curso-006",
      cursoNome: "Docker e Kubernetes",
      turmaId: "turma-006",
      turmaNome: "Turma B - Tarde",
      inscricaoId: "inscricao-006",
      alunoId: "aluno-001",
      nota: 8.0,
      atualizadoEm: "2025-01-12T13:30:00.000Z",
      motivo: "Prática de containerização",
      origem: {
        tipo: "ATIVIDADE",
        id: "atividade-003",
        titulo: "Prática: Containerização de Aplicação",
      },
      isManual: false,
      history: [
        {
          id: "hist-006",
          action: "ADDED",
          at: "2025-01-12T13:30:00.000Z",
          nota: 8.0,
          motivo: "Prática de containerização",
          origem: {
            tipo: "ATIVIDADE",
            id: "atividade-003",
            titulo: "Prática: Containerização de Aplicação",
          },
        },
      ],
    },
  ],
  frequencias: [
    {
      id: "freq-001",
      key: "freq-001",
      cursoId: "curso-001",
      cursoNome: "React Avançado",
      turmaId: "turma-001",
      turmaNome: "Turma A - Manhã",
      aulaId: "aula-001",
      aulaNome: "Introdução ao React Hooks",
      inscricaoId: "inscricao-001",
      alunoId: "aluno-001",
      statusAtual: "PRESENTE",
      justificativa: null,
      observacoes: null,
      dataReferencia: "2025-01-15T08:00:00.000Z",
      evidence: {
        ultimoLogin: "2025-01-15T08:05:00.000Z",
        tempoAoVivoMin: 120,
      },
    },
    {
      id: "freq-002",
      key: "freq-002",
      cursoId: "curso-001",
      cursoNome: "React Avançado",
      turmaId: "turma-001",
      turmaNome: "Turma A - Manhã",
      aulaId: "aula-002",
      aulaNome: "Context API e State Management",
      inscricaoId: "inscricao-001",
      alunoId: "aluno-001",
      statusAtual: "PRESENTE",
      justificativa: null,
      observacoes: null,
      dataReferencia: "2025-01-17T08:00:00.000Z",
      evidence: {
        ultimoLogin: "2025-01-17T08:10:00.000Z",
        tempoAoVivoMin: 90,
      },
    },
    {
      id: "freq-003",
      key: "freq-003",
      cursoId: "curso-001",
      cursoNome: "React Avançado",
      turmaId: "turma-001",
      turmaNome: "Turma A - Manhã",
      aulaId: "aula-003",
      aulaNome: "Performance e Otimização",
      inscricaoId: "inscricao-001",
      alunoId: "aluno-001",
      statusAtual: "ATRASADO",
      justificativa: "Problemas de conexão",
      observacoes: null,
      dataReferencia: "2025-01-20T08:00:00.000Z",
      evidence: {
        ultimoLogin: "2025-01-20T08:25:00.000Z",
        tempoAoVivoMin: 75,
      },
    },
    {
      id: "freq-004",
      key: "freq-004",
      cursoId: "curso-001",
      cursoNome: "React Avançado",
      turmaId: "turma-001",
      turmaNome: "Turma A - Manhã",
      aulaId: "aula-004",
      aulaNome: "Testes com Jest e React Testing Library",
      inscricaoId: "inscricao-001",
      alunoId: "aluno-001",
      statusAtual: "AUSENTE",
      justificativa: null,
      observacoes: null,
      dataReferencia: "2025-01-22T08:00:00.000Z",
      evidence: null,
    },
    {
      id: "freq-005",
      key: "freq-005",
      cursoId: "curso-001",
      cursoNome: "React Avançado",
      turmaId: "turma-001",
      turmaNome: "Turma A - Manhã",
      aulaId: "aula-005",
      aulaNome: "Deploy e CI/CD",
      inscricaoId: "inscricao-001",
      alunoId: "aluno-001",
      statusAtual: "JUSTIFICADO",
      justificativa: "Atestado médico",
      observacoes: null,
      dataReferencia: "2025-01-24T08:00:00.000Z",
      evidence: null,
    },
    {
      id: "freq-006",
      key: "freq-006",
      cursoId: "curso-002",
      cursoNome: "TypeScript Essencial",
      turmaId: "turma-002",
      turmaNome: "Turma B - Tarde",
      aulaId: "aula-006",
      aulaNome: "Tipos Básicos e Interfaces",
      inscricaoId: "inscricao-002",
      alunoId: "aluno-001",
      statusAtual: "PRESENTE",
      justificativa: null,
      observacoes: null,
      dataReferencia: "2025-01-18T14:00:00.000Z",
      evidence: {
        ultimoLogin: "2025-01-18T14:05:00.000Z",
        tempoAoVivoMin: 100,
      },
    },
    {
      id: "freq-007",
      key: "freq-007",
      cursoId: "curso-002",
      cursoNome: "TypeScript Essencial",
      turmaId: "turma-002",
      turmaNome: "Turma B - Tarde",
      aulaId: "aula-007",
      aulaNome: "Generics e Utility Types",
      inscricaoId: "inscricao-002",
      alunoId: "aluno-001",
      statusAtual: "PRESENTE",
      justificativa: null,
      observacoes: null,
      dataReferencia: "2025-01-21T14:00:00.000Z",
      evidence: {
        ultimoLogin: "2025-01-21T14:02:00.000Z",
        tempoAoVivoMin: 110,
      },
    },
    {
      id: "freq-008",
      key: "freq-008",
      cursoId: "curso-003",
      cursoNome: "Node.js Backend",
      turmaId: "turma-003",
      turmaNome: "Turma C - Noite",
      aulaId: "aula-008",
      aulaNome: "Fundamentos do Node.js",
      inscricaoId: "inscricao-003",
      alunoId: "aluno-001",
      statusAtual: "PRESENTE",
      justificativa: null,
      observacoes: null,
      dataReferencia: "2024-12-10T19:00:00.000Z",
      evidence: {
        ultimoLogin: "2024-12-10T19:05:00.000Z",
        tempoAoVivoMin: 150,
      },
    },
    {
      id: "freq-009",
      key: "freq-009",
      cursoId: "curso-003",
      cursoNome: "Node.js Backend",
      turmaId: "turma-003",
      turmaNome: "Turma C - Noite",
      aulaId: "aula-009",
      aulaNome: "Express.js e Middlewares",
      inscricaoId: "inscricao-003",
      alunoId: "aluno-001",
      statusAtual: "PRESENTE",
      justificativa: null,
      observacoes: null,
      dataReferencia: "2024-12-12T19:00:00.000Z",
      evidence: {
        ultimoLogin: "2024-12-12T19:03:00.000Z",
        tempoAoVivoMin: 140,
      },
    },
    {
      id: "freq-010",
      key: "freq-010",
      cursoId: "curso-005",
      cursoNome: "Python para Data Science",
      turmaId: "turma-005",
      turmaNome: "Turma A - Manhã",
      aulaId: "aula-010",
      aulaNome: "Introdução ao Pandas",
      inscricaoId: "inscricao-005",
      alunoId: "aluno-001",
      statusAtual: "PRESENTE",
      justificativa: null,
      observacoes: null,
      dataReferencia: "2025-01-08T08:00:00.000Z",
      evidence: {
        ultimoLogin: "2025-01-08T08:07:00.000Z",
        tempoAoVivoMin: 95,
      },
    },
  ],
  certificados: [
    {
      id: "cert-001",
      key: "cert-001",
      codigo: "CERT-2025-001",
      cursoId: "curso-001",
      cursoNome: "React Avançado",
      turmaId: "turma-001",
      turmaNome: "Turma A - Manhã",
      inscricaoId: "inscricao-001",
      alunoId: "aluno-001",
      emitidoEm: "2025-01-25T10:00:00.000Z",
      pdfUrl: "https://example.com/certificados/cert-001.pdf",
      templateId: "modelo-padrao-001",
      cargaHoraria: 80,
      dataInicio: "2024-01-15",
      dataFim: "2025-01-25",
    },
    {
      id: "cert-002",
      key: "cert-002",
      codigo: "CERT-2025-002",
      cursoId: "curso-003",
      cursoNome: "Node.js Backend",
      turmaId: "turma-003",
      turmaNome: "Turma C - Noite",
      inscricaoId: "inscricao-003",
      alunoId: "aluno-001",
      emitidoEm: "2024-12-20T18:00:00.000Z",
      pdfUrl: "https://example.com/certificados/cert-002.pdf",
      templateId: "modelo-padrao-001",
      cargaHoraria: 60,
      dataInicio: "2024-09-01",
      dataFim: "2024-12-20",
    },
    {
      id: "cert-003",
      key: "cert-003",
      codigo: "CERT-2025-003",
      cursoId: "curso-004",
      cursoNome: "JavaScript Moderno",
      turmaId: "turma-004",
      turmaNome: "Turma A - Tarde",
      inscricaoId: "inscricao-004",
      alunoId: "aluno-001",
      emitidoEm: "2024-11-15T14:00:00.000Z",
      pdfUrl: "https://example.com/certificados/cert-003.pdf",
      templateId: "modelo-simples-001",
      cargaHoraria: 40,
      dataInicio: "2024-08-01",
      dataFim: "2024-11-15",
    },
  ],
  estatisticas: {
    totalCursos: 8,
    cursosEmProgresso: 4,
    cursosConcluidos: 2,
    vagasSalvas: 8,
  },
};

/**
 * Retorna os dados mockados do aluno/candidato
 */
export function getMockAlunoCandidatoData(): AlunoCandidatoOverviewData {
  return structuredClone(MOCK_ALUNO_CANDIDATO_DATA);
}

/**
 * Retorna as notas mockadas do aluno/candidato
 * Filtra por cursoId (retorna todas as notas do curso, independente da turma)
 */
export function getMockAlunoNotas(cursoId?: string | null): MockNotaItemData[] {
  const allNotas = MOCK_ALUNO_CANDIDATO_DATA.notas;

  if (!cursoId) {
    return [];
  }

  return allNotas.filter((nota) => nota.cursoId === cursoId);
}

/**
 * Retorna as frequências mockadas do aluno/candidato
 */
export function getMockAlunoFrequencias(
  cursoId?: string | null,
  aulaId?: string | null
): MockFrequenciaItemData[] {
  const allFrequencias = MOCK_ALUNO_CANDIDATO_DATA.frequencias ?? [];

  let filtered = allFrequencias;

  if (cursoId) {
    filtered = filtered.filter((freq) => freq.cursoId === cursoId);
  }

  if (aulaId) {
    filtered = filtered.filter((freq) => freq.aulaId === aulaId);
  }

  return filtered;
}

/**
 * Retorna os certificados mockados do aluno/candidato
 */
export function getMockAlunoCertificados(
  cursoId?: string | null
): MockCertificadoItemData[] {
  const allCertificados = MOCK_ALUNO_CANDIDATO_DATA.certificados ?? [];

  if (!cursoId) {
    return allCertificados;
  }

  return allCertificados.filter((cert) => cert.cursoId === cursoId);
}

export interface MockEstagioItemData {
  id: string;
  key: string;
  cursoId: string;
  cursoNome: string;
  turmaId: string;
  turmaNome: string;
  inscricaoId: string;
  alunoId: string;
  empresaNome: string;
  empresaTelefone?: string;
  cep: string;
  rua: string;
  numero: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  dataInicioPrevista: string;
  dataFimPrevista: string;
  horarioInicio: string;
  horarioFim: string;
  status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";
  compareceu?: boolean | null;
  aprovado?: boolean | null;
  observacoes?: string | null;
  criadoEm: string;
  atualizadoEm?: string;
}

const MOCK_ESTAGIOS: MockEstagioItemData[] = [
  {
    id: "estagio-001",
    key: "estagio-001",
    cursoId: "curso-001",
    cursoNome: "React Avançado",
    turmaId: "turma-001",
    turmaNome: "Turma A - Manhã",
    inscricaoId: "inscricao-001",
    alunoId: "aluno-001",
    empresaNome: "Tech Solutions Ltda",
    empresaTelefone: "(11) 98765-4321",
    cep: "01310-100",
    rua: "Avenida Paulista",
    numero: "1578",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
    dataInicioPrevista: "2025-02-01",
    dataFimPrevista: "2025-05-31",
    horarioInicio: "08:00",
    horarioFim: "12:00",
    status: "EM_ANDAMENTO",
    compareceu: true,
    aprovado: null,
    criadoEm: "2024-12-15T10:00:00Z",
    atualizadoEm: "2025-01-15T14:30:00Z",
  },
  {
    id: "estagio-002",
    key: "estagio-002",
    cursoId: "curso-002",
    cursoNome: "Node.js Backend",
    turmaId: "turma-002",
    turmaNome: "Turma B - Tarde",
    inscricaoId: "inscricao-002",
    alunoId: "aluno-001",
    empresaNome: "Digital Innovations S.A.",
    empresaTelefone: "(21) 3456-7890",
    cep: "20040-020",
    rua: "Rua do Ouvidor",
    numero: "50",
    bairro: "Centro",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    dataInicioPrevista: "2025-03-01",
    dataFimPrevista: "2025-06-30",
    horarioInicio: "14:00",
    horarioFim: "18:00",
    status: "PENDENTE",
    compareceu: null,
    aprovado: null,
    criadoEm: "2025-01-10T09:00:00Z",
  },
  {
    id: "estagio-003",
    key: "estagio-003",
    cursoId: "curso-003",
    cursoNome: "TypeScript Completo",
    turmaId: "turma-003",
    turmaNome: "Turma C - Noite",
    inscricaoId: "inscricao-003",
    alunoId: "aluno-001",
    empresaNome: "Startup Tech",
    empresaTelefone: "(31) 99876-5432",
    cep: "30130-010",
    rua: "Avenida Afonso Pena",
    numero: "3000",
    bairro: "Centro",
    cidade: "Belo Horizonte",
    estado: "MG",
    dataInicioPrevista: "2024-11-01",
    dataFimPrevista: "2025-01-31",
    horarioInicio: "19:00",
    horarioFim: "23:00",
    status: "CONCLUIDO",
    compareceu: true,
    aprovado: true,
    observacoes:
      "Estágio concluído com sucesso. Aluno demonstrou excelente desempenho.",
    criadoEm: "2024-10-20T08:00:00Z",
    atualizadoEm: "2025-01-31T18:00:00Z",
  },
];

/**
 * Retorna os estágios mockados do aluno/candidato
 */
export function getMockAlunoEstagios(
  cursoId?: string | null
): MockEstagioItemData[] {
  const allEstagios = MOCK_ESTAGIOS;

  if (!cursoId) {
    return allEstagios;
  }

  return allEstagios.filter((estagio) => estagio.cursoId === cursoId);
}
