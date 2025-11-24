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
  error?: string;
}

export interface RichTextareaProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      | "onChange"
      | "value"
      | "defaultValue"
      | "onKeyDown"
      | "onPaste"
      | "onFocus"
      | "onBlur"
    >,
    VariantProps<typeof textareaVariants> {
  label?: string;
  showInfo?: boolean;
  onInfoClick?: () => void;
  maxLength?: number;
  showCharCount?: boolean;
  error?: string;
  // Propriedades essenciais para compatibilidade com forms
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean; // 🔧 CORRIGE o erro de build
  name?: string;
  id?: string;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  // Event handlers compatíveis com textarea
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onHtmlChange?: (html: string) => void; // Callback opcional para capturar HTML formatado
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onPaste?: (event: React.ClipboardEvent<HTMLDivElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
}

export type SimpleTextareaProps = BaseTextareaProps;
