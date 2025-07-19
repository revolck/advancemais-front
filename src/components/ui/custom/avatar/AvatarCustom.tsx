"use client";

import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { avatarCustomVariants, statusIndicatorVariants } from "./variants";
import { getInitials, getAvatarColor, isValidImageUrl } from "./utils";
import { STATUS_COLORS } from "./types";
import type { AvatarCustomProps } from "./types";

const AvatarCustom = React.forwardRef<HTMLDivElement, AvatarCustomProps>(
  (
    {
      className,
      name,
      src,
      alt,
      size = "md",
      fixedColor,
      showStatus = false,
      status = "offline",
      clickable = false,
      onClick,
      withBorder = false,
      isLoading = false,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(!!src);

    // Calcula valores derivados
    const initials = getInitials(name);
    const avatarColor = fixedColor || getAvatarColor(name);
    const shouldShowImage = isValidImageUrl(src) && !imageError;
    const actualAlt = alt || `Avatar de ${name}`;

    // Handlers
    const handleImageLoad = () => {
      setImageLoading(false);
    };

    const handleImageError = () => {
      setImageError(true);
      setImageLoading(false);
    };

    const handleClick = () => {
      if (clickable && onClick) {
        onClick();
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (clickable && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        onClick?.();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          avatarCustomVariants({
            size,
            clickable,
            withBorder,
            isLoading,
          }),
          className
        )}
        role={clickable ? "button" : "img"}
        tabIndex={clickable ? 0 : undefined}
        aria-label={actualAlt}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <Avatar className="size-full">
          {/* Imagem do avatar */}
          {shouldShowImage && (
            <AvatarImage
              src={src}
              alt={actualAlt}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={cn(
                "transition-opacity duration-300",
                imageLoading && "opacity-0"
              )}
            />
          )}

          {/* Fallback com iniciais e cor de fundo */}
          <AvatarFallback
            className={cn(
              "font-semibold text-white border-0",
              avatarColor,
              // Loading state
              (isLoading || imageLoading) &&
                "animate-pulse bg-gray-200 text-transparent"
            )}
          >
            {!isLoading && !imageLoading && initials}
          </AvatarFallback>
        </Avatar>

        {/* Indicador de status */}
        {showStatus && !isLoading && (
          <div
            className={cn(
              statusIndicatorVariants({ size }),
              STATUS_COLORS[status]
            )}
            aria-label={`Status: ${status}`}
          />
        )}

        {/* Overlay para estado de loading */}
        {(isLoading || imageLoading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full">
            <div className="w-1/3 h-1/3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }
);

AvatarCustom.displayName = "AvatarCustom";

export { AvatarCustom, avatarCustomVariants };
