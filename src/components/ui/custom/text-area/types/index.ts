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

export type RichTextareaProps = BaseTextareaProps;
export type SimpleTextareaProps = BaseTextareaProps;
