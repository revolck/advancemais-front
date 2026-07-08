import type { FooterConfig } from "../theme/website/footer/types";

export const FOOTER_CONFIG: FooterConfig = {
  sections: [
    {
      id: "about",
      title: "Sobre Nós",
      icon: "users",
      links: [
        {
          label: "Quem Somos",
          href: "/sobre",
          popupTarget: "website-footer-about",
        },
        {
          label: "Como funciona",
          href: "/como-funciona",
          popupTarget: "website-footer-how-it-works",
        },
        {
          label: "Como comprar",
          href: "/como-comprar",
          popupTarget: "website-footer-how-to-buy",
        },
        {
          label: "Preferências de Cookies",
          href: "/cookies",
          popupTarget: "website-footer-cookie-preferences",
        },
      ],
    },
    {
      id: "quick-access",
      title: "Acesso Rápido",
      icon: "zap",
      links: [
        {
          label: "Cursos",
          href: "/cursos",
          popupTarget: "website-footer-courses",
        },
        {
          label: "Para empresas",
          href: "/recrutamento",
          popupTarget: "website-footer-for-business",
        },
        {
          label: "Para candidatos",
          href: "/vagas",
          popupTarget: "website-footer-for-candidates",
        },
        {
          label: "FAQ",
          href: "/faq",
          popupTarget: "website-footer-faq",
        },
      ],
    },
    {
      id: "contact",
      title: "Fale Conosco",
      icon: "message-circle",
      links: [
        {
          label: "Central de Ajuda",
          href: "#",
          popupTarget: "website-footer-help-center",
        },
        {
          label: "Ouvidoria",
          href: "/ouvidoria",
          popupTarget: "website-footer-ombudsman",
        },
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
    { label: "Política de Privacidade", href: "/politica-privacidade" },
    { label: "Termos de Uso", href: "/termos-uso" },
    { label: "Preferências de Cookies", href: "/cookies" },
  ],
  copyright: "Todos os Direitos Reservados Advance+",
};
