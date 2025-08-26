import type * as React from "react";
import type { VariantProps } from "class-variance-authority";
import { textareaVariants } from "../variants";

export interface BaseTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  showInfo?: boolean;
  onInfoClick?: () => void;
  maxLength?: number;
  showCharCount?: boolean;
}
export interface RichTextareaProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      "onChange" | "value" | "defaultValue"
    >,
    VariantProps<typeof textareaVariants> {
  label?: string;
  showInfo?: boolean;
  onInfoClick?: () => void;
  maxLength?: number;
  showCharCount?: boolean;
  // Mantém compatibilidade com textarea props
  value?: string;
  defaultValue?: string;
  placeholder?: string; // 🔧 ADICIONADO
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onPaste?: (event: React.ClipboardEvent<HTMLDivElement>) => void;
}

export type SimpleTextareaProps = BaseTextareaProps;
