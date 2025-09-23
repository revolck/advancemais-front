export type ScriptApplication = "WEBSITE" | "DASHBOARD";

export type ScriptOrientation = "HEADER" | "BODY" | "FOOTER";

export type ScriptStatus = "PUBLICADO" | "RASCUNHO";

export interface ScriptResponse {
  id: string;
  nome: string;
  descricao?: string | null;
  codigo: string;
  aplicacao: ScriptApplication;
  orientacao: ScriptOrientation;
  status: ScriptStatus | boolean;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface ScriptListParams {
  aplicacao?: ScriptApplication;
  orientacao?: ScriptOrientation;
  status?: ScriptStatus;
}

export interface CreateScriptPayload {
  nome: string;
  descricao?: string | null;
  codigo: string;
  aplicacao: ScriptApplication;
  orientacao: ScriptOrientation;
  status: ScriptStatus;
}

export type UpdateScriptPayload = Partial<CreateScriptPayload>;
