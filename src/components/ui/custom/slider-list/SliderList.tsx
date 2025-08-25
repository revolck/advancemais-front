"use client";

import React, { useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ButtonCustom, Icon } from "@/components/ui/custom";
import { useSliderList, useSliderModal } from "./hooks";
import {
  SliderListItem,
  SliderModal,
  SliderEmptyState,
  SliderLoadingState,
  SliderDeleteConfirmation,
} from "./components";
import {
  sliderListVariants,
  sliderListHeaderVariants,
  addButtonVariants,
} from "./styles";
import type { SliderListProps, SliderFormData } from "./types";

export const SliderList: React.FC<SliderListProps> = ({
  deviceType = "desktop",
  className,
  maxSliders = 4,
  onSlidersChange,
  onError,
  allowReorder = true,
  autoLoad = true,
}) => {
  // Hook principal da lista
  const {
    sliders,
    status,
    error,
    addSlider,
    editSlider,
    removeSlider,
    togglePublishSlider,
    moveSliderUp,
    moveSliderDown,
    canAddMore,
    canRemove,
    getNextOrder,
    refreshSliders,
  } = useSliderList({
    maxSliders,
    onSlidersChange,
    onError,
    autoLoad,
  });

  // Hook do modal
  const {
    isOpen,
    isCreateMode,
    editingSlider,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useSliderModal();

  // Estados locais para confirmações
  const [deleteConfirmation, setDeleteConfirmation] = React.useState<{
    isOpen: boolean;
    slider: import("./types").SliderItem | null;
  }>({ isOpen: false, slider: null });

  // Handler para submissão do modal
  const handleSubmitSlider = useCallback(
    async (formData: SliderFormData) => {
      try {
        if (editingSlider) {
          await editSlider(editingSlider.id, formData);
        } else {
          await addSlider(formData);
        }
        closeModal();
      } catch (error) {
        // Erro já tratado nos hooks
        throw error;
      }
    },
    [editingSlider, editSlider, addSlider, closeModal]
  );

  // Handler para confirmação de delete
  const handleDeleteSlider = useCallback(
    (sliderId: string) => {
      const slider = sliders.find((s) => s.id === sliderId);
      if (slider) {
        setDeleteConfirmation({ isOpen: true, slider });
      }
    },
    [sliders]
  );

  // Handler para confirmar delete
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmation.slider) return;

    try {
      await removeSlider(deleteConfirmation.slider.id);
      setDeleteConfirmation({ isOpen: false, slider: null });
    } catch (error) {
      // Erro já tratado no hook
    }
  }, [deleteConfirmation.slider, removeSlider]);

  // Estado de carregamento inicial
  if (status === "loading") {
    return (
      <div className={cn(sliderListVariants(), className)}>
        <SliderLoadingState itemCount={3} />
      </div>
    );
  }

  // Estado vazio
  if (sliders.length === 0) {
    return (
      <div className={cn(sliderListVariants(), className)}>
        <SliderEmptyState
          onAddSlider={openCreateModal}
          maxSliders={maxSliders}
        />
      </div>
    );
  }

  return (
    <div className={cn(sliderListVariants(), className)}>
      {/* Header */}
      <div className={cn(sliderListHeaderVariants())}>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Gestão de Sliders -{" "}
            {deviceType === "desktop" ? "Desktop" : "Mobile/Tablet"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {sliders.length} de {maxSliders} sliders configurados
            {status !== "idle" && (
              <span className="ml-2 capitalize">• {status}...</span>
            )}
          </p>
        </div>

        {/* Actions Header */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <ButtonCustom
            variant="outline"
            size="sm"
            onClick={refreshSliders}
            disabled={status !== "idle"}
            icon="RefreshCw"
            title="Recarregar lista"
          >
            Atualizar
          </ButtonCustom>

          {/* Add Button */}
          {canAddMore && (
            <ButtonCustom
              onClick={openCreateModal}
              icon="Plus"
              className={cn(addButtonVariants())}
              disabled={status !== "idle"}
            >
              Adicionar Slider
            </ButtonCustom>
          )}
        </div>
      </div>

      {/* Lista de Sliders */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sliders.map((slider, index) => (
            <SliderListItem
              key={slider.id}
              slider={slider}
              index={index}
              isFirst={index === 0}
              isLast={index === sliders.length - 1}
              allowReorder={allowReorder && status === "idle"}
              onEdit={openEditModal}
              onDelete={handleDeleteSlider}
              onTogglePublish={togglePublishSlider}
              onMoveUp={allowReorder ? moveSliderUp : undefined}
              onMoveDown={allowReorder ? moveSliderDown : undefined}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex gap-2">
            <Icon
              name="AlertCircle"
              className="w-4 h-4 text-destructive shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm text-destructive font-medium">
                Erro na operação
              </p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adição/Edição */}
      <SliderModal
        isOpen={isOpen}
        onClose={closeModal}
        editingSlider={editingSlider}
        nextOrder={getNextOrder()}
        onSubmit={handleSubmitSlider}
        isLoading={status === "saving"}
      />

      {/* Modal de Confirmação de Exclusão */}
      <SliderDeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, slider: null })}
        slider={deleteConfirmation.slider}
        onConfirm={handleConfirmDelete}
        isLoading={status === "deleting"}
        isLastSlider={!canRemove}
      />
    </div>
  );
};
