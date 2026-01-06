"use client";

import { QueryClient, QueryClientConfig, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { MercadoPagoProvider } from "@/lib/mercadopago";
import { CookieConsentProvider } from "@/components/cookies/CookieConsentProvider";

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 segundos (igual ao backend)
      gcTime: 60 * 1000, // 1 minuto (garbage collect unused queries)
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

  return (
    <QueryClientProvider client={queryClient}>
      <MercadoPagoProvider>
        <CookieConsentProvider>{children}</CookieConsentProvider>
      </MercadoPagoProvider>
    </QueryClientProvider>
  );
}
