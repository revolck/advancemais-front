"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Icon } from "@/components/ui/custom/Icons";

interface EmptyStateProps {
  isDragging: boolean;
  onAddModule: () => void;
}

/**
 * Estado vazio quando não há módulos nem itens avulsos
 */
export function EmptyState({ isDragging, onAddModule }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Ilustração decorativa */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[var(--primary-color)]/10 rounded-full blur-xl scale-150" />
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary-color)]/20 to-[var(--primary-color)]/5 border border-[var(--primary-color)]/20">
          <Icon
            name="Layers"
            className="h-10 w-10 text-[var(--primary-color)]"
          />
        </div>
      </div>

      {/* Título e descrição */}
      <h3 className="text-lg! font-semibold! text-gray-900! mb-2!">
        {isDragging
          ? "Solte aqui para adicionar"
          : "Monte a estrutura do curso"}
      </h3>
      <p className="text-sm! text-gray-500! max-w-sm! mb-6! leading-relaxed!">
        {isDragging
          ? "Solte o componente para começar a criar sua estrutura"
          : "Arraste componentes da paleta ao lado ou clique no botão abaixo para começar"}
      </p>

      {/* Botão CTA */}
      {!isDragging && (
        <ButtonCustom
          type="button"
          variant="primary"
          onClick={onAddModule}
          className="gap-2"
        >
          <Icon name="Plus" className="h-4 w-4" />
          Criar Primeiro Módulo
        </ButtonCustom>
      )}

      {/* Dica visual */}
      {!isDragging && (
        <div className="mt-8 flex items-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Icon name="Boxes" className="h-4 w-4 text-indigo-600" />
            </div>
            <span>Módulo</span>
          </div>
          <Icon name="ArrowRight" className="h-3 w-3" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Icon name="GraduationCap" className="h-4 w-4 text-blue-600" />
            </div>
            <span>Aulas</span>
          </div>
          <Icon name="ArrowRight" className="h-3 w-3" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
              <Icon name="FileText" className="h-4 w-4 text-rose-600" />
            </div>
            <span>Provas</span>
          </div>
        </div>
      )}
    </div>
  );
}
