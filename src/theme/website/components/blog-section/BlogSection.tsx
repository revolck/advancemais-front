// src/theme/website/components/blog-section/BlogSection.tsx

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BlogCard } from "./components/BlogCard";
import { useBlogData } from "./hooks/useBlogData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import { BLOG_CONFIG } from "./constants";
import type { BlogSectionProps } from "./types";

/**
 * Componente BlogSection
 * Exibe posts do blog em grid responsivo
 *
 * @example
 * ```tsx
 * // Uso básico com dados da API
 * <BlogSection />
 *
 * // Com dados estáticos
 * <BlogSection
 *   fetchFromApi={false}
 *   staticData={myBlogData}
 * />
 *
 * // Com configurações customizadas
 * <BlogSection
 *   title="Últimas Notícias"
 *   buttonText="Ver todas as notícias"
 *   maxPostsDesktop={6}
 *   maxPostsMobile={3}
 * />
 * ```
 */
const BlogSection: React.FC<BlogSectionProps> = ({
  className,
  title = "Dicas para crescer profissionalmente",
  buttonText = "Ver mais dicas",
  buttonUrl = "/blog",
  maxPostsDesktop = BLOG_CONFIG.display.desktop.maxPosts,
  maxPostsMobile = BLOG_CONFIG.display.mobile.maxPosts,
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
  onPostClick,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const { data, isLoading, error, refetch } = useBlogData(
    fetchFromApi,
    staticData
  );

  // Detecta se é mobile - IGUAL AO ORIGINAL
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Executa no carregamento inicial
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Callbacks quando dados são carregados ou há erro
  useEffect(() => {
    if (data && data.length > 0 && !isLoading) {
      onDataLoaded?.(data);
    }
  }, [data, isLoading, onDataLoaded]);

  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // Determina quantos posts mostrar - IGUAL AO ORIGINAL
  const maxPosts = isMobile ? maxPostsMobile : maxPostsDesktop;
  const displayedPosts = data.slice(0, maxPosts);

  // Estado de carregamento
  if (isLoading) {
    return (
      <section
        className={cn(
          "container mx-auto py-16 flex-col lg:flex-row px-4 items-center gap-8 lg:px-4",
          className
        )}
      >
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-80" />
          {!isMobile && (
            <div className="h-12 bg-gray-200 rounded animate-pulse w-48" />
          )}
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: maxPosts }).map((_, index) => (
            <div
              key={index}
              className="bg-gray-200 rounded-lg animate-pulse"
              style={{ aspectRatio: "7/9" }}
            />
          ))}
        </div>

        {/* Mobile Button Skeleton */}
        {isMobile && (
          <div className="mt-4 flex justify-center">
            <div className="h-12 bg-gray-200 rounded animate-pulse w-48" />
          </div>
        )}
      </section>
    );
  }

  // Estado de erro
  if (error && (!data || data.length === 0)) {
    return (
      <section className={cn("container mx-auto py-16 px-4", className)}>
        <div className="text-center">
          <ImageNotFound
            size="lg"
            variant="error"
            message="Erro ao carregar posts do blog"
            icon="FileText"
            className="mx-auto mb-6"
          />
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Não foi possível carregar os posts do blog.
            {error.includes("padrão") ? " Exibindo dados de exemplo." : ""}
          </p>
          {!error.includes("padrão") && (
            <ButtonCustom onClick={refetch} variant="default" icon="RefreshCw">
              Tentar Novamente
            </ButtonCustom>
          )}
        </div>
      </section>
    );
  }

  // Estado normal com dados - LAYOUT IGUAL AO ORIGINAL
  return (
    <section
      className={cn(
        "container mx-auto py-16 flex-col lg:flex-row px-4 items-center gap-8 lg:px-4",
        className
      )}
    >
      {/* Header - IGUAL AO ORIGINAL */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl text-center font-bold text-neutral-800 lg:text-left">
          {title}
        </h2>
        {!isMobile && (
          <Link href={buttonUrl}>
            <button className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-500 transition-all duration-200 flex items-center hover:scale-105 shadow-lg">
              {buttonText} <span className="ml-2">→</span>
            </button>
          </Link>
        )}
      </div>

      {/* Grid - IGUAL AO ORIGINAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {displayedPosts.map((post, index) => (
          <div
            key={post.id}
            style={{
              // Animação stagger
              animationDelay: `${index * BLOG_CONFIG.animation.staggerDelay}ms`,
            }}
          >
            <BlogCard post={post} onPostClick={onPostClick} />
          </div>
        ))}
      </div>

      {/* Mobile Button - IGUAL AO ORIGINAL */}
      {isMobile && (
        <div className="mt-4 flex justify-center">
          <Link href={buttonUrl}>
            <button className="bg-red-600 text-white px-6 py-3 mt-5 rounded-md hover:bg-red-500 transition-all duration-200 flex items-center hover:scale-105 shadow-lg">
              {buttonText} <span className="ml-2">→</span>
            </button>
          </Link>
        </div>
      )}
    </section>
  );
};

export default BlogSection;
