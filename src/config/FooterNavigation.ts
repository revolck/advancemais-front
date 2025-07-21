import type { FooterConfig } from "../theme/website/footer/types";

export const FOOTER_CONFIG: FooterConfig = {
  sections: [
    {
      title: "Sobre Nós",
      icon: "users",
      links: [
        { label: "Quem Somos", href: "/sobre" },
        { label: "Página Inicial", href: "/" },
        { label: "Contato", href: "/contato" },
      ],
    },
    {
      title: "Acesso Rápido",
      icon: "zap",
      links: [
        { label: "Cursos", href: "/cursos" },
        { label: "Soluções", href: "/solucoes" },
        { label: "Plataforma", href: "/plataforma" },
        { label: "Suporte", href: "/suporte" },
      ],
    },
    {
      title: "Fale Conosco",
      icon: "message-circle",
      links: [
        { label: "Fale Conosco", href: "/contato" },
        { label: "Ouvidoria", href: "/ouvidoria" },
        { label: "FAQ", href: "/faq" },
      ],
    },
  ],
  contact: {
    address:
      "Av. Juca Sampaio, 2247 - sala 30 Condominio Shopping Miramar - Feitosa CEP 57.042-530 Maceió/AL",
    phones: ["(82) 3234-1397", "(82) 98882-5559"],
    hours: "segunda a sexta (08h às 20h) e sábado (09h às 13h)",
  },
  legal: [
    { label: "Política de Privacidade", href: "/privacidade" },
    { label: "Termos de Uso", href: "/termos" },
    { label: "Preferências de Cookies", href: "/cookies" },
  ],
  copyright: "Todos os Direitos Reservados AdvanceMais",
};
