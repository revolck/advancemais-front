// src/theme/website/components/problem-solution-section/components/ProblemCard.tsx

"use client";

import React from "react";
import { Icon } from "@/components/ui/custom/Icons";
import { cn } from "@/lib/utils";
import type { ProblemCardProps } from "../types";

export const ProblemCard: React.FC<ProblemCardProps> = ({ data, index }) => {
  return (
    <div
      className="flex items-start gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover-lift"
      style={{
        // Animação de entrada com stagger
        animationDelay: `${index * 150}ms`,
        animation: `fade-in-up 0.6s ease-out forwards`,
        opacity: 0, // Inicia invisível para a animação
      }}
    >
      {/* Ícone */}
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-700 flex-shrink-0">
        <Icon
          name={data.icon as any}
          size={32}
          className={cn(
            "transition-all duration-300",
            data.iconColor || "text-blue-600"
          )}
        />
      </div>

      {/* Conteúdo */}
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
          {data.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
          {data.description}
        </p>
      </div>
    </div>
  );
};
