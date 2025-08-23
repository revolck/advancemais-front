"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWebsiteFeaturesData } from "./hooks/useWebsiteFeaturesData";
import { Loader } from "@/components/ui/custom/loader";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { WebsiteFeaturesProps } from "./types";
import { env } from "@/lib/env";

const WebsiteFeatures: React.FC<WebsiteFeaturesProps> = ({
  className,
  onFeatureClick,
  customFeatures,
  showTitle = true,
}) => {
  const router = useRouter();
  const { features, isLoading, error, refetch } =
    useWebsiteFeaturesData(customFeatures);

  const handleFeatureClick = (feature: any) => {
    if (onFeatureClick) {
      onFeatureClick(feature);
    } else {
      router.push(feature.link);
    }
  };

  if (isLoading) {
    if (env.apiFallback === "loading") {
      return (
        <div className={cn("py-16 flex justify-center", className)}>
          <Loader />
        </div>
      );
    }

    return (
      <div className={cn("w-full py-7", className)}>
        <div className="container mx-auto justify-between py-2">
          {showTitle && (
            <div className="mb-8">
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-6 flex flex-col items-center animate-pulse"
              >
                <div className="w-[120px] h-[120px] bg-gray-200 rounded mb-4" />
                <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && env.apiFallback !== "mock") {
    return (
      <div className={cn("py-16", className)}>
        <div className="container mx-auto px-4 text-center">
          <ImageNotFound
            size="lg"
            variant="error"
            message="Erro ao carregar funcionalidades"
            icon="AlertCircle"
            className="mx-auto mb-6"
          />
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Não foi possível carregar as funcionalidades do painel.
          </p>
          <ButtonCustom onClick={refetch} variant="default" icon="RefreshCw">
            Tentar Novamente
          </ButtonCustom>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full py-7", className)}>
      <div className="container mx-auto justify-between py-2">
        {showTitle && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--primary-color)] mb-2">
              Gerenciamento do Website
            </h1>
            <p className="text-gray-600">
              Gerencie o conteúdo e configurações das páginas do seu website
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              onClick={() => handleFeatureClick(feature)}
              className="dashboard-website-card border border-gray-200 rounded-xl p-6 flex flex-col items-center cursor-pointer"
            >
              <div className="relative w-[120px] h-[120px] mb-4 mx-auto">
                <Image
                  src={feature.imageUrl}
                  alt={feature.title}
                  fill
                  className="dashboard-website-card-image object-contain rounded"
                />
                {feature.imageUrlHover && (
                  <Image
                    src={feature.imageUrlHover}
                    alt={feature.title}
                    fill
                    className="dashboard-website-card-image-hover object-contain rounded"
                  />
                )}
              </div>

              <h4 className="text-base sm:text-lg md:text-xl font-semibold text-inherit mb-2 text-left w-full">
                {feature.title}
              </h4>

              <p className="text-sm sm:text-base text-inherit text-left w-full">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <div className="text-center py-2 mt-4">
            <span className="text-xs text-gray-500">
              Usando dados de exemplo
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteFeatures;
