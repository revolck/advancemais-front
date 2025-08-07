import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LoadingProvider } from "./loading-context";
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
 * Layout do Website - VERSÃO SIMPLIFICADA E FUNCIONAL
 *
 * - Loading de 3 segundos automático
 * - Sem complexidade desnecessária
 * - Funciona de verdade
 */
export default function WebsiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <LoadingProvider>
      <LayoutClient>{children}</LayoutClient>
    </LoadingProvider>
  );
}
