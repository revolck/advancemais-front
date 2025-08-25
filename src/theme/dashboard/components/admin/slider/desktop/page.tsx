"use client";

import React from "react";
import { SliderList } from "@/components/ui/custom";
import type { SliderItem } from "@/components/ui/custom/slider-list/types";

export default function SliderDesktopPage() {
  const handleSlidersChange = (sliders: SliderItem[]) => {
    console.log("Sliders desktop atualizados:", sliders);
  };

  const handleError = (error: string) => {
    console.error("Erro na gestão de sliders desktop:", error);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Sliders Desktop
        </h1>
        <p className="text-muted-foreground">
          Gerencie os sliders que aparecem na versão desktop do site. Imagens
          otimizadas para telas grandes (1200px+).
        </p>
      </div>

      <SliderList
        deviceType="desktop"
        maxSliders={4}
        allowReorder={true}
        onSlidersChange={handleSlidersChange}
        onError={handleError}
        className="w-full"
      />

      <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border/30">
        <h3 className="font-medium text-foreground mb-2">
          Configurações Desktop
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Resolução recomendada: 1920x800px ou superior</li>
          <li>• Formato: JPEG, PNG ou WebP</li>
          <li>• Tamanho máximo: 5MB por imagem</li>
          <li>• Proporção ideal: 16:9 para melhor visualização</li>
        </ul>
      </div>
    </div>
  );
}
