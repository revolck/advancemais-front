"use client";

import { useCallback, useEffect, useState } from "react";
import { getAboutDataClient } from "@/api/websites/components/about";
import type { AboutApiResponse } from "@/api/websites/components/about/types";
import AboutImage from "./components/AboutImage";
import AboutContent from "./components/AboutContent";
import { useLoadingStatus } from "@/hooks/use-loading-status";

// Loading skeleton component
function AboutSkeleton({ className = "" }: { className?: string }) {
  return (
    <section className={className}>
      <div className="container mx-auto py-16 px-4 flex flex-col lg:flex-row items-center gap-20 mt-5">
        {/* Image skeleton */}
        <div className="w-full lg:w-1/2">
          <div className="aspect-[3/2] bg-gray-200 animate-pulse rounded-lg" />
        </div>

        {/* Content skeleton */}
        <div className="w-full lg:w-1/2 space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
          </div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32" />
        </div>
      </div>
    </section>
  );
}

// Main component interfaces
interface AboutSectionProps {
  className?: string;
  onDataLoaded?: (data: AboutApiResponse) => void;
  onError?: (error: string) => void;
}

// Hook personalizado para gerenciar loading status
function useAboutLoading() {
  const [data, setData] = useState<AboutApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔄 Carregando dados do About...");
      const result = await getAboutDataClient();
      setData(result);
      console.log("✅ About carregado com sucesso:", result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      console.error("❌ Erro ao carregar About:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    fetchData();
  }, [fetchData]);

  // Auto-retry em caso de erro (máximo 2 tentativas automáticas)
  useEffect(() => {
    if (error && retryCount < 2) {
      const timer = setTimeout(() => {
        console.log(`🔄 Tentativa automática ${retryCount + 1} para About...`);
        retry();
      }, 2000 * (retryCount + 1)); // Delay crescente

      return () => clearTimeout(timer);
    }
  }, [error, retryCount, retry]);

  // Executa o fetch inicial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    error,
    isLoading,
    retry,
    hasAutoRetried: retryCount >= 2,
  };
}

// Main About Section component
export default function AboutSection({
  className = "",
  onDataLoaded,
  onError,
}: AboutSectionProps) {
  const { data, error, isLoading, hasAutoRetried } = useAboutLoading();
  const { markAsLoaded, reportError } = useLoadingStatus({ componentName: "About" });

  // Notify parent components about data loading
  useEffect(() => {
    if (data && !isLoading) {
      onDataLoaded?.(data);
      markAsLoaded();
    }
  }, [data, isLoading, onDataLoaded, markAsLoaded]);

  // Notify parent components about errors
  useEffect(() => {
    if (error && hasAutoRetried && !isLoading) {
      onError?.(error);
      reportError(error);
      markAsLoaded();
    }
  }, [error, hasAutoRetried, isLoading, onError, reportError, markAsLoaded]);

  // Loading state
  if (isLoading) {
    return <AboutSkeleton className={className} />;
  }

  // Error state (after auto-retries) - hide component if data is not available
  if (error || !data) {
    return null;
  }

  // Success state - render the actual content
  return (
    <section className={className}>
      <div className="container mx-auto py-16 px-4 flex flex-col lg:flex-row items-center gap-20 mt-5">
        {/* Image Section */}
        <AboutImage
          src={data.src}
          alt={data.title || "Sobre nós"}
          width={600}
          height={400}
        />

        {/* Content Section */}
        <AboutContent title={data.title} description={data.description} />
      </div>
    </section>
  );
}

// Export skeleton for external use if needed
export { AboutSkeleton };
