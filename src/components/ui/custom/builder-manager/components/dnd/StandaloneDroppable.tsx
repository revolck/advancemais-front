import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface StandaloneDroppableProps {
  id: string;
  children: (opts: { setNodeRef: any; isOver: boolean }) => React.ReactNode;
}

/**
 * Zona droppable para itens avulsos (fora de módulos)
 */
export function StandaloneDroppable({ id, children }: StandaloneDroppableProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return <>{children({ setNodeRef, isOver })}</>;
}

