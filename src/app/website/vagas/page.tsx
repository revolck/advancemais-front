"use client";

import React, { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import CareerOpportunities from "@/theme/website/components/career-opportunities";

/**
 * Página de Vagas
 *
 * Apresenta todas as oportunidades de trabalho disponíveis
 */
export default function VagasPage() {
  const [isClient, setIsClient] = useState(false);

  // Configura o título da página
  usePageTitle("Vagas e Oportunidades");

  // Evita problemas de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero skeleton */}
          <div className="text-center mb-16 space-y-4">
            <div className="h-8 bg-gray-200 rounded-full w-48 mx-auto mb-6 animate-pulse" />
            <div className="h-14 bg-gray-200 rounded-xl w-full max-w-2xl mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded-lg w-96 mx-auto animate-pulse" />
            </div>
          {/* Search skeleton */}
          <div className="mb-8 max-w-3xl mx-auto">
            <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <CareerOpportunities fetchFromApi={true} />
    </div>
  );
}
