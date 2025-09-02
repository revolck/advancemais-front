"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Icon } from "@/components/ui/custom/Icons";
import { toastCustom } from "@/components/ui/custom/toast";
import { Badge } from "@/components/ui/badge";
import ModalCustom, {
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from "@/components/ui/custom/modal";

import type { SliderManagerProps, Slider } from "./types";
import { SLIDER_ANIMATIONS } from "./constants";
import { useSliderManager } from "./hooks/use-slider-manager";
import { SliderForm, SliderList } from "./components";
import { cn } from "@/lib/utils";
import { deleteImage } from "@/services/upload";

export function SliderManager({
  initialSliders = [],
  onCreateSlider,
  onUpdateSlider,
  onDeleteSlider,
  onReorderSliders,
  className,
  uploadPath = "website/slider",
  entityName = "Slider",
  entityNamePlural = "Sliders",
  maxItems,
  firstFieldLabel,
  secondFieldLabel,
  validateSecondFieldAsUrl = true,
  secondFieldRequired = false,
}: SliderManagerProps) {
  // Use our custom hook for state management
  const {
    // State
    sliders,
    isLoading,
    error,
    currentView,
    editingSlider,

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

    // Statistics
    activeSliders,
  } = useSliderManager({
    initialSliders,
    onCreateSlider,
    onUpdateSlider,
    onDeleteSlider,
    onReorderSliders,
    entityName,
    entityNamePlural,
  });

  /**
   * Handle form submission (create or update)
   */
  const handleFormSubmit = useCallback(
    async (sliderData: Omit<Slider, "id" | "createdAt">) => {
      try {
        if (editingSlider) {
          await updateSlider(editingSlider.id, sliderData);
        } else {
          await createSlider(sliderData);
        }
      } catch (error) {
        // Error is handled in the hook with toastCustom
        console.error("Form submission error:", error);
      }
    },
    [editingSlider, updateSlider, createSlider]
  );

  /**
   * Handle creating new slider
   */
  const handleCreateNew = useCallback(() => {
    if (typeof maxItems === "number" && sliders.length >= maxItems) {
      toastCustom.error(
        `Limite de ${maxItems} ${entityNamePlural.toLowerCase()} atingido.`
      );
      return;
    }
    setView("form");
  }, [setView, maxItems, sliders.length, entityNamePlural]);

  /**
   * Handle back to list
   */
  const handleBackToList = useCallback(() => {
    cancelEdit();
  }, [cancelEdit]);

  return (
    <div
      className={cn("w-full max-w-7xl mx-auto relative", className)}
      aria-busy={isLoading}
      aria-live="polite"
    >
      {/* Header */}
      <div className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Title Section */}
            <div>
              <motion.div {...SLIDER_ANIMATIONS.FADE_IN} className="flex items-center gap-2">
                <h3>Gerenciador de {entityNamePlural.toLowerCase()}</h3>
                {typeof maxItems === "number" && sliders.length >= maxItems && (
                  <Badge variant="secondary" className="uppercase tracking-wide">
                    <Icon name="CircleSlash2" /> Limite atingido
                  </Badge>
                )}
              </motion.div>
              <motion.p
                {...SLIDER_ANIMATIONS.FADE_IN}
                className="text-muted-foreground mt-[-16] text-lg"
              >
                O sistema está gerenciando{" "}
                <span className="font-semibold">
                  {activeSliders} {entityNamePlural.toLowerCase()} ativos
                </span>
                .
              </motion.p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {(typeof maxItems !== "number" || sliders.length < maxItems) && (
              <ButtonCustom
                onClick={handleCreateNew}
                disabled={isLoading}
                className="h-11 px-6"
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" className="h-5 w-5 mr-2 animate-spin" />
                    Processando…
                  </>
                ) : (
                  <>
                    <Icon name="Plus" className="h-5 w-5 mr-2" />
                    Novo {entityName}
                  </>
                )}
              </ButtonCustom>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div {...SLIDER_ANIMATIONS.SLIDE_UP} className="mt-4">
            <Alert variant="destructive" className="rounded-xl">
              <AlertDescription className="text-base">
                {error}
                <ButtonCustom
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="ml-4 h-auto p-1 text-sm underline hover:no-underline"
                >
                  Dispensar
                </ButtonCustom>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="p-0">
        <AnimatePresence mode="wait">
          <motion.div
            key="list"
            {...SLIDER_ANIMATIONS.FADE_IN}
            className="pt-4"
          >
            <SliderList
              sliders={sliders}
              entityName={entityName}
              entityNamePlural={entityNamePlural}
              onEdit={(s) => {
                editSlider(s);
              }}
              onDelete={async (slider) => {
                // Primeiro remove no backend; se ok, remove do Blob
                await deleteSlider(slider.id);
                if (slider.image) {
                  await deleteImage(slider.image);
                }
              }}
              onToggleStatus={async (id) => {
                await toggleSliderStatus(id);
              }}
              onReorder={async (id, pos) => {
                await reorderSlider(id, pos);
              }}
              isLoading={isLoading}
            />
          </motion.div>
        </AnimatePresence>

        {/* Modal for create/edit */}
        <ModalCustom
          isOpen={currentView === "form"}
          onOpenChange={(open) => {
            if (!open) handleBackToList();
          }}
          isDismissable={!isLoading}
          size="2xl"
          backdrop="blur"
        >
          <ModalContentWrapper>
            <ModalHeader>
              <ModalTitle className="!text-xl md:text-lg font-semibold">
                {editingSlider ? `Editar ${entityName.toLowerCase()}` : `Criar novo ${entityName.toLowerCase()}`}
              </ModalTitle>
            </ModalHeader>
            <ModalBody>
              <SliderForm
                slider={editingSlider}
                showHeader={false}
                firstFieldLabel={firstFieldLabel}
                secondFieldLabel={secondFieldLabel}
                validateSecondFieldAsUrl={validateSecondFieldAsUrl}
                secondFieldRequired={secondFieldRequired}
                uploadPath={uploadPath}
                entityName={entityName}
                onSubmit={async (formData) => {
                  await handleFormSubmit(formData);
                  // Close modal and return to list
                  handleBackToList();
                }}
                onCancel={handleBackToList}
                isLoading={isLoading}
              />
            </ModalBody>
          </ModalContentWrapper>
        </ModalCustom>
      </div>

      {/* Global loading overlay to prevent interactions during API ops */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="slider-manager-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="flex items-center gap-3 bg-muted/60 rounded-xl px-4 py-3 border border-border/50 shadow-sm">
              <Icon name="Loader2" className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Processando…</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export types and utilities for external use
export type {
  SliderManagerProps,
  Slider,
  SliderFormData,
  SliderManagerState,
} from "./types";

export { SLIDER_CONSTANTS, SLIDER_MESSAGES } from "./constants";

export { SLIDER_CONFIG } from "./config";

export { useSliderManager } from "./hooks/use-slider-manager";
export { SliderForm, SliderList } from "./components";

// Default export
export default SliderManager;
