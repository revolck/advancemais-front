import { Bold, Italic, Strikethrough, Undo, Redo } from "lucide-react";

export const TOOLBAR_BUTTONS = [
  { icon: Bold, action: "bold", tooltip: "Negrito" },
  { icon: Italic, action: "italic", tooltip: "Itálico" },
  { icon: Strikethrough, action: "strikethrough", tooltip: "Riscado" },
  { icon: Undo, action: "undo", tooltip: "Desfazer" },
  { icon: Redo, action: "redo", tooltip: "Refazer" },
] as const;

export type ToolbarAction = (typeof TOOLBAR_BUTTONS)[number]["action"];
