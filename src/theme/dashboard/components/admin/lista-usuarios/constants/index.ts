export const STATUS_OPTIONS = [
  { value: "ATIVO", label: "Ativo" },
  { value: "INATIVO", label: "Inativo" },
  { value: "SUSPENSO", label: "Suspenso" },
  { value: "BLOQUEADO", label: "Bloqueado" },
] as const;

export const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Administrador" },
  { value: "MODERADOR", label: "Moderador" },
  { value: "EDITOR", label: "Editor" },
  { value: "VIEWER", label: "Visualizador" },
  { value: "EMPRESA", label: "Empresa" },
  { value: "CANDIDATO", label: "Candidato" },
  { value: "INSTRUTOR", label: "Instrutor" },
  { value: "ALUNO", label: "Aluno" },
] as const;

export const DEFAULT_PAGE_SIZE = 10;
export const MIN_SEARCH_LENGTH = 3;
export const SEARCH_HELPER_TEXT = "Pesquise por nome, e-mail ou código.";
