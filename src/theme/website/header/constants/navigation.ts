import React from "react";
import { ExternalLinkIcon } from "../icons";
import type { NavigationItem } from "../types";

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
  // {
  //   key: "resources",
  //   label: "Resources",
  //   href: "#",
  //   type: "dropdown",
  //   items: [
  //     { label: "Blog", href: "#", icon: React.createElement(ExternalLinkIcon) },
  //     { label: "Guides", href: "#" },
  //     { label: "Help Center", href: "#" },
  //     { label: "API Reference", href: "#" },
  //   ],
  // },
  {
    key: "business",
    label: "Vagas",
    href: "/vagas",
    type: "link",
  },
  {
    key: "blog",
    label: "Blog",
    href: "/blog",
    type: "link",
  },
];
