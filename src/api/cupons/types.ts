/**
 * Tipos para API de Cupons de Desconto
 */

// ============================================================================
// TIPOS DE CUPOM
// ============================================================================

export interface CupomDesconto {
  id: string;
  codigo: string;
  descricao?: string;
  tipoDesconto: "PORCENTAGEM" | "VALOR_FIXO";
  valorPercentual?: number;
  valorFixo?: number;
  aplicarEm: "TODA_PLATAFORMA" | "APENAS_ASSINATURA" | "APENAS_CURSOS";
  aplicarEmTodosItens: boolean;
  limiteUsoTotalTipo: "ILIMITADO" | "LIMITADO";
  limiteUsoTotalQuantidade?: number;
  limitePorUsuarioTipo: "ILIMITADO" | "LIMITADO" | "PRIMEIRA_COMPRA";
  limitePorUsuarioQuantidade?: number;
  periodoTipo: "ILIMITADO" | "PERIODO";
  periodoInicio?: string;
  periodoFim?: string;
  usosTotais: number;
  // ativo removido - sempre true por padrão
  criadoEm: string;
  atualizadoEm: string;
  criadoPor: {
    id: string;
    nomeCompleto: string;
    email: string;
    role: string;
  };
  cursosAplicados?: CursoAplicado[];
  planosAplicados?: PlanoAplicado[];
}

export interface CursoAplicado {
  cursoId: number;
  codigo: string;
  nome: string;
}

export interface PlanoAplicado {
  planoId: string;
  nome: string;
}

// ============================================================================
// PAYLOADS DE REQUISIÇÃO
// ============================================================================

export interface CreateCupomPayload {
  codigo: string;
  descricao?: string;
  tipoDesconto: "PORCENTAGEM" | "VALOR_FIXO";
  valorPercentual?: number;
  valorFixo?: number;
  aplicarEm: "TODA_PLATAFORMA" | "APENAS_ASSINATURA" | "APENAS_CURSOS";
  aplicarEmTodosItens: boolean;
  cursosIds?: number[];
  planosIds?: string[];
  limiteUsoTotalTipo: "ILIMITADO" | "LIMITADO";
  limiteUsoTotalQuantidade?: number;
  limitePorUsuarioTipo: "ILIMITADO" | "LIMITADO" | "PRIMEIRA_COMPRA";
  limitePorUsuarioQuantidade?: number;
  periodoTipo: "ILIMITADO" | "PERIODO";
  periodoInicio?: string;
  periodoFim?: string;
  // ativo removido - sempre true por padrão
}

export interface UpdateCupomPayload {
  codigo?: string;
  descricao?: string;
  tipoDesconto?: "PORCENTAGEM" | "VALOR_FIXO";
  valorPercentual?: number;
  valorFixo?: number;
  aplicarEm?: "TODA_PLATAFORMA" | "APENAS_ASSINATURA" | "APENAS_CURSOS";
  aplicarEmTodosItens?: boolean;
  cursosIds?: number[];
  planosIds?: string[];
  limiteUsoTotalTipo?: "ILIMITADO" | "LIMITADO";
  limiteUsoTotalQuantidade?: number;
  limitePorUsuarioTipo?: "ILIMITADO" | "LIMITADO" | "PRIMEIRA_COMPRA";
  limitePorUsuarioQuantidade?: number;
  periodoTipo?: "ILIMITADO" | "PERIODO";
  periodoInicio?: string;
  periodoFim?: string;
  ativo?: boolean;
}

// ============================================================================
// RESPONSES DA API
// ============================================================================

// Union types for API responses
export type CuponsListApiResponse =
  | CupomDesconto[]
  | {
      success: false;
      message: string;
      code: string;
      error: string;
    };

export type CupomDetailApiResponse =
  | CupomDesconto
  | {
      success: false;
      message: string;
      code: string;
      error: string;
    };

export type CupomCreateApiResponse =
  | CupomDesconto
  | {
      success: false;
      message: string;
      code: string;
      error: string;
    };

// ============================================================================
// PARÂMETROS DE LISTAGEM
// ============================================================================

export interface CuponsListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  ativo?: boolean;
  tipoDesconto?: "PORCENTAGEM" | "VALOR_FIXO";
  aplicarEm?: "TODA_PLATAFORMA" | "APENAS_ASSINATURA" | "APENAS_CURSOS";
}

// ============================================================================
// TIPOS PARA FORMULÁRIOS
// ============================================================================

export interface CupomFormData {
  codigo: string;
  // descricao removido do formulário
  tipoDesconto: "PORCENTAGEM" | "VALOR_FIXO";
  valorPercentual?: number;
  valorFixo?: number;
  // aplicarEm é fixo como "APENAS_CURSOS" - removido do form
  aplicacaoCupom: "TODAS_ASSINATURAS" | "ASSINATURA_ESPECIFICA";
  assinaturasSelecionadas: string[];
  aplicarEmTodosItens: boolean;
  cursosIds: number[];
  // planosIds removido - cupons aplicam apenas em cursos
  limiteUsoTotalTipo: "ILIMITADO" | "LIMITADO";
  limiteUsoTotalQuantidade?: number;
  limitePorUsuarioTipo: "ILIMITADO" | "LIMITADO" | "PRIMEIRA_COMPRA";
  limitePorUsuarioQuantidade?: number;
  periodoTipo: "ILIMITADO" | "PERIODO";
  periodoInicio?: string;
  periodoFim?: string;
  // ativo removido - sempre true por padrão
}

// ============================================================================
// OPÇÕES PARA SELECTS
// ============================================================================

export const TIPOS_DESCONTO = [
  { value: "PORCENTAGEM", label: "Porcentagem (%)" },
  { value: "VALOR_FIXO", label: "Valor Fixo (R$)" },
] as const;

export const APLICAR_EM_OPCOES = [
  { value: "TODA_PLATAFORMA", label: "Toda a Plataforma" },
  { value: "APENAS_ASSINATURA", label: "Apenas Assinaturas" },
  { value: "APENAS_CURSOS", label: "Apenas Cursos" },
] as const;

export const APLICACAO_CUPOM_OPCOES = [
  { value: "TODAS_ASSINATURAS", label: "Em todas as assinaturas" },
  { value: "ASSINATURA_ESPECIFICA", label: "Em assinatura específica" },
] as const;

export const LIMITE_USO_TOTAL_OPCOES = [
  { value: "ILIMITADO", label: "Ilimitado" },
  { value: "LIMITADO", label: "Limitado" },
] as const;

export const LIMITE_POR_USUARIO_OPCOES = [
  { value: "ILIMITADO", label: "Ilimitado" },
  { value: "PRIMEIRA_COMPRA", label: "Primeira Compra" },
  { value: "LIMITADO", label: "Limitado" },
] as const;

export const PERIODO_TIPO_OPCOES = [
  { value: "ILIMITADO", label: "Sempre Ativo" },
  { value: "PERIODO", label: "Período Específico" },
] as const;

// ============================================================================
// VALIDAÇÃO DE CUPOM (Checkout)
// ============================================================================

export interface ValidateCupomPayload {
  codigo: string;
  planosEmpresariaisId?: string;
}

export interface ValidateCupomSuccessResponse {
  success: true;
  valido: true;
  cupom: {
    id: string;
    codigo: string;
    descricao?: string;
    tipoDesconto: "PORCENTAGEM" | "VALOR_FIXO";
    valorPercentual: number | null;
    valorFixo: number | null;
    aplicarEm: "TODA_PLATAFORMA" | "APENAS_ASSINATURA" | "APENAS_CURSOS";
  };
}

export interface ValidateCupomErrorResponse {
  success: false;
  code:
    | "CUPOM_NAO_ENCONTRADO"
    | "CUPOM_INATIVO"
    | "CUPOM_AINDA_NAO_VALIDO"
    | "CUPOM_EXPIRADO"
    | "CUPOM_ESGOTADO"
    | "CUPOM_NAO_APLICAVEL"
    | "CUPOM_NAO_APLICAVEL_PLANO"
    | "CUPOM_APENAS_PRIMEIRA_COMPRA";
  message: string;
}

export type ValidateCupomResponse =
  | ValidateCupomSuccessResponse
  | ValidateCupomErrorResponse;
