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
    const Comp = asChild ? Slot : ("button" as const);

    // Função para montar o conteúdo interno do botão,
    // permitindo injetar filhos customizados quando "asChild" for usado
    const renderInner = (innerChildren: React.ReactNode) => (
      <>
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {loadingText || innerChildren}
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && <Icon name={icon} />}
            {innerChildren}
            {icon && iconPosition === "right" && <Icon name={icon} />}
          </>
        )}
      </>
    );

    // Para usos como Trigger/Slot (Radix asChild), evitar recriar Motion component
    // pois isso pode causar loops de atualização (ex.: Dropdown/Menu/Popover triggers).
    const shouldAnimate = withAnimation && !asChild;

    // Se withAnimation for true (e não asChild), aplica animação no próprio botão
    if (shouldAnimate) {
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
            {renderInner(children as React.ReactNode)}
          </span>
        </MotionComp>
      );
    }

    // Versão sem animação
    const { disabled, ...rest } = props;

    // Quando "asChild" é true, precisamos garantir que o Slot receba
    // exatamente um elemento React válido (não um Fragment). Além disso,
    // injetamos o conteúdo (ícones/loader + filhos) dentro do elemento filho.
    if (asChild && React.isValidElement(children)) {
      const childElement = children as React.ReactElement;
      const inner = (childElement.props as any)?.children as React.ReactNode;
      const composedChildren = renderInner(inner);
      const clonedChild = React.cloneElement(childElement, undefined, composedChildren);

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
          // Evitar passar "disabled" diretamente para elementos não-button
          {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {clonedChild}
        </Comp>
      );
    }

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
        <span className="flex items-center justify-center gap-2 w-full">
          {renderInner(children as React.ReactNode)}
        </span>
      </Comp>
    );
  }
);

ButtonCustom.displayName = "ButtonCustom";

export { ButtonCustom, buttonCustomVariants };
