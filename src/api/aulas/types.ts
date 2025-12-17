/**
 * Tipos para o módulo de Aulas
 */

export type Modalidade = "ONLINE" | "PRESENCIAL" | "AO_VIVO" | "SEMIPRESENCIAL";
export type TipoLink = "YOUTUBE" | "MEET";
export type AulaStatus =
  | "RASCUNHO"
  | "PUBLICADA"
  | "EM_ANDAMENTO"
  | "CONCLUIDA"
  | "CANCELADA";

export interface Aula {
  id: string;
  codigo?: string;
  titulo: string;
  descricao: string; // ✅ Obrigatório
  modalidade: Modalidade;
  tipoLink?: TipoLink;
  youtubeUrl?: string;
  meetUrl?: string;
  meetEventId?: string;
  sala?: string; // ✅ Sala física (apenas PRESENCIAL)
  obrigatoria: boolean;
  duracaoMinutos: number; // ✅ Obrigatório
  status: AulaStatus;
  ordem: number;
  dataInicio?: string; // Condicional por modalidade
  dataFim?: string; // Condicional por modalidade
  horaInicio?: string;
  horaFim?: string;
  // Novos campos de gravação
  gravarAula?: boolean;
  linkGravacao?: string | null;
  duracaoGravacao?: number | null;
  statusGravacao?: "PROCESSANDO" | "DISPONIVEL" | "ERRO" | "NAO_GRAVADO" | null;
  // Relacionamentos (podem ser null)
  turma?: {
    id: string;
    codigo: string; // ✅ Código da turma
    nome: string;
    curso?: {
      id: string;
      codigo: string; // ✅ Código do curso
      nome: string;
    };
  } | null;
  modulo?: {
    id: string;
    nome: string;
  } | null;
  instrutor?: {
    id: string;
    codigo: string; // ✅ Código do usuário (codUsuario)
    nome: string;
    email?: string;
    cpf: string; // ✅ CPF do instrutor
  } | null;
  criadoPor: {
    id: string;
    nome: string;
    email?: string;
    cpf?: string; // ✅ CPF do criador
  };
  criadoEm: string;
  atualizadoEm?: string;
}

export interface AulaProgresso {
  id: string;
  aulaId: string;
  alunoId: string;
  inscricaoId: string;
  percentualAssistido: number;
  tempoAssistidoSegundos: number;
  concluida: boolean;
  concluidaEm?: string;
  ultimaPosicao: number;
}

export interface AulaPresenca {
  id: string;
  aulaId: string;
  usuarioId: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
  tipoParticipante: "ALUNO" | "INSTRUTOR";
  entradaEm: string;
  saidaEm?: string;
  tempoTotal: number;
  presente: boolean;
}

export interface AulaHistorico {
  id: string;
  aulaId: string;
  usuarioId: string;
  usuario: {
    id: string;
    nome: string;
    role?: "ADMIN" | "MODERADOR" | "PEDAGOGICO" | "INSTRUTOR";
    email?: string;
  };
  acao: string;
  camposAlterados?: Record<string, { de: unknown; para: unknown }> | null;
  criadoEm: string;
  ip?: string;
  userAgent?: string;
}

// Payloads
export interface CreateAulaPayload {
  titulo: string;
  descricao: string; // ✅ Obrigatório
  modalidade: Modalidade;
  tipoLink?: TipoLink;
  youtubeUrl?: string;
  sala?: string; // ⚠️ Opcional (apenas PRESENCIAL)
  turmaId?: string; // ⚠️ Opcional para Admin/Mod/Ped (pode criar sem turma)
  instrutorId?: string; // ⚠️ Opcional para Admin/Mod/Ped (pode criar sem instrutor)
  moduloId?: string;
  dataInicio?: string; // Condicional por modalidade
  dataFim?: string; // Condicional por modalidade
  horaInicio?: string;
  horaFim?: string;
  obrigatoria?: boolean;
  duracaoMinutos?: number; // ⚠️ Opcional (calculado se houver período)
  status?: "RASCUNHO" | "PUBLICADA";
  gravarAula?: boolean; // Novo campo (apenas AO_VIVO/SEMIPRESENCIAL com Meet)
}

export type UpdateAulaPayload = Partial<CreateAulaPayload>;

export interface UpdateProgressoPayload {
  inscricaoId: string;
  percentualAssistido: number;
  tempoAssistidoSegundos: number;
  ultimaPosicao: number;
}

export interface RegistrarPresencaPayload {
  inscricaoId: string;
  tipo: "entrada" | "saida";
}

// Listagem
export interface AulasListParams {
  page?: number;
  pageSize?: number;
  turmaId?: string;
  moduloId?: string;
  instrutorId?: string;
  modalidade?: Modalidade | Modalidade[];
  status?: AulaStatus | AulaStatus[];
  obrigatoria?: boolean;
  dataInicio?: string;
  dataFim?: string;
  search?: string;
  orderBy?: string;
  order?: "asc" | "desc";
  // Novos filtros
  semTurma?: boolean; // Aulas sem turma vinculada
  semInstrutor?: boolean; // Aulas sem instrutor vinculado
}

export interface AulasListResponse {
  data: Aula[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Agenda
export interface AgendaEvento {
  id: string;
  tipo: "AULA" | "PROVA" | "ATIVIDADE" | "ANIVERSARIO" | "TURMA_INICIO" | "TURMA_FIM";
  titulo: string;
  descricao?: string;
  dataInicio?: string;
  dataFim?: string;
  data?: string;
  cor?: string;
  turma?: {
    id: string;
    nome: string;
  };
  modalidade?: Modalidade;
  meetUrl?: string;
  usuario?: {
    id: string;
    nome: string;
    role: string;
  };
}

export interface AgendaListParams {
  dataInicio: string;
  dataFim: string;
  tipos?: string[];
}

export interface AgendaListResponse {
  eventos: AgendaEvento[];
}

// Google OAuth
export interface GoogleOAuthStatus {
  conectado: boolean;
  email?: string;
  expiresAt?: string;
}

export interface GoogleConnectResponse {
  authUrl: string;
}

// =============================================================================
// MATERIAIS COMPLEMENTARES
// =============================================================================

export type TipoMaterial = "ARQUIVO" | "LINK" | "TEXTO";

export interface AulaMaterial {
  id: string;
  aulaId: string;
  tipo: TipoMaterial;
  titulo: string;
  descricao?: string;
  obrigatorio: boolean;
  ordem: number;
  // Para tipo ARQUIVO
  arquivoNome?: string;
  arquivoTamanho?: number; // em bytes
  arquivoMimeType?: string;
  // Para tipo LINK
  linkUrl?: string;
  // Para tipo TEXTO
  conteudoHtml?: string;
  // Timestamps
  criadoEm: string;
  atualizadoEm?: string;
  criadoPor?: {
    id: string;
    nome: string;
  };
}

// Payloads de Materiais

/** @deprecated Use CreateMaterialArquivoUrlPayload para novo fluxo via blob */
export interface CreateMaterialArquivoPayload {
  file: File;
  titulo: string;
  descricao?: string;
  obrigatorio?: boolean;
}

/**
 * Payload para criar material ARQUIVO via URL do blob storage.
 * Novo fluxo: primeiro upload para blob, depois enviar URL para API.
 */
export interface CreateMaterialArquivoUrlPayload {
  tipo: "ARQUIVO";
  titulo: string;
  descricao?: string;
  obrigatorio?: boolean;
  arquivoUrl: string;
  arquivoNome: string;
  arquivoTamanho: number;
  arquivoMimeType: string;
}

export interface CreateMaterialLinkPayload {
  tipo: "LINK";
  titulo: string;
  descricao?: string;
  linkUrl: string;
  obrigatorio?: boolean;
}

export interface CreateMaterialTextoPayload {
  tipo: "TEXTO";
  titulo: string;
  descricao?: string;
  conteudoHtml: string;
  obrigatorio?: boolean;
}

export type CreateMaterialPayload =
  | CreateMaterialArquivoPayload
  | CreateMaterialLinkPayload
  | CreateMaterialTextoPayload;

export interface UpdateMaterialPayload {
  titulo?: string;
  descricao?: string;
  obrigatorio?: boolean;
  ordem?: number;
  // Para TEXTO
  conteudoHtml?: string;
  // Para LINK
  linkUrl?: string;
}

export interface ReordenarMateriaisPayload {
  ordens: Array<{ id: string; ordem: number }>;
}

export interface MaterialDownloadToken {
  token: string;
  expiresIn: number;
  downloadUrl: string;
}

export interface MateriaisListResponse {
  data: AulaMaterial[];
  total: number;
  limite: number; // máximo 3
}

// Constantes
export const MATERIAIS_CONFIG = {
  MAX_POR_AULA: 3,
  MAX_TAMANHO_ARQUIVO: 5 * 1024 * 1024, // 5MB
  TIPOS_PERMITIDOS: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "application/zip",
    "image/jpeg",
    "image/png",
    "image/gif",
    "audio/mpeg",
    "video/mp4",
  ],
  EXTENSOES_PERMITIDAS: [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
    ".zip",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".mp3",
    ".mp4",
  ],
} as const;

// Atualização na Aula para incluir materiais
export interface AulaComMateriais extends Aula {
  materiais: AulaMaterial[];
  apenasMateriaisComplementares: boolean;
}

