"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormLoadingModalProps {
  /**
   * Controla se o modal está visível
   */
  isLoading: boolean;
  /**
   * Título principal do modal (ex: "Salvando...", "Criando curso...")
   */
  title: string;
  /**
   * Descrição detalhada da etapa atual (ex: "Salvando alterações...", "Fazendo upload da imagem...")
   * Se não fornecido, exibe "Processando"
   */
  loadingStep?: string;
  /**
   * Ícone contextual a ser exibido no centro do spinner
   * Exemplos: Video (aulas), BookOpen (cursos), Users (turmas), Building2 (empresas), Briefcase (vagas)
   */
  icon: LucideIcon;
  /**
   * Classes CSS adicionais para o container do modal
   */
  className?: string;
}

/**
 * Componente de modal de loading padronizado para formulários
 * 
 * @example
 * ```tsx
 * <FormLoadingModal
 *   isLoading={isLoading}
 *   title={mode === "edit" ? "Salvando..." : "Criando curso..."}
 *   loadingStep={loadingStep}
 *   icon={BookOpen}
 * />
 * ```
 */
export function FormLoadingModal({
  isLoading,
  title,
  loadingStep,
  icon: IconComponent,
  className,
}: FormLoadingModalProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center",
        className
      )}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-5 w-80">
        <div className="flex items-center gap-4">
          {/* Spinner compacto */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full border-3 border-gray-200" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-3 border-primary border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
          </div>

          {/* Título e descrição ao lado */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm! font-semibold! text-gray-900! mb-0.5!">
              {title}
            </h3>
            <p className="text-xs! text-gray-600! mb-0!">
              {loadingStep || "Processando"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

