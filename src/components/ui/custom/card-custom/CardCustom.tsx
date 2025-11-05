"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export interface CardCustomProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  title: string;
  subtitle?: string;
  themeColor: string; // HSL triplet: "150 50% 25%"
  href?: string;
  selected?: boolean;
  tooltip?: React.ReactNode;
  tooltipSide?: "top" | "right" | "bottom" | "left";
}

type CardCustomStyle = React.CSSProperties & {
  "--theme-color"?: string;
};

export const CardCustom = React.forwardRef<HTMLDivElement, CardCustomProps>(
  (
    {
      className,
      imageUrl,
      title,
      subtitle,
      themeColor,
      href,
      selected,
      tooltip,
      tooltipSide = "top",
      ...props
    },
    ref
  ) => {
    const cardStyle: CardCustomStyle = {
      "--theme-color": themeColor,
    };

    const CardInner = (
      <div
        ref={ref}
        style={cardStyle}
        className={cn(
          "group relative w-full h-full rounded-2xl overflow-hidden cursor-pointer",
          className
        )}
        {...props}
      >
        {href ? (
          <a href={href} className="absolute inset-0" aria-hidden />
        ) : null}

        {/* Background */}
        <div
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out",
            "group-hover:scale-105"
          )}
          style={{ backgroundImage: `url(${imageUrl})` }}
        />

        {/* Themed overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, hsl(var(--theme-color)/0.55), hsl(var(--theme-color)/0.28) 35%, transparent 65%)",
          }}
        />

        {/* Selected pill */}
        {selected && (
          <div className="absolute top-3 right-3 z-[2] inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase text-white backdrop-blur border border-white/20">
            <Check className="h-3.5 w-3.5" /> Selecionado
          </div>
        )}

        {/* Content */}
        <div className="relative z-[1] flex h-full flex-col justify-end p-6 text-white">
          <div>
            <h3 className="!md:text-3xl leading-tight drop-shadow-sm !mb-0">
              {title}
            </h3>
            {subtitle && (
              <p className="!text-sm !md:text-base !text-white/85 !mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Focus/selection ring */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 rounded-2xl",
            selected ? "ring-1 ring-[hsl(var(--theme-color)/0.35)]" : "ring-0"
          )}
        />

      </div>
    );

    if (!tooltip) return CardInner;
    return (
      <Tooltip>
        <TooltipTrigger asChild>{CardInner}</TooltipTrigger>
        <TooltipContent
          side={tooltipSide}
          className="max-w-sm text-[13px] leading-snug"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }
);

CardCustom.displayName = "CardCustom";

export default CardCustom;
