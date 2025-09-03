"use client";

import React from "react";
import { Icon } from "@/components/ui/custom/Icons";
import { cn } from "@/lib/utils";
import type { ProblemCardProps } from "../types";

export const ProblemCard: React.FC<ProblemCardProps> = ({ data, index }) => {
  return (
    <div
      className="flex items-start gap-6 p-6 bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 border border-gray-200 hover:border-[var(--secondary-color)] hover-lift"
      style={{
        animationDelay: `${index * 150}ms`,
        animation: `fade-in-up 0.6s ease-out forwards`,
      }}
    >
      {/* Ícone */}
      <div className="flex items-center mt-4 gap-3 p-3 bg-[var(--primary-color)] rounded-xl duration-300 hover:bg-[var(--secondary-color)]">
        <Icon
          name={data.icon as any}
          size={32}
          className={cn(
            "transition-all duration-300",
            data.iconColor || "text-white"
          )}
        />
      </div>

      {/* Conteúdo */}
      <div className="flex-1">
        <h3 className="!text-xl !font-semibold text-neutral-700 !mb-2">
          {data.title}
        </h3>
        <p className="!text-gray-600 !text-base text-justify">
          {data.description}
        </p>
      </div>
    </div>
  );
};
