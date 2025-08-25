"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ButtonCustom, Icon } from "@/components/ui/custom";
import { emptyStateVariants, addButtonVariants } from "../styles";
import type { SliderEmptyStateProps } from "../types";

export const SliderEmptyState: React.FC<SliderEmptyStateProps> = ({
  onAddSlider,
  maxSliders,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(emptyStateVariants(), className)}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4"
      >
        <Icon name="Image" className="w-8 h-8 text-muted-foreground" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg font-semibold text-foreground mb-2"
      >
        Nenhum slider encontrado
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mb-6 max-w-sm"
      >
        Adicione o primeiro slider para começar a configurar o carrossel do
        site. Você pode adicionar até {maxSliders} sliders.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <ButtonCustom
          onClick={onAddSlider}
          icon="Plus"
          className={cn(addButtonVariants({ size: "lg" }))}
        >
          Adicionar Primeiro Slider
        </ButtonCustom>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 w-2 h-2 bg-primary/20 rounded-full" />
        <div className="absolute bottom-4 right-4 w-3 h-3 bg-secondary/20 rounded-full" />
        <div className="absolute top-1/3 right-6 w-1 h-1 bg-accent/30 rounded-full" />
      </div>
    </motion.div>
  );
};
