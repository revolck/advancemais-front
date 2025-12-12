import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableModuleProps {
  id: string;
  children: (opts: {
    attributes: any;
    listeners: any;
    setNodeRef: any;
    style: React.CSSProperties;
  }) => React.ReactNode;
}

/**
 * Wrapper sortable para módulos usando dnd-kit
 */
export function SortableModule({ id, children }: SortableModuleProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return <>{children({ attributes, listeners, setNodeRef, style })}</>;
}

