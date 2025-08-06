'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAboutDataClient } from '@/api/websites/components/about';
import type { AboutApiResponse } from '@/api/websites/components/about/types';
import AboutImage from './components/AboutImage';
import AboutContent from './components/AboutContent';
import { ImageNotFound } from '@/components/ui/custom/image-not-found';
import { ButtonCustom } from '@/components/ui/custom/button';

// Loading component
function AboutSkeleton({ className = '' }: { className?: string }) {
  return (
    <section
      className={`container mx-auto pt-16 lg:pb-6 px-4 flex flex-col lg:flex-row items-center lg:gap-20 gap-6 mt-5 ${className}`}
    >
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
      </div>
    </section>
  );
}

interface AboutSectionProps {
  className?: string;
  onDataLoaded?: (data: AboutApiResponse) => void;
  onError?: (error: string) => void;
}

export default function AboutSection({
  className,
  onDataLoaded,
  onError,
}: AboutSectionProps) {
  const [data, setData] = useState<AboutApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    getAboutDataClient()
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (data && !isLoading) {
      onDataLoaded?.(data);
    }
  }, [data, isLoading, onDataLoaded]);

  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  if (isLoading) {
    return <AboutSkeleton className={className} />;
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <ImageNotFound
          size="lg"
          variant="error"
          message="Erro ao carregar informações"
          icon="AlertCircle"
          className="mx-auto mb-6"
          showMessage={true}
        />
        <p className="text-gray-600 mb-4 max-w-md mx-auto">
          Não foi possível carregar as informações do about.
        </p>
        <ButtonCustom onClick={fetchData} variant="default" icon="RefreshCw">
          Tentar Novamente
        </ButtonCustom>
      </div>
    );
  }

  return (
    <section
      className={`container mx-auto pt-16 lg:pb-6 px-4 flex flex-col lg:flex-row items-center lg:gap-20 gap-6 mt-5 ${className}`}
    >
      <AboutImage
        src={data.src}
        alt={data.title}
        width={600}
        height={400}
      />
      <AboutContent title={data.title} description={data.description} />
    </section>
  );
}

