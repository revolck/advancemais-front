// Componente principal
export { SliderList } from "./SliderList";
export { SliderList as default } from "./SliderList";

// Sub-componentes (para uso avançado)
export {
  SliderListItem,
  SliderModal,
  SliderEmptyState,
  SliderLoadingState,
  SliderDeleteConfirmation,
} from "./components";

// Hooks personalizados
export {
  useSliderList,
  useSliderModal,
  useSliderForm,
  useSliderDragDrop,
} from "./hooks";

// Serviços
export {
  getSliders,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider,
  reorderSliders,
  validateSliderForm,
  validateImageUrl,
  validateImageFile,
  validateLink,
  validateOrder,
} from "./services";

// Utilitários
export {
  formatFileSize,
  formatDate,
  formatRelativeDate,
  truncateText,
  createFilePreview,
  revokeFilePreview,
  extractFilenameFromUrl,
  generateSliderTitle,
  isImageUrl,
  sortSlidersByOrder,
  getNextAvailableOrder,
  reorderArray,
} from "./utils";

// Estilos e variantes
export {
  sliderListVariants,
  sliderListHeaderVariants,
  sliderListItemVariants,
  orderIndicatorVariants,
  thumbnailVariants,
  sliderInfoVariants,
  metadataVariants,
  actionsContainerVariants,
  actionButtonVariants,
  emptyStateVariants,
  addButtonVariants,
  statusIndicatorVariants,
  loadingStateVariants,
} from "./styles";

// Configurações
export {
  SLIDER_CONFIG,
  SLIDER_UI_CONFIG,
  DRAG_CONFIG,
  SLIDER_ERROR_MESSAGES,
  SLIDER_SUCCESS_MESSAGES,
  VALIDATION_RULES,
  ANIMATION_CONFIG,
  THEME_CONFIG,
} from "./config";

// Tipos TypeScript
export type {
  // API Types
  SliderBackendResponse,
  SliderItem,
  SliderFormData,
  SliderApiResponse,
  ReorderParams,

  // Component Types
  SliderListProps,
  SliderListItemProps,
  SliderModalProps,
  SliderDeleteConfirmationProps,
  SliderEmptyStateProps,
  SliderLoadingStateProps,

  // Form Types
  SliderFormState,
  SliderFormErrors,
  SliderFormAction,
  FileValidationConfig,
  ValidationResult,

  // State Types
  UploadStatus,
  ListOperationStatus,
  DragDropConfig,
  SliderListState,
  SliderModalState,
} from "./types";

export type { AcceptedFileType, AcceptedExtension } from "./config";
