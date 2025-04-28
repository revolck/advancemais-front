/**
 * Configuração geral do site
 */

export const siteConfig = {
  name: "AdvanceMais",
  description: "Plataforma completa para gestão e avanço de negócios.",
  url: "https://advancemais.com",
  ogImage: "https://advancemais.com/og-image.jpg",
  links: {
    twitter: "https://twitter.com/advancemais",
    github: "https://github.com/advancemais",
  },
  creator: "AdvanceMais Team",
  keywords: [
    "gestão",
    "negócios",
    "dashboard",
    "analytics",
    "plataforma",
    "automação",
  ],
  metadataBase: new URL("https://advancemais.com"),
};

export const contactInfo = {
  email: "contato@advancemais.com",
  phone: "+55 11 9999-9999",
  address: "Rua Exemplo, 123 - São Paulo, SP",
};

export const socialLinks = {
  facebook: "https://facebook.com/advancemais",
  instagram: "https://instagram.com/advancemais",
  twitter: "https://twitter.com/advancemais",
  linkedin: "https://linkedin.com/company/advancemais",
};

/**
 * Rotas principais do site
 */
export const routes = {
  home: "/",
  about: "/sobre",
  services: "/servicos",
  contact: "/contato",
  blog: "/blog",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  terms: "/termos-de-uso",
  privacy: "/politica-de-privacidade",
};

/**
 * Links do rodapé
 */
export const footerLinks = [
  {
    title: "Produto",
    items: [
      { title: "Recursos", href: "/recursos" },
      { title: "Preços", href: "/precos" },
      { title: "Demonstração", href: "/demo" },
      { title: "Roadmap", href: "/roadmap" },
    ],
  },
  {
    title: "Empresa",
    items: [
      { title: "Sobre nós", href: "/sobre" },
      { title: "Blog", href: "/blog" },
      { title: "Carreiras", href: "/carreiras" },
      { title: "Contato", href: "/contato" },
    ],
  },
  {
    title: "Recursos",
    items: [
      { title: "Documentação", href: "/docs" },
      { title: "Guias", href: "/guias" },
      { title: "Webinars", href: "/webinars" },
      { title: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    items: [
      { title: "Termos de Uso", href: "/termos-de-uso" },
      { title: "Política de Privacidade", href: "/politica-de-privacidade" },
      { title: "Cookies", href: "/cookies" },
    ],
  },
];

/**
 * Características principais do produto para seção de destaque
 */
export const featureHighlights = [
  {
    title: "Gestão Completa",
    description:
      "Gerencie todos os aspectos do seu negócio em uma única plataforma.",
    icon: "LayoutDashboard",
  },
  {
    title: "Analytics Avançado",
    description:
      "Visualize dados e métricas em tempo real para tomar decisões informadas.",
    icon: "BarChart",
  },
  {
    title: "Automação Inteligente",
    description:
      "Automatize tarefas repetitivas e processos para aumentar a produtividade.",
    icon: "Zap",
  },
  {
    title: "Integração Total",
    description:
      "Integre-se com suas ferramentas favoritas e centralize seus dados.",
    icon: "Workflow",
  },
  {
    title: "Segurança Avançada",
    description:
      "Proteja seus dados com os mais altos padrões de segurança do mercado.",
    icon: "Shield",
  },
  {
    title: "Suporte Premium",
    description:
      "Conte com suporte especializado 24/7 para resolver suas dúvidas.",
    icon: "HelpCircle",
  },
];
