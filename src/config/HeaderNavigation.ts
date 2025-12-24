import type { NavigationItem } from "@/theme/website/header/types";

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    key: "initialpage",
    label: "Página Inicial",
    href: "/",
    type: "link",
  },
  {
    key: "about",
    label: "Sobre",
    href: "/sobre",
    type: "link",
  },
  {
    key: "courses",
    label: "Cursos",
    href: "/cursos",
    type: "link",
  },
  {
    key: "solutions",
    label: "Soluções",
    href: "#",
    type: "dropdown",
    items: [
      { label: "Recrutamento & Seleção", href: "/recrutamento" },
      { label: "Treinamento In Company", href: "/treinamento" },
    ],
  },
  {
    key: "business",
    label: "Vagas",
    href: "/vagas",
    type: "link",
  },
];
