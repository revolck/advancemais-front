"use client";

import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { usePageTitle } from "@/hooks/usePageTitle";
import Slider from "@/theme/website/slider";

export default function HomePage() {
  // Configura o título da página
  usePageTitle("Início");

  return (
    <div className="min-h-screen">
      <Slider />
      {/* Hero Section usando PageWrapper */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-32 pb-16 min-h-screen bg-gradient-to-b from-transparent to-gray-100 dark:to-gray-800">
        <PageWrapper maxWidth="xl" className="space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            IntegreApp
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl">
            Plataforma de Gestão Integrada que revoluciona a forma como você
            gerencia seus negócios
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105">
              Começar Agora
            </button>
            <button className="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-3 rounded-lg font-semibold transition-colors">
              Saiba Mais
            </button>
          </div>
        </PageWrapper>
      </section>
    </div>
  );
}
