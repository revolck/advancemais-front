"use client";
import { useState, useCallback } from "react";
import type { SliderItem, SliderModalState, UploadStatus } from "../types";

interface UseSliderModalOptions {
  onSliderAdded?: (slider: SliderItem) => void;
  onSliderUpdated?: (slider: SliderItem) => void;
}

interface UseSliderModalReturn {
  // Estado do modal
  modalState: SliderModalState;

  // Ações do modal
  openCreateModal: () => void;
  openEditModal: (slider: SliderItem) => void;
  closeModal: () => void;

  // Estado de upload
  setUploadStatus: (status: UploadStatus) => void;

  // Utilitários
  isOpen: boolean;
  isCreateMode: boolean;
  isEditMode: boolean;
  editingSlider: SliderItem | null;
}

export function useSliderModal({
  onSliderAdded,
  onSliderUpdated,
}: UseSliderModalOptions = {}): UseSliderModalReturn {
  const [modalState, setModalState] = useState<SliderModalState>({
    isOpen: false,
    mode: "create",
    editingSlider: null,
    uploadStatus: "idle",
  });

  // Abre modal para criar slider
  const openCreateModal = useCallback(() => {
    setModalState({
      isOpen: true,
      mode: "create",
      editingSlider: null,
      uploadStatus: "idle",
    });
  }, []);

  // Abre modal para editar slider
  const openEditModal = useCallback((slider: SliderItem) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      editingSlider: slider,
      uploadStatus: "idle",
    });
  }, []);

  // Fecha modal
  const closeModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
      uploadStatus: "idle",
    }));
  }, []);

  // Atualiza status de upload
  const setUploadStatus = useCallback((status: UploadStatus) => {
    setModalState((prev) => ({
      ...prev,
      uploadStatus: status,
    }));
  }, []);

  // Derivações de estado
  const isOpen = modalState.isOpen;
  const isCreateMode = modalState.mode === "create";
  const isEditMode = modalState.mode === "edit";
  const editingSlider = modalState.editingSlider;

  return {
    // Estado do modal
    modalState,

    // Ações do modal
    openCreateModal,
    openEditModal,
    closeModal,

    // Estado de upload
    setUploadStatus,

    // Utilitários
    isOpen,
    isCreateMode,
    isEditMode,
    editingSlider,
  };
}
