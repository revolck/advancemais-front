// src/theme/website/components/contact-form-section/ContactFormSection.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ContactForm } from "./components/ContactForm";
import { useContactConfig } from "./hooks/useContactConfig";
import { toastCustom } from "@/components/ui/custom/toast";
import type {
  ContactFormSectionProps,
  ContactSubmitApiResponse,
} from "./types";

/**
 * Componente ContactFormSection
 * Seção de formulário de contato com imagem e formulário lado a lado
 *
 * @example
 * ```tsx
 * // Uso básico
 * <ContactFormSection />
 *
 * // Com configuração estática
 * <ContactFormSection
 *   fetchFromApi={false}
 *   staticData={myConfig}
 * />
 * ```
 */
const ContactFormSection: React.FC<ContactFormSectionProps> = ({
  className,
  fetchFromApi = true,
  staticData,
  onSubmitSuccess,
  onSubmitError,
  onConfigLoaded,
}) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasImageError, setHasImageError] = useState(false);

  const { config, isLoading, error } = useContactConfig(
    fetchFromApi,
    staticData
  );

  // Handlers de imagem
  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setHasImageError(true);
  };

  // Handlers do formulário
  const handleSubmitSuccess = (data: ContactSubmitApiResponse) => {
    toastCustom.success("Mensagem enviada com sucesso!");
    onSubmitSuccess?.(data);
  };

  const handleSubmitError = (error: string) => {
    toastCustom.error(error);
    onSubmitError?.(error);
  };

  // Callback quando configuração carrega
  React.useEffect(() => {
    if (config && !isLoading) {
      onConfigLoaded?.(config);
    }
  }, [config, isLoading, onConfigLoaded]);

  // Estado de carregamento
  if (isLoading) {
    return (
      <section className={cn("container mx-auto py-16 px-4", className)}>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Skeleton da imagem */}
          <div className="w-full lg:w-1/2">
            <div className="aspect-[3/2] bg-gray-200 animate-pulse rounded-lg" />
          </div>

          {/* Skeleton do formulário */}
          <div className="w-full lg:w-1/2">
            <div className="bg-gray-50 rounded-lg p-8 space-y-6">
              <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto w-48" />
              <div className="h-1 bg-gray-200 rounded animate-pulse mx-auto w-12" />
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-200 rounded animate-pulse"
                  />
                ))}
                <div className="h-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 bg-gray-200 rounded animate-pulse w-32 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("container mx-auto py-16 px-4", className)}>
      <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-8">
        {/* Imagem no lado esquerdo */}
        <div className="lg:w-1/2 flex justify-center relative">
          {/* Loading State */}
          {isImageLoading && (
            <div className="aspect-[3/2] w-full max-w-[600px] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error State */}
          {hasImageError && (
            <ImageNotFound
              size="full"
              variant="muted"
              aspectRatio="landscape"
              message="Imagem indisponível"
              icon="ImageOff"
              className="aspect-[3/2] w-full max-w-[600px] rounded-lg shadow-lg"
              showMessage={true}
            />
          )}

          {/* Main Image */}
          {!hasImageError && (
            <Image
              src={config.imageUrl}
              alt={config.imageAlt}
              width={600}
              height={400}
              className={`
                rounded-lg shadow-lg object-cover w-full max-w-[600px]
                transition-opacity duration-500
                ${isImageLoading ? "opacity-0 absolute inset-0" : "opacity-100"}
              `}
              style={{ aspectRatio: "3/2" }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={true}
              quality={90}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}
        </div>

        {/* Formulário no lado direito */}
        <div className="lg:w-1/2 w-full">
          <ContactForm
            config={config}
            onSuccess={handleSubmitSuccess}
            onError={handleSubmitError}
          />
        </div>
      </div>

      {/* Indicador de erro sutil se houver fallback */}
      {error && (
        <div className="text-center mt-4">
          <span className="text-xs text-gray-500">Configuração padrão</span>
        </div>
      )}
    </section>
  );
};

export default ContactFormSection;
