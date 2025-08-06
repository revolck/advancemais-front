"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface LoadingContextValue {
  register: () => void;
  init: (total: number) => void;
  isReady: boolean;
}

const LoadingContext = createContext<LoadingContextValue>({
  register: () => {},
  init: () => {},
  isReady: true,
});

export function LoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const register = useCallback(() => {
    setLoaded((prev) => prev + 1);
  }, []);

  const init = useCallback((sections: number) => {
    setTotal(sections);
    setLoaded(0);
  }, []);

  const isReady = isClient && loaded >= total;

  return (
    <LoadingContext.Provider value={{ register, init, isReady }}>
      {children}
    </LoadingContext.Provider>
  );
}

export const useWebsiteLoading = () => useContext(LoadingContext);

