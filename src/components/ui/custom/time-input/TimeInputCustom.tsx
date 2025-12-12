"use client";

import React, { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

export interface TimeInputCustomProps {
  label?: string;
  name?: string;
  value?: string; // Formato: "HH:mm" (ex: "14:30")
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  fullWidth?: boolean;
}

/**
 * Componente de input de tempo customizado com máscara HH:MM
 * Design refinado e UX melhorada
 */
export const TimeInputCustom = React.forwardRef<
  HTMLInputElement,
  TimeInputCustomProps
>(
  (
    {
      label,
      name,
      value = "",
      onChange,
      error,
      className,
      disabled = false,
      required = false,
      placeholder = "--:--",
      helperText,
      fullWidth = true,
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setDisplayValue(value);
    }, [value]);

    const formatTime = (
      input: string,
      cursorPosition: number
    ): { formatted: string; newCursor: number } => {
      // Remove tudo que não é número
      const numbers = input.replace(/\D/g, "");

      if (numbers.length === 0) {
        return { formatted: "", newCursor: 0 };
      }

      let formatted = "";
      let newCursor = cursorPosition;

      if (numbers.length <= 2) {
        // Apenas horas (até 2 dígitos)
        formatted = numbers;
        newCursor = numbers.length;
      } else {
        // Horas e minutos
        const hours = numbers.substring(0, 2);
        const minutes = numbers.substring(2, 4);
        formatted = `${hours}:${minutes}`;

        // Ajustar cursor
        if (cursorPosition <= 2) {
          newCursor = cursorPosition;
        } else if (cursorPosition === 3) {
          newCursor = 3; // Na posição do ":"
        } else {
          newCursor = Math.min(cursorPosition, formatted.length);
        }
      }

      return { formatted, newCursor };
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const cursorPos = e.target.selectionStart || 0;

      // Permitir deletar tudo
      if (input === "") {
        setDisplayValue("");
        onChange?.("");
        return;
      }

      const { formatted } = formatTime(input, cursorPos);

      // Validar horas e minutos ANTES de aceitar
      const numbers = formatted.replace(/\D/g, "");

      // Validar horas (primeiros 2 dígitos)
      if (numbers.length >= 2) {
        const hours = parseInt(numbers.substring(0, 2), 10);
        if (hours > 23) {
          return; // Bloqueia horas > 23
        }
      }

      // Validar minutos (últimos 2 dígitos)
      if (numbers.length >= 3) {
        const minutes = parseInt(numbers.substring(2, 4), 10);
        if (minutes > 59) {
          return; // Bloqueia minutos > 59
        }
      }

      setDisplayValue(formatted);
      onChange?.(formatted);
    };

    const handleBlur = () => {
      setIsFocused(false);
      // Garantir formato completo ao perder foco
      if (displayValue && !displayValue.includes(":")) {
        // Se digitou apenas horas, adiciona :00
        if (displayValue.length <= 2) {
          const formatted = `${displayValue.padStart(2, "0")}:00`;
          setDisplayValue(formatted);
          onChange?.(formatted);
        }
      } else if (displayValue && displayValue.includes(":")) {
        // Garantir que horas e minutos tenham 2 dígitos
        const [hours, minutes] = displayValue.split(":");
        const formatted = `${hours.padStart(2, "0")}:${(
          minutes || "00"
        ).padStart(2, "0")}`;
        setDisplayValue(formatted);
        onChange?.(formatted);
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Permitir teclas de navegação e controle
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
      ];

      // Permitir Ctrl/Cmd + A, C, V, X
      if (e.ctrlKey || e.metaKey) {
        return;
      }

      // Se não é número e não é tecla permitida, bloquear
      if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
        e.preventDefault();
      }
    };

    const handleIconClick = () => {
      inputRef.current?.focus();
      inputRef.current?.showPicker?.();
    };

    const hasError = Boolean(error);

    return (
      <div className={cn("space-y-2", fullWidth && "w-full", className)}>
        {/* Label */}
        {label && (
          <Label
            className={cn(
              "text-sm font-medium text-gray-700",
              disabled && "opacity-50 cursor-not-allowed",
              hasError && "text-destructive"
            )}
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>
        )}

        {/* Input Container */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            name={name}
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={5}
            className={cn(
              "flex h-12 w-full rounded-lg border px-3 py-2 pr-10 text-sm",
              "placeholder:text-muted-foreground/70",
              "focus-visible:outline-none focus-visible:ring-[3px]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              hasError
                ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                : "border-input focus-visible:border-ring focus-visible:ring-ring/20",
              isFocused && !hasError && "border-ring",
              "tracking-wider"
            )}
            aria-invalid={hasError}
          />

          {/* Ícone de Relógio */}
          <div
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none",
              "text-muted-foreground/70",
              disabled && "opacity-50"
            )}
          >
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Mensagem de erro ou helper text */}
        {error && <p className="text-xs text-destructive">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

TimeInputCustom.displayName = "TimeInputCustom";

export default TimeInputCustom;
