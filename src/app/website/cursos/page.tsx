"use client";

import React, { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import CourseCatalog from "@/theme/website/components/course";

/**
 * Página Sobre Nós
 *
 * Apresenta informações sobre a empresa, história, missão e valores
 */
export default function CursosPage() {
  const [isClient, setIsClient] = useState(false);

  // Configura o título da página
  usePageTitle("Sobre nós");

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
      <CourseCatalog
        fetchFromApi={false}
        showHeader={false} // Se já tem header na página
        onDataLoaded={(data) => {
          console.log("Cursos carregados:", data);
        }}
      />
    </div>
  );
}
