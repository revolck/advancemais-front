"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/custom";
import {
  sliderListItemVariants,
  loadingStateVariants,
  orderIndicatorVariants,
  thumbnailVariants,
} from "../styles";
import type { SliderLoadingStateProps } from "../types";

const LoadingItem: React.FC<{ index: number }> = ({ index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn(sliderListItemVariants({ state: "loading" }))}
    >
      {/* Indicador de ordem loading */}
      <div className={cn(orderIndicatorVariants(), "animate-pulse bg-muted")}>
        <div className="w-4 h-4 bg-muted-foreground/20 rounded" />
      </div>

      {/* Thumbnail loading */}
      <div className={cn(thumbnailVariants({ state: "loading" }))}>
        <div className="w-full h-full bg-muted-foreground/10 rounded" />
      </div>

      {/* Content loading */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(loadingStateVariants({ variant: "title" }), "flex-1")}
          />
          <div className="w-16 h-6 bg-muted rounded-full" />
        </div>

        <div className="flex items-center gap-4">
          <div
            className={cn(loadingStateVariants({ variant: "text" }), "w-24")}
          />
          <div
            className={cn(loadingStateVariants({ variant: "text" }), "w-28")}
          />
          <div
            className={cn(loadingStateVariants({ variant: "text" }), "w-16")}
          />
        </div>
      </div>

      {/* Actions loading */}
      <div className="flex items-center gap-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              loadingStateVariants({ variant: "button" }),
              "w-8 h-8 rounded-md"
            )}
          />
        ))}
      </div>
    </motion.div>
  );
};

export const SliderLoadingState: React.FC<SliderLoadingStateProps> = ({
  itemCount = 3,
  className,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header loading */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between pb-4 border-b border-border/50"
      >
        <div className="space-y-2">
          <div
            className={cn(loadingStateVariants({ variant: "title" }), "w-48")}
          />
          <div
            className={cn(loadingStateVariants({ variant: "text" }), "w-32")}
          />
        </div>
        <div
          className={cn(loadingStateVariants({ variant: "button" }), "w-32")}
        />
      </motion.div>

      {/* Items loading */}
      <div className="space-y-3">
        {[...Array(itemCount)].map((_, index) => (
          <LoadingItem key={index} index={index} />
        ))}
      </div>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center py-4"
      >
        <Icon
          name="Loader2"
          className="w-5 h-5 animate-spin text-muted-foreground"
        />
        <span className="ml-2 text-sm text-muted-foreground">
          Carregando sliders...
        </span>
      </motion.div>
    </div>
  );
};
