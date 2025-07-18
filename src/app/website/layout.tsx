// src/app/website/layout.tsx
import type { Metadata } from "next";
import { ToasterCustom } from "@/components/ui/custom/toast";
import HeaderWithBackground from "@/theme/website/header";
import WebsiteFooter from "@/theme/website/footer";

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
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header responsivo com navegação */}
      <HeaderWithBackground />

      {/* Conteúdo principal da aplicação */}
      <main
        id="main-content"
        className="relative z-10 min-h-screen"
        role="main"
      >
        {children}
      </main>

      {/* Footer do website */}
      <WebsiteFooter />

      {/* Sistema de notificações */}
      <ToasterCustom
        position="top-right"
        theme="system"
        richColors={true}
        closeButton={false}
        maxToasts={5}
        gap={8}
        defaultDuration={5000}
      />
    </div>
  );
}
