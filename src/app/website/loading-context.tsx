"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Loader } from "@/components/ui/custom/loader";
import { apiKeepAlive } from "@/lib/api-keep-alive";

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

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detecta se é cliente e inicia keep-alive
  useEffect(() => {
    setIsClient(true);

    // Inicia keep-alive da API
    apiKeepAlive.start();

    // Garante um tempo mínimo de loading
    const timer = setTimeout(() => {
      console.log("✅ Loading mínimo de 3s cumprido");
      setMinTimeElapsed(true);
    }, 3000);

    return () => {
      clearTimeout(timer);
      apiKeepAlive.stop();
    };
  }, []);

  // Atualiza status de pronto quando todos os carregamentos finalizam
  useEffect(() => {
    const ready = loadingCount === 0 && minTimeElapsed && !error;
    console.log(`📊 Loading status: ${ready ? "PRONTO" : "CARREGANDO"}`);
    setIsReady(ready);
  }, [loadingCount, minTimeElapsed, error]);

  const startLoading = () =>
    setLoadingCount((prev) => {
      const next = prev + 1;
      console.log(`🔄 Loading iniciado (${next})`);
      return next;
    });

  const finishLoading = () =>
    setLoadingCount((prev) => {
      const next = Math.max(0, prev - 1);
      console.log(`✅ Loading concluído (${next})`);
      return next;
    });

  const setErrorCallback = (newError: string | null) => {
    console.log(newError ? `❌ Erro: ${newError}` : "✅ Erro limpo");
    setError(newError);
  };

  const contextValue: SimpleLoadingContextValue = {
    isReady: isClient && isReady,
    startLoading,
    finishLoading,
    error,
    setError: setErrorCallback,
  };

  return (
    <SimpleLoadingContext.Provider value={contextValue}>
      {/* Loading Screen */}
      {!contextValue.isReady && !error && (
        <Loader showOverlay={true} fullScreen={true} />
      )}

      {/* Error Screen */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center text-white max-w-md mx-auto p-6">
            <h2 className="text-xl font-semibold mb-4">Ops! Algo deu errado</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {contextValue.isReady && !error && children}
    </SimpleLoadingContext.Provider>
  );
}

export const useWebsiteLoading = () => useContext(SimpleLoadingContext);
