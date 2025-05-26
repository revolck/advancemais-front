// src/app/website/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { usePageTitle } from "@/hooks/usePageTitle";
import Slider from "@/theme/website/slider";

/**
 * Página Inicial do Website Institucional
 *
 * Esta é a homepage que representa a AdvanceMais como empresa
 * e apresenta seus serviços, cursos e soluções.
 */
export default function WebsiteHomePage() {
  const [isClient, setIsClient] = useState(false);

  // Configura o título da página
  usePageTitle("Início");

  // Evita problemas de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen">
        {/* Loading placeholder que é igual ao conteúdo */}
        <section className="relative min-h-[300px] bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-36"></div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Slider - Banner principal */}
      <section className="relative">
        <Slider />
      </section>

      {/* Hero Section Complementar */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-transparent to-gray-100 dark:to-gray-800">
        <PageWrapper maxWidth="xl" className="space-y-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Transformando Vidas através da Educação e Tecnologia
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Na AdvanceMais, oferecemos cursos profissionalizantes, soluções
              tecnológicas e capacitação que conectam pessoas ao mercado de
              trabalho e impulsionam o crescimento empresarial.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                Conheça Nossos Cursos
              </button>
              <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-semibold transition-all">
                Soluções Empresariais
              </button>
            </div>
          </div>
        </PageWrapper>
      </section>

      {/* Seção de Serviços Principais */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <PageWrapper maxWidth="xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Nossos Principais Serviços
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Soluções integradas que atendem desde a capacitação individual até
              as necessidades mais complexas de empresas e organizações.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Serviço 1 - Cursos */}
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Cursos Profissionalizantes
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Capacitação técnica e profissional em diversas áreas, preparando
                pessoas para o mercado de trabalho atual.
              </p>
              <a
                href="/cursos"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver cursos disponíveis →
              </a>
            </div>

            {/* Serviço 2 - Tecnologia */}
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Soluções Tecnológicas
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Desenvolvimento de sistemas, plataformas digitais e soluções
                personalizadas para empresas.
              </p>
              <a
                href="/solucoes"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Conhecer soluções →
              </a>
            </div>

            {/* Serviço 3 - Consultoria */}
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Consultoria Especializada
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Orientação estratégica em educação corporativa, transformação
                digital e gestão de pessoas.
              </p>
              <a
                href="/contato"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Falar com especialista →
              </a>
            </div>
          </div>
        </PageWrapper>
      </section>

      {/* Seção de Números/Impacto */}
      <section className="py-20 bg-blue-600 text-white">
        <PageWrapper maxWidth="xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nosso Impacto em Números
            </h2>
            <p className="text-xl text-blue-100">
              Resultados que demonstram nossa dedicação à transformação social
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Pessoas Capacitadas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Empresas Atendidas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Taxa de Satisfação</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">10+</div>
              <div className="text-blue-100">Anos de Experiência</div>
            </div>
          </div>
        </PageWrapper>
      </section>

      {/* Call to Action Final */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <PageWrapper maxWidth="lg">
          <div className="text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Pronto para Transformar seu Futuro?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Entre em contato conosco e descubra como podemos ajudar você ou
              sua empresa a alcançar novos patamares.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105">
                Fale Conosco
              </button>
              <button className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 px-8 py-4 rounded-lg font-semibold transition-all">
                Agendar Reunião
              </button>
            </div>
          </div>
        </PageWrapper>
      </section>
    </div>
  );
}
