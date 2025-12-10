// Configurações do componente de catálogo de cursos

export const COURSE_CONFIG = {
  pagination: {
    defaultItemsPerPage: 12,
    maxItemsPerPage: 50,
  },
  search: {
    debounceDelay: 300,
    minSearchLength: 2,
  },
  sorting: {
    options: [
      { value: "recent", label: "Mais recente" },
      { value: "name_az", label: "Nome (A-Z)" },
      { value: "name_za", label: "Nome (Z-A)" },
      { value: "carga_high", label: "Maior carga horária" },
      { value: "carga_low", label: "Menor carga horária" },
    ],
  },
} as const;
