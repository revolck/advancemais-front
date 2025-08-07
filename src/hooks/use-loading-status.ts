import { useWebsiteLoading } from "@/app/website/loading-context";
import { useState } from "react";

interface UseLoadingStatusOptions {
  componentName?: string;
  autoRegister?: boolean;
}

/**
 * Hook para componentes reportarem seu status de carregamento
 */
export function useLoadingStatus(options: UseLoadingStatusOptions = {}) {
  const { autoRegister = true } = options;
  const { setReady, setError } = useWebsiteLoading();
  const [hasRegistered, setHasRegistered] = useState(false);

  // Marca o carregamento como concluído
  const markAsLoaded = () => {
    if (!hasRegistered && autoRegister) {
      setReady(true);
      setHasRegistered(true);
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
    hasRegistered,
  };
}
