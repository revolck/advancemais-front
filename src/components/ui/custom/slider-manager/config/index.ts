/**
 * Slider Manager Configuration
 * Path: src/components/ui/custom/slider-manager/config/index.ts
 */

import { SLIDER_CONSTANTS } from "../constants";
import type { SliderFormData } from "../types";

export const SLIDER_CONFIG = {
  // Animation configuration
  animations: {
    duration: SLIDER_CONSTANTS.ANIMATION_DURATION,
    successMessageDuration: SLIDER_CONSTANTS.SUCCESS_MESSAGE_DURATION,
    easing: "ease-in-out",
  },

  // Default form data
  defaultFormData: {
    title: "",
    image: "",
    url: "",
    status: SLIDER_CONSTANTS.DEFAULT_STATUS,
    position: SLIDER_CONSTANTS.DEFAULT_POSITION,
  } as SliderFormData,

  // UI configuration
  ui: {
    // Thumbnail dimensions for slider previews
    thumbnail: {
      width: 96, // 24 * 4 (w-24)
      height: 64, // 16 * 4 (h-16)
    },

    // Image preview dimensions
    preview: {
      maxHeight: 128, // max-h-32
    },

    // Toast position and behavior
    toast: {
      position: "top-right" as const,
      duration: 3000,
    },

    // Modal configuration
    modal: {
      closeOnEscKey: true,
      closeOnOutsideClick: false,
    },
  },

  // Performance optimizations
  performance: {
    // Debounce time for search/filter operations
    debounceTime: 300,

    // Virtual scrolling threshold
    virtualScrollThreshold: 50,
  },

  // Accessibility configuration
  a11y: {
    // ARIA labels
    labels: {
      sliderForm: "Formulário de slider",
      sliderList: "Lista de sliders",
      dragHandle: "Arrastar para reordenar",
      deleteButton: "Excluir slider",
      editButton: "Editar slider",
      toggleButton: "Alterar status do slider",
      imageUpload: "Upload de imagem",
      imagePreview: "Pré-visualização da imagem",
    },

    // Keyboard navigation
    keyboard: {
      enableKeyboardNavigation: true,
      escapeToClose: true,
      enterToSubmit: true,
    },
  },

  // Feature flags
  features: {
    enableDragReorder: false,
    enableBulkOperations: false, // Future feature
    enableAdvancedFiltering: false, // Future feature
  },
} as const;

// Type-safe configuration getter
export function getSliderConfig() {
  return SLIDER_CONFIG;
}

// Merge user config with default config
export function createSliderConfig(
  userConfig: Partial<typeof SLIDER_CONFIG> = {}
) {
  return {
    ...SLIDER_CONFIG,
    ...userConfig,
    // Deep merge for nested objects
    animations: { ...SLIDER_CONFIG.animations, ...userConfig.animations },
    ui: { ...SLIDER_CONFIG.ui, ...userConfig.ui },
    performance: { ...SLIDER_CONFIG.performance, ...userConfig.performance },
    a11y: { ...SLIDER_CONFIG.a11y, ...userConfig.a11y },
    features: { ...SLIDER_CONFIG.features, ...userConfig.features },
  };
}
