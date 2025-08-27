"use client";

import { useCallback, useEffect, useState } from "react";
import { getConsultoriaDataClient } from "@/api/websites/components/consultoria";
import type { ConsultoriaApiResponse } from "@/api/websites/components";
import ConsultoriaImage from "./components/ConsultoriaImage";
import ConsultoriaContent from "./components/ConsultoriaContent";
import { useLoadingStatus } from "@/hooks/use-loading-status";

function ConsultoriaSkeleton({ className = "" }: { className?: string }) {
  return (
    <section className={className}>
      <div className="container mx-auto py-16 px-4 flex flex-col lg:flex-row items-center gap-20 mt-5">
        <div className="w-full lg:w-1/2">
          <div className="aspect-[3/2] bg-gray-200 animate-pulse rounded-lg" />
        </div>
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

interface ConsultoriaSectionProps {
  className?: string;
  onDataLoaded?: (data: ConsultoriaApiResponse) => void;
  onError?: (error: string) => void;
}

function useConsultoriaLoading() {
  const [data, setData] = useState<ConsultoriaApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getConsultoriaDataClient();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (error && retryCount < 2) {
      const timer = setTimeout(() => {
        retry();
      }, 2000 * (retryCount + 1));
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, retry]);

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

export default function ConsultoriaSection({
  className = "",
  onDataLoaded,
  onError,
}: ConsultoriaSectionProps) {
  const { data, error, isLoading, hasAutoRetried } = useConsultoriaLoading();
  const { markAsLoaded, reportError } = useLoadingStatus({
    componentName: "Consultoria",
  });

  useEffect(() => {
    if (data && !isLoading) {
      onDataLoaded?.(data);
      markAsLoaded();
    }
  }, [data, isLoading, onDataLoaded, markAsLoaded]);

  useEffect(() => {
    if (error && hasAutoRetried && !isLoading) {
      onError?.(error);
      reportError(error);
      markAsLoaded();
    }
  }, [error, hasAutoRetried, isLoading, onError, reportError, markAsLoaded]);

  if (isLoading) {
    return <ConsultoriaSkeleton className={className} />;
  }

  if (error || !data) {
    return null;
  }

  return (
    <section className={className}>
      <div className="container mx-auto py-16 px-4 flex flex-col lg:flex-row items-center gap-10 mt-5 lg:gap-20 md:gap-20">
        <ConsultoriaImage
          src={data.src}
          alt={data.title || "Consultoria"}
          width={600}
          height={400}
        />
        <ConsultoriaContent
          title={data.title}
          description={data.description}
          buttonUrl={data.buttonUrl}
          buttonLabel={data.buttonLabel}
        />
      </div>
    </section>
  );
}

export { ConsultoriaSkeleton };
