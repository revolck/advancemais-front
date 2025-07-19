"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/custom/Icons";
import { imageNotFoundVariants } from "./variants";
import type { ImageNotFoundProps, ICON_SIZES } from "./types";

/**
 * Mapeamento de tamanhos de ícone baseado na variante
 */
const getIconSize = (
  size: keyof typeof ICON_SIZES,
  customSize?: number
): number => {
  if (customSize) return customSize;

  const sizeMap = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
    "2xl": 64,
  };

  return sizeMap[size] || 24;
};

/**
 * Componente ImageNotFound
 * Exibe um placeholder estilizado quando uma imagem não pode ser carregada ou não existe
 *
 * @example
 * ```tsx
 * // Uso básico
 * <ImageNotFound />
 *
 * // Com mensagem customizada
 * <ImageNotFound
 *   message="Adicione uma foto de perfil"
 *   variant="accent"
 *   size="lg"
 * />
 *
 * // Clicável com animação
 * <ImageNotFound
 *   clickable
 *   withAnimation
 *   onClick={() => openFileDialog()}
 *   message="Clique para adicionar imagem"
 * />
 * ```
 */
const ImageNotFound = React.forwardRef<HTMLDivElement, ImageNotFoundProps>(
  (
    {
      className,
      size = "md",
      variant = "default",
      aspectRatio,
      alt = "Imagem não encontrada",
      message = "Imagem não encontrada",
      showMessage = true,
      icon = "Image",
      iconSize,
      withAnimation = false,
      clickable = false,
      onClick,
      ...props
    },
    ref
  ) => {
    // Calcula o tamanho do ícone baseado na prop size
    const calculatedIconSize = getIconSize(
      size as keyof typeof ICON_SIZES,
      iconSize
    );

    // Define se o componente deve ser tratado como clicável
    const isClickable = clickable || !!onClick;

    // Handler para clique
    const handleClick = () => {
      if (isClickable && onClick) {
        onClick();
      }
    };

    // Handler para teclas (acessibilidade)
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (isClickable && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        onClick?.();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          imageNotFoundVariants({
            size,
            variant,
            aspectRatio,
            clickable: isClickable,
            withAnimation,
          }),
          className
        )}
        role={isClickable ? "button" : "img"}
        tabIndex={isClickable ? 0 : undefined}
        aria-label={alt}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* Ícone principal */}
        <div className="flex items-center justify-center mb-2">
          <Icon
            name={icon as any}
            size={calculatedIconSize}
            className="opacity-60"
            aria-hidden="true"
          />
        </div>

        {/* Mensagem de texto */}
        {showMessage && message && (
          <span
            className={cn(
              "text-center font-medium leading-tight",
              // Tamanhos de texto baseados no tamanho do componente - CORRIGIDO
              {
                "text-xs px-2": size === "xs" || size === "sm",
                "text-sm px-3": size === "md" || size === "full",
                "text-base px-4": size === "lg",
                "text-lg px-4": size === "xl" || size === "2xl",
              }
            )}
          >
            {message}
          </span>
        )}

        {/* Indicador visual para componentes clicáveis */}
        {isClickable && (
          <div className="mt-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Icon
              name="Plus"
              size={16}
              className="opacity-50"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    );
  }
);

ImageNotFound.displayName = "ImageNotFound";

export { ImageNotFound, imageNotFoundVariants };
