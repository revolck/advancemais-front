"use client";
import { useState, useCallback, useEffect } from "react";
import { toastCustom } from "../../toast";
import {
  getSliders,
  createSlider,
  updateSlider,
  deleteSlider,
  reorderSliders,
} from "../services";
import { SLIDER_SUCCESS_MESSAGES, SLIDER_CONFIG } from "../config";
import { sortSlidersByOrder, getNextAvailableOrder } from "../utils";
import type {
  SliderItem,
  SliderFormData,
  ListOperationStatus,
  ReorderParams,
} from "../types";

interface UseSliderListOptions {
  /** Máximo de sliders permitidos */
  maxSliders?: number;
  /** Callback quando lista é atualizada */
  onSlidersChange?: (sliders: SliderItem[]) => void;
  /** Callback quando ocorre erro */
  onError?: (error: string) => void;
  /** Se deve carregar dados automaticamente */
  autoLoad?: boolean;
}

interface UseSliderListReturn {
  // Estado
  sliders: SliderItem[];
  status: ListOperationStatus;
  error: string | null;

  // Ações CRUD
  loadSliders: () => Promise<void>;
  addSlider: (data: SliderFormData) => Promise<SliderItem>;
  editSlider: (id: string, data: SliderFormData) => Promise<SliderItem>;
  removeSlider: (id: string) => Promise<void>;

  // Ações de publicação
  publishSlider: (id: string) => Promise<void>;
  unpublishSlider: (id: string) => Promise<void>;
  togglePublishSlider: (id: string, published: boolean) => Promise<void>;

  // Ações de reordenação
  moveSliderUp: (id: string) => Promise<void>;
  moveSliderDown: (id: string) => Promise<void>;
  reorderSlidersList: (reorderData: ReorderParams[]) => Promise<void>;

  // Utilitários
  canAddMore: boolean;
  canRemove: boolean;
  getNextOrder: () => number;
  getSliderById: (id: string) => SliderItem | undefined;
  refreshSliders: () => Promise<void>;
}

export function useSliderList({
  maxSliders = SLIDER_CONFIG.MAX_SLIDERS,
  onSlidersChange,
  onError,
  autoLoad = true,
}: UseSliderListOptions = {}): UseSliderListReturn {
  const [sliders, setSliders] = useState<SliderItem[]>([]);
  const [status, setStatus] = useState<ListOperationStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Função auxiliar para lidar com erros
  const handleError = useCallback(
    (err: unknown, defaultMessage: string) => {
      const errorMessage = err instanceof Error ? err.message : defaultMessage;
      setError(errorMessage);
      onError?.(errorMessage);
      toastCustom.error({ description: errorMessage });
      return errorMessage;
    },
    [onError]
  );

  // Carrega sliders da API
  const loadSliders = useCallback(async () => {
    try {
      setStatus("loading");
      setError(null);

      const slidersData = await getSliders();
      const sortedSliders = sortSlidersByOrder(slidersData);

      setSliders(sortedSliders);
      onSlidersChange?.(sortedSliders);
      setStatus("idle");
    } catch (err) {
      handleError(err, "Erro ao carregar sliders");
      setStatus("idle");
    }
  }, [onSlidersChange, handleError]);

  // Adiciona novo slider
  const addSlider = useCallback(
    async (data: SliderFormData): Promise<SliderItem> => {
      if (sliders.length >= maxSliders) {
        throw new Error(`Máximo de ${maxSliders} sliders permitidos`);
      }

      try {
        setStatus("saving");
        const newSlider = await createSlider(data);

        setSliders((prev) => {
          const updated = sortSlidersByOrder([...prev, newSlider]);
          onSlidersChange?.(updated);
          return updated;
        });

        toastCustom.success({ description: SLIDER_SUCCESS_MESSAGES.CREATED });
        setStatus("idle");
        return newSlider;
      } catch (err) {
        setStatus("idle");
        handleError(err, "Erro ao criar slider");
        throw err;
      }
    },
    [sliders.length, maxSliders, onSlidersChange, handleError]
  );

  // Edita slider existente
  const editSlider = useCallback(
    async (id: string, data: SliderFormData): Promise<SliderItem> => {
      try {
        setStatus("saving");
        const updatedSlider = await updateSlider(id, data);

        setSliders((prev) => {
          const updated = sortSlidersByOrder(
            prev.map((s) => (s.id === id ? updatedSlider : s))
          );
          onSlidersChange?.(updated);
          return updated;
        });

        toastCustom.success({ description: SLIDER_SUCCESS_MESSAGES.UPDATED });
        setStatus("idle");
        return updatedSlider;
      } catch (err) {
        setStatus("idle");
        handleError(err, "Erro ao atualizar slider");
        throw err;
      }
    },
    [onSlidersChange, handleError]
  );

  // Remove slider
  const removeSlider = useCallback(
    async (id: string): Promise<void> => {
      if (sliders.length <= SLIDER_CONFIG.MIN_SLIDERS) {
        toastCustom.warning({
          description: `Deve haver pelo menos ${SLIDER_CONFIG.MIN_SLIDERS} slider na lista.`,
        });
        return;
      }

      try {
        setStatus("deleting");
        await deleteSlider(id);

        setSliders((prev) => {
          const updated = prev.filter((s) => s.id !== id);
          onSlidersChange?.(updated);
          return updated;
        });

        toastCustom.success({ description: SLIDER_SUCCESS_MESSAGES.DELETED });
        setStatus("idle");
      } catch (err) {
        setStatus("idle");
        handleError(err, "Erro ao remover slider");
        throw err;
      }
    },
    [sliders.length, onSlidersChange, handleError]
  );

  // Publica slider
  const publishSlider = useCallback(async (id: string): Promise<void> => {
    setSliders((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPublished: true } : s))
    );
    toastCustom.success({ description: SLIDER_SUCCESS_MESSAGES.PUBLISHED });
  }, []);

  // Despublica slider
  const unpublishSlider = useCallback(async (id: string): Promise<void> => {
    setSliders((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPublished: false } : s))
    );
    toastCustom.success({ description: SLIDER_SUCCESS_MESSAGES.UNPUBLISHED });
  }, []);

  // Toggle publicação
  const togglePublishSlider = useCallback(
    async (id: string, published: boolean): Promise<void> => {
      if (published) {
        await publishSlider(id);
      } else {
        await unpublishSlider(id);
      }
    },
    [publishSlider, unpublishSlider]
  );

  // Move slider para cima
  const moveSliderUp = useCallback(
    async (id: string): Promise<void> => {
      const currentIndex = sliders.findIndex((s) => s.id === id);
      if (currentIndex <= 0) return;

      const newSliders = [...sliders];
      const currentSlider = newSliders[currentIndex];
      const previousSlider = newSliders[currentIndex - 1];

      // Troca ordens
      const tempOrdem = currentSlider.ordem;
      currentSlider.ordem = previousSlider.ordem;
      previousSlider.ordem = tempOrdem;

      // Atualiza estado otimisticamente
      newSliders[currentIndex] = previousSlider;
      newSliders[currentIndex - 1] = currentSlider;
      setSliders(newSliders);

      try {
        setStatus("reordering");
        await reorderSliders([
          { id: currentSlider.id, ordem: currentSlider.ordem },
          { id: previousSlider.id, ordem: previousSlider.ordem },
        ]);
        setStatus("idle");
      } catch (err) {
        // Reverte mudança em caso de erro
        await loadSliders();
        handleError(err, "Erro ao reordenar sliders");
        setStatus("idle");
      }
    },
    [sliders, loadSliders, handleError]
  );

  // Move slider para baixo
  const moveSliderDown = useCallback(
    async (id: string): Promise<void> => {
      const currentIndex = sliders.findIndex((s) => s.id === id);
      if (currentIndex >= sliders.length - 1) return;

      const newSliders = [...sliders];
      const currentSlider = newSliders[currentIndex];
      const nextSlider = newSliders[currentIndex + 1];

      // Troca ordens
      const tempOrdem = currentSlider.ordem;
      currentSlider.ordem = nextSlider.ordem;
      nextSlider.ordem = tempOrdem;

      // Atualiza estado otimisticamente
      newSliders[currentIndex] = nextSlider;
      newSliders[currentIndex + 1] = currentSlider;
      setSliders(newSliders);

      try {
        setStatus("reordering");
        await reorderSliders([
          { id: currentSlider.id, ordem: currentSlider.ordem },
          { id: nextSlider.id, ordem: nextSlider.ordem },
        ]);
        setStatus("idle");
      } catch (err) {
        // Reverte mudança em caso de erro
        await loadSliders();
        handleError(err, "Erro ao reordenar sliders");
        setStatus("idle");
      }
    },
    [sliders, loadSliders, handleError]
  );

  // Reordena lista completa
  const reorderSlidersList = useCallback(
    async (reorderData: ReorderParams[]): Promise<void> => {
      try {
        setStatus("reordering");
        const reorderedSliders = await reorderSliders(reorderData);
        setSliders(reorderedSliders);
        onSlidersChange?.(reorderedSliders);
        toastCustom.success({ description: SLIDER_SUCCESS_MESSAGES.REORDERED });
        setStatus("idle");
      } catch (err) {
        await loadSliders(); // Recarrega em caso de erro
        handleError(err, "Erro ao reordenar sliders");
        setStatus("idle");
      }
    },
    [onSlidersChange, loadSliders, handleError]
  );

  // Calcula próxima ordem disponível
  const getNextOrder = useCallback(() => {
    return getNextAvailableOrder(sliders, maxSliders);
  }, [sliders, maxSliders]);

  // Busca slider por ID
  const getSliderById = useCallback(
    (id: string) => {
      return sliders.find((s) => s.id === id);
    },
    [sliders]
  );

  // Recarrega sliders
  const refreshSliders = useCallback(async () => {
    await loadSliders();
  }, [loadSliders]);

  // Auto-carregamento
  useEffect(() => {
    if (autoLoad) {
      loadSliders();
    }
  }, [autoLoad, loadSliders]);

  // Derivações de estado
  const canAddMore = sliders.length < maxSliders;
  const canRemove = sliders.length > SLIDER_CONFIG.MIN_SLIDERS;

  return {
    // Estado
    sliders,
    status,
    error,

    // Ações CRUD
    loadSliders,
    addSlider,
    editSlider,
    removeSlider,

    // Ações de publicação
    publishSlider,
    unpublishSlider,
    togglePublishSlider,

    // Ações de reordenação
    moveSliderUp,
    moveSliderDown,
    reorderSlidersList,

    // Utilitários
    canAddMore,
    canRemove,
    getNextOrder,
    getSliderById,
    refreshSliders,
  };
}
