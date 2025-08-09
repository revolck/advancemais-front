"use client";

import React from "react";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";

interface SliderErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const SliderError: React.FC<SliderErrorProps> = ({
  message = "Erro ao carregar slides",
  onRetry,
}) => {
  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: 16 / 9 }}
    >
      {/* Usando o novo ImageNotFound */}
      <ImageNotFound
        size="full"
        variant="error"
        aspectRatio="landscape"
        message={message}
        icon="AlertCircle"
        className="h-full"
        showMessage={true}
      />

      {/* Botão de retry sobreposto */}
      {onRetry && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <ButtonCustom
            onClick={onRetry}
            variant="default"
            icon="RefreshCw"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            Tentar Novamente
          </ButtonCustom>
        </div>
      )}
    </div>
  );
};
