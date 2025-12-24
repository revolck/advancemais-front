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




