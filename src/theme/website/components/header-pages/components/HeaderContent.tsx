// src/theme/website/components/header-pages/components/HeaderContent.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ChevronRight, Home } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePathname } from "next/navigation";
import { generateBreadcrumbs, isExternalUrl } from "../utils";
import { HEADER_CONFIG } from "../constants";
import type { HeaderPageData } from "../types";

interface HeaderContentProps {
  data: HeaderPageData;
}

export const HeaderContent: React.FC<HeaderContentProps> = ({ data }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const isMobile = useIsMobile();
  const pathname = usePathname();

  const breadcrumbs = generateBreadcrumbs(pathname);
  const isExternal = isExternalUrl(data.buttonUrl);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Componente de Breadcrumbs
  const BreadcrumbsComponent = () => (
    <nav className="header-pages-breadcrumbs">
      <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <li>
          <Link
            href="/"
            className="hover:text-[var(--primary-color)] transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            <li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li>
              {crumb.isActive ? (
                <span className="text-[var(--primary-color)] font-medium">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-[var(--primary-color)] transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );

  // Layout Mobile
  if (isMobile) {
    return (
      <section className="container mx-auto py-10 flex flex-col items-center text-center">
        <BreadcrumbsComponent />

        <h3 className="header-pages-subtitle mb-1 text-red-500 uppercase font-semibold tracking-wider">
          {data.subtitle}
        </h3>

        <h2 className="header-pages-main-title-mobile text-[var(--primary-color)] mb-4">
          {data.title}
        </h2>

        <p className="header-pages-description text-gray-600 mb-6">
          {data.description}
        </p>

        {isExternal ? (
          <a href={data.buttonUrl} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {data.buttonText}
            </Button>
          </a>
        ) : (
          <Link href={data.buttonUrl}>
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {data.buttonText}
            </Button>
          </Link>
        )}
      </section>
    );
  }

  // Layout Desktop
  return (
    <section className="header-pages-px-responsive container mx-auto py-16 flex flex-col lg:flex-row items-center gap-8">
      <div className="w-full flex flex-col lg:flex-row items-start justify-between">
        {/* Texto principal */}
        <div className="text-center lg:text-left" style={{ width: "43%" }}>
          <h3 className="header-pages-subtitle !mb-0 text-red-500 uppercase font-semibold tracking-wider">
            {data.subtitle}
          </h3>

          <h2 className="header-pages-main-title text-[var(--primary-color)] mb-4">
            {data.title}
          </h2>

          <p className="header-pages-description text-gray-600 mb-6">
            {data.description}
          </p>

          {isExternal ? (
            <a href={data.buttonUrl} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {data.buttonText}
              </Button>
            </a>
          ) : (
            <Link href={data.buttonUrl}>
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {data.buttonText}
              </Button>
            </Link>
          )}
        </div>

        {/* Imagem e Breadcrumbs */}
        <div className="header-pages-container">
          <BreadcrumbsComponent />

          {/* Loading State - CORRIGIDO: Tamanho fixo */}
          {isLoading && (
            <div className="header-pages-image-loading">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error State - CORRIGIDO: Tamanho fixo */}
          {hasError && (
            <div className="header-pages-image-error">
              <ImageNotFound
                size="full"
                variant="muted"
                message="Imagem indisponível"
                icon="ImageOff"
                className="w-full h-full rounded-lg"
                showMessage={true}
              />
            </div>
          )}

          {/* Main Image - CORRIGIDO: Tamanho fixo 810x360 */}
          {!hasError && (
            <Image
              src={data.imageUrl}
              alt={data.imageAlt}
              width={810} // CORRIGIDO: Tamanho fixo
              height={360} // CORRIGIDO: Tamanho fixo
              className={`
                header-pages-image
                transition-opacity duration-500
                ${isLoading ? "opacity-0 absolute" : "opacity-100"}
              `}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={HEADER_CONFIG.image.priority}
              quality={HEADER_CONFIG.image.quality}
              style={{
                width: "810px",
                height: "360px",
                objectFit: "cover",
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
};
