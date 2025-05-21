import type { CustomToasterProps } from "./types";

/**
 * Configuração padrão global para todos os toasts da aplicação
 * Centraliza as definições para garantir consistência visual
 */
export const DEFAULT_TOAST_CONFIG: CustomToasterProps = {
  position: "top-right",
  theme: "system",
  richColors: true,
  closeButton: true,
  maxToasts: 5,
  gap: 8,
  defaultDuration: 5000,
  toastOptions: {
    classNames: {
      toast: "group toast-custom-item",
      title: "text-base font-semibold",
      description:
        "text-sm opacity-90 group-[.toast-custom-item]:text-muted-foreground",
      actionButton: "bg-primary text-primary-foreground hover:bg-primary/90",
      cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80",
      error: "group toast-custom-error",
      success: "group toast-custom-success",
      warning: "group toast-custom-warning",
      info: "group toast-custom-info",
      loading: "group toast-custom-loading",
      closeButton: "!hidden", // Esconde o botão de fechar padrão pois usamos nosso próprio
    },
  },
};
