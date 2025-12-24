"use client";

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { avatarCustomVariants, statusIndicatorVariants } from "./variants";
import { getInitials, getAvatarColor } from "./utils";
import { STATUS_COLORS } from "./types";
import type { AvatarCustomProps } from "./types";

const AvatarCustom = React.forwardRef<HTMLDivElement, AvatarCustomProps>(
  (
    {
      className,
      name,
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
    // Valores derivados
    const initials = getInitials(name);
    const avatarColor = fixedColor || getAvatarColor(name);
    const actualAlt = `Avatar de ${name}`;

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
          <AvatarFallback
            className={cn(
              "font-semibold border-0",
              avatarColor === "bg-[var(--primary-color)]"
                ? "text-white"
                : "text-[#314e93]",
              avatarColor,
              isLoading && "animate-pulse bg-gray-200 text-transparent"
            )}
          >
            {!isLoading && initials}
          </AvatarFallback>
        </Avatar>

        {showStatus && !isLoading && (
          <div
            className={cn(
              statusIndicatorVariants({ size }),
              STATUS_COLORS[status]
            )}
            aria-label={`Status: ${status}`}
          />
        )}

        {isLoading && (
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
