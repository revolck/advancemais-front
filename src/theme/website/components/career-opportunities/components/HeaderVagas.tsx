"use client";

import React from "react";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom/button";

interface HeaderVagasProps {
  busca: string;
  onBuscaChange: (value: string) => void;
  regiao: string;
  onRegiaoChange: (value: string) => void;
  onOpenMobileFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function HeaderVagas({
  busca,
  onBuscaChange,
  regiao,
  onRegiaoChange,
  onOpenMobileFilters,
  hasActiveFilters = false,
}: HeaderVagasProps) {
  return (
    <section className="bg-[var(--primary-color)] py-26">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white !mb-0">
            Busque a oportunidade que combina com você
          </h2>
        </div>

        <div className="bg-white rounded-[20px] flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-0">
          <div className="flex items-center flex-1 px-4">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              value={busca}
              onChange={(e) => onBuscaChange(e.target.value)}
              placeholder="Cargo ou função desejada"
              className="w-full bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          <div className="hidden sm:block w-px h-8 bg-gray-200/70" />
          <div className="flex items-center flex-1 px-4">
            <MapPin className="w-5 h-5 text-gray-400 mr-3" />
            <input
              value={regiao}
              onChange={(e) => onRegiaoChange(e.target.value)}
              placeholder="Cidade ou região"
              className="w-full bg-transparent text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
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
            <ButtonCustom variant="primary" className="px-8 py-3 rounded-full">
              Buscar
            </ButtonCustom>
          </div>
        </div>
      </div>
    </section>
  );
}
