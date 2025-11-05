"use client";

import { QueryClient, QueryClientConfig, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // keep data fresh for 5 minutes
      gcTime: 30 * 60 * 1000, // garbage collect unused queries after 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
};

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient(queryClientConfig));

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

