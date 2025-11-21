"use client";

import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom/button";

interface CourseHeaderProps {
  busca: string;
  onBuscaChange: (value: string) => void;
  onOpenMobileFilters?: () => void;
  hasActiveFilters?: boolean;
  onSearch?: () => void;
  isLoading?: boolean;
}

export function CourseHeader({
  busca,
  onBuscaChange,
  onOpenMobileFilters,
  hasActiveFilters = false,
  onSearch,
  isLoading = false,
}: CourseHeaderProps) {
  const [localBusca, setLocalBusca] = useState(busca);

  // Sincroniza o estado local quando o prop muda externamente
  useEffect(() => {
    setLocalBusca(busca);
  }, [busca]);

  const handleSearch = () => {
    // Validação: mínimo de 3 caracteres ou campo vazio (para buscar todos)
    const trimmedBusca = localBusca.trim();
    if (trimmedBusca.length > 0 && trimmedBusca.length < 3) {
      return; // Não permite busca com menos de 3 caracteres
    }

    onBuscaChange(trimmedBusca);
    if (onSearch) {
      onSearch();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const canSearch =
    localBusca.trim().length === 0 || localBusca.trim().length >= 3;

  return (
    <section className="bg-[var(--primary-color)] py-26">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white !mb-0">
            Busque o curso ideal para sua capacitação profissional
          </h2>
        </div>

        <div className="bg-white rounded-[20px] flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-0">
          <div className="flex items-center flex-1 px-4">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              value={localBusca}
              onChange={(e) => setLocalBusca(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nome do curso ou área de interesse"
              className="w-full bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3 sm:pl-3">
            {onOpenMobileFilters && (
              <ButtonCustom
                variant="outline"
                size="sm"
                className="rounded-full border-gray-200 text-gray-700"
                onClick={onOpenMobileFilters}
                icon="SlidersHorizontal"
              >
                Filtros
                {hasActiveFilters && (
                  <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1f8454] text-xs font-bold text-white">
                    !
                  </span>
                )}
              </ButtonCustom>
            )}
            <ButtonCustom
              variant="primary"
              className="px-8 py-3 rounded-full"
              onClick={handleSearch}
              isLoading={isLoading}
              disabled={isLoading || !canSearch}
            >
              Buscar
            </ButtonCustom>
          </div>
        </div>
      </div>
    </section>
  );
}
