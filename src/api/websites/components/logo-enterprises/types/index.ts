export type LogoEnterpriseStatus = "PUBLICADO" | "RASCUNHO" | string;

export interface LogoEnterpriseBackendResponse {
  id: string; // ID da ordem
  logoId: string; // ID do recurso logo
  nome: string;
  imagemUrl: string;
  imagemAlt?: string;
  website?: string;
  status?: LogoEnterpriseStatus | boolean;
  ordem: number;
  ordemCriadoEm?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface CreateLogoEnterprisePayload {
  nome?: string;
  website?: string;
  imagemUrl?: string;
  imagem?: File;
  status?: LogoEnterpriseStatus | boolean;
  imagemAlt?: string;
  ordem?: number;
}

export interface UpdateLogoEnterprisePayload {
  nome?: string;
  website?: string;
  imagemUrl?: string;
  imagem?: File;
  status?: LogoEnterpriseStatus | boolean;
  imagemAlt?: string;
  ordem?: number;
}
