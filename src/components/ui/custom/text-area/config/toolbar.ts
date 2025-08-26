import { Bold, Italic, Strikethrough } from "lucide-react";

// Configuração da toolbar com tags HTML correspondentes
export const TOOLBAR_BUTTONS = [
  {
    icon: Bold,
    action: "bold" as const,
    tooltip: "Negrito (Ctrl+B)",
    tag: "strong",
    shortcut: "b",
  },
  {
    icon: Italic,
    action: "italic" as const,
    tooltip: "Itálico (Ctrl+I)",
    tag: "em",
    shortcut: "i",
  },
  {
    icon: Strikethrough,
    action: "strikethrough" as const,
    tooltip: "Riscado (Ctrl+U)",
    tag: "del",
    shortcut: "u",
  },
] as const;

export type ToolbarAction = (typeof TOOLBAR_BUTTONS)[number]["action"];
