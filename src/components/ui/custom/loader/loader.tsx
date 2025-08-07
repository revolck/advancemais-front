"use client";

import React from "react";
import { LoaderProps } from "./types";

/**
 * Palavras que aparecem na animação
 */
const LOADER_WORDS = [
  "oportunidades",
  "talentos",
  "resultados",
  "conhecimento",
  "futuro",
  "crescimento",
  "transformação",
];

/**
 * Componente Loader animado com "Juntos, somos +"
 * - Centralizado na tela
 * - Fundo preto com overlay
 * - Animação de palavras
 */
export function Loader({
  showOverlay = true,
  fullScreen = true,
  className = "",
  variant = "default",
}: LoaderProps) {
  const overlayClasses = showOverlay
    ? "fixed inset-0 bg-white bg-opacity-90 z-50"
    : "";

  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center z-50"
    : "flex items-center justify-center p-8";

  const loaderVariantClasses = {
    default: "adv-loader-card",
    minimal: "adv-loader-card-minimal",
    compact: "adv-loader-card-compact",
  };

  return (
    <div className={`${overlayClasses} ${containerClasses} ${className}`}>
      <div className={loaderVariantClasses[variant]}>
        <div className="adv-loader">
          <p>Juntos, somos + </p>
          <div className="adv-loader-words">
            {LOADER_WORDS.map((word, index) => (
              <span key={`${word}-${index}`} className="adv-loader-word">
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loader simples para uso interno/loading pages
 */
export function SimpleLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div className="adv-loader-card">
        <div className="adv-loader">
          <p>Juntos, somos + </p>
          <div className="adv-loader-words">
            {LOADER_WORDS.map((word, index) => (
              <span key={`${word}-${index}`} className="adv-loader-word">
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loader;
