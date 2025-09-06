/**
 * Slider Manager Types
 * Path: src/components/ui/custom/slider-manager/types/index.ts
 */

export interface Slider {
  id: string;
  /** ID da ordem no backend (WebsiteSliderOrdem) */
  orderId?: string;
  title: string;
  image: string;
  url: string;
  content: string;
  status: boolean;
  position: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SliderFormData {
  title: string;
  image: string;
  url: string;
  /** Free text field mapped to Slider.content */
  content: string;
  status: boolean;
  position: number;
}

export interface SliderFormProps {
  slider?: Slider | null;
  onSubmit: (slider: Omit<Slider, "id" | "createdAt">) => void;
  onCancel: () => void;
  isLoading?: boolean;
  showHeader?: boolean;
  uploadPath?: string;
  entityName?: string;
  firstFieldLabel?: string;
  secondFieldLabel?: string;
  validateSecondFieldAsUrl?: boolean;
  secondFieldRequired?: boolean;
  /** Show and label the optional content field */
  showContentField?: boolean;
  contentFieldLabel?: string;
  /** Render the title field as a textarea (e.g., for depoimentos) */
  titleAsTextarea?: boolean;
  /** Custom ordering of fields; keys: 'url' | 'content' | 'title' */
  fieldsOrder?: Array<"url" | "content" | "title">;
  /** Mark content field as required when visible */
  contentFieldRequired?: boolean;
  /** Override image field label */
  imageFieldLabel?: string;
}

export interface SliderListProps {
  sliders: Slider[];
  onEdit: (slider: Slider) => void;
  onDelete: (slider: Slider) => Promise<void>;
  onToggleStatus: (id: string) => Promise<void>;
  onReorder: (draggedId: string, targetPosition: number) => void;
  isLoading?: boolean;
  onCreateNew?: () => void;
  entityName?: string;
  entityNamePlural?: string;
}

export interface SliderManagerProps {
  initialSliders?: Slider[];
  onCreateSlider?: (
    slider: Omit<Slider, "id" | "createdAt">
  ) => Promise<Slider>;
  onUpdateSlider?: (id: string, slider: Partial<Slider>) => Promise<Slider>;
  onDeleteSlider?: (id: string) => Promise<void>;
  onReorderSliders?: (sliderId: string, newPosition: number) => Promise<void>;
  onRefreshSliders?: () => Promise<Slider[]>;
  className?: string;
  uploadPath?: string;
  entityName?: string;
  entityNamePlural?: string;
  maxItems?: number;
  firstFieldLabel?: string;
  secondFieldLabel?: string;
  validateSecondFieldAsUrl?: boolean;
  secondFieldRequired?: boolean;
  showContentField?: boolean;
  contentFieldLabel?: string;
  titleAsTextarea?: boolean;
  fieldsOrder?: Array<"url" | "content" | "title">;
  contentFieldRequired?: boolean;
  imageFieldLabel?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type SliderView = "list" | "form";

export type SliderAction =
  | { type: "SET_SLIDERS"; payload: Slider[] }
  | { type: "ADD_SLIDER"; payload: Slider }
  | { type: "UPDATE_SLIDER"; payload: { id: string; updates: Partial<Slider> } }
  | { type: "DELETE_SLIDER"; payload: string }
  | { type: "REORDER_SLIDER"; payload: { id: string; position: number } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_VIEW"; payload: SliderView }
  | { type: "SET_EDITING_SLIDER"; payload: Slider | null };

export interface SliderManagerState {
  sliders: Slider[];
  isLoading: boolean;
  error: string | null;
  currentView: SliderView;
  editingSlider: Slider | null;
}
