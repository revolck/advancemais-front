"use client";

import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/custom/Icons";

interface ListEmptyStateProps {
  entityName: string;
  entityNamePlural: string;
  maxItems?: number;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateAction?: React.ReactNode;
  emptyStateFirstItemText?: string;
}

const EMPTY_STATE_ANIMATION = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
};

export function ListEmptyState({
  entityName,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateAction,
  emptyStateFirstItemText,
}: ListEmptyStateProps) {
  const title =
    emptyStateTitle || `Nenhum ${entityName.toLowerCase()} encontrado`;
  const description =
    emptyStateDescription ||
    emptyStateFirstItemText ||
    `Comece criando seu primeiro ${entityName.toLowerCase()}.`;

  return (
    <motion.div {...EMPTY_STATE_ANIMATION} className="py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Icon name="FileText" className="h-10 w-10 text-blue-900" />
        </div>
        <h3 className="text-2xl font-semibold text-foreground !mb-1">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed text-base max-w-xl mx-auto mb-6">
          {description}
        </p>
        {emptyStateAction}
      </div>
    </motion.div>
  );
}

export default ListEmptyState;
