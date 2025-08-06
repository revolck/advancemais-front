// src/app/website/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import LayoutClient from "./layout-client";

export const metadata: Metadata = {
  title: "AdvanceMais - Inovação em Educação e Tecnologia",
  description:
    "Plataforma integrada de educação, cursos profissionalizantes e soluções tecnológicas para empresas e pessoas",
  keywords: [
    "educação",
    "cursos",
    "tecnologia",
    "capacitação",
    "profissionalização",
    "plataforma de ensino",
    "soluções empresariais",
    "AdvanceMais",
  ],
  authors: [{ name: "AdvanceMais" }],
  robots: "index, follow",
  openGraph: {
    title: "AdvanceMais - Inovação em Educação e Tecnologia",
    description:
      "Plataforma integrada de educação, cursos profissionalizantes e soluções tecnológicas",
    type: "website",
    locale: "pt_BR",
    siteName: "AdvanceMais",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AdvanceMais - Educação e Tecnologia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AdvanceMais - Inovação em Educação e Tecnologia",
    description:
      "Plataforma integrada de educação, cursos profissionalizantes e soluções tecnológicas",
    images: ["/images/og-image.jpg"],
  },
  alternates: {
    canonical: "https://advancemais.com.br",
  },
};

/**
 * Layout específico para o Website Institucional
 *
 * Características:
 * - Header responsivo com navegação completa
 * - Footer com links e informações da empresa
 * - Sistema de notificações integrado
 * - Otimizações de SEO e performance
 * - Estrutura semântica para acessibilidade
 */
export default function WebsiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <LayoutClient>{children}</LayoutClient>;
}
