"use client";
import { useState, useCallback } from "react";
import type { DragDropConfig, ReorderParams } from "../types";

interface UseSliderDragDropOptions {
  onReorder: (reorderData: ReorderParams[]) => Promise<void>;
  enabled?: boolean;
}

interface UseSliderDragDropReturn {
  // Estado do drag & drop
  dragConfig: DragDropConfig;

  // Handlers de drag
  handleDragStart: (sliderId: string) => void;
  handleDragEnd: () => void;
  handleDragOver: (sliderId: string) => void;
  handleDragLeave: () => void;
  handleDrop: (targetId: string) => Promise<void>;

  // Utilitários
  isDragging: boolean;
  isDraggedItem: (sliderId: string) => boolean;
  isDragOverItem: (sliderId: string) => boolean;
  resetDragState: () => void;
}

export function useSliderDragDrop({
  onReorder,
  enabled = true,
}: UseSliderDragDropOptions): UseSliderDragDropReturn {
  const [dragConfig, setDragConfig] = useState<DragDropConfig>({
    draggedItemId: null,
    dragOverItemId: null,
    isDragging: false,
  });

  // Inicia drag
  const handleDragStart = useCallback(
    (sliderId: string) => {
      if (!enabled) return;

      setDragConfig({
        draggedItemId: sliderId,
        dragOverItemId: null,
        isDragging: true,
      });
    },
    [enabled]
  );

  // Finaliza drag
  const handleDragEnd = useCallback(() => {
    setDragConfig({
      draggedItemId: null,
      dragOverItemId: null,
      isDragging: false,
    });
  }, []);

  // Drag over item
  const handleDragOver = useCallback(
    (sliderId: string) => {
      if (!enabled || !dragConfig.isDragging) return;

      setDragConfig((prev) => ({
        ...prev,
        dragOverItemId: sliderId,
      }));
    },
    [enabled, dragConfig.isDragging]
  );

  // Drag leave
  const handleDragLeave = useCallback(() => {
    setDragConfig((prev) => ({
      ...prev,
      dragOverItemId: null,
    }));
  }, []);

  // Drop
  const handleDrop = useCallback(
    async (targetId: string) => {
      if (
        !enabled ||
        !dragConfig.draggedItemId ||
        dragConfig.draggedItemId === targetId
      ) {
        handleDragEnd();
        return;
      }

      try {
        // Aqui você implementaria a lógica de reordenação
        // Por exemplo, calculando as novas ordens e chamando onReorder

        // Esta é uma implementação simplificada
        // Em uma implementação real, você precisaria:
        // 1. Determinar as novas ordens baseadas na posição do drop
        // 2. Criar os dados de reordenação
        // 3. Chamar onReorder com os dados corretos

        const reorderData: ReorderParams[] = [
          // Implementar lógica de reordenação aqui
        ];

        await onReorder(reorderData);
      } catch (error) {
        console.error("Erro ao reordenar por drag & drop:", error);
      } finally {
        handleDragEnd();
      }
    },
    [enabled, dragConfig.draggedItemId, onReorder, handleDragEnd]
  );

  // Reset do estado de drag
  const resetDragState = useCallback(() => {
    setDragConfig({
      draggedItemId: null,
      dragOverItemId: null,
      isDragging: false,
    });
  }, []);

  // Utilitários
  const isDragging = dragConfig.isDragging;

  const isDraggedItem = useCallback(
    (sliderId: string) => {
      return dragConfig.draggedItemId === sliderId;
    },
    [dragConfig.draggedItemId]
  );

  const isDragOverItem = useCallback(
    (sliderId: string) => {
      return dragConfig.dragOverItemId === sliderId;
    },
    [dragConfig.dragOverItemId]
  );

  return {
    // Estado do drag & drop
    dragConfig,

    // Handlers de drag
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,

    // Utilitários
    isDragging,
    isDraggedItem,
    isDragOverItem,
    resetDragState,
  };
}
