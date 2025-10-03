"use client";

import { useEffect, useState, useMemo } from "react";

interface UseUnsavedChangesProps<T> {
  formData: T;
  initialData: T;
  isSubmitting?: boolean;
}

interface UseUnsavedChangesReturn {
  hasUnsavedChanges: boolean;
  showExitModal: boolean;
  setShowExitModal: (show: boolean) => void;
  handleConfirmExit: () => void;
  handleCancelExit: () => void;
  isExiting: boolean;
}

export function useUnsavedChanges<T>({
  formData,
  initialData,
  isSubmitting = false,
}: UseUnsavedChangesProps<T>): UseUnsavedChangesReturn {
  const [showExitModal, setShowExitModal] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Detecta se há mudanças não salvas no formulário
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  // Intercepta eventos de refresh para mostrar modal customizada
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F5" && hasUnsavedChanges && !isSubmitting) {
        event.preventDefault();
        event.stopPropagation();
        setShowExitModal(true);
      }
    };

    // Intercepta Ctrl+R / Cmd+R
    const handleKeyUp = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "r" &&
        hasUnsavedChanges &&
        !isSubmitting
      ) {
        event.preventDefault();
        event.stopPropagation();
        setShowExitModal(true);
      }
    };

    // Intercepta tentativas de navegação - usa beforeunload para mostrar modal nativa como fallback
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSubmitting && !isExiting) {
        setShowExitModal(true);

        event.preventDefault();
        event.returnValue =
          "Você tem alterações não salvas. Tem certeza que deseja sair?";
        return "Você tem alterações não salvas. Tem certeza que deseja sair?";
      }
    };

    // Intercepta eventos de mouse que podem causar refresh
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target && hasUnsavedChanges && !isSubmitting) {
        // Verifica se é um elemento que pode causar refresh
        const isRefreshElement =
          target.closest('button[aria-label*="Recarregar"]') ||
          target.closest('button[title*="Recarregar"]') ||
          target.closest('[data-testid*="refresh"]') ||
          target.closest(".reload-button") ||
          target.closest('[aria-label*="Reload"]') ||
          target.closest('[title*="Reload"]') ||
          target.closest('button[aria-label*="Refresh"]') ||
          target.closest('button[title*="Refresh"]');

        if (isRefreshElement) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          setShowExitModal(true);
        }
      }
    };

    // Intercepta cliques em elementos que podem causar refresh
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target && hasUnsavedChanges && !isSubmitting) {
        // Verifica se é um elemento que pode causar refresh
        const isRefreshElement =
          target.closest('button[aria-label*="Recarregar"]') ||
          target.closest('button[title*="Recarregar"]') ||
          target.closest('[data-testid*="refresh"]') ||
          target.closest(".reload-button") ||
          target.closest('[aria-label*="Reload"]') ||
          target.closest('[title*="Reload"]') ||
          target.closest('button[aria-label*="Refresh"]') ||
          target.closest('button[title*="Refresh"]');

        if (isRefreshElement) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          setShowExitModal(true);
        }
      }
    };

    // Intercepta mudanças no histórico do navegador
    const handlePopState = (event: PopStateEvent) => {
      if (hasUnsavedChanges && !isSubmitting) {
        event.preventDefault();
        setShowExitModal(true);
        // Adiciona uma entrada ao histórico para interceptar o próximo popstate
        history.pushState(null, "", window.location.href);
      }
    };

    // Adiciona uma entrada ao histórico para capturar eventos de navegação
    if (hasUnsavedChanges && !isSubmitting) {
      history.pushState(null, "", window.location.href);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown, true);
    window.addEventListener("click", handleClick, true);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown, true);
      window.removeEventListener("click", handleClick, true);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges, isSubmitting, isExiting]);

  // Funções para lidar com a modal de confirmação
  const handleConfirmExit = () => {
    setIsExiting(true);
    setShowExitModal(false);
    // Força o reload da página
    window.location.reload();
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  return {
    hasUnsavedChanges,
    showExitModal,
    setShowExitModal,
    handleConfirmExit,
    handleCancelExit,
    isExiting,
  };
}
