/**
 * Mock Auditoria Data
 * TODO: Remover quando a API real estiver disponível
 */

import type { AuditoriaLog } from "@/api/auditoria/types";

// Gera uma data no passado
const getPastDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
};

// IDs mockados
const mockUsuarioIds = [
  "550e8400-e29b-41d4-a716-446655440001",
  "550e8400-e29b-41d4-a716-446655440002",
  "550e8400-e29b-41d4-a716-446655440003",
  "550e8400-e29b-41d4-a716-446655440004",
  "550e8400-e29b-41d4-a716-446655440005",
];

const mockIPs = [
  "192.168.1.100",
  "10.0.0.45",
  "172.16.0.23",
  "192.168.1.150",
  "10.0.0.78",
];

const mockUserAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
];

// Dados mockados de logs de auditoria - apenas ações de negócio
export const mockAuditoriaLogs: AuditoriaLog[] = [
  // CURSOS
  {
    id: "log-001",
    categoria: "CURSO",
    tipo: "CRIACAO",
    acao: "Curso criado",
    descricao: "Curso 'Desenvolvimento Web Full Stack' foi criado",
    usuarioId: mockUsuarioIds[0],
    entidadeId: "curso-001",
    entidadeTipo: "Curso",
    ip: mockIPs[0],
    userAgent: mockUserAgents[0],
    criadoEm: getPastDate(1),
  },
  {
    id: "log-002",
    categoria: "CURSO",
    tipo: "EDICAO",
    acao: "Curso editado",
    descricao: "Curso 'Desenvolvimento Web Full Stack' teve seus dados atualizados",
    usuarioId: mockUsuarioIds[0],
    entidadeId: "curso-001",
    entidadeTipo: "Curso",
    ip: mockIPs[0],
    userAgent: mockUserAgents[0],
    criadoEm: getPastDate(2),
  },
  {
    id: "log-003",
    categoria: "CURSO",
    tipo: "CRIACAO",
    acao: "Curso criado",
    descricao: "Curso 'UX/UI Design' foi criado",
    usuarioId: mockUsuarioIds[1],
    entidadeId: "curso-002",
    entidadeTipo: "Curso",
    ip: mockIPs[1],
    userAgent: mockUserAgents[1],
    criadoEm: getPastDate(3),
  },
  
  // TURMAS
  {
    id: "log-004",
    categoria: "CURSO",
    tipo: "TURMA_CRIADA",
    acao: "Turma criada",
    descricao: "Turma 'Turma A - 2024/1' foi criada para o curso 'Desenvolvimento Web Full Stack'",
    usuarioId: mockUsuarioIds[0],
    entidadeId: "turma-001",
    entidadeTipo: "Turma",
    ip: mockIPs[0],
    userAgent: mockUserAgents[0],
    criadoEm: getPastDate(4),
  },
  {
    id: "log-005",
    categoria: "CURSO",
    tipo: "TURMA_EDITADA",
    acao: "Turma editada",
    descricao: "Turma 'Turma A - 2024/1' teve seus dados atualizados",
    usuarioId: mockUsuarioIds[0],
    entidadeId: "turma-001",
    entidadeTipo: "Turma",
    ip: mockIPs[0],
    userAgent: mockUserAgents[0],
    criadoEm: getPastDate(5),
  },
  {
    id: "log-006",
    categoria: "CURSO",
    tipo: "TURMA_CRIADA",
    acao: "Turma criada",
    descricao: "Turma 'Turma B - 2024/1' foi criada para o curso 'UX/UI Design'",
    usuarioId: mockUsuarioIds[1],
    entidadeId: "turma-002",
    entidadeTipo: "Turma",
    ip: mockIPs[1],
    userAgent: mockUserAgents[1],
    criadoEm: getPastDate(6),
  },
  
  // AULAS
  {
    id: "log-007",
    categoria: "CURSO",
    tipo: "AULA_CRIADA",
    acao: "Aula criada",
    descricao: "Aula 'Introdução ao React' foi criada",
    usuarioId: mockUsuarioIds[0],
    entidadeId: "aula-001",
    entidadeTipo: "Aula",
    ip: mockIPs[0],
    userAgent: mockUserAgents[0],
    criadoEm: getPastDate(7),
  },
  {
    id: "log-008",
    categoria: "CURSO",
    tipo: "AULA_EDITADA",
    acao: "Aula editada",
    descricao: "Aula 'Introdução ao React' teve seus dados atualizados",
    usuarioId: mockUsuarioIds[0],
    entidadeId: "aula-001",
    entidadeTipo: "Aula",
    ip: mockIPs[0],
    userAgent: mockUserAgents[0],
    criadoEm: getPastDate(8),
  },
  {
    id: "log-009",
    categoria: "CURSO",
    tipo: "AULA_CRIADA",
    acao: "Aula criada",
    descricao: "Aula 'Componentes e Props' foi criada",
    usuarioId: mockUsuarioIds[1],
    entidadeId: "aula-002",
    entidadeTipo: "Aula",
    ip: mockIPs[1],
    userAgent: mockUserAgents[1],
    criadoEm: getPastDate(9),
  },
  
  // ALUNOS
  {
    id: "log-010",
    categoria: "CURSO",
    tipo: "ALUNO_BLOQUEADO",
    acao: "Aluno bloqueado",
    descricao: "Aluno 'João Silva' foi bloqueado do sistema",
    usuarioId: mockUsuarioIds[2],
    entidadeId: "aluno-001",
    entidadeTipo: "Aluno",
    ip: mockIPs[2],
    userAgent: mockUserAgents[2],
    criadoEm: getPastDate(10),
  },
  {
    id: "log-011",
    categoria: "CURSO",
    tipo: "ALUNO_BLOQUEADO",
    acao: "Aluno bloqueado",
    descricao: "Aluno 'Maria Santos' foi bloqueado do sistema",
    usuarioId: mockUsuarioIds[2],
    entidadeId: "aluno-002",
    entidadeTipo: "Aluno",
    ip: mockIPs[2],
    userAgent: mockUserAgents[2],
    criadoEm: getPastDate(11),
  },
  
  // INSTRUTORES
  {
    id: "log-012",
    categoria: "CURSO",
    tipo: "INSTRUTOR_CRIADO",
    acao: "Instrutor criado",
    descricao: "Instrutor 'Carlos Oliveira' foi cadastrado no sistema",
    usuarioId: mockUsuarioIds[0],
    entidadeId: "instrutor-001",
    entidadeTipo: "Instrutor",
    ip: mockIPs[0],
    userAgent: mockUserAgents[0],
    criadoEm: getPastDate(12),
  },
  {
    id: "log-013",
    categoria: "CURSO",
    tipo: "INSTRUTOR_BLOQUEADO",
    acao: "Instrutor bloqueado",
    descricao: "Instrutor 'Carlos Oliveira' foi bloqueado do sistema",
    usuarioId: mockUsuarioIds[2],
    entidadeId: "instrutor-001",
    entidadeTipo: "Instrutor",
    ip: mockIPs[2],
    userAgent: mockUserAgents[2],
    criadoEm: getPastDate(13),
  },
  {
    id: "log-014",
    categoria: "CURSO",
    tipo: "INSTRUTOR_EDITADO",
    acao: "Instrutor editado",
    descricao: "Dados do instrutor 'Ana Costa' foram atualizados",
    usuarioId: mockUsuarioIds[0],
    entidadeId: "instrutor-002",
    entidadeTipo: "Instrutor",
    ip: mockIPs[0],
    userAgent: mockUserAgents[0],
    criadoEm: getPastDate(14),
  },
  {
    id: "log-015",
    categoria: "CURSO",
    tipo: "INSTRUTOR_CRIADO",
    acao: "Instrutor criado",
    descricao: "Instrutor 'Pedro Alves' foi cadastrado no sistema",
    usuarioId: mockUsuarioIds[1],
    entidadeId: "instrutor-003",
    entidadeTipo: "Instrutor",
    ip: mockIPs[1],
    userAgent: mockUserAgents[1],
    criadoEm: getPastDate(15),
  },
  
  // ATIVIDADES
  {
    id: "log-016",
    categoria: "CURSO",
    tipo: "ATIVIDADE_CRIADA",
    acao: "Atividade criada",
    descricao: "Atividade 'Exercício de Lógica de Programação' foi criada",
    usuarioId: mockUsuarioIds[0],
    entidadeId: "atividade-001",
    entidadeTipo: "Atividade",
    ip: mockIPs[0],
    userAgent: mockUserAgents[0],
    criadoEm: getPastDate(16),
  },
  {
    id: "log-017",
    categoria: "CURSO",
    tipo: "ATIVIDADE_EDITADA",
    acao: "Atividade editada",
    descricao: "Atividade 'Exercício de Lógica de Programação' teve seus dados atualizados",
    usuarioId: mockUsuarioIds[0],
    entidadeId: "atividade-001",
    entidadeTipo: "Atividade",
    ip: mockIPs[0],
    userAgent: mockUserAgents[0],
    criadoEm: getPastDate(17),
  },
  {
    id: "log-018",
    categoria: "CURSO",
    tipo: "ATIVIDADE_CRIADA",
    acao: "Atividade criada",
    descricao: "Atividade 'Projeto Prático - ToDo List' foi criada",
    usuarioId: mockUsuarioIds[1],
    entidadeId: "atividade-002",
    entidadeTipo: "Atividade",
    ip: mockIPs[1],
    userAgent: mockUserAgents[1],
    criadoEm: getPastDate(18),
  },
  
  // PROVAS
  {
    id: "log-019",
    categoria: "CURSO",
    tipo: "PROVA_CRIADA",
    acao: "Prova criada",
    descricao: "Prova 'Avaliação Final - Módulo 1' foi criada",
    usuarioId: mockUsuarioIds[0],
    entidadeId: "prova-001",
    entidadeTipo: "Prova",
    ip: mockIPs[0],
    userAgent: mockUserAgents[0],
    criadoEm: getPastDate(19),
  },
  {
    id: "log-020",
    categoria: "CURSO",
    tipo: "PROVA_EDITADA",
    acao: "Prova editada",
    descricao: "Prova 'Avaliação Final - Módulo 1' teve seus dados atualizados",
    usuarioId: mockUsuarioIds[0],
    entidadeId: "prova-001",
    entidadeTipo: "Prova",
    ip: mockIPs[0],
    userAgent: mockUserAgents[0],
    criadoEm: getPastDate(20),
  },
  {
    id: "log-021",
    categoria: "CURSO",
    tipo: "PROVA_CRIADA",
    acao: "Prova criada",
    descricao: "Prova 'Avaliação Parcial - Módulo 2' foi criada",
    usuarioId: mockUsuarioIds[1],
    entidadeId: "prova-002",
    entidadeTipo: "Prova",
    ip: mockIPs[1],
    userAgent: mockUserAgents[1],
    criadoEm: getPastDate(21),
  },
  
  // CERTIFICADOS
  {
    id: "log-022",
    categoria: "CURSO",
    tipo: "CERTIFICADO_EMITIDO",
    acao: "Certificado emitido",
    descricao: "Certificado foi emitido para o aluno 'João Silva' que concluiu o curso 'Desenvolvimento Web Full Stack'",
    usuarioId: mockUsuarioIds[0],
    entidadeId: "certificado-001",
    entidadeTipo: "Certificado",
    ip: mockIPs[0],
    userAgent: mockUserAgents[0],
    criadoEm: getPastDate(22),
  },
  {
    id: "log-023",
    categoria: "CURSO",
    tipo: "CERTIFICADO_EMITIDO",
    acao: "Certificado emitido",
    descricao: "Certificado foi emitido para o aluno 'Maria Santos' que concluiu o curso 'UX/UI Design'",
    usuarioId: mockUsuarioIds[1],
    entidadeId: "certificado-002",
    entidadeTipo: "Certificado",
    ip: mockIPs[1],
    userAgent: mockUserAgents[1],
    criadoEm: getPastDate(23),
  },
  
  // AGENDA
  {
    id: "log-024",
    categoria: "CURSO",
    tipo: "AGENDA_CRIADA",
    acao: "Evento agendado",
    descricao: "Evento 'Aula ao Vivo - React Hooks' foi agendado para 15/03/2024 às 19:00",
    usuarioId: mockUsuarioIds[0],
    entidadeId: "agenda-001",
    entidadeTipo: "Agenda",
    ip: mockIPs[0],
    userAgent: mockUserAgents[0],
    criadoEm: getPastDate(24),
  },
  {
    id: "log-025",
    categoria: "CURSO",
    tipo: "AGENDA_EDITADA",
    acao: "Evento editado",
    descricao: "Evento 'Aula ao Vivo - React Hooks' teve sua data alterada",
    usuarioId: mockUsuarioIds[0],
    entidadeId: "agenda-001",
    entidadeTipo: "Agenda",
    ip: mockIPs[0],
    userAgent: mockUserAgents[0],
    criadoEm: getPastDate(25),
  },
  
  // EMPRESAS
  {
    id: "log-026",
    categoria: "EMPRESA",
    tipo: "EMPRESA_BLOQUEADA",
    acao: "Empresa bloqueada",
    descricao: "Empresa 'Tech Solutions LTDA' foi bloqueada do sistema",
    usuarioId: mockUsuarioIds[2],
    entidadeId: "empresa-001",
    entidadeTipo: "Empresa",
    ip: mockIPs[2],
    userAgent: mockUserAgents[2],
    criadoEm: getPastDate(26),
  },
  {
    id: "log-027",
    categoria: "EMPRESA",
    tipo: "EMPRESA_BLOQUEADA",
    acao: "Empresa bloqueada",
    descricao: "Empresa 'Digital Innovations' foi bloqueada do sistema",
    usuarioId: mockUsuarioIds[2],
    entidadeId: "empresa-002",
    entidadeTipo: "Empresa",
    ip: mockIPs[2],
    userAgent: mockUserAgents[2],
    criadoEm: getPastDate(27),
  },
  
  // VAGAS
  {
    id: "log-028",
    categoria: "VAGA",
    tipo: "VAGA_CRIADA",
    acao: "Vaga criada",
    descricao: "Vaga 'Desenvolvedor Full Stack - Remoto' foi criada pela empresa 'Tech Solutions LTDA'",
    usuarioId: mockUsuarioIds[3],
    entidadeId: "vaga-001",
    entidadeTipo: "Vaga",
    ip: mockIPs[3],
    userAgent: mockUserAgents[2],
    criadoEm: getPastDate(28),
  },
  {
    id: "log-029",
    categoria: "VAGA",
    tipo: "VAGA_APROVADA",
    acao: "Vaga aprovada",
    descricao: "Vaga 'Desenvolvedor Full Stack - Remoto' foi aprovada e publicada",
    usuarioId: mockUsuarioIds[2],
    entidadeId: "vaga-001",
    entidadeTipo: "Vaga",
    ip: mockIPs[2],
    userAgent: mockUserAgents[1],
    criadoEm: getPastDate(29),
  },
  {
    id: "log-030",
    categoria: "VAGA",
    tipo: "VAGA_RECUSADA",
    acao: "Vaga recusada",
    descricao: "Vaga 'Analista de Sistemas - Presencial' foi recusada pelo moderador",
    usuarioId: mockUsuarioIds[2],
    entidadeId: "vaga-002",
    entidadeTipo: "Vaga",
    ip: mockIPs[2],
    userAgent: mockUserAgents[1],
    criadoEm: getPastDate(30),
  },
  {
    id: "log-031",
    categoria: "VAGA",
    tipo: "VAGA_BLOQUEADA",
    acao: "Vaga bloqueada",
    descricao: "Vaga 'Desenvolvedor Frontend - Remoto' foi bloqueada do sistema",
    usuarioId: mockUsuarioIds[2],
    entidadeId: "vaga-003",
    entidadeTipo: "Vaga",
    ip: mockIPs[2],
    userAgent: mockUserAgents[2],
    criadoEm: getPastDate(31),
  },
  {
    id: "log-032",
    categoria: "VAGA",
    tipo: "VAGA_PREENCHIDA",
    acao: "Vaga preenchida",
    descricao: "Vaga 'Desenvolvedor Full Stack - Remoto' foi preenchida pelo candidato 'João Silva'",
    usuarioId: mockUsuarioIds[3],
    entidadeId: "vaga-001",
    entidadeTipo: "Vaga",
    ip: mockIPs[3],
    userAgent: mockUserAgents[2],
    criadoEm: getPastDate(32),
  },
  {
    id: "log-033",
    categoria: "VAGA",
    tipo: "VAGA_CRIADA",
    acao: "Vaga criada",
    descricao: "Vaga 'UX Designer - Híbrido' foi criada pela empresa 'Digital Innovations'",
    usuarioId: mockUsuarioIds[4],
    entidadeId: "vaga-004",
    entidadeTipo: "Vaga",
    ip: mockIPs[4],
    userAgent: mockUserAgents[0],
    criadoEm: getPastDate(33),
  },
  
  // CANDIDATOS
  {
    id: "log-034",
    categoria: "VAGA",
    tipo: "REUNIAO_AGENDADA",
    acao: "Reunião agendada",
    descricao: "Reunião foi agendada com o candidato 'Maria Santos' para a vaga 'Desenvolvedor Full Stack - Remoto'",
    usuarioId: mockUsuarioIds[3],
    entidadeId: "reuniao-001",
    entidadeTipo: "Reuniao",
    ip: mockIPs[3],
    userAgent: mockUserAgents[2],
    criadoEm: getPastDate(34),
  },
  {
    id: "log-035",
    categoria: "VAGA",
    tipo: "CANDIDATO_BLOQUEADO",
    acao: "Candidato bloqueado",
    descricao: "Candidato 'Pedro Alves' foi bloqueado do sistema",
    usuarioId: mockUsuarioIds[2],
    entidadeId: "candidato-001",
    entidadeTipo: "Candidato",
    ip: mockIPs[2],
    userAgent: mockUserAgents[2],
    criadoEm: getPastDate(35),
  },
  {
    id: "log-036",
    categoria: "VAGA",
    tipo: "CANDIDATURA_REALIZADA",
    acao: "Candidatura realizada",
    descricao: "Candidato 'Ana Costa' se inscreveu na vaga 'Desenvolvedor Full Stack - Remoto'",
    usuarioId: mockUsuarioIds[0],
    entidadeId: "candidatura-001",
    entidadeTipo: "Candidatura",
    ip: mockIPs[0],
    userAgent: mockUserAgents[0],
    criadoEm: getPastDate(36),
  },
  {
    id: "log-037",
    categoria: "VAGA",
    tipo: "CANDIDATURA_REALIZADA",
    acao: "Candidatura realizada",
    descricao: "Candidato 'Lucas Pereira' se inscreveu na vaga 'UX Designer - Híbrido'",
    usuarioId: mockUsuarioIds[1],
    entidadeId: "candidatura-002",
    entidadeTipo: "Candidatura",
    ip: mockIPs[1],
    userAgent: mockUserAgents[1],
    criadoEm: getPastDate(37),
  },
  {
    id: "log-038",
    categoria: "VAGA",
    tipo: "CANDIDATURA_REALIZADA",
    acao: "Candidatura realizada",
    descricao: "Candidato 'Juliana Ferreira' se inscreveu na vaga 'Desenvolvedor Frontend - Remoto'",
    usuarioId: mockUsuarioIds[2],
    entidadeId: "candidatura-003",
    entidadeTipo: "Candidatura",
    ip: mockIPs[2],
    userAgent: mockUserAgents[2],
    criadoEm: getPastDate(38),
  },
  {
    id: "log-039",
    categoria: "VAGA",
    tipo: "REUNIAO_AGENDADA",
    acao: "Reunião agendada",
    descricao: "Reunião foi agendada com o candidato 'Ana Costa' para a vaga 'UX Designer - Híbrido'",
    usuarioId: mockUsuarioIds[4],
    entidadeId: "reuniao-002",
    entidadeTipo: "Reuniao",
    ip: mockIPs[4],
    userAgent: mockUserAgents[0],
    criadoEm: getPastDate(39),
  },
  {
    id: "log-040",
    categoria: "VAGA",
    tipo: "CANDIDATO_BLOQUEADO",
    acao: "Candidato bloqueado",
    descricao: "Candidato 'Roberto Silva' foi bloqueado do sistema",
    usuarioId: mockUsuarioIds[2],
    entidadeId: "candidato-002",
    entidadeTipo: "Candidato",
    ip: mockIPs[2],
    userAgent: mockUserAgents[2],
    criadoEm: getPastDate(40),
  },
];

/**
 * Simula uma resposta paginada da API de auditoria
 */
export function getMockAuditoriaLogsResponse(
  filters?: {
    categoria?: string | string[];
    tipo?: string;
    usuarioId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }
) {
  let filteredLogs = [...mockAuditoriaLogs];

  // Filtrar por categoria
  if (filters?.categoria) {
    const categorias = Array.isArray(filters.categoria)
      ? filters.categoria
      : [filters.categoria];
    filteredLogs = filteredLogs.filter((log) =>
      categorias.includes(log.categoria)
    );
  }

  // Filtrar por tipo
  if (filters?.tipo) {
    filteredLogs = filteredLogs.filter((log) => log.tipo === filters.tipo);
  }

  // Filtrar por usuário
  if (filters?.usuarioId) {
    filteredLogs = filteredLogs.filter(
      (log) => log.usuarioId === filters.usuarioId
    );
  }

  // Filtrar por busca
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredLogs = filteredLogs.filter(
      (log) =>
        log.descricao.toLowerCase().includes(searchLower) ||
        log.acao.toLowerCase().includes(searchLower) ||
        log.tipo.toLowerCase().includes(searchLower)
    );
  }

  // Paginação
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 10;
  const total = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  return {
    items: paginatedLogs,
    total,
    page,
    pageSize,
    totalPages,
  };
}
