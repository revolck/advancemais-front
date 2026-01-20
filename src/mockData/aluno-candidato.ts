/**
 * Mock de dados para Aluno/Candidato
 * Usado na visão geral do dashboard
 */

import type { BuilderData } from "@/components/ui/custom/builder-manager/types";

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
      nome: "Docker e Kubernetes",
      descricao:
        "Containerização e orquestração de aplicações com Docker e Kubernetes.",
      imagemUrl: "/academia/cursos/docker-kubernetes.jpg",
      status: "EM_PROGRESSO",
      percentualConcluido: 15,
      dataInicio: "2026-01-14",
      dataFim: "2026-01-31",
    },
    {
      id: "curso-006",
      nome: "Vue.js Avançado",
      descricao:
        "Domine Vue.js 3, Composition API, Pinia e padrões avançados.",
      imagemUrl: "/academia/cursos/vuejs-avancado.jpg",
      status: "EM_PROGRESSO",
      percentualConcluido: 20,
      dataInicio: "2026-01-14",
      dataFim: "2026-01-31",
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

// Interfaces e tipos para cursos do aluno
export interface MockCursoItemData {
  id: string;
  key: string;
  cursoId: string;
  cursoNome: string;
  cursoDescricao: string;
  cursoImagemUrl: string;
  turmaId: string;
  turmaNome: string;
  turmaTipo?: "ONLINE" | "AO_VIVO" | "PRESENCIAL" | "SEMIPRESENCIAL";
  inscricaoId: string;
  alunoId: string;
  status: "EM_PROGRESSO" | "CONCLUIDO" | "NAO_INICIADO";
  percentualConcluido: number;
  dataInicio: string;
  dataFim?: string | null;
  cargaHoraria?: number;
  notaMedia?: number | null;
  totalAulas?: number;
  aulasConcluidas?: number;
  criadoEm: string;
  atualizadoEm?: string;
  disciplina?: string;
  progressoDetalhado?: {
    videos: { completados: number; total: number };
    documentos: { completados: number; total: number };
    exercicios: { completados: number; total: number };
    discussoes: { completados: number; total: number };
    avaliacoes: { completados: number; total: number };
  };
  proximaAula?: {
    aulaId: string;
    aulaNome: string;
    dataInicio: string;
    horaInicio: string;
    meetUrl?: string;
  } | null;
}

// Interface para progresso de itens da estrutura do curso
export interface MockItemProgresso {
  itemId: string;
  status: "NAO_INICIADO" | "EM_PROGRESSO" | "CONCLUIDO";
  percentualConcluido: number;
  nota?: number | null;
  tentativas?: number;
  ultimaTentativa?: string;
  dataConclusao?: string;
}

const MOCK_CURSOS_ALUNO: MockCursoItemData[] = [
  {
    id: "curso-aluno-001",
    key: "curso-001::turma-001::inscricao-001",
    cursoId: "curso-001",
    cursoNome: "React Avançado",
    cursoDescricao:
      "Aprenda React avançado, hooks, context API, performance e padrões modernos.",
    cursoImagemUrl: "/academia/cursos/react-avancado.jpg",
    turmaId: "turma-001",
    turmaNome: "Turma A - Manhã",
    turmaTipo: "ONLINE",
    inscricaoId: "inscricao-001",
    alunoId: "aluno-001",
    status: "EM_PROGRESSO",
    percentualConcluido: 65,
    dataInicio: "2024-01-15",
    dataFim: "2025-12-31", // Período do curso encerrou
    cargaHoraria: 80,
    notaMedia: 8.5,
    totalAulas: 20,
    aulasConcluidas: 13,
    criadoEm: "2024-01-10T08:00:00Z",
    atualizadoEm: "2025-01-22T14:30:00Z",
    disciplina: "Desenvolvimento Frontend",
    progressoDetalhado: {
      videos: { completados: 13, total: 20 },
      documentos: { completados: 8, total: 10 },
      exercicios: { completados: 12, total: 15 },
      discussoes: { completados: 3, total: 5 },
      avaliacoes: { completados: 1, total: 1 },
    },
    proximaAula: {
      aulaId: "aula-014",
      aulaNome: "React Hooks Avançados",
      dataInicio: "2025-01-25",
      horaInicio: "10:00",
    },
  },
  {
    id: "curso-aluno-002",
    key: "curso-002::turma-002::inscricao-002",
    cursoId: "curso-002",
    cursoNome: "TypeScript Essencial",
    cursoDescricao:
      "Domine os fundamentos do TypeScript para projetos robustos e escaláveis.",
    cursoImagemUrl: "/academia/cursos/typescript-essencial.jpg",
    turmaId: "turma-002",
    turmaNome: "Turma B - Tarde",
    turmaTipo: "AO_VIVO",
    inscricaoId: "inscricao-002",
    alunoId: "aluno-001",
    status: "EM_PROGRESSO",
    percentualConcluido: 42,
    dataInicio: "2024-02-01",
    dataFim: "2025-03-31",
    cargaHoraria: 60,
    notaMedia: 7.8,
    totalAulas: 15,
    aulasConcluidas: 6,
    criadoEm: "2024-01-28T10:00:00Z",
    atualizadoEm: "2025-01-20T16:45:00Z",
    disciplina: "Linguagens de Programação",
    proximaAula: {
      aulaId: "aula-007",
      aulaNome: "TypeScript Generics e Utility Types",
      dataInicio: "2025-01-26",
      horaInicio: "14:00",
      meetUrl: "https://meet.google.com/abc-defg-hij",
    },
  },
  {
    id: "curso-aluno-003",
    key: "curso-003::turma-003::inscricao-003",
    cursoId: "curso-003",
    cursoNome: "Node.js Backend",
    cursoDescricao:
      "Construa APIs e serviços backend eficientes com Node.js e Express.",
    cursoImagemUrl: "/academia/cursos/nodejs-backend.jpg",
    turmaId: "turma-003",
    turmaNome: "Turma C - Noite",
    turmaTipo: "PRESENCIAL",
    inscricaoId: "inscricao-003",
    alunoId: "aluno-001",
    status: "CONCLUIDO",
    percentualConcluido: 100,
    dataInicio: "2024-01-01",
    dataFim: "2024-12-20",
    cargaHoraria: 100,
    notaMedia: 9.2,
    totalAulas: 25,
    aulasConcluidas: 25,
    criadoEm: "2023-12-15T09:00:00Z",
    atualizadoEm: "2024-12-20T18:00:00Z",
    disciplina: "Desenvolvimento Backend",
  },
  {
    id: "curso-aluno-005",
    key: "curso-005::turma-005::inscricao-005",
    cursoId: "curso-005",
    cursoNome: "Docker e Kubernetes",
    cursoDescricao:
      "Aprenda a containerizar aplicações e orquestrar com Kubernetes.",
    cursoImagemUrl: "/academia/cursos/docker-kubernetes.jpg",
    turmaId: "turma-005",
    turmaNome: "Turma E - Presencial",
    turmaTipo: "PRESENCIAL",
    inscricaoId: "inscricao-005",
    alunoId: "aluno-001",
    status: "EM_PROGRESSO",
    percentualConcluido: 15,
    dataInicio: "2026-01-14",
    dataFim: "2026-01-31",
    cargaHoraria: 40,
    notaMedia: null,
    totalAulas: 10,
    aulasConcluidas: 1,
    criadoEm: "2026-01-10T08:00:00Z",
    atualizadoEm: "2026-01-14T10:00:00Z",
    disciplina: "DevOps",
    progressoDetalhado: {
      videos: { completados: 1, total: 10 },
      documentos: { completados: 0, total: 5 },
      exercicios: { completados: 0, total: 8 },
      discussoes: { completados: 0, total: 3 },
      avaliacoes: { completados: 0, total: 1 },
    },
  },
  {
    id: "curso-aluno-006",
    key: "curso-006::turma-006::inscricao-006",
    cursoId: "curso-006",
    cursoNome: "Vue.js Avançado",
    cursoDescricao:
      "Domine Vue.js 3, Composition API, Pinia e padrões avançados.",
    cursoImagemUrl: "/academia/cursos/vuejs-avancado.jpg",
    turmaId: "turma-006",
    turmaNome: "Turma F - Ao Vivo",
    turmaTipo: "AO_VIVO",
    inscricaoId: "inscricao-006",
    alunoId: "aluno-001",
    status: "EM_PROGRESSO",
    percentualConcluido: 20,
    dataInicio: "2026-01-14",
    dataFim: "2026-01-31",
    cargaHoraria: 50,
    notaMedia: null,
    totalAulas: 12,
    aulasConcluidas: 2,
    criadoEm: "2026-01-10T08:00:00Z",
    atualizadoEm: "2026-01-14T14:00:00Z",
    disciplina: "Desenvolvimento Frontend",
    progressoDetalhado: {
      videos: { completados: 2, total: 12 },
      documentos: { completados: 1, total: 6 },
      exercicios: { completados: 1, total: 10 },
      discussoes: { completados: 0, total: 4 },
      avaliacoes: { completados: 0, total: 2 },
    },
    proximaAula: {
      aulaId: "aula-003",
      aulaNome: "Composition API e Reatividade",
      dataInicio: "2026-01-15",
      horaInicio: "14:00",
      meetUrl: "https://meet.google.com/vue-avancado-001",
    },
  },
];

/**
 * Retorna os cursos mockados do aluno/candidato
 */
export function getMockAlunoCursos(
  cursoId?: string | null,
  status?: "EM_PROGRESSO" | "CONCLUIDO" | "NAO_INICIADO" | null
): MockCursoItemData[] {
  let cursos = [...MOCK_CURSOS_ALUNO];

  if (cursoId) {
    cursos = cursos.filter((curso) => curso.cursoId === cursoId);
  }

  if (status) {
    cursos = cursos.filter((curso) => curso.status === status);
  }

  return cursos;
}

/**
 * Retorna a estrutura mockada de uma turma
 */
export function getMockTurmaEstrutura(
  cursoId: string,
  turmaId: string
): BuilderData | null {
  if (cursoId === "curso-001" && turmaId === "turma-001") {
    return {
      modules: [
        {
          id: "mod-1",
          title: "Módulo 1: Fundamentos do React",
          startDate: "2025-01-15",
          endDate: "2025-02-15",
          items: [
            {
              id: "aula-1",
              title: "Introdução ao React e JSX",
              type: "AULA",
              startDate: "2025-01-15",
              endDate: "2025-01-15",
              aulaId: "aula-001",
            },
            {
              id: "aula-2",
              title: "Componentes Funcionais e Props",
              type: "AULA",
              startDate: "2025-01-20",
              endDate: "2025-01-20",
              aulaId: "aula-002",
            },
            {
              id: "atividade-1",
              title: "Atividade 01 - Fixação de Conceitos",
              type: "ATIVIDADE",
              startDate: "2025-01-22",
              endDate: "2025-01-25",
              activityType: "PLATAFORMA",
              platformActivityId: "atividade-001",
            },
            {
              id: "atividade-3",
              title: "Atividade 03 - Perguntas e Respostas",
              type: "ATIVIDADE",
              startDate: "2025-01-26",
              endDate: "2025-01-30",
              activityType: "PLATAFORMA",
              platformActivityId: "atividade-003",
            },
            {
              id: "atividade-4",
              title: "Atividade 04 - Análise de Código",
              type: "ATIVIDADE",
              startDate: "2025-01-31",
              endDate: "2025-02-05",
              activityType: "PLATAFORMA",
              platformActivityId: "atividade-004",
            },
            {
              id: "atividade-5",
              title: "Atividade 05 - Conceitos Avançados",
              type: "ATIVIDADE",
              startDate: "2026-01-05",
              endDate: "2026-01-10",
              activityType: "PLATAFORMA",
              platformActivityId: "atividade-005",
            },
            {
              id: "prova-1",
              title: "Prova do Módulo 1",
              type: "PROVA",
              startDate: "2025-02-10",
              endDate: "2025-02-15",
            },
          ],
        },
        {
          id: "mod-2",
          title: "Módulo 2: Gerenciamento de Estado",
          startDate: "2025-02-16",
          endDate: "2025-03-16",
          items: [
            {
              id: "aula-3",
              title: "Context API e State Management Avançado",
              type: "AULA",
              startDate: "2025-02-20",
              endDate: "2025-02-20",
              aulaId: "aula-003",
            },
            {
              id: "aula-4",
              title: "Redux e Recoil: Comparativo",
              type: "AULA",
              startDate: "2025-02-25",
              endDate: "2025-02-25",
              aulaId: "aula-004",
            },
          ],
        },
      ],
      standaloneItems: [
        {
          id: "aula-5",
          title: "Custom Hooks",
          type: "AULA",
          startDate: "2025-03-01",
          endDate: "2025-03-01",
          aulaId: "aula-005",
        },
      ],
    };
  }

  if (cursoId === "curso-002" && turmaId === "turma-002") {
    return {
      modules: [
        {
          id: "mod-1",
          title: "Módulo 1: Fundamentos do TypeScript",
          startDate: "2025-02-01",
          endDate: "2025-02-28",
          items: [
            {
              id: "aula-1",
              title: "Tipos Básicos e Annotations",
              type: "AULA",
              startDate: "2025-02-01",
              endDate: "2025-02-01",
              aulaId: "aula-101",
            },
            {
              id: "aula-2",
              title: "Interfaces e Types",
              type: "AULA",
              startDate: "2025-02-05",
              endDate: "2025-02-05",
              aulaId: "aula-102",
            },
          ],
        },
      ],
    };
  }

  // Turma PRESENCIAL (curso-003/turma-003)
  if (cursoId === "curso-003" && turmaId === "turma-003") {
    return {
      modules: [
        {
          id: "mod-1",
          title: "Módulo 1: Fundamentos do Node.js",
          startDate: "2024-01-01",
          endDate: "2024-03-01",
          items: [
            {
              id: "aula-pres-1",
              title: "Introdução ao Node.js e NPM",
              type: "AULA",
              startDate: "2024-01-05",
              endDate: "2024-01-05",
              aulaId: "aula-pres-001",
            },
            {
              id: "aula-pres-2",
              title: "Módulos e Require",
              type: "AULA",
              startDate: "2024-01-10",
              endDate: "2024-01-10",
              aulaId: "aula-pres-002",
            },
            {
              id: "prova-pres-1",
              title: "Prova Prática - Fundamentos",
              type: "PROVA",
              startDate: "2024-01-25",
              endDate: "2024-01-25",
            },
            {
              id: "atividade-pres-1",
              title: "Atividade Prática - Criar API REST",
              type: "ATIVIDADE",
              startDate: "2024-01-15",
              endDate: "2024-01-20",
            },
          ],
        },
        {
          id: "mod-2",
          title: "Módulo 2: Express e Middlewares",
          startDate: "2024-03-05",
          endDate: "2024-05-05",
          items: [
            {
              id: "aula-pres-3",
              title: "Criando Servidor Express",
              type: "AULA",
              startDate: "2024-03-05",
              endDate: "2024-03-05",
              aulaId: "aula-pres-003",
            },
            {
              id: "prova-pres-2",
              title: "Prova Final - Express",
              type: "PROVA",
              startDate: "2024-05-10",
              endDate: "2024-05-10",
            },
          ],
        },
      ],
    };
  }

  // Estrutura para curso-005 (Docker e Kubernetes - PRESENCIAL)
  if (cursoId === "curso-005" && turmaId === "turma-005") {
    return {
      modules: [
        {
          id: "mod-1",
          title: "Módulo 1: Fundamentos do Docker",
          startDate: "2026-01-14",
          endDate: "2026-01-20",
          items: [
            {
              id: "aula-docker-1",
              title: "Introdução ao Docker",
              type: "AULA",
              startDate: "2026-01-14",
              endDate: "2026-01-14",
              aulaId: "aula-docker-001",
            },
            {
              id: "atividade-docker-1",
              title: "Atividade 01 - Criar Primeiro Container",
              type: "ATIVIDADE",
              startDate: "2026-01-15",
              endDate: "2026-01-18",
              activityType: "PLATAFORMA",
              platformActivityId: "atividade-docker-001",
            },
          ],
        },
        {
          id: "mod-2",
          title: "Módulo 2: Kubernetes Básico",
          startDate: "2026-01-21",
          endDate: "2026-01-31",
          items: [
            {
              id: "aula-k8s-1",
              title: "Introdução ao Kubernetes",
              type: "AULA",
              startDate: "2026-01-21",
              endDate: "2026-01-21",
              aulaId: "aula-k8s-001",
            },
            {
              id: "prova-docker-1",
              title: "Prova Final - Docker e Kubernetes",
              type: "PROVA",
              startDate: "2026-01-28",
              endDate: "2026-01-31",
            },
          ],
        },
      ],
    };
  }

  // Estrutura para curso-006 (Vue.js Avançado - AO_VIVO)
  if (cursoId === "curso-006" && turmaId === "turma-006") {
    return {
      modules: [
        {
          id: "mod-1",
          title: "Módulo 1: Vue.js 3 e Composition API",
          startDate: "2026-01-14",
          endDate: "2026-01-22",
          items: [
            {
              id: "aula-vue-1",
              title: "Introdução ao Vue.js 3",
              type: "AULA",
              startDate: "2026-01-14",
              endDate: "2026-01-14",
              aulaId: "aula-vue-001",
            },
            {
              id: "aula-vue-2",
              title: "Composition API e Reatividade",
              type: "AULA",
              startDate: "2026-01-15",
              endDate: "2026-01-15",
              aulaId: "aula-vue-002",
            },
            {
              id: "aula-vue-3",
              title: "Pinia e Gerenciamento de Estado",
              type: "AULA",
              startDate: "2026-01-16",
              endDate: "2026-01-16",
              aulaId: "aula-vue-003",
            },
            {
              id: "atividade-vue-1",
              title: "Atividade 01 - Projeto Vue.js",
              type: "ATIVIDADE",
              startDate: "2026-01-17",
              endDate: "2026-01-20",
              activityType: "PLATAFORMA",
              platformActivityId: "atividade-vue-001",
            },
          ],
        },
        {
          id: "mod-2",
          title: "Módulo 2: Padrões Avançados",
          startDate: "2026-01-23",
          endDate: "2026-01-31",
          items: [
            {
              id: "aula-vue-4",
              title: "Teleport e Suspense",
              type: "AULA",
              startDate: "2026-01-23",
              endDate: "2026-01-23",
              aulaId: "aula-vue-004",
            },
            {
              id: "prova-vue-1",
              title: "Prova Final - Vue.js Avançado",
              type: "PROVA",
              startDate: "2026-01-28",
              endDate: "2026-01-31",
            },
          ],
        },
      ],
    };
  }

  return null;
}

/**
 * Retorna dados mockados de uma aula por ID
 */
export function getMockAulaById(aulaId: string): any | null {
  const mockAulas: Record<string, any> = {
    "aula-001": {
      id: "aula-001",
      codigo: "AUL-0001",
      titulo: "Introdução ao React e JSX",
      descricao:
        "Aula introdutória sobre React e JSX, fundamentos da biblioteca.",
      modalidade: "ONLINE",
      tipoLink: "YOUTUBE",
      youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      obrigatoria: true,
      duracaoMinutos: 45,
      status: "PUBLICADA",
      ordem: 1,
      dataInicio: "2025-01-15",
      dataFim: "2025-01-15",
      horaInicio: "08:00",
      horaFim: "08:45",
      gravarAula: false,
      linkGravacao: null,
      statusGravacao: null,
      criadoPor: {
        id: "user-001",
        nome: "Instrutor Teste",
        email: "instrutor@teste.com",
      },
      criadoEm: "2025-01-10T10:00:00.000Z",
      atualizadoEm: "2025-01-10T10:00:00.000Z",
    },
    "aula-002": {
      id: "aula-002",
      codigo: "AUL-0002",
      titulo: "Componentes Funcionais e Props",
      descricao:
        "Aprenda a criar componentes funcionais e trabalhar com props.",
      modalidade: "ONLINE",
      tipoLink: "YOUTUBE",
      youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      obrigatoria: true,
      duracaoMinutos: 60,
      status: "PUBLICADA",
      ordem: 2,
      dataInicio: "2025-01-20",
      dataFim: "2025-01-20",
      horaInicio: "08:00",
      horaFim: "09:00",
      gravarAula: false,
      linkGravacao: null,
      statusGravacao: null,
      criadoPor: {
        id: "user-001",
        nome: "Instrutor Teste",
        email: "instrutor@teste.com",
      },
      criadoEm: "2025-01-10T10:00:00.000Z",
      atualizadoEm: "2025-01-10T10:00:00.000Z",
    },
    "aula-003": {
      id: "aula-003",
      codigo: "AUL-0003",
      titulo: "Context API e State Management Avançado",
      descricao:
        "Aprofunde-se no Context API e gerenciamento de estado avançado.",
      modalidade: "ONLINE",
      youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      obrigatoria: true,
      duracaoMinutos: 90,
      status: "PUBLICADA",
      ordem: 1,
      gravarAula: false,
      linkGravacao: null,
      statusGravacao: null,
      criadoPor: {
        id: "user-001",
        nome: "Instrutor Teste",
        email: "instrutor@teste.com",
      },
      criadoEm: "2025-01-10T10:00:00.000Z",
      atualizadoEm: "2025-01-10T10:00:00.000Z",
    },
    "aula-004": {
      id: "aula-004",
      codigo: "AUL-0004",
      titulo: "Redux e Recoil: Comparativo",
      descricao: "Compare Redux e Recoil para gerenciamento de estado.",
      modalidade: "ONLINE",
      youtubeUrl: "https://www.youtube.com/embed/abc123xyz",
      obrigatoria: false,
      duracaoMinutos: 60,
      status: "PUBLICADA",
      ordem: 2,
      gravarAula: false,
      linkGravacao: null,
      statusGravacao: null,
      criadoPor: {
        id: "user-001",
        nome: "Instrutor Teste",
        email: "instrutor@teste.com",
      },
      criadoEm: "2025-01-10T10:00:00.000Z",
      atualizadoEm: "2025-01-10T10:00:00.000Z",
    },
    "aula-005": {
      id: "aula-005",
      codigo: "AUL-0005",
      titulo: "Custom Hooks",
      descricao: "Aprenda a criar e usar custom hooks no React.",
      modalidade: "ONLINE",
      tipoLink: "YOUTUBE",
      youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      obrigatoria: false,
      duracaoMinutos: 45,
      status: "PUBLICADA",
      ordem: 1,
      dataInicio: "2025-03-01",
      dataFim: "2025-03-01",
      horaInicio: "08:00",
      horaFim: "08:45",
      gravarAula: false,
      linkGravacao: null,
      statusGravacao: null,
      criadoPor: {
        id: "user-001",
        nome: "Instrutor Teste",
        email: "instrutor@teste.com",
      },
      criadoEm: "2025-01-10T10:00:00.000Z",
      atualizadoEm: "2025-01-10T10:00:00.000Z",
    },
    // Aulas PRESENCIAIS (curso-003/turma-003)
    "aula-pres-001": {
      id: "aula-pres-001",
      codigo: "AUL-PRES-001",
      titulo: "Introdução ao Node.js e NPM",
      descricao: "Aula presencial sobre fundamentos do Node.js e NPM.",
      modalidade: "PRESENCIAL",
      tipoLink: undefined,
      youtubeUrl: undefined,
      meetUrl: undefined,
      sala: "Sala 101",
      obrigatoria: true,
      duracaoMinutos: 120,
      status: "PUBLICADA",
      ordem: 1,
      dataInicio: "2024-01-05",
      dataFim: "2024-01-05",
      horaInicio: "08:00",
      horaFim: "10:00",
      gravarAula: false,
      linkGravacao: null,
      statusGravacao: null,
      criadoPor: {
        id: "user-001",
        nome: "Instrutor Presencial",
        email: "instrutor@teste.com",
      },
      criadoEm: "2024-01-01T10:00:00.000Z",
      atualizadoEm: "2024-01-01T10:00:00.000Z",
    },
    "aula-pres-002": {
      id: "aula-pres-002",
      codigo: "AUL-PRES-002",
      titulo: "Módulos e Require",
      descricao:
        "Aula presencial sobre módulos e sistema de require do Node.js.",
      modalidade: "PRESENCIAL",
      tipoLink: undefined,
      youtubeUrl: undefined,
      meetUrl: undefined,
      sala: "Sala 101",
      obrigatoria: true,
      duracaoMinutos: 120,
      status: "PUBLICADA",
      ordem: 2,
      dataInicio: "2024-01-10",
      dataFim: "2024-01-10",
      horaInicio: "08:00",
      horaFim: "10:00",
      gravarAula: false,
      linkGravacao: null,
      statusGravacao: null,
      criadoPor: {
        id: "user-001",
        nome: "Instrutor Presencial",
        email: "instrutor@teste.com",
      },
      criadoEm: "2024-01-01T10:00:00.000Z",
      atualizadoEm: "2024-01-01T10:00:00.000Z",
    },
    "aula-pres-003": {
      id: "aula-pres-003",
      codigo: "AUL-PRES-003",
      titulo: "Criando Servidor Express",
      descricao: "Aula presencial sobre criação de servidor Express.",
      modalidade: "PRESENCIAL",
      tipoLink: undefined,
      youtubeUrl: undefined,
      meetUrl: undefined,
      sala: "Sala 101",
      obrigatoria: true,
      duracaoMinutos: 120,
      status: "PUBLICADA",
      ordem: 1,
      dataInicio: "2024-03-05",
      dataFim: "2024-03-05",
      horaInicio: "08:00",
      horaFim: "10:00",
      gravarAula: false,
      linkGravacao: null,
      statusGravacao: null,
      criadoPor: {
        id: "user-001",
        nome: "Instrutor Presencial",
        email: "instrutor@teste.com",
      },
      criadoEm: "2024-01-01T10:00:00.000Z",
      atualizadoEm: "2024-01-01T10:00:00.000Z",
    },
    // Aulas para curso-005 (Docker e Kubernetes - PRESENCIAL)
    "aula-docker-001": {
      id: "aula-docker-001",
      codigo: "AUL-DOCKER-001",
      titulo: "Introdução ao Docker",
      descricao: "Aula presencial sobre fundamentos do Docker.",
      modalidade: "PRESENCIAL",
      tipoLink: undefined,
      youtubeUrl: undefined,
      meetUrl: undefined,
      sala: "Sala 201",
      endereco: "Rua das Flores, 123 - Centro, São Paulo - SP",
      obrigatoria: true,
      duracaoMinutos: 120,
      status: "PUBLICADA",
      ordem: 1,
      dataInicio: "2026-01-14",
      dataFim: "2026-01-14",
      horaInicio: "09:00",
      horaFim: "11:00",
      gravarAula: false,
      linkGravacao: null,
      statusGravacao: null,
      criadoPor: {
        id: "user-001",
        nome: "Instrutor Docker",
        email: "instrutor@teste.com",
      },
      criadoEm: "2026-01-10T10:00:00.000Z",
      atualizadoEm: "2026-01-10T10:00:00.000Z",
    },
    "aula-k8s-001": {
      id: "aula-k8s-001",
      codigo: "AUL-K8S-001",
      titulo: "Introdução ao Kubernetes",
      descricao: "Aula presencial sobre fundamentos do Kubernetes.",
      modalidade: "PRESENCIAL",
      tipoLink: undefined,
      youtubeUrl: undefined,
      meetUrl: undefined,
      sala: "Sala 201",
      obrigatoria: true,
      duracaoMinutos: 120,
      status: "PUBLICADA",
      ordem: 1,
      dataInicio: "2026-01-21",
      dataFim: "2026-01-21",
      horaInicio: "09:00",
      horaFim: "11:00",
      gravarAula: false,
      linkGravacao: null,
      statusGravacao: null,
      criadoPor: {
        id: "user-001",
        nome: "Instrutor Kubernetes",
        email: "instrutor@teste.com",
      },
      criadoEm: "2026-01-10T10:00:00.000Z",
      atualizadoEm: "2026-01-10T10:00:00.000Z",
    },
    // Aulas para curso-006 (Vue.js Avançado - AO_VIVO)
    "aula-vue-001": {
      id: "aula-vue-001",
      codigo: "AUL-VUE-001",
      titulo: "Introdução ao Vue.js 3",
      descricao: "Aula ao vivo sobre fundamentos do Vue.js 3.",
      modalidade: "AO_VIVO",
      tipoLink: "MEET",
      youtubeUrl: undefined,
      meetUrl: "https://meet.google.com/vue-intro-001",
      obrigatoria: true,
      duracaoMinutos: 90,
      status: "PUBLICADA",
      ordem: 1,
      dataInicio: "2026-01-14",
      dataFim: "2026-01-14",
      horaInicio: "14:00",
      horaFim: "15:30",
      gravarAula: true,
      linkGravacao: null,
      statusGravacao: null,
      criadoPor: {
        id: "user-001",
        nome: "Instrutor Vue.js",
        email: "instrutor@teste.com",
      },
      criadoEm: "2026-01-10T10:00:00.000Z",
      atualizadoEm: "2026-01-10T10:00:00.000Z",
    },
    "aula-vue-002": {
      id: "aula-vue-002",
      codigo: "AUL-VUE-002",
      titulo: "Composition API e Reatividade",
      descricao: "Aula ao vivo sobre Composition API e sistema de reatividade do Vue.js 3.",
      modalidade: "AO_VIVO",
      tipoLink: "MEET",
      youtubeUrl: undefined,
      meetUrl: "https://meet.google.com/vue-composition-001",
      obrigatoria: true,
      duracaoMinutos: 90,
      status: "PUBLICADA",
      ordem: 2,
      dataInicio: "2026-01-15",
      dataFim: "2026-01-15",
      horaInicio: "14:00",
      horaFim: "15:30",
      gravarAula: true,
      linkGravacao: null,
      statusGravacao: null,
      criadoPor: {
        id: "user-001",
        nome: "Instrutor Vue.js",
        email: "instrutor@teste.com",
      },
      criadoEm: "2026-01-10T10:00:00.000Z",
      atualizadoEm: "2026-01-10T10:00:00.000Z",
    },
    "aula-vue-003": {
      id: "aula-vue-003",
      codigo: "AUL-VUE-003",
      titulo: "Pinia e Gerenciamento de Estado",
      descricao: "Aula ao vivo sobre Pinia e gerenciamento de estado no Vue.js 3.",
      modalidade: "AO_VIVO",
      tipoLink: "MEET",
      youtubeUrl: undefined,
      meetUrl: "https://meet.google.com/vue-pinia-001",
      obrigatoria: true,
      duracaoMinutos: 90,
      status: "PUBLICADA",
      ordem: 3,
      dataInicio: "2026-01-16",
      dataFim: "2026-01-16",
      horaInicio: "14:00",
      horaFim: "15:30",
      gravarAula: true,
      linkGravacao: null,
      statusGravacao: null,
      criadoPor: {
        id: "user-001",
        nome: "Instrutor Vue.js",
        email: "instrutor@teste.com",
      },
      criadoEm: "2026-01-10T10:00:00.000Z",
      atualizadoEm: "2026-01-10T10:00:00.000Z",
    },
    "aula-vue-004": {
      id: "aula-vue-004",
      codigo: "AUL-VUE-004",
      titulo: "Teleport e Suspense",
      descricao: "Aula ao vivo sobre Teleport e Suspense no Vue.js 3.",
      modalidade: "AO_VIVO",
      tipoLink: "MEET",
      youtubeUrl: undefined,
      meetUrl: "https://meet.google.com/vue-teleport-001",
      obrigatoria: true,
      duracaoMinutos: 90,
      status: "PUBLICADA",
      ordem: 1,
      dataInicio: "2026-01-23",
      dataFim: "2026-01-23",
      horaInicio: "14:00",
      horaFim: "15:30",
      gravarAula: true,
      linkGravacao: null,
      statusGravacao: null,
      criadoPor: {
        id: "user-001",
        nome: "Instrutor Vue.js",
        email: "instrutor@teste.com",
      },
      criadoEm: "2026-01-10T10:00:00.000Z",
      atualizadoEm: "2026-01-10T10:00:00.000Z",
    },
  };

  return mockAulas[aulaId] || null;
}

/**
 * Retorna o progresso mockado do aluno em uma turma
 */
export function getMockTurmaProgresso(
  cursoId: string,
  turmaId: string
): Record<string, MockItemProgresso> {
  if (cursoId === "curso-001" && turmaId === "turma-001") {
    return {
      "aula-1": {
        itemId: "aula-1",
        status: "CONCLUIDO",
        percentualConcluido: 100,
        dataConclusao: "2025-01-15",
      },
      "aula-2": {
        itemId: "aula-2",
        status: "CONCLUIDO",
        percentualConcluido: 100,
        dataConclusao: "2025-01-20",
      },
      "atividade-1": {
        itemId: "atividade-1",
        status: "CONCLUIDO",
        percentualConcluido: 100,
        nota: 8.5,
        tentativas: 1,
        dataConclusao: "2025-01-24",
      },
      "prova-1": {
        itemId: "prova-1",
        status: "CONCLUIDO",
        percentualConcluido: 100,
        nota: 7.8,
        tentativas: 1,
        dataConclusao: "2025-02-12",
      },
      "aula-3": {
        itemId: "aula-3",
        status: "EM_PROGRESSO",
        percentualConcluido: 30,
        ultimaTentativa: "2025-02-22",
      },
      "aula-4": {
        itemId: "aula-4",
        status: "NAO_INICIADO",
        percentualConcluido: 0,
      },
      "aula-5": {
        itemId: "aula-5",
        status: "NAO_INICIADO",
        percentualConcluido: 0,
      },
      "atividade-4": {
        itemId: "atividade-4",
        status: "CONCLUIDO",
        percentualConcluido: 100,
        dataConclusao: "2025-01-20",
      },
      "atividade-5": {
        itemId: "atividade-5",
        status: "CONCLUIDO",
        percentualConcluido: 100,
        nota: 8.5,
        dataConclusao: "2026-01-10",
      },
    };
  }

  // Progresso para turma PRESENCIAL (curso-003/turma-003)
  if (cursoId === "curso-003" && turmaId === "turma-003") {
    return {
      "aula-pres-1": {
        itemId: "aula-pres-1",
        status: "CONCLUIDO",
        percentualConcluido: 100,
        dataConclusao: "2024-01-05",
      },
      "aula-pres-2": {
        itemId: "aula-pres-2",
        status: "CONCLUIDO",
        percentualConcluido: 100,
        dataConclusao: "2024-01-10",
      },
      "prova-pres-1": {
        itemId: "prova-pres-1",
        status: "CONCLUIDO",
        percentualConcluido: 100,
        nota: 8.5, // Nota lançada pelo instrutor após a prova presencial
        dataConclusao: "2024-01-25",
      },
      "atividade-pres-1": {
        itemId: "atividade-pres-1",
        status: "CONCLUIDO",
        percentualConcluido: 100,
        nota: 9.0, // Nota lançada pelo instrutor após avaliação presencial
        dataConclusao: "2024-01-20",
      },
      "aula-pres-3": {
        itemId: "aula-pres-3",
        status: "CONCLUIDO",
        percentualConcluido: 100,
        dataConclusao: "2024-03-05",
      },
      "prova-pres-2": {
        itemId: "prova-pres-2",
        status: "CONCLUIDO",
        percentualConcluido: 100,
        nota: 9.2, // Nota final lançada pelo instrutor
        dataConclusao: "2024-05-10",
      },
    };
  }

  // Progresso para curso-005 (Docker e Kubernetes - PRESENCIAL)
  if (cursoId === "curso-005" && turmaId === "turma-005") {
    return {
      "aula-docker-1": {
        itemId: "aula-docker-1",
        status: "NAO_INICIADO",
        percentualConcluido: 0,
        dataConclusao: undefined,
      },
    };
  }

  // Progresso para curso-006 (Vue.js Avançado - AO_VIVO)
  if (cursoId === "curso-006" && turmaId === "turma-006") {
    return {
      "aula-vue-1": {
        itemId: "aula-vue-1",
        status: "CONCLUIDO",
        percentualConcluido: 100,
        dataConclusao: "2026-01-14",
      },
      "aula-vue-2": {
        itemId: "aula-vue-2",
        status: "CONCLUIDO",
        percentualConcluido: 100,
        dataConclusao: "2026-01-15",
      },
    };
  }

  return {};
}

/**
 * Interface para atividade com questões (múltipla escolha)
 */
export interface MockAtividadeQuestoes {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: "MULTIPLA_ESCOLHA" | "PERGUNTA_RESPOSTA";
  notaTotal?: number; // Nota total da atividade (ex: 2, 5, 10)
  // Campos específicos para provas (período de disponibilidade)
  dataInicio?: string; // Data de início (YYYY-MM-DD)
  dataFim?: string; // Data de término (YYYY-MM-DD)
  horaInicio?: string; // Hora de início (HH:MM)
  horaFim?: string; // Hora de término (HH:MM)
  questoes: Array<{
    id: string;
    enunciado: string;
    alternativas?: Array<{
      id: string;
      texto: string;
      correta: boolean;
    }>;
  }>;
  // Para atividades de pergunta e resposta
  perguntas?: Array<{
    id: string;
    pergunta: string;
    respostaEnviada?: string;
    dataEnvio?: string;
    podeEditar?: boolean;
    nota?: number;
    dataCorrecao?: string;
    feedback?: string;
  }>;
}

/**
 * Retorna dados mockados de uma prova por ID
 */
export function getMockProvaById(
  provaId: string
): MockAtividadeQuestoes | null {
  const mockProvas: Record<string, MockAtividadeQuestoes> = {
    "prova-1": {
      id: "prova-1",
      titulo: "Prova do Módulo 1",
      descricao:
        "Responda as questões sobre os conceitos aprendidos no módulo 1.",
      tipo: "MULTIPLA_ESCOLHA",
      notaTotal: 10, // Prova vale 10 pontos
      // Período de disponibilidade da prova
      dataInicio: "2025-02-10", // Data de início
      dataFim: "2025-02-15", // Data de término
      horaInicio: "08:00", // Hora de início
      horaFim: "18:00", // Hora de término
      questoes: [
        {
          id: "questao-prova-1",
          enunciado: "O que é React?",
          alternativas: [
            {
              id: "alt-prova-1-a",
              texto: "Uma linguagem de programação",
              correta: false,
            },
            {
              id: "alt-prova-1-b",
              texto: "Uma biblioteca JavaScript para construção de interfaces",
              correta: true,
            },
            {
              id: "alt-prova-1-c",
              texto: "Um framework CSS",
              correta: false,
            },
            {
              id: "alt-prova-1-d",
              texto: "Um banco de dados",
              correta: false,
            },
          ],
        },
        {
          id: "questao-prova-2",
          enunciado:
            "Qual hook é usado para adicionar estado a componentes funcionais?",
          alternativas: [
            {
              id: "alt-prova-2-a",
              texto: "useState",
              correta: true,
            },
            {
              id: "alt-prova-2-b",
              texto: "useEffect",
              correta: false,
            },
            {
              id: "alt-prova-2-c",
              texto: "useContext",
              correta: false,
            },
            {
              id: "alt-prova-2-d",
              texto: "useReducer",
              correta: false,
            },
          ],
        },
        {
          id: "questao-prova-3",
          enunciado: "O que é JSX?",
          alternativas: [
            {
              id: "alt-prova-3-a",
              texto: "Uma extensão de sintaxe do JavaScript",
              correta: true,
            },
            {
              id: "alt-prova-3-b",
              texto: "Uma linguagem de marcação",
              correta: false,
            },
            {
              id: "alt-prova-3-c",
              texto: "Um pré-processador CSS",
              correta: false,
            },
            {
              id: "alt-prova-3-d",
              texto: "Um framework JavaScript",
              correta: false,
            },
          ],
        },
        {
          id: "questao-prova-4",
          enunciado: "Qual é a principal vantagem do Virtual DOM?",
          alternativas: [
            {
              id: "alt-prova-4-a",
              texto:
                "Melhora a performance ao minimizar manipulações diretas do DOM",
              correta: true,
            },
            {
              id: "alt-prova-4-b",
              texto: "Reduz o tamanho do código",
              correta: false,
            },
            {
              id: "alt-prova-4-c",
              texto: "Torna o código mais legível",
              correta: false,
            },
            {
              id: "alt-prova-4-d",
              texto: "Permite usar TypeScript",
              correta: false,
            },
          ],
        },
      ],
    },
    // Prova PRESENCIAL (curso-003/turma-003)
    "prova-pres-1": {
      id: "prova-pres-1",
      titulo: "Prova Prática - Fundamentos",
      descricao: "Prova prática realizada presencialmente na sala de aula.",
      tipo: "MULTIPLA_ESCOLHA",
      notaTotal: 10,
      // Período da prova presencial
      dataInicio: "2024-01-25",
      dataFim: "2024-01-25",
      horaInicio: "14:00",
      horaFim: "16:00",
      questoes: [],
    },
    "prova-pres-2": {
      id: "prova-pres-2",
      titulo: "Prova Final - Express",
      descricao: "Prova final realizada presencialmente na sala de aula.",
      tipo: "MULTIPLA_ESCOLHA",
      notaTotal: 10,
      // Período da prova presencial
      dataInicio: "2024-05-10",
      dataFim: "2024-05-10",
      horaInicio: "14:00",
      horaFim: "17:00",
      questoes: [],
    },
  };

  return mockProvas[provaId] || null;
}

/**
 * Retorna dados mockados de uma atividade por ID
 */
export function getMockAtividadeById(
  atividadeId: string
): MockAtividadeQuestoes | null {
  const mockAtividades: Record<string, MockAtividadeQuestoes> = {
    "atividade-001": {
      id: "atividade-001",
      titulo: "Atividade 01 - Fixação de Conceitos",
      descricao:
        "Responda as questões sobre os conceitos aprendidos nas aulas anteriores.",
      tipo: "MULTIPLA_ESCOLHA",
      notaTotal: 2, // Atividade vale 2 pontos (cada questão vale 0,5)
      // Período de disponibilidade da atividade
      dataInicio: "2025-01-15", // Data de início
      dataFim: "2025-01-30", // Data de término
      horaInicio: "08:00", // Hora de início
      horaFim: "23:59", // Hora de término
      questoes: [
        {
          id: "questao-1",
          enunciado: "a minha pergunta pro chatgpt",
          alternativas: [
            {
              id: "alt-1-a",
              texto: "verdade",
              correta: true,
            },
            {
              id: "alt-1-b",
              texto: "mentira",
              correta: false,
            },
            {
              id: "alt-1-c",
              texto: "agente",
              correta: false,
            },
            {
              id: "alt-1-d",
              texto: "full",
              correta: false,
            },
          ],
        },
        {
          id: "questao-2",
          enunciado:
            "Qual é a principal diferença entre componentes funcionais e componentes de classe no React?",
          alternativas: [
            {
              id: "alt-2-a",
              texto: "Componentes funcionais não podem ter estado",
              correta: false,
            },
            {
              id: "alt-2-b",
              texto: "Componentes funcionais usam hooks para gerenciar estado",
              correta: true,
            },
            {
              id: "alt-2-c",
              texto: "Componentes de classe são mais performáticos",
              correta: false,
            },
            {
              id: "alt-2-d",
              texto: "Não há diferença entre eles",
              correta: false,
            },
          ],
        },
        {
          id: "questao-3",
          enunciado: "O que é JSX?",
          alternativas: [
            {
              id: "alt-3-a",
              texto: "Uma linguagem de programação",
              correta: false,
            },
            {
              id: "alt-3-b",
              texto: "Uma extensão de sintaxe do JavaScript",
              correta: true,
            },
            {
              id: "alt-3-c",
              texto: "Um framework CSS",
              correta: false,
            },
          ],
        },
        {
          id: "questao-4",
          enunciado:
            "Qual hook é usado para gerenciar estado em componentes funcionais?",
          alternativas: [
            {
              id: "alt-4-a",
              texto: "useState",
              correta: true,
            },
            {
              id: "alt-4-b",
              texto: "useEffect",
              correta: false,
            },
            {
              id: "alt-4-c",
              texto: "useContext",
              correta: false,
            },
            {
              id: "alt-4-d",
              texto: "useReducer",
              correta: false,
            },
          ],
        },
      ],
    },
    "atividade-002": {
      id: "atividade-002",
      titulo: "Atividade 02 - Prática Avançada",
      descricao: "Teste seus conhecimentos sobre React avançado.",
      tipo: "MULTIPLA_ESCOLHA",
      questoes: [
        {
          id: "questao-5",
          enunciado: "O que é o Context API?",
          alternativas: [
            {
              id: "alt-5-a",
              texto:
                "Uma forma de compartilhar dados entre componentes sem props",
              correta: true,
            },
            {
              id: "alt-5-b",
              texto: "Uma biblioteca externa",
              correta: false,
            },
            {
              id: "alt-5-c",
              texto: "Um método de roteamento",
              correta: false,
            },
          ],
        },
      ],
    },
    "atividade-003": {
      id: "atividade-003",
      titulo: "Atividade 03 - Perguntas e Respostas",
      descricao:
        "Responda a pergunta abaixo com suas próprias palavras. Após enviar, não será possível editar sua resposta.",
      tipo: "PERGUNTA_RESPOSTA",
      // Período de disponibilidade da atividade
      dataInicio: "2025-01-20", // Data de início
      dataFim: "2025-02-05", // Data de término
      horaInicio: "00:00", // Hora de início
      horaFim: "23:59", // Hora de término
      questoes: [],
      perguntas: [
        {
          id: "pergunta-1",
          pergunta:
            "Explique com suas próprias palavras o que é React e quais são suas principais vantagens.",
          respostaEnviada: undefined,
          dataEnvio: undefined,
          podeEditar: true,
        },
      ],
    },
    "atividade-004": {
      id: "atividade-004",
      titulo: "Atividade 04 - Análise de Código",
      descricao:
        "Analise o código fornecido e responda a pergunta. Esta atividade já foi enviada e não pode mais ser editada.",
      tipo: "PERGUNTA_RESPOSTA",
      questoes: [],
      perguntas: [
        {
          id: "pergunta-4",
          pergunta:
            "Analise o seguinte código e explique o que ele faz:\n\n```javascript\nconst [count, setCount] = useState(0);\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);\n```",
          respostaEnviada:
            "Este código utiliza o hook useState para criar um estado 'count' inicializado com 0, e o hook useEffect para atualizar o título do documento sempre que o valor de 'count' mudar. O array de dependências [count] garante que o efeito seja executado apenas quando 'count' for alterado.",
          dataEnvio: "2025-01-20T10:30:00.000Z",
          podeEditar: false,
        },
      ],
    },
    "atividade-005": {
      id: "atividade-005",
      titulo: "Atividade 05 - Conceitos Avançados",
      descricao:
        "Responda a pergunta abaixo com suas próprias palavras. Após enviar, não será possível editar sua resposta.",
      tipo: "PERGUNTA_RESPOSTA",
      questoes: [],
      perguntas: [
        {
          id: "pergunta-5",
          pergunta:
            "Explique a diferença entre props e state no React, e quando usar cada um.",
          respostaEnviada:
            "Props são dados passados de um componente pai para um componente filho, são imutáveis e usados para comunicação entre componentes. State é gerenciado internamente pelo componente e pode ser alterado usando setState ou hooks. Use props para dados que vêm de fora e state para dados que o componente precisa gerenciar internamente.",
          dataEnvio: "2026-01-09T17:23:00.000Z",
          podeEditar: false,
          nota: 8.5,
          dataCorrecao: "2026-01-10T14:30:00.000Z",
          feedback:
            "Boa explicação sobre props e state. Você demonstrou compreensão dos conceitos fundamentais. Poderia ter mencionado exemplos práticos de uso.",
        },
      ],
    },
    // Atividade PRESENCIAL (curso-003/turma-003)
    "atividade-pres-1": {
      id: "atividade-pres-1",
      titulo: "Atividade Prática - Criar API REST",
      descricao: "Atividade prática realizada presencialmente na sala de aula.",
      tipo: "PERGUNTA_RESPOSTA",
      // Período da atividade presencial
      dataInicio: "2024-01-15",
      dataFim: "2024-01-20",
      horaInicio: "08:00",
      horaFim: "12:00",
      questoes: [],
      perguntas: [
        {
          id: "pergunta-pres-1",
          pergunta:
            "Implemente uma API REST básica usando Express e explique os principais conceitos.",
          respostaEnviada:
            "A atividade foi realizada presencialmente na sala de aula.",
          dataEnvio: "2024-01-20T12:00:00.000Z",
          podeEditar: false,
          nota: 9.0,
          dataCorrecao: "2024-01-22T14:00:00.000Z",
          feedback:
            "Excelente implementação. Demonstrou domínio dos conceitos de Express e REST.",
        },
      ],
    },
  };

  return mockAtividades[atividadeId] || null;
}
