"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/custom/Icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BuilderItemType } from "../types";

interface PaletteProps {
  onAddModule: () => void;
  onAddItem: (type: BuilderItemType) => void;
  onDragStart: (type: string) => void;
  onDragEnd: () => void;
}

/**
 * Paleta de componentes arrastáveis (Módulo, Aula, Atividade, Trabalho, Prova)
 */
export function Palette({
  onAddModule,
  onAddItem,
  onDragStart,
  onDragEnd,
}: PaletteProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-6 w-6 rounded-lg bg-[var(--primary-color)]/10 flex items-center justify-center">
          <Icon
            name="LayoutGrid"
            className="h-3.5 w-3.5 text-[var(--primary-color)]"
          />
        </div>
        <span className="text-sm font-semibold text-gray-800">Componentes</span>
      </div>

      {/* Instrução sutil */}
      <p className="text-[11px]! text-gray-500! mb-3! leading-relaxed!">
        Clique ou arraste para adicionar à estrutura
      </p>

      <div className="space-y-2">
        {/* Módulo - Card destacado */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              draggable
              onDragStart={() => onDragStart("palette-MODULO")}
              onDragEnd={onDragEnd}
              onClick={onAddModule}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl border p-3 transition-all duration-200",
                "border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 hover:border-indigo-400",
                "cursor-grab active:cursor-grabbing"
              )}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                <Icon name="Boxes" className="h-4.5 w-4.5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-0">
                <span className="text-sm! font-medium text-indigo-900 leading-tight!">
                  Módulo
                </span>
                <p className="text-[10px]! text-indigo-600/70 truncate leading-tight! mb-0!">
                  Agrupe aulas e atividades
                </p>
              </div>
              <Icon
                name="GripVertical"
                className="h-4 w-4 text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8} className="p-3 max-w-xs">
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs mb-0! font-medium text-white">
                  Módulo
                </span>
              </div>
              <p className="text-[11px]! text-white/70! mt-[-5px]!">
                Agrupa conteúdos relacionados (aulas, atividades e provas)
              </p>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Aula - Card com cor azul */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              draggable
              onClick={() => onAddItem("AULA")}
              onDragStart={(e) => {
                onDragStart("palette-AULA");
                e.dataTransfer.setData("text/plain", "AULA");
              }}
              onDragEnd={onDragEnd}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl border p-3 transition-all duration-200",
                "border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 hover:border-blue-300",
                "cursor-grab active:cursor-grabbing"
              )}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Icon
                  name="GraduationCap"
                  className="h-4.5 w-4.5 text-blue-600"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-0">
                <span className="text-sm! font-medium text-blue-900 leading-tight!">
                  Aula
                </span>
                <p className="text-[10px]! text-blue-600/70 truncate leading-tight! mb-0!">
                  Conteúdo de aprendizado
                </p>
              </div>
              <Icon
                name="GripVertical"
                className="h-4 w-4 text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8} className="p-3 max-w-xs">
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs mb-0! font-medium text-white">
                  Aulas
                </span>
              </div>
              <p className="text-[11px]! text-white/70! mt-[-5px]!">
                Conteúdo de aprendizado (vídeos, textos, materiais)
              </p>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Atividade - Card com cor âmbar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              draggable
              onClick={() => onAddItem("ATIVIDADE")}
              onDragStart={(e) => {
                onDragStart("palette-ATIVIDADE");
                e.dataTransfer.setData("text/plain", "ATIVIDADE");
              }}
              onDragEnd={onDragEnd}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl border p-3 transition-all duration-200",
                "border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 hover:border-amber-300",
                "cursor-grab active:cursor-grabbing"
              )}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 group-hover:bg-amber-200 transition-colors">
                <Icon name="Paperclip" className="h-4.5 w-4.5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-0">
                <span className="text-sm! font-medium text-amber-900 leading-tight!">
                  Atividade
                </span>
                <p className="text-[10px]! text-amber-600/70 truncate leading-tight! mb-0!">
                  Exercício prático
                </p>
              </div>
              <Icon
                name="GripVertical"
                className="h-4 w-4 text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8} className="p-3 max-w-xs">
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs mb-0! font-medium text-white">
                  Atividade
                </span>
              </div>
              <p className="text-[11px]! text-white/70! mt-[-5px]!">
                Exercício prático para reforçar o conteúdo da aula
              </p>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Trabalho - Card com cor roxa */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              draggable
              onClick={() => onAddItem("TRABALHO")}
              onDragStart={(e) => {
                onDragStart("palette-TRABALHO");
                e.dataTransfer.setData("text/plain", "TRABALHO");
              }}
              onDragEnd={onDragEnd}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl border p-3 transition-all duration-200",
                "border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 hover:border-purple-300",
                "cursor-grab active:cursor-grabbing"
              )}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                <Icon
                  name="Briefcase"
                  className="h-4.5 w-4.5 text-purple-600"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-0">
                <span className="text-sm! font-medium text-purple-900 leading-tight!">
                  Trabalho
                </span>
                <p className="text-[10px]! text-purple-600/70 truncate leading-tight! mb-0!">
                  Projeto avaliativo
                </p>
              </div>
              <Icon
                name="GripVertical"
                className="h-4 w-4 text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8} className="p-3 max-w-xs">
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs mb-0! font-medium text-white">
                  Trabalho
                </span>
              </div>
              <p className="text-[11px]! text-white/70! mt-[-5px]!">
                Projeto individual ou em grupo com nota
              </p>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Prova - Card com cor rosa */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              draggable
              onClick={() => onAddItem("PROVA")}
              onDragStart={(e) => {
                onDragStart("palette-PROVA");
                e.dataTransfer.setData("text/plain", "PROVA");
              }}
              onDragEnd={onDragEnd}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl border p-3 transition-all duration-200",
                "border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 hover:border-rose-300",
                "cursor-grab active:cursor-grabbing"
              )}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 group-hover:bg-rose-200 transition-colors">
                <Icon name="FileText" className="h-4.5 w-4.5 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-0">
                <span className="text-sm! font-medium text-rose-900 leading-tight!">
                  Prova
                </span>
                <p className="text-[10px]! text-rose-600/70! truncate! leading-tight! mb-0!">
                  Avaliação de conhecimento
                </p>
              </div>
              <Icon
                name="GripVertical"
                className="h-4 w-4 text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8} className="p-3 max-w-xs">
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs mb-0! font-medium text-white">
                  Prova
                </span>
              </div>
              <p className="text-[11px]! text-white/70! mt-[-5px]!">
                Avaliação para medir o nível de aprendizagem
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

