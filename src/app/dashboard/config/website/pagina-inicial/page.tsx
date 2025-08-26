"use client";

import React from "react";
import {
  VerticalTabs,
  SliderList,
  type VerticalTabItem,
} from "@/components/ui/custom";
import type { SliderItem } from "@/components/ui/custom/slider-list/types";

/**
 * Página principal de configuração da página inicial
 * Usa VerticalTabs para organizar as diferentes seções
 */
export default function PaginaInicialPage() {
  // Handlers para slider desktop
  const handleDesktopSlidersChange = (sliders: SliderItem[]) => {
    console.log("Sliders desktop atualizados:", sliders);
  };

  const handleDesktopError = (error: string) => {
    console.error("Erro nos sliders desktop:", error);
  };

  // Handlers para slider mobile
  const handleMobileSlidersChange = (sliders: SliderItem[]) => {
    console.log("Sliders mobile atualizados:", sliders);
  };

  const handleMobileError = (error: string) => {
    console.error("Erro nos sliders mobile:", error);
  };

  const items: VerticalTabItem[] = [
    {
      value: "slider",
      label: "Slider",
      icon: "Images",
      submenu: [
        {
          value: "slider-desktop",
          label: "Desktop",
          icon: "Monitor",
          content: (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Sliders Desktop</h3>
                <p className="text-muted-foreground mb-4">
                  Gerencie os sliders que aparecem na versão desktop do site.
                  Resolução recomendada: 1920x800px.
                </p>
              </div>

              <SliderList
                deviceType="desktop"
                maxSliders={4}
                allowReorder={true}
                onSlidersChange={handleDesktopSlidersChange}
                onError={handleDesktopError}
                className="w-full"
              />
            </div>
          ),
        },
        {
          value: "slider-mobile",
          label: "Tablet/Mobile",
          icon: "Smartphone",
          content: (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Sliders Mobile/Tablet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Gerencie os sliders para dispositivos móveis e tablets.
                  Resolução recomendada: 768x400px.
                </p>
              </div>

              <SliderList
                deviceType="tablet-mobile"
                maxSliders={4}
                allowReorder={true}
                onSlidersChange={handleMobileSlidersChange}
                onError={handleMobileError}
                className="w-full"
              />

              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/30">
                <h4 className="font-medium text-foreground mb-2">
                  Especificações Mobile/Tablet
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <h5 className="font-medium text-foreground mb-1">
                      Técnicas
                    </h5>
                    <ul className="space-y-1">
                      <li>• Resolução: 768x400px</li>
                      <li>• Formato: JPEG, PNG, WebP</li>
                      <li>• Máximo: 5MB</li>
                      <li>• Proporção: 16:9</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-foreground mb-1">
                      Otimizações
                    </h5>
                    <ul className="space-y-1">
                      <li>• Touch gestures</li>
                      <li>• Auto-play adaptativo</li>
                      <li>• Carregamento otimizado</li>
                      <li>• Compressão automática</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      value: "sobre",
      label: "Sobre",
      icon: "Info",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Seção Sobre</h3>
            <p className="text-muted-foreground mb-4">
              Configure o conteúdo da seção "Sobre Nós" da página inicial.
            </p>
          </div>

          {/* Placeholder para SobreForm quando estiver disponível */}
          <div className="p-6 border-2 border-dashed border-border/50 rounded-lg text-center">
            <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
              <span className="text-muted-foreground text-xl">📝</span>
            </div>
            <h4 className="font-medium text-foreground mb-2">
              Formulário de Configuração
            </h4>
            <p className="text-sm text-muted-foreground">
              O componente SobreForm será implementado aqui para gerenciar
              título, descrição, imagem e botão de call-to-action.
            </p>
          </div>
        </div>
      ),
    },
    {
      value: "banners",
      label: "Banners",
      icon: "Image",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Banners Promocionais</h3>
            <p className="text-muted-foreground mb-4">
              Gerencie os banners promocionais que aparecem na página inicial.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="p-6 border-2 border-dashed border-border/50 rounded-lg text-center">
              <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
                <span className="text-muted-foreground text-xl">🎨</span>
              </div>
              <h4 className="font-medium text-foreground mb-2">
                Banner Principal
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Configure o banner de destaque da página inicial
              </p>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors">
                Configurar Banner
              </button>
            </div>

            <div className="p-6 border-2 border-dashed border-border/50 rounded-lg text-center">
              <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
                <span className="text-muted-foreground text-xl">📢</span>
              </div>
              <h4 className="font-medium text-foreground mb-2">
                Banners Secundários
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Gerencie banners adicionais e promoções
              </p>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/90 transition-colors">
                Gerenciar Banners
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      value: "empresarial",
      label: "Empresarial",
      icon: "Briefcase",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Seção Empresarial</h3>
            <p className="text-muted-foreground mb-4">
              Configure o conteúdo da seção empresarial e institucional.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="p-6 border border-border rounded-lg">
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="text-blue-600">🏢</span>
                Informações da Empresa
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Atualize missão, visão, valores e história da empresa
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                Editar Informações
              </button>
            </div>

            <div className="p-6 border border-border rounded-lg">
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="text-green-600">📊</span>
                Estatísticas e Números
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Configure contadores e métricas de destaque
              </p>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors">
                Configurar Estatísticas
              </button>
            </div>

            <div className="p-6 border border-border rounded-lg">
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="text-purple-600">🎯</span>
                Call-to-Actions
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Gerencie botões de ação e links importantes
              </p>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition-colors">
                Gerenciar CTAs
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 h-full min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Conteúdo principal com VerticalTabs */}
      <div className="flex-1 min-h-0">
        <VerticalTabs
          items={items}
          defaultValue="slider-desktop"
          variant="spacious"
          size="md"
          withAnimation={true}
          showIndicator={true}
          tabsWidth="md"
          classNames={{
            root: "h-full",
            contentWrapper: "h-full overflow-hidden",
            tabsContent: "h-full overflow-auto p-8",
            tabsList: "bg-gray-50/40 rounded-2xl p-2",
            tabsTrigger: "mb-1",
          }}
        />
      </div>
    </div>
  );
}
