"use client";

import React from "react";
import { SliderList, useSliderList } from "@/components/ui/custom";

export default function SliderMobilePage() {
  const { sliders, status, canAddMore, canRemove, refreshSliders } =
    useSliderList({
      maxSliders: 4,
      autoLoad: true,
      onSlidersChange: (sliders) => {
        console.log("Sliders mobile atualizados:", sliders.length);
      },
      onError: (error) => {
        console.error("Erro na gestão de sliders mobile:", error);
      },
    });

  const isLoading = status === "loading";
  const publishedCount = sliders.filter((s) => s.isPublished).length;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Sliders Mobile/Tablet
            </h1>
            <p className="text-muted-foreground">
              Gerencie os sliders para dispositivos móveis e tablets (768px ou
              menos).
            </p>
          </div>

          <div className="text-right text-sm text-muted-foreground">
            <div>{sliders.length}/4 sliders</div>
            <div>{publishedCount} publicados</div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  isLoading ? "bg-yellow-500" : "bg-green-500"
                }`}
              ></span>
              {isLoading ? "Carregando..." : "Sincronizado"}
            </div>
          </div>
        </div>
      </div>

      <SliderList
        deviceType="tablet-mobile"
        maxSliders={4}
        allowReorder={true}
        className="w-full"
      />

      <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border/30">
        <h3 className="font-medium text-foreground mb-2">
          Configurações Mobile/Tablet
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <h4 className="font-medium text-foreground mb-1">
              Especificações Técnicas
            </h4>
            <ul className="space-y-1">
              <li>• Resolução recomendada: 768x400px</li>
              <li>• Formato: JPEG, PNG ou WebP</li>
              <li>• Tamanho máximo: 5MB por imagem</li>
              <li>• Proporção ideal: 16:9</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">Otimizações</h4>
            <ul className="space-y-1">
              <li>• Carregamento progressivo</li>
              <li>• Suporte a gestos touch</li>
              <li>• Auto-play responsivo</li>
              <li>• Compressão automática</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
