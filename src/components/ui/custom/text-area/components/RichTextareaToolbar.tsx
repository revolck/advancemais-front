"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bold,
  Italic,
  Strikethrough,
  RemoveFormatting,
  Link as LinkIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Configuração da toolbar
const TOOLBAR_BUTTONS = [
  {
    icon: Bold,
    action: "bold" as const,
    tooltip: "Negrito (Ctrl+B)",
    tag: "strong",
  },
  {
    icon: Italic,
    action: "italic" as const,
    tooltip: "Itálico (Ctrl+I)",
    tag: "em",
  },
  {
    icon: Strikethrough,
    action: "strikethrough" as const,
    tooltip: "Riscado (Ctrl+U)",
    tag: "del",
  },
] as const;

// Opções de formatação de texto (parágrafo e títulos)
const HEADING_OPTIONS = [
  { value: "p", label: "Parágrafo" },
  { value: "h1", label: "Título 1" },
  { value: "h2", label: "Título 2" },
  { value: "h3", label: "Título 3" },
  { value: "h4", label: "Título 4" },
  { value: "h5", label: "Título 5" },
  { value: "h6", label: "Título 6" },
] as const;

export type HeadingType = (typeof HEADING_OPTIONS)[number]["value"];
export type ToolbarAction =
  | (typeof TOOLBAR_BUTTONS)[number]["action"]
  | "clear"
  | "link";

export interface RichTextareaToolbarProps {
  activeHeading: HeadingType | null;
  activeFormats: Set<string>;
  activeLink: { url: string; element: HTMLAnchorElement } | null;
  onHeadingChange: (value: string) => void;
  onToolbarAction: (action: ToolbarAction) => void;
}

export function RichTextareaToolbar({
  activeHeading,
  activeFormats,
  activeLink,
  onHeadingChange,
  onToolbarAction,
}: RichTextareaToolbarProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 border-b border-input p-2 flex-shrink-0 bg-background z-10">
        {/* Select para headings */}
        <Select value={activeHeading || "p"} onValueChange={onHeadingChange}>
          <SelectTrigger className="h-8 w-[140px] text-xs bg-white">
            <SelectValue placeholder="Parágrafo" />
          </SelectTrigger>
          <SelectContent>
            {HEADING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="h-4 border-l border-input mx-1" />

        {TOOLBAR_BUTTONS.map((button) => (
          <Tooltip key={button.action}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                  activeFormats.has(button.action) &&
                    "bg-accent text-foreground"
                )}
                onClick={() => onToolbarAction(button.action)}
                type="button"
              >
                <button.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={8}
              className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 shadow-lg border border-gray-700"
              arrowClassName="bg-gray-900 fill-gray-900 border-gray-700"
            >
              {button.tooltip}
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Botão para adicionar link */}
        <div className="h-4 border-l border-input mx-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                activeLink && "bg-accent text-foreground"
              )}
              onClick={() => onToolbarAction("link")}
              type="button"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={8}
            className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 shadow-lg border border-gray-700"
            arrowClassName="bg-gray-900 fill-gray-900 border-gray-700"
          >
            Adicionar Link (Ctrl+K)
          </TooltipContent>
        </Tooltip>

        {/* Botão para limpar formatação */}
        <div className="h-4 border-l border-input mx-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => onToolbarAction("clear")}
              type="button"
            >
              <RemoveFormatting className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={8}
            className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 shadow-lg border border-gray-700"
            arrowClassName="bg-gray-900 fill-gray-900 border-gray-700"
          >
            Limpar Formatação (Ctrl+\)
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}



