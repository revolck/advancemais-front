import { useWebsiteLoading } from "@/app/website/loading-context";
import { useEffect, useRef } from "react";

interface UseLoadingStatusOptions {
  componentName?: string;
  autoRegister?: boolean;
}

/**
 * Hook para componentes reportarem seu status de carregamento
 */
export function useLoadingStatus(options: UseLoadingStatusOptions = {}) {
  const { autoRegister = true } = options;
  const { startLoading, finishLoading, setError } = useWebsiteLoading();
  const isRegisteredRef = useRef(false);

  // Registra automaticamente o componente no contador global
  useEffect(() => {
    if (autoRegister) {
      startLoading();
      isRegisteredRef.current = true;
    }

    return () => {
      if (autoRegister && isRegisteredRef.current) {
        finishLoading();
      }
    };
  }, [autoRegister, startLoading, finishLoading]);

  // Marca o carregamento como concluído
  const markAsLoaded = () => {
    if (isRegisteredRef.current) {
      finishLoading();
      isRegisteredRef.current = false;
    }
  };

  // Reporta erro
  const reportError = (error: string) => {
    setError(error);
  };

  // Limpa erro
  const clearError = () => {
    setError(null);
  };

  return {
    markAsLoaded,
    reportError,
    clearError,
  };
}
