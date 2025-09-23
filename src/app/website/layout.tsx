import type { Metadata } from "next";
import type { ReactNode } from "react";
import { listWebsiteScripts } from "@/api/websites/components/scripts";
import { ScriptInjector } from "@/components/scripts/script-injector";
import { loadPublishedScripts } from "@/lib/scripts/load-published-scripts";

import { LoadingProvider } from "./loading-context";
import LayoutClient from "./layout-client";

export const metadata: Metadata = {
  title: "Advance+ | Inovação em Educação e Tecnologia",
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
    "Advance+",
  ],
  authors: [{ name: "Advance+" }],
  robots: "index, follow",
  openGraph: {
    title: "Advance+ | Inovação em Educação e Tecnologia",
    description:
      "Plataforma integrada de educação, cursos profissionalizantes e soluções tecnológicas",
    type: "website",
    locale: "pt_BR",
    siteName: "Advance+",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Advance+ | Educação e Tecnologia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Advance+ | Inovação em Educação e Tecnologia",
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
async function fetchWebsiteScripts() {
  return loadPublishedScripts(listWebsiteScripts, "WEBSITE");
}

export default async function WebsiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const scripts = await fetchWebsiteScripts();

  return (
    <LoadingProvider>
      <ScriptInjector scripts={scripts} />
      <LayoutClient>{children}</LayoutClient>
    </LoadingProvider>
  );
}
