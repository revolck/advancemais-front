/**
 * Status de upload de arquivo
 */
export type UploadStatus = "idle" | "uploading" | "success" | "error";

/**
 * Status de operação da lista
 */
export type ListOperationStatus =
  | "idle"
  | "loading"
  | "saving"
  | "deleting"
  | "reordering";

/**
 * Configuração de drag & drop
 */
export interface DragDropConfig {
  draggedItemId: string | null;
  dragOverItemId: string | null;
  isDragging: boolean;
}

/**
 * Estado da lista de sliders
 */
export interface SliderListState {
  sliders: import("./api.types").SliderItem[];
  status: ListOperationStatus;
  error: string | null;
  selectedSlider: string | null;
}

/**
 * Estado do modal
 */
export interface SliderModalState {
  isOpen: boolean;
  mode: "create" | "edit";
  editingSlider: import("./api.types").SliderItem | null;
  uploadStatus: UploadStatus;
}
