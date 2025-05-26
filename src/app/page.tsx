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

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <PageWrapper maxWidth="xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-gray-100">
            Funcionalidades Principais
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📊"
              title="Gestão Completa"
              description="Gerencie todos os aspectos do seu negócio em uma única plataforma integrada"
              color="blue"
            />

            <FeatureCard
              icon="⚡"
              title="Performance"
              description="Interface rápida e responsiva com tecnologia de ponta"
              color="green"
            />

            <FeatureCard
              icon="🔒"
              title="Segurança"
              description="Proteção avançada dos seus dados com criptografia de ponta"
              color="purple"
            />
          </div>
        </PageWrapper>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <PageWrapper maxWidth="lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCard number="1000+" label="Clientes" />
            <StatCard number="50K+" label="Usuários" />
            <StatCard number="99.9%" label="Uptime" />
            <StatCard number="24/7" label="Suporte" />
          </div>
        </PageWrapper>
      </section>
    </div>
  );
}

// Componente auxiliar para cards de features
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  color: "blue" | "green" | "purple";
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    purple:
      "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div
        className={`w-12 h-12 ${colorClasses[color]} rounded-lg mx-auto mb-4 flex items-center justify-center text-2xl`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

// Componente auxiliar para estatísticas
interface StatCardProps {
  number: string;
  label: string;
}

function StatCard({ number, label }: StatCardProps) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
        {number}
      </div>
      <div className="text-gray-600 dark:text-gray-300">{label}</div>
    </div>
  );
}
