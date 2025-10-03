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
    const fallbackSize = size ?? "md";
    const resolvedVariantSize = fallbackSize as EmptyStateSize;
    const resolvedImageSize = (imageSize ??
      resolvedVariantSize) as EmptyStateSize;
    const illustrationSrc = illustration
      ? emptyStateIllustrations[illustration]
      : undefined;

    const maxWidthClass =
      contentWidthMap[maxContentWidth] ?? contentWidthMap.md;

    return (
      <section
        ref={ref}
        className={cn(
          emptyStateVariants({ align, size, fullHeight }),
          className
        )}
        aria-live="polite"
        {...props}
      >
        {illustrationSrc && (
          <div
            className={cn(
              "relative flex items-center justify-center overflow-hidden",
              illustrationWrapperPadding[resolvedImageSize],
              align === "start" ? "self-start" : "self-center"
            )}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
            />
            <Image
              src={illustrationSrc}
              alt={illustrationAlt ?? DEFAULT_ILLUSTRATION_ALT}
              width={illustrationSizeMap[resolvedImageSize]}
              height={illustrationSizeMap[resolvedImageSize]}
              className="relative h-auto w-50 max-w-[220px] object-contain"
              sizes="(min-width: 1024px) 220px, (min-width: 640px) 180px, 160px"
              priority={false}
            />
          </div>
        )}

        <div
          className={cn(
            "flex w-full flex-col gap-2 text-gray-600",
            align === "start"
              ? "items-start text-left"
              : "items-center text-center",
            maxWidthClass
          )}
        >
          {eyebrow && (
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-gray-400">
              {eyebrow}
            </span>
          )}

          <TitleTag className="text-2xl font-semibold leading-tight text-[var(--primary-color)] !mb-0">
            {title}
          </TitleTag>

          {description && (
            <DescriptionTag className="!leading-tight">
              {description}
            </DescriptionTag>
          )}
        </div>

        {(actions || children) && (
          <div
            className={cn(
              "flex w-full flex-wrap items-center gap-3 pt-1",
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
