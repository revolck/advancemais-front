"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { textareaVariants } from "../variants";
import type { SimpleTextareaProps } from "../types";

const SimpleTextarea = React.forwardRef<
  HTMLTextAreaElement,
  SimpleTextareaProps
>(
  (
    {
      className,
      label,
      showInfo = false,
      onInfoClick,
      maxLength,
      showCharCount = false,
      size,
      style,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState<string>(
      typeof props.value === "string" ? props.value : ""
    );

    const charCount = value.length;

    // Estilos para prevenir redimensionamento
    const textareaStyles: React.CSSProperties = {
      resize: "none",
      minWidth: "100%",
      maxWidth: "100%",
      width: "100%",
      overflowY: "auto",
      overflowX: "hidden",
      ...style,
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      // Bloqueia digitação se exceder maxLength
      if (maxLength && newValue.length > maxLength) {
        return; // Impede a atualização se exceder o limite
      }

      setValue(newValue);
      props.onChange?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Bloqueia teclas que adicionam caracteres se já atingiu o limite
      if (maxLength && value.length >= maxLength) {
        const allowedKeys = [
          "Backspace",
          "Delete",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
          "Tab",
          "Escape",
          "Enter",
        ];

        if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          return;
        }
      }

      props.onKeyDown?.(e);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      // Intercepta colar para respeitar maxLength
      if (maxLength) {
        const clipboardData = e.clipboardData?.getData("text/plain") || "";
        const currentValue = value || "";
        const availableChars = maxLength - currentValue.length;

        if (availableChars <= 0) {
          e.preventDefault();
          return;
        }

        const textToInsert = clipboardData.slice(0, availableChars);

        // Se o texto colado não excede o limite, deixa o comportamento padrão
        if (textToInsert.length === clipboardData.length) {
          return; // Comportamento padrão do textarea
        }

        // Se precisa truncar, intercepta e faz manualmente
        e.preventDefault();
        const newValue = currentValue + textToInsert;

        setValue(newValue);
        props.onChange?.({
          target: { value: newValue },
        } as React.ChangeEvent<HTMLTextAreaElement>);
      }
    };

    return (
      <div className="w-full space-y-2">
        {label && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
            </label>
            {showInfo && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                onClick={onInfoClick}
              >
                <Info className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        <div className="rounded-lg border border-input bg-background">
          <textarea
            className={cn(
              textareaVariants({ size }),
              // Classes CSS adicionais para garantir travamento
              "simple-textarea !resize-none !min-w-full !max-w-full !w-full",
              className
            )}
            ref={ref}
            value={value}
            maxLength={maxLength}
            style={textareaStyles}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            {...props}
          />

          {(showCharCount || maxLength) && (
            <div className="flex justify-end px-3 py-2 border-t border-input">
              <span
                className={cn(
                  "text-xs text-muted-foreground",
                  maxLength && charCount > maxLength && "text-destructive"
                )}
              >
                {charCount}
                {maxLength ? `/${maxLength}` : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

SimpleTextarea.displayName = "SimpleTextarea";

export { SimpleTextarea };
