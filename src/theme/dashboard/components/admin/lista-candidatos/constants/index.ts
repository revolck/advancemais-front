export const CANDIDATO_TABLE_COLUMNS = [
  { key: "candidato", label: "Candidato", sortable: true },
  { key: "contato", label: "Contato", sortable: false },
  { key: "localizacao", label: "Localização", sortable: false },
  { key: "candidaturas", label: "Candidaturas", sortable: true },
  { key: "ultimaAtividade", label: "Última Atividade", sortable: true },
  { key: "acoes", label: "", sortable: false },
] as const;

export const CANDIDATO_DEFAULT_PAGE_SIZE = 10;
export const CANDIDATO_MAX_PAGE_SIZE = 100;

export const CANDIDATO_SORT_FIELDS = [
  { value: "nomeCompleto", label: "Nome" },
  { value: "criadoEm", label: "Data de Cadastro" },
  { value: "ultimoLogin", label: "Último Login" },
  { value: "candidaturas", label: "Número de Candidaturas" },
] as const;

export const CANDIDATO_SORT_DIRECTIONS = [
  { value: "asc", label: "Crescente" },
  { value: "desc", label: "Decrescente" },
] as const;


