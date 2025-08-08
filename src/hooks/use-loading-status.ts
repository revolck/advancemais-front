import { useWebsiteLoading } from "@/app/website/loading-context";
import { useEffect, useState } from "react";

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
  const [isRegistered, setIsRegistered] = useState(false);

  // Registra automaticamente o componente no contador global
  useEffect(() => {
    if (autoRegister && !isRegistered) {
      startLoading();
      setIsRegistered(true);
    }

    return () => {
      if (autoRegister && isRegistered) {
        finishLoading();
      }
    };
  }, [autoRegister, isRegistered, startLoading, finishLoading]);

  // Marca o carregamento como concluído
  const markAsLoaded = () => {
    if (isRegistered) {
      finishLoading();
      setIsRegistered(false);
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
