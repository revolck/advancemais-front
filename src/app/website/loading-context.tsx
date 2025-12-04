"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { Loader } from "@/components/ui/custom/loader";
import { apiKeepAlive } from "@/lib/api-keep-alive";

const INTRO_STORAGE_KEY = "website_intro_seen";

interface SimpleLoadingContextValue {
  isReady: boolean;
  startLoading: () => void;
  finishLoading: () => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const SimpleLoadingContext = createContext<SimpleLoadingContextValue>({
  isReady: false,
  startLoading: () => {},
  finishLoading: () => {},
  error: null,
  setError: () => {},
});

/**
 * LoadingProvider - Gerencia estado de carregamento do website
 *
 * Este componente foi otimizado para evitar erros de hidratação SSR/CSR.
 * O estado inicial é definido de forma segura e os efeitos colaterais
 * só são executados no cliente.
 */
export function LoadingProvider({ children }: { children: ReactNode }) {
  // Ref para rastrear se a intro já foi vista (evita re-renders)
  const introSeenRef = React.useRef(false);

  // Estados do loading
  const [loadingCount, setLoadingCount] = useState(0);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIntroOverlay, setShowIntroOverlay] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Efeito de montagem - só executa no cliente
  useEffect(() => {
    setIsMounted(true);

    // Inicia keep-alive da API
    apiKeepAlive.start();

    // Verifica se já viu a intro
    const hasSeenIntro =
      introSeenRef.current ||
      window.localStorage.getItem(INTRO_STORAGE_KEY) === "true";

    if (hasSeenIntro) {
      setMinTimeElapsed(true);
      setShowIntroOverlay(false);
      introSeenRef.current = true;
    } else {
      setShowIntroOverlay(true);

      const timer = setTimeout(() => {
        setMinTimeElapsed(true);
        setShowIntroOverlay(false);
        introSeenRef.current = true;
          window.localStorage.setItem(INTRO_STORAGE_KEY, "true");
    }, 3000);

      return () => {
        clearTimeout(timer);
        apiKeepAlive.stop();
      };
    }

    return () => {
      apiKeepAlive.stop();
    };
  }, []);

  // Calcula se está pronto
  const isReady = isMounted && loadingCount === 0 && minTimeElapsed && !error;

  const startLoading = () => {
    setLoadingCount((prev) => prev + 1);
  };

  const finishLoading = () => {
    setLoadingCount((prev) => Math.max(0, prev - 1));
  };

  const setErrorCallback = (newError: string | null) => {
    setError(newError);
  };

  const contextValue: SimpleLoadingContextValue = {
    isReady,
    startLoading,
    finishLoading,
    error,
    setError: setErrorCallback,
  };

  return (
    <SimpleLoadingContext.Provider value={contextValue}>
      {/* Loading Screen - só mostra após montagem */}
      {isMounted && showIntroOverlay && !error && (
        <Loader showOverlay={true} fullScreen={true} />
      )}

      {/* Error Screen */}
      {error && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center text-[var(--primary-color)] max-w-md mx-auto p-6">
            <h2 className="text-xl font-semibold mb-4">Ops! Algo deu errado</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Content sempre renderizado; o Loader sobrepõe enquanto carrega */}
      {!error && children}
    </SimpleLoadingContext.Provider>
  );
}

export const useWebsiteLoading = () => useContext(SimpleLoadingContext);
