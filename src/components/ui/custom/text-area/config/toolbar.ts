import { Bold, Italic, Strikethrough } from "lucide-react";

// Configuração da toolbar sem undo/redo
export const TOOLBAR_BUTTONS = [
  { icon: Bold, action: "bold" as const, tooltip: "Negrito (Ctrl+B)" },
  { icon: Italic, action: "italic" as const, tooltip: "Itálico (Ctrl+I)" },
  {
    icon: Strikethrough,
    action: "strikethrough" as const,
    tooltip: "Riscado (Ctrl+U)",
  },
] as const;

export type ToolbarAction = (typeof TOOLBAR_BUTTONS)[number]["action"];
