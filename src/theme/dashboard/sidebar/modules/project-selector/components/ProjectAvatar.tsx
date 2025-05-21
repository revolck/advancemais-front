// src/theme/sidebar/modules/project-selector/components/ProjectAvatar.tsx
"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Project } from "../types/project.types";

interface ProjectAvatarProps {
  project: Project;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  isSelected?: boolean;
  showInitials?: boolean;
}

export function ProjectAvatar({
  project,
  size = "md",
  className = "",
  isSelected = false, // Mantemos o prop, mas não usaremos para estilos visuais
  showInitials = true,
}: ProjectAvatarProps) {
  // Configuração de tamanhos
  const sizeConfigs = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
  };

  // Extrai cores com base no ID do projeto (para consistência)
  const getAvatarColor = (id: string) => {
    const colors = {
      "1": "bg-blue-100 text-blue-800",
      "2": "bg-green-100 text-green-800",
      "3": "bg-purple-100 text-purple-800",
      "4": "bg-amber-100 text-amber-800",
      "5": "bg-teal-100 text-teal-800",
      default: "bg-gray-100 text-gray-800",
    };

    return colors[id as keyof typeof colors] || colors.default;
  };

  const getInitials = (name: string) => {
    const words = name.split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + (words[1] ? words[1][0] : "")).toUpperCase();
  };

  return (
    <div
      className={cn(
        sizeConfigs[size],
        "flex items-center justify-center rounded-md overflow-hidden",
        className
      )}
    >
      {project.logoUrl ? (
        <div className="w-full h-full relative">
          <Image
            src={project.logoUrl}
            alt={project.name}
            fill
            className="object-cover"
            sizes={`(max-width: 768px) ${sizeConfigs[size].split(" ")[0]}, ${
              sizeConfigs[size].split(" ")[0]
            }`}
          />
        </div>
      ) : (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center font-medium",
            getAvatarColor(project.id)
          )}
        >
          {showInitials && getInitials(project.name)}
        </div>
      )}
    </div>
  );
}
