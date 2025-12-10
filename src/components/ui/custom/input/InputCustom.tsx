"use client";

import React, { useState, useEffect, useRef, useCallback, useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/custom/Icons";
import { cn } from "@/lib/utils";
import { MaskService } from "@/services";
import type { InputCustomProps } from "@/types/components/input";

/**
 * Componente de input customizado com suporte para máscaras, validação,
 * estados visuais e muito mais.
 */
export const InputCustom = React.forwardRef<HTMLInputElement, InputCustomProps>(
  (
    {
      label,
      name,
      id,
      value = "",
      onChange,
      onFocus,
      onBlur,
      error,
      className,
      disabled = false,
      required = false,
      type = "text",
      placeholder = "",
      icon,
      rightIcon,
      mask,
      maskConfig,
      showPasswordToggle = false,
      size = "md",
      fullWidth = true,
      isFloatingLabel = false,
      helperText,
      maxLength,
      successMessage,
      onIconClick,
      onRightIconClick,
      forceError = false,
      showInlineError = true,
      ...props
    },
    ref
  ) => {
    // Refs e serviços
    const inputRef = useRef<HTMLInputElement>(null);
    const maskService = MaskService.getInstance();
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [innerValue, setInnerValue] = useState<string>(value as string);
    const [touched, setTouched] = useState(false);

    // Determina o tipo efetivo do input (para alternância de visibilidade da senha)
    const effectiveType =
      isPasswordVisible && type === "password" ? "text" : type;

    // ID gerado automaticamente se não for fornecido
    const reactAutoId = useId();
    const inputId =
      id || (name ? `input-custom-${name}` : `input-custom-${reactAutoId}`);

    // Atualiza o valor interno quando o prop value muda
    useEffect(() => {
      setInnerValue(value as string);
    }, [value]);

    // Handler para mudança de valor
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        // Se tivermos uma máscara, aplicamos o processamento
        let processedValue = newValue;
        if (mask) {
          processedValue = maskService.processInput(newValue, mask, maskConfig);
        }

        // Atualiza o valor interno
        setInnerValue(processedValue);

        // Propaga a mudança para o componente pai com um evento simulado
        if (onChange) {
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              name: name || "",
              value: processedValue,
            },
          } as React.ChangeEvent<HTMLInputElement>;

          onChange(syntheticEvent);
        }
      },
      [mask, maskConfig, name, onChange, maskService]
    );

    // Handler para foco no input
    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
      },
      [onFocus]
    );

    // Handler para perda de foco no input
    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        setTouched(true);

        if (onBlur) onBlur(e);
      },
      [onBlur]
    );

    // Alterna a visibilidade da senha
    const togglePasswordVisibility = useCallback(() => {
      setIsPasswordVisible((prev) => !prev);
    }, []);

    // Calcula as classes CSS com base nas propriedades e estado
    const containerClasses = cn(
      "group relative space-y-2",
      {
        "w-full": fullWidth,
        "min-w-[200px]": !fullWidth && size === "sm",
        "min-w-[250px]": !fullWidth && size === "md",
        "min-w-[300px]": !fullWidth && size === "lg",
      },
      className
    );

    // Aumentamos a altura do campo para todos os tamanhos
    const inputClasses = cn(
      "w-full text-foreground shadow-none focus-visible:border-ring/20 focus-visible:ring-ring/50 focus-visible:ring-[1px]",
      {
        "pr-10":
          icon || rightIcon || (type === "password" && showPasswordToggle),
        "h-10": size === "sm",
        "h-12": size === "md",
        "h-14": size === "lg",
        "border-destructive":
          (error && touched) || (error && forceError && !touched),
        "border-emerald-500": successMessage && !error,
        "focus:border-blue-400 focus:ring-1 focus:ring-blue-300":
          !error && !successMessage,
      }
    );

    // Aplica classe 'required' na label quando obrigatório (asterisco vem do CSS externo)

    // Determina o ícone a ser exibido (prioridade para o toggle de senha se for campo de senha)
    const displayIcon =
      type === "password" && showPasswordToggle
        ? isPasswordVisible
          ? "EyeOff"
          : "Eye"
        : icon || rightIcon;

    // Deve mostrar erro apenas quando o campo foi tocado e existe uma mensagem de erro
    const hasError = (touched || forceError) && !!error;
    const shouldShowError = hasError && showInlineError;

    return (
      <div className={containerClasses}>
        {/* Label posicionado acima do input */}
        {label && (
          <Label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium",
              {
                "text-destructive": hasError,
                "text-emerald-500": successMessage && !error,
              },
              required && "required"
            )}
          >
            {label}
          </Label>
        )}

        {/* Container do input */}
        <div className="relative">
          <Input
            ref={ref || inputRef}
            id={inputId}
            name={name}
            type={effectiveType}
            value={innerValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={inputClasses}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            aria-invalid={!!error}
            aria-describedby={shouldShowError ? `${inputId}-error` : undefined}
            style={{
              // Garantir que o texto tenha alta prioridade de cor
              caretColor: error
                ? "var(--destructive)"
                : "var(--blue-500, #3b82f6)",
            }}
            {...props}
          />

          {/* Ícone único do lado direito (pode ser o ícone do campo ou toggle de senha) */}
          {displayIcon && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground/70"
              onClick={
                type === "password" && showPasswordToggle
                  ? togglePasswordVisibility
                  : icon
                  ? onIconClick
                  : onRightIconClick
              }
            >
              <Icon
                name={displayIcon}
                size={size === "sm" ? 18 : size === "md" ? 20 : 22}
              />
            </div>
          )}
        </div>

        {/* Mensagem de erro ou texto de ajuda */}
        {shouldShowError && (
          <p id={`${inputId}-error`} className="text-xs! text-destructive!">
            {error}
          </p>
        )}

        {/* Mensagem de sucesso */}
        {!error && successMessage && (
          <p className="text-xs text-emerald-500">{successMessage}</p>
        )}

        {/* Texto de ajuda */}
        {!error && !successMessage && helperText && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

InputCustom.displayName = "InputCustom";

export default InputCustom;
