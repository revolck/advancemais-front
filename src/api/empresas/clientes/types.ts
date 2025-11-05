export type ClientePlanoModo = "CLIENTE" | "TESTE" | "PARCEIRO";
export type ClientePlanoStatus = "ATIVO" | "SUSPENSO" | "EXPIRADO" | "CANCELADO";

export interface EmpresaClientePlano {
  id: string;
  usuarioId: string;
  planosEmpresariaisId: string;
  modo: ClientePlanoModo;
  status: ClientePlanoStatus;
  inicio: string;
  fim?: string;
  diasTeste?: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface EmpresaClientePlanoListParams {
  usuarioId?: string;
  status?: ClientePlanoStatus;
  modo?: ClientePlanoModo;
  page?: number;
  pageSize?: number;
}

export interface EmpresaClientePlanoCreatePayload {
  usuarioId: string;
  planosEmpresariaisId: string;
  modo: ClientePlanoModo;
  diasTeste?: number;
}

export interface EmpresaClientePlanoUpdatePayload {
  modo?: ClientePlanoModo;
  status?: ClientePlanoStatus;
}

export interface EmpresaClientePlanoListResponse {
  data: EmpresaClientePlano[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export type EmpresaClientePlanoDetailResponse = EmpresaClientePlano;

