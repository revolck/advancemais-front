/**
 * Tipos dos componentes SliderList
 */
import type { SliderItem, SliderFormData } from "./api.types";

/**
 * Props para o componente principal SliderList
 */
export interface SliderListProps {
  /** Tipo de dispositivo para qual a lista está sendo renderizada */
  deviceType?: "desktop" | "tablet-mobile";
  /** Classes CSS personalizadas */
  className?: string;
  /** Máximo de sliders permitidos */
  maxSliders?: number;
  /** Callback quando a lista é atualizada */
  onSlidersChange?: (sliders: SliderItem[]) => void;
  /** Callback quando ocorre erro */
  onError?: (error: string) => void;
  /** Se deve permitir reordenação */
  allowReorder?: boolean;
  /** Carregamento automático dos dados */
  autoLoad?: boolean;
}

/**
 * Props para o componente SliderListItem
 */
export interface SliderListItemProps {
  slider: SliderItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  allowReorder?: boolean;
  onEdit: (slider: SliderItem) => void;
  onDelete: (sliderId: string) => void;
  onTogglePublish: (sliderId: string, published: boolean) => void;
  onMoveUp?: (sliderId: string) => void;
  onMoveDown?: (sliderId: string) => void;
}

/**
 * Props para o modal de slider
 */
export interface SliderModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSlider?: SliderItem | null;
  nextOrder: number;
  onSubmit: (data: SliderFormData) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Props para confirmação de exclusão
 */
export interface SliderDeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  slider: SliderItem | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
  isLastSlider?: boolean;
}

/**
 * Props para estado vazio
 */
export interface SliderEmptyStateProps {
  onAddSlider: () => void;
  maxSliders: number;
  className?: string;
}

/**
 * Props para estado de carregamento
 */
export interface SliderLoadingStateProps {
  itemCount?: number;
  className?: string;
}
