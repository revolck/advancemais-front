"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { textareaVariants } from "../variants";
import type { SimpleTextareaProps } from "../types";
import { Label } from "@/components/ui/label";

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
      error,
      ...props
    },
    ref
  ) => {
    const {
      value: controlledValue,
      defaultValue,
      onChange,
      onKeyDown,
      onPaste,
      ...restProps
    } = props as SimpleTextareaProps & {
      value?: string;
      defaultValue?: string;
    };

    const [value, setValue] = React.useState<string>(
      typeof controlledValue === "string"
        ? controlledValue
        : typeof defaultValue === "string"
        ? defaultValue
        : ""
    );

    // Mantém o estado sincronizado quando o componente é controlado externamente
    React.useEffect(() => {
      if (typeof controlledValue === "string" && controlledValue !== value) {
        setValue(controlledValue);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controlledValue]);

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
      onChange?.(e);
    };

    const handleKeyDownInternal = (
      e: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
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

      onKeyDown?.(e);
    };

    const handlePasteInternal = (
      e: React.ClipboardEvent<HTMLTextAreaElement>
    ) => {
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
        onChange?.({
          target: { value: newValue },
        } as React.ChangeEvent<HTMLTextAreaElement>);
      }
    };

    const isRequired = Boolean((props as any)?.required);

    return (
      <div className={cn("w-full space-y-2")}>
        {label && (
          <div className="flex items-center gap-2">
            <Label
              className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                // Quando o campo for required, aplica classe 'required' para estilizar via CSS externo
                isRequired ? "required" : undefined
              )}
            >
              {label}
            </Label>
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

        <div
          className={cn(
            "rounded-lg border bg-background",
            error ? "border-destructive" : "border-input"
          )}
        >
          <textarea
            className={cn(
              textareaVariants({ size }),
              // Classes CSS adicionais para garantir travamento
              "simple-textarea !resize-none !min-w-full !max-w-full !w-full",
              className
            )}
            ref={ref}
            {...restProps}
            value={value}
            maxLength={maxLength}
            style={textareaStyles}
            onChange={handleChange}
            onKeyDown={handleKeyDownInternal}
            onPaste={handlePasteInternal}
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
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    );
  }
);

SimpleTextarea.displayName = "SimpleTextarea";

export { SimpleTextarea };
