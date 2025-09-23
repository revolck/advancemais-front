export interface PlanoEmpresarialBackendResponse {
  id: string;
  icon: string;
  nome: string;
  descricao: string;
  valor: string;
  desconto: number;
  quantidadeVagas: number;
  vagaEmDestaque: boolean;
  quantidadeVagasDestaque: number;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface CreatePlanoEmpresarialPayload {
  icon: string;
  nome: string;
  descricao: string;
  valor: string;
  desconto: number;
  quantidadeVagas: number;
  vagaEmDestaque: boolean;
  quantidadeVagasDestaque: number;
}

export interface UpdatePlanoEmpresarialPayload {
  icon?: string;
  nome?: string;
  descricao?: string;
  valor?: string;
  desconto?: number;
  quantidadeVagas?: number;
  vagaEmDestaque?: boolean;
  quantidadeVagasDestaque?: number;
}
