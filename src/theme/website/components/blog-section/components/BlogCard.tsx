// src/theme/website/components/blog-section/components/BlogCard.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { BLOG_CONFIG } from "../constants";
import type { BlogCardProps } from "../types";

export const BlogCard: React.FC<BlogCardProps> = ({ post, onPostClick }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleClick = () => {
    onPostClick?.(post);
  };

  return (
    <Link
      href={post.link}
      onClick={handleClick}
      className="bg-gray-300 shadow-lg rounded-lg overflow-hidden relative group hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
    >
      <div className="relative w-full aspect-[7/9] bg-gray-200">
        {/* Loading State */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center z-10">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <ImageNotFound
            size="full"
            variant="muted"
            aspectRatio="portrait"
            message="Imagem do post indisponível"
            icon="FileText"
            className="absolute inset-0"
            showMessage={true}
          />
        )}

        {/* Main Image */}
        {!hasError && (
          <Image
            src={post.image}
            alt={post.title}
            fill
            className={`
              object-cover w-full h-full
              transition-all duration-500
              ${isLoading ? "opacity-0" : "opacity-100"}
              group-hover:scale-105
            `}
            onLoad={handleImageLoad}
            onError={handleImageError}
            quality={BLOG_CONFIG.image.quality}
            sizes={BLOG_CONFIG.image.sizes}
          />
        )}

        {/* Category Badge (opcional) */}
        {!hasError && post.category && (
          <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
            {post.category}
          </div>
        )}

        {/* Read Time Badge (opcional) */}
        {!hasError && post.readTime && (
          <div className="absolute top-3 right-3 bg-white/90 text-gray-800 text-xs px-2 py-1 rounded-md backdrop-blur-sm">
            {post.readTime}
          </div>
        )}

        {/* Título - IGUAL AO ORIGINAL */}
        {!hasError && (
          <div className="absolute bottom-0 left-0 right-0 bg-white p-4 h-[130px] justify-center items-center w-11/12 mx-auto mb-5 rounded-lg shadow-lg">
            <h3 className="text-neutral-800 font-medium px-4 py-2 text-lg leading-tight line-clamp-4">
              {post.title}
            </h3>
          </div>
        )}

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </Link>
  );
};
