"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/custom/Icons";
import { Loader2 } from "lucide-react";
import { buttonCustomVariants } from "./variants";
import type { ButtonCustomProps } from "./types";

/**
 * Componente ButtonCustom - Um botão avançado com suporte a variantes, ícones, estados de carregamento e animações
 */
const ButtonCustom = React.forwardRef<HTMLButtonElement, ButtonCustomProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      withAnimation = true,
      icon,
      iconPosition = "left",
      isLoading = false,
      loadingText,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    // Determina o componente a ser renderizado
    const Comp = asChild ? Slot : "button";

    // Conteúdo interno do botão
    const buttonContent = (
      <>
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && <Icon name={icon} />}
            {children}
            {icon && iconPosition === "right" && <Icon name={icon} />}
          </>
        )}
      </>
    );

    // Se withAnimation for true, aplica animação no próprio botão
    if (withAnimation) {
      const MotionComp = (motion as any).create
        ? (motion as any).create(Comp as any)
        : (motion as any)(Comp as any);
      return (
        <MotionComp
          data-slot="button-custom"
          className={cn(
            buttonCustomVariants({
              variant,
              size,
              fullWidth,
              withAnimation,
              className,
            })
          )}
          ref={ref}
          disabled={isLoading || props.disabled}
          whileTap={{ scale: 0.93 }}
          transition={{ duration: 0.1 }}
          {...props}
        >
          <span className="flex items-center justify-center gap-2 w-full">
            {buttonContent}
          </span>
        </MotionComp>
      );
    }

    // Versão sem animação
    const { disabled, ...rest } = props;
    return (
      <Comp
        data-slot="button-custom"
        className={cn(
          buttonCustomVariants({
            variant,
            size,
            fullWidth,
            withAnimation,
            className,
          })
        )}
        ref={ref}
        disabled={isLoading || disabled}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {buttonContent}
      </Comp>
    );
  }
);

ButtonCustom.displayName = "ButtonCustom";

export { ButtonCustom, buttonCustomVariants };
