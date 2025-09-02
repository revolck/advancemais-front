/**
 * Slider Manager Custom Hook
 * Path: src/components/ui/custom/slider-manager/hooks/use-slider-manager.ts
 */

import { useReducer, useCallback, useEffect, useRef } from "react";
import { toastCustom } from "@/components/ui/custom/toast";
import type {
  Slider,
  SliderManagerState,
  SliderAction,
  SliderView,
  SliderManagerProps,
} from "../types";
import { SLIDER_MESSAGES } from "../constants";

// Initial state
const initialState: SliderManagerState = {
  sliders: [],
  isLoading: false,
  error: null,
  currentView: "list",
  editingSlider: null,
};

// Reducer function
function sliderManagerReducer(
  state: SliderManagerState,
  action: SliderAction
): SliderManagerState {
  switch (action.type) {
    case "SET_SLIDERS":
      return {
        ...state,
        sliders: action.payload,
        error: null,
      };

    case "ADD_SLIDER":
      return {
        ...state,
        sliders: [...state.sliders, action.payload],
        error: null,
      };

    case "UPDATE_SLIDER":
      return {
        ...state,
        sliders: state.sliders.map((slider) =>
          slider.id === action.payload.id
            ? {
                ...slider,
                ...action.payload.updates,
                updatedAt: new Date().toISOString(),
              }
            : slider
        ),
        error: null,
      };

    case "DELETE_SLIDER":
      return {
        ...state,
        sliders: state.sliders.filter((slider) => slider.id !== action.payload),
        error: null,
      };

    case "REORDER_SLIDER": {
      // Reorder local array while keeping all positions consistent
      const sorted = [...state.sliders].sort(
        (a, b) => a.position - b.position
      );

      // Find index of the moved slider (can match either id or orderId)
      const fromIndex = sorted.findIndex(
        (slider) =>
          slider.id === action.payload.id ||
          (slider as any).orderId === action.payload.id
      );

      if (fromIndex === -1) {
        return state;
      }

      // Remove the slider from its current position
      const [moved] = sorted.splice(fromIndex, 1);
      // Insert slider into the new position (1-based -> 0-based index)
      sorted.splice(action.payload.position - 1, 0, moved);

      // Recalculate the position of every slider to avoid duplicates
      const recalculated = sorted.map((slider, index) => ({
        ...slider,
        position: index + 1,
      }));

      return {
        ...state,
        sliders: recalculated,
        error: null,
      };
    }

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case "SET_VIEW":
      return {
        ...state,
        currentView: action.payload,
      };

    case "SET_EDITING_SLIDER":
      return {
        ...state,
        editingSlider: action.payload,
        currentView: action.payload ? "form" : "list",
      };

    default:
      return state;
  }
}

/**
 * Custom hook for managing slider state and operations
 */
export function useSliderManager(props: SliderManagerProps = {}) {
  const {
    initialSliders = [],
    onCreateSlider,
    onUpdateSlider,
    onDeleteSlider,
    onReorderSliders,
    onRefreshSliders,
    entityName = "Slider",
    entityNamePlural = "Sliders",
    maxItems,
  } = props;

  const [state, dispatch] = useReducer(sliderManagerReducer, {
    ...initialState,
    sliders: initialSliders,
  });

  const mountedRef = useRef(true);

  // Initialize sliders
  useEffect(() => {
    if (initialSliders.length > 0) {
      dispatch({ type: "SET_SLIDERS", payload: initialSliders });
    }
  }, [initialSliders]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Generate unique ID for new sliders
   */
  const generateId = useCallback(() => {
    return `slider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Refresh sliders from API (if provided)
   */
  const refreshSliders = useCallback(async () => {
    if (!onRefreshSliders) return;
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    try {
      const fresh = await onRefreshSliders();
      if (!mountedRef.current) return;
      dispatch({ type: "SET_SLIDERS", payload: fresh });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : SLIDER_MESSAGES.ERROR_GENERIC;
      toastCustom.error(errorMessage);
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [onRefreshSliders]);

  /**
   * Get next position for new slider
   */
  const getNextPosition = useCallback(() => {
    return Math.max(...state.sliders.map((s) => s.position), 0) + 1;
  }, [state.sliders]);

  /**
   * Create a new slider
   */
  const createSlider = useCallback(
    async (sliderData: Omit<Slider, "id" | "createdAt">) => {
      if (typeof maxItems === "number" && state.sliders.length >= maxItems) {
        toastCustom.error(
          `Limite de ${maxItems} ${entityNamePlural.toLowerCase()} atingido.`
        );
        throw new Error("MAX_ITEMS_REACHED");
      }
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        const newSlider: Slider = {
          ...sliderData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          position: sliderData.position || getNextPosition(),
        };

        if (onCreateSlider) {
          const createdSlider = await onCreateSlider(sliderData);
          dispatch({ type: "ADD_SLIDER", payload: createdSlider });
          toastCustom.success(`${entityName} criado com sucesso!`);
        } else {
          dispatch({ type: "ADD_SLIDER", payload: newSlider });
          toastCustom.success(`${entityName} criado com sucesso!`);
        }

        dispatch({ type: "SET_VIEW", payload: "list" });
        dispatch({ type: "SET_EDITING_SLIDER", payload: null });

        return newSlider;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : SLIDER_MESSAGES.ERROR_GENERIC;
        toastCustom.error(errorMessage);
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [
      generateId,
      getNextPosition,
      onCreateSlider,
      maxItems,
      state.sliders.length,
      entityNamePlural,
      entityName,
    ]
  );

  /**
   * Update an existing slider
   */
  const updateSlider = useCallback(
    async (id: string, updates: Partial<Slider>) => {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        if (onUpdateSlider) {
          const updatedSlider = await onUpdateSlider(id, updates);
          dispatch({
            type: "UPDATE_SLIDER",
            payload: { id, updates: updatedSlider },
          });
        } else {
          dispatch({ type: "UPDATE_SLIDER", payload: { id, updates } });
        }

        toastCustom.success(`${entityName} atualizado com sucesso!`);
        dispatch({ type: "SET_VIEW", payload: "list" });
        dispatch({ type: "SET_EDITING_SLIDER", payload: null });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : SLIDER_MESSAGES.ERROR_GENERIC;
        toastCustom.error(errorMessage);
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [onUpdateSlider, entityName]
  );

  /**
   * Delete a slider
   */
  const deleteSlider = useCallback(
    async (id: string) => {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        if (onDeleteSlider) {
          await onDeleteSlider(id);
        }
        dispatch({ type: "DELETE_SLIDER", payload: id });
        toastCustom.success(`${entityName} excluído com sucesso!`);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : SLIDER_MESSAGES.ERROR_GENERIC;
        toastCustom.error(errorMessage);
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [onDeleteSlider, entityName]
  );

  /**
   * Toggle slider status (active/inactive)
   */
  const toggleSliderStatus = useCallback(
    async (id: string) => {
      const slider = state.sliders.find((s) => s.id === id);
      if (!slider) return;

      // Não usar loading global aqui para permitir busy por item
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        if (onUpdateSlider) {
          await onUpdateSlider(id, { status: !slider.status });
        }

        dispatch({
          type: "UPDATE_SLIDER",
          payload: { id, updates: { status: !slider.status } },
        });
        toastCustom.success(`Status do ${entityName.toLowerCase()} alterado com sucesso!`);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : SLIDER_MESSAGES.ERROR_GENERIC;
        toastCustom.error(errorMessage);
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        console.error("Error toggling slider status:", error);
      } finally {
        // Nada a fazer: loading por item controlado no componente da lista
      }
    },
    [state.sliders, onUpdateSlider, entityName]
  );

  /**
   * Reorder slider position
   */
  const reorderSlider = useCallback(
    async (idOrOrderId: string, newPosition: number) => {
      try {
        if (onReorderSliders) {
          await onReorderSliders(idOrOrderId, newPosition);
        }
        dispatch({
          type: "REORDER_SLIDER",
          payload: { id: idOrOrderId, position: newPosition },
        });
        toastCustom.success(`Ordem dos ${entityNamePlural.toLowerCase()} atualizada!`);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : SLIDER_MESSAGES.ERROR_GENERIC;
        toastCustom.error(errorMessage);
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        throw error;
      }
    },
    [onReorderSliders, entityNamePlural]
  );

  /**
   * Set current view
   */
  const setView = useCallback((view: SliderView) => {
    dispatch({ type: "SET_VIEW", payload: view });
  }, []);

  /**
   * Start editing a slider
   */
  const editSlider = useCallback((slider: Slider) => {
    dispatch({ type: "SET_EDITING_SLIDER", payload: slider });
  }, []);

  /**
   * Cancel editing
   */
  const cancelEdit = useCallback(() => {
    dispatch({ type: "SET_EDITING_SLIDER", payload: null });
    dispatch({ type: "SET_VIEW", payload: "list" });
  }, []);

  /**
   * Clear errors
   */
  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", payload: null });
  }, []);

  /**
   * Get slider by ID
   */
  const getSliderById = useCallback(
    (id: string) => {
      return state.sliders.find((slider) => slider.id === id) || null;
    },
    [state.sliders]
  );

  /**
   * Get active sliders only
   */
  const getActiveSliders = useCallback(() => {
    return state.sliders.filter((slider) => slider.status);
  }, [state.sliders]);

  /**
   * Get sliders sorted by position
   */
  const getSortedSliders = useCallback(() => {
    return [...state.sliders].sort((a, b) => a.position - b.position);
  }, [state.sliders]);

  return {
    // State
    sliders: state.sliders,
    isLoading: state.isLoading,
    error: state.error,
    currentView: state.currentView,
    editingSlider: state.editingSlider,

    // Actions
    createSlider,
    updateSlider,
    deleteSlider,
    toggleSliderStatus,
    reorderSlider,
    editSlider,
    cancelEdit,
    setView,
    clearError,
    refreshSliders,

    // Getters
    getSliderById,
    getActiveSliders,
    getSortedSliders,

    // Statistics
    activeSliders: state.sliders.filter((s) => s.status).length,
    inactiveSliders: state.sliders.filter((s) => !s.status).length,
  };
}
