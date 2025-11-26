import type { UserRole } from "@/config/roles";

export interface UsuarioOverview {
  id: string;
  nomeCompleto: string;
  email: string;
  telefone?: string;
  avatarUrl?: string;
  codUsuario?: string;
  cpf?: string;
  cnpj?: string;
  tipoUsuario?: "PESSOA_FISICA" | "PESSOA_JURIDICA";
  cidade?: string;
  estado?: string;
  role: UserRole;
  status: "ATIVO" | "INATIVO" | "SUSPENSO" | "BLOQUEADO";
  criadoEm: string;
  atualizadoEm?: string;
  ultimoAcesso?: string;
  // Informações para determinar se é aluno ou candidato
  curriculos?: Array<{ id: string }>;
  cursosInscricoes?: Array<{ id: string }>;
}

export interface UsuarioDashboardFilters {
  search?: string;
  role?: UserRole;
  status?: string;
  cidade?: string;
  estado?: string;
  criadoDe?: string;
  criadoAte?: string;
  page?: number;
  pageSize?: number;
}

export interface UsuariosPaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface UsuariosDashboardData {
  usuarios: UsuarioOverview[];
  pagination: UsuariosPaginationMeta;
}

export interface UsuarioDashboardProps {
  className?: string;
  filters?: Partial<UsuarioDashboardFilters>;
}
