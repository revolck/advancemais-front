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

    case "REORDER_SLIDER":
      return {
        ...state,
        sliders: state.sliders
          .map((slider) =>
            slider.id === action.payload.id
              ? { ...slider, position: action.payload.position }
              : slider
          )
          .sort((a, b) => a.position - b.position),
        error: null,
      };

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
          toastCustom.success(SLIDER_MESSAGES.SUCCESS_CREATE);
        } else {
          dispatch({ type: "ADD_SLIDER", payload: newSlider });
          toastCustom.success(SLIDER_MESSAGES.SUCCESS_CREATE);
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
    [generateId, getNextPosition, onCreateSlider]
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

        toastCustom.success(SLIDER_MESSAGES.SUCCESS_UPDATE);
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
    [onUpdateSlider]
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
        toastCustom.success(SLIDER_MESSAGES.SUCCESS_DELETE);
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
    [onDeleteSlider]
  );

  /**
   * Toggle slider status (active/inactive)
   */
  const toggleSliderStatus = useCallback(
    async (id: string) => {
      const slider = state.sliders.find((s) => s.id === id);
      if (!slider) return;

      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        if (onUpdateSlider) {
          await onUpdateSlider(id, { status: !slider.status });
        }

        dispatch({
          type: "UPDATE_SLIDER",
          payload: { id, updates: { status: !slider.status } },
        });
        toastCustom.success(SLIDER_MESSAGES.SUCCESS_STATUS_TOGGLE);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : SLIDER_MESSAGES.ERROR_GENERIC;
        toastCustom.error(errorMessage);
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        console.error("Error toggling slider status:", error);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [state.sliders, onUpdateSlider]
  );

  /**
   * Reorder slider position
   */
  const reorderSlider = useCallback(
    async (sliderId: string, newPosition: number) => {
      try {
        if (onReorderSliders) {
          await onReorderSliders(sliderId, newPosition);
        }
        dispatch({
          type: "REORDER_SLIDER",
          payload: { id: sliderId, position: newPosition },
        });
        toastCustom.success(SLIDER_MESSAGES.SUCCESS_REORDER);
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
    [onReorderSliders]
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
