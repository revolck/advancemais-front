/**
 * Tipos para o módulo de Provas - Questões e Respostas
 */

export enum CursosTipoQuestao {
  TEXTO = "TEXTO",
  MULTIPLA_ESCOLHA = "MULTIPLA_ESCOLHA",
  ANEXO = "ANEXO",
}

export interface Alternativa {
  id: string;
  questaoId: string;
  texto: string;
  ordem: number;
  correta: boolean;
  criadoEm: string; // ISO 8601
  atualizadoEm: string; // ISO 8601
}

export interface Questao {
  id: string;
  provaId: string;
  enunciado: string;
  tipo: CursosTipoQuestao;
  ordem: number;
  peso: number | null;
  obrigatoria: boolean;
  criadoEm: string; // ISO 8601
  atualizadoEm: string; // ISO 8601
  alternativas?: Alternativa[]; // Apenas para MULTIPLA_ESCOLHA
}

export interface Resposta {
  id: string;
  questaoId: string;
  inscricaoId: string;
  respostaTexto: string | null; // Para TEXTO
  alternativaId: string | null; // Para MULTIPLA_ESCOLHA
  anexoUrl: string | null; // Para ANEXO
  anexoNome: string | null; // Para ANEXO
  corrigida: boolean;
  nota: number | null; // 0-10, 1 casa decimal
  observacoes: string | null; // Até 1000 caracteres
  criadoEm: string; // ISO 8601
  atualizadoEm: string; // ISO 8601
}

export interface RespostaComQuestao extends Resposta {
  questao: {
    id: string;
    enunciado: string;
    tipo: CursosTipoQuestao;
  };
  alternativa?: {
    id: string;
    texto: string;
    correta: boolean;
  } | null;
}

// Payloads para criar/atualizar questão
export interface CreateAlternativaPayload {
  texto: string;
  ordem?: number;
  correta?: boolean;
}

export interface UpdateAlternativaPayload {
  id?: string; // Se fornecido, atualiza; se não, cria nova
  texto?: string;
  ordem?: number;
  correta?: boolean;
}

export interface CreateQuestaoPayload {
  enunciado: string;
  tipo: CursosTipoQuestao;
  ordem?: number;
  peso?: number;
  obrigatoria?: boolean;
  alternativas?: CreateAlternativaPayload[]; // Obrigatório para MULTIPLA_ESCOLHA
}

export interface UpdateQuestaoPayload {
  enunciado?: string;
  tipo?: CursosTipoQuestao;
  ordem?: number;
  peso?: number;
  obrigatoria?: boolean;
  alternativas?: UpdateAlternativaPayload[]; // Se fornecido, substitui todas
}

// Payloads para responder questão
export interface ResponderQuestaoPayload {
  inscricaoId: string;
  respostaTexto?: string; // Para TEXTO
  alternativaId?: string; // Para MULTIPLA_ESCOLHA
  anexoUrl?: string; // Para ANEXO
  anexoNome?: string; // Para ANEXO
}

// Payloads para corrigir resposta
export interface CorrigirRespostaPayload {
  inscricaoId: string;
  nota?: number; // 0-10, 1 casa decimal
  observacoes?: string; // Até 1000 caracteres
  corrigida?: boolean; // Default: true se nota fornecida
}

// Parâmetros para listar respostas
export interface ListRespostasParams {
  questaoId?: string;
  inscricaoId?: string;
}

// Respostas da API
export interface QuestoesListResponse {
  data: Questao[];
}

export interface QuestaoResponse {
  data: Questao;
}

export interface RespostasListResponse {
  data: RespostaComQuestao[];
}

export interface RespostaResponse {
  data: RespostaComQuestao;
}

// ===================================
// RESPOSTAS (Nova API por Avaliação)
// ===================================

export type StatusCorrecao = "PENDENTE" | "CORRIGIDA";

export interface AvaliacaoRespostaAlunoResumo {
  id: string;
  nomeCompleto: string;
  codigo?: string | null; // Código de matrícula do aluno
  cpf?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface AvaliacaoRespostaResumo {
  id: string;
  avaliacaoId: string;
  inscricaoId: string;
  codigoInscricao?: string | null;
  aluno: AvaliacaoRespostaAlunoResumo;
  tipoAvaliacao?: "PROVA" | "ATIVIDADE";
  tipoAtividade?:
    | "QUESTOES"
    | "PERGUNTA_RESPOSTA"
    | "ENVIO_MATERIAL"
    | "TEXTO"
    | null;
  statusCorrecao: StatusCorrecao;
  nota?: number | null;
  notaMaxima?: number | null;
  peso?: number | null;
  valeNota?: boolean | null;
  valePonto?: boolean | null;
  concluidoEm?: string | null;
  ipEnvio?: string | null;
  tentativasEnvio?: number | null;
  edicoesRealizadas?: number | null;
  ultimaEdicaoEm?: string | null;
  resumo?: {
    questoesTotal?: number;
    questoesRespondidas?: number;
    questoesCorretas?: number;
  } | null;
  corrigidoEm?: string | null;
  corrigidoPor?: {
    id?: string;
    nome?: string | null;
    role?: string | null;
  } | null;
}

export interface ListAvaliacaoRespostasParams {
  page?: number;
  pageSize?: number;
  search?: string;
  statusCorrecao?: StatusCorrecao;
  orderBy?: "concluidoEm" | "alunoNome" | "nota";
  order?: "asc" | "desc";
}

export interface ListAvaliacaoRespostasResponse {
  success: boolean;
  data: AvaliacaoRespostaResumo[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface AvaliacaoHistoricoActor {
  id?: string;
  nome?: string | null;
  name?: string | null;
  nomeCompleto?: string | null;
  role?: string | null;
  papel?: string | null;
}

export interface AvaliacaoHistoricoItem {
  id?: string;
  tipoAvaliacao?: "ATIVIDADE" | "PROVA" | string | null;
  tipoAvaliacaoLabel?: string | null;
  tipo?: string;
  entidade?: string;
  kind?: string;
  acao?: string;
  action?: string;
  acaoLabel?: string;
  actionLabel?: string;
  descricao?: string;
  description?: string;
  ocorridoEm?: string;
  criadoEm?: string;
  data?: string;
  date?: string;
  metadata?: Record<string, unknown> | null;
  ator?: AvaliacaoHistoricoActor | string | null;
  alteradoPor?: AvaliacaoHistoricoActor | string | null;
  usuario?: AvaliacaoHistoricoActor | string | null;
  corrigidoPor?: AvaliacaoHistoricoActor | string | null;
}

export interface ListAvaliacaoHistoricoResponse {
  success?: boolean;
  data?:
    | AvaliacaoHistoricoItem[]
    | {
        data?: AvaliacaoHistoricoItem[];
        historico?: AvaliacaoHistoricoItem[];
        items?: AvaliacaoHistoricoItem[];
      };
  items?: AvaliacaoHistoricoItem[];
  historico?: AvaliacaoHistoricoItem[];
}

export interface AvaliacaoRespostaDetalheQuestaoItem {
  questaoId: string;
  ordem?: number;
  enunciado: string;
  tipo: CursosTipoQuestao | string;
  peso?: number | null;
  respostaAluno?: {
    alternativaId?: string | null;
    texto?: string | null;
    anexoUrl?: string | null;
    anexoNome?: string | null;
  } | null;
  respostaCorreta?: {
    alternativaId?: string | null;
    texto?: string | null;
  } | null;
  acertou?: boolean | null;
  notaItem?: number | null;
}

export interface AvaliacaoRespostaDetalhe {
  id: string;
  avaliacaoId: string;
  inscricaoId?: string;
  aluno?: AvaliacaoRespostaAlunoResumo;
  tipoAvaliacao?: "PROVA" | "ATIVIDADE";
  tipoAtividade?:
    | "QUESTOES"
    | "PERGUNTA_RESPOSTA"
    | "ENVIO_MATERIAL"
    | "TEXTO"
    | null;
  statusCorrecao?: StatusCorrecao;
  nota?: number | null;
  notaMaxima?: number | null;
  peso?: number | null;
  valeNota?: boolean | null;
  valePonto?: boolean | null;
  concluidoEm?: string | null;
  ipEnvio?: string | null;
  tentativasEnvio?: number | null;
  edicoesRealizadas?: number | null;
  ultimaEdicaoEm?: string | null;
  corrigidoEm?: string | null;
  corrigidoPor?: {
    id: string;
    nome?: string;
  } | null;
  feedback?: string | null;
  enunciado?: string | null;
  respostaAluno?: {
    texto?: string | null;
    anexos?: Array<{
      nome?: string | null;
      url: string;
    }>;
  } | null;
  itens?: AvaliacaoRespostaDetalheQuestaoItem[];
}

export interface AvaliacaoRespostaDetalheResponse {
  success: boolean;
  data: AvaliacaoRespostaDetalhe;
}

export interface CorrigirAvaliacaoRespostaPayload {
  nota?: number;
  feedback?: string;
  statusCorrecao?: StatusCorrecao;
}

export interface CorrigirAvaliacaoRespostaResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    statusCorrecao: StatusCorrecao;
    nota?: number | null;
    corrigidoEm?: string | null;
  };
}

export type AvaliacaoRespostaComentarioFiltro =
  | "PRINCIPAL"
  | "RECENTES"
  | "MEUS_COMENTARIOS";

export interface AvaliacaoRespostaComentarioAutor {
  id: string;
  nome: string;
  role?: string | null;
  avatarUrl?: string | null;
}

export interface AvaliacaoRespostaComentarioAnexo {
  url: string;
  nome: string;
  tipo: string;
  tamanho: number;
}

export interface AvaliacaoRespostaComentario {
  id: string;
  parentId?: string | null;
  conteudo: string;
  anexos: AvaliacaoRespostaComentarioAnexo[];
  fixado: boolean;
  criadoEm?: string | null;
  atualizadoEm?: string | null;
  autor: AvaliacaoRespostaComentarioAutor;
  canEdit?: boolean;
  canDelete?: boolean;
  canPin?: boolean;
  replies: AvaliacaoRespostaComentario[];
}

export interface ListAvaliacaoRespostaComentariosParams {
  filtro?: AvaliacaoRespostaComentarioFiltro;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ListAvaliacaoRespostaComentariosResponse {
  success: boolean;
  data: AvaliacaoRespostaComentario[];
  total?: number;
  pagination?: {
    page: number;
    pageSize: number;
    totalRoots: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface AvaliacaoRespostaComentarioPayload {
  conteudo: string;
  anexos?: AvaliacaoRespostaComentarioAnexo[];
  parentId?: string | null;
}

export interface UpdateAvaliacaoRespostaComentarioPayload {
  conteudo: string;
  anexos?: AvaliacaoRespostaComentarioAnexo[];
}

export interface FixarAvaliacaoRespostaComentarioPayload {
  fixado: boolean;
}

export interface AvaliacaoRespostaComentarioResponse {
  success: boolean;
  data: AvaliacaoRespostaComentario;
}

export interface DeleteAvaliacaoRespostaComentarioResponse {
  success: boolean;
  deletedAttachmentUrls?: string[];
}
