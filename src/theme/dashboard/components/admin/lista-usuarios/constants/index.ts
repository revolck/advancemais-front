export const STATUS_OPTIONS = [
  { value: "ATIVO", label: "Ativo" },
  { value: "PENDENTE", label: "Pendente" },
  { value: "INATIVO", label: "Inativo" },
  { value: "SUSPENSO", label: "Suspenso" },
  { value: "BLOQUEADO", label: "Bloqueado" },
] as const;

export const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Administrador" },
  { value: "MODERADOR", label: "Moderador" },
  { value: "PEDAGOGICO", label: "Pedagógico" },
  { value: "FINANCEIRO", label: "Financeiro" },
  { value: "SETOR_DE_VAGAS", label: "Setor de vagas" },
  { value: "RECRUTADOR", label: "Recrutador" },
  { value: "EMPRESA", label: "Empresa" },
  { value: "INSTRUTOR", label: "Instrutor" },
  { value: "ALUNO_CANDIDATO", label: "Aluno/Candidato" },
] as const;

export const DEFAULT_PAGE_SIZE = 10;
export const MIN_SEARCH_LENGTH = 3;
export const SEARCH_HELPER_TEXT = "Pesquise por nome, e-mail ou código.";
