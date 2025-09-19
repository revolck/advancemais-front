import Image from "next/image";
import React from "react";

import { cn } from "@/lib/utils";

import { emptyStateIllustrations } from "./illustrations";
import type { EmptyStateProps, EmptyStateSize } from "./types";
import { emptyStateVariants } from "./variants";

const illustrationSizeMap: Record<EmptyStateSize, number> = {
  sm: 120,
  md: 168,
  lg: 216,
};

const illustrationWrapperPadding: Record<EmptyStateSize, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const contentWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  full: "max-w-none w-full",
} as const;

const DEFAULT_ILLUSTRATION_ALT = "Ilustração representando ausência de dados";

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      align = "center",
      size = "md",
      tone = "neutral",
      fullHeight = false,
      title,
      eyebrow,
      titleAs: TitleTag = "h3",
      description,
      descriptionAs: DescriptionTag = "p",
      illustration,
      illustrationAlt,
      imageSize,
      maxContentWidth = "md",
      actions,
      children,
      ...props
    },
    ref
  ) => {
    const resolvedImageSize: EmptyStateSize = imageSize ?? size;
    const illustrationSrc = illustration
      ? emptyStateIllustrations[illustration]
      : undefined;

    const maxWidthClass = contentWidthMap[maxContentWidth] ?? contentWidthMap.md;

    return (
      <section
        ref={ref}
        className={cn(
          emptyStateVariants({ align, size, tone, fullHeight }),
          className
        )}
        aria-live="polite"
        {...props}
      >
        {illustrationSrc && (
          <div
            className={cn(
              "relative flex items-center justify-center self-center rounded-3xl bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-sm ring-1 ring-black/5 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-900 dark:ring-white/10",
              illustrationWrapperPadding[resolvedImageSize],
              align === "start" ? "self-start" : ""
            )}
          >
            <Image
              src={illustrationSrc}
              alt={illustrationAlt ?? DEFAULT_ILLUSTRATION_ALT}
              width={illustrationSizeMap[resolvedImageSize]}
              height={illustrationSizeMap[resolvedImageSize]}
              className="h-auto w-full max-w-[220px] object-contain"
              sizes="(min-width: 1024px) 220px, (min-width: 640px) 180px, 160px"
              priority={false}
            />
          </div>
        )}

        <div
          className={cn(
            "flex w-full flex-col gap-3 text-gray-600 dark:text-zinc-400",
            align === "start" ? "items-start text-left" : "items-center text-center",
            maxWidthClass
          )}
        >
          {eyebrow && (
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400 dark:text-zinc-500">
              {eyebrow}
            </span>
          )}

          <TitleTag className="text-2xl font-semibold leading-tight text-gray-900 dark:text-white">
            {title}
          </TitleTag>

          {description && (
            <DescriptionTag className="text-base leading-relaxed text-gray-600 dark:text-zinc-400">
              {description}
            </DescriptionTag>
          )}
        </div>

        {(actions || children) && (
          <div
            className={cn(
              "flex w-full flex-wrap items-center gap-3",
              align === "start" ? "justify-start" : "justify-center",
              maxWidthClass
            )}
          >
            {actions}
            {children}
          </div>
        )}
      </section>
    );
  }
);

EmptyState.displayName = "EmptyState";

export { EmptyState };
