// src/theme/website/components/header-pages/constants/index.ts

/**
 * Configurações do componente
 */
export const HEADER_CONFIG = {
  image: {
    width: 686,
    height: 305,
    quality: 90,
    priority: true,
    sizes: "(max-width: 1024px) 100vw, 50vw",
  },
  breadcrumbs: {
    separator: "/",
    homeLabel: "Página Inicial",
    homeUrl: "/",
  },
  responsive: {
    mobileBreakpoint: 768,
  },
} as const;

/**
 * Mapeamento de rotas para labels mais amigáveis nos breadcrumbs
 */
export const ROUTE_LABELS: Record<string, string> = {
  consultoria: "Consultoria",
  recrutamento: "Recrutamento",
  "recrutamento-selecao": "Recrutamento & Seleção",
  treinamento: "Treinamento",
  "treinamento-company": "Treinamento In Company",
  servicos: "Serviços",
  solucoes: "Soluções",
  sobre: "Sobre Nós",
  contato: "Contato",
  blog: "Blog",
  cursos: "Cursos",
  certificados: "Certificados",
  processo: "Processo Seletivo",
  programas: "Programas",
};
