"use client";

import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { usePageTitle } from "@/hooks/usePageTitle";

/**
 * Página Sobre a AdvanceMais
 *
 * Apresenta a história, missão, visão, valores e equipe da empresa.
 */
export default function SobrePage() {
  usePageTitle("Sobre Nós");

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <PageWrapper maxWidth="xl">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              Sobre a AdvanceMais
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Há mais de 10 anos transformando vidas através da educação,
              tecnologia e inovação social.
            </p>
          </div>
        </PageWrapper>
      </section>

      {/* Nossa História */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <PageWrapper maxWidth="xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                Nossa História
              </h2>
              <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300">
                <p>
                  A AdvanceMais nasceu em 2013 com o propósito de democratizar o
                  acesso à educação de qualidade e à tecnologia, especialmente
                  para comunidades em situação de vulnerabilidade social.
                </p>
                <p>
                  Iniciamos nossas atividades em Maceió, Alagoas, oferecendo
                  cursos profissionalizantes gratuitos e desenvolvendo soluções
                  tecnológicas para organizações do terceiro setor.
                </p>
                <p>
                  Ao longo dos anos, expandimos nossa atuação e hoje atendemos
                  empresas, ONGs e pessoas físicas em todo o território
                  nacional, mantendo sempre nosso compromisso com a
                  transformação social.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 h-96 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <svg
                  className="w-24 h-24 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m-3 0h2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10"
                  />
                </svg>
                <p>Timeline da Empresa</p>
              </div>
            </div>
          </div>
        </PageWrapper>
      </section>

      {/* Missão, Visão e Valores */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <PageWrapper maxWidth="xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Nossos Princípios
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Os valores que guiam nossa atuação e definem quem somos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Missão */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Nossa Missão
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Promover a inclusão social e digital através da educação
                profissionalizante e soluções tecnológicas acessíveis,
                empoderando pessoas e organizações para um futuro melhor.
              </p>
            </div>

            {/* Visão */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Nossa Visão
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ser referência nacional em educação profissionalizante e
                tecnologia social, reconhecida pelo impacto positivo na vida das
                pessoas e no desenvolvimento das comunidades.
              </p>
            </div>

            {/* Valores */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6">
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Nossos Valores
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Compromisso social</li>
                <li>• Inovação constante</li>
                <li>• Educação transformadora</li>
                <li>• Transparência</li>
                <li>• Sustentabilidade</li>
                <li>• Respeito à diversidade</li>
              </ul>
            </div>
          </div>
        </PageWrapper>
      </section>

      {/* Equipe/Números */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <PageWrapper maxWidth="xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Nossa Equipe e Impacto
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Profissionais dedicados trabalhando por um objetivo comum
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                15+
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Colaboradores
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
                500+
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Vidas Transformadas
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">
                50+
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Projetos Executados
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">
                10+
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Anos de Experiência
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Quer Fazer Parte da Nossa História?
            </h3>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Junte-se a nós na missão de transformar vidas através da educação
              e tecnologia. Há sempre espaço para quem quer fazer a diferença.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Trabalhe Conosco
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors">
                Seja um Parceiro
              </button>
            </div>
          </div>
        </PageWrapper>
      </section>
    </div>
  );
}
