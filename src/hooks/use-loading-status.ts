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
  const { componentName = "unknown-component", autoRegister = true } = options;
  const { register, unregister, setError } = useWebsiteLoading();
  const [hasRegistered, setHasRegistered] = useState(false);

  // Registra carregamento concluído
  const markAsLoaded = () => {
    if (!hasRegistered && autoRegister) {
      register(componentName);
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

  // Auto-cleanup
  useEffect(() => {
    return () => {
      if (hasRegistered) {
        unregister(componentName);
      }
    };
  }, [hasRegistered, componentName, unregister]);

  return {
    markAsLoaded,
    reportError,
    clearError,
    hasRegistered,
  };
}
