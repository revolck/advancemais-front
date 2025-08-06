'use client';

import { useEffect, useState } from 'react';
import { getAboutDataClient } from '@/api/websites/components/about';
import type { AboutApiResponse } from '@/api/websites/components/about/types';
import AboutImage from './components/AboutImage';
import AboutContent from './components/AboutContent';

// Loading component
function AboutSkeleton() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image skeleton */}
          <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse" />

          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AboutSection() {
  const [data, setData] = useState<AboutApiResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAboutDataClient()
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-red-500">
            Erro ao carregar informações. Tente novamente mais tarde.
          </p>
        </div>
      </section>
    );
  }

  if (!data) {
    return <AboutSkeleton />;
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <AboutImage
            src={data.src}
            alt={data.title}
            width={600}
            height={400}
          />
          <AboutContent
            title={data.title}
            description={data.description}
          />
        </div>
      </div>
    </section>
  );
}

