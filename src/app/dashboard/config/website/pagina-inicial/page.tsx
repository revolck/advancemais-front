"use client";

import React from "react";
import {
  VerticalTabs,
  type VerticalTabItem,
} from "@/components/ui/custom";
import SobreForm from "./sobre/SobreForm";

/**
 * Página principal de configuração da página inicial
 * Usa VerticalTabs para organizar as diferentes seções
 */
export default function PaginaInicialPage() {

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
                <h3 className="text-lg font-semibold mb-0">Sliders Desktop</h3>
              </div>
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
          <SobreForm />
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
          size="sm"
          withAnimation={true}
          showIndicator={true}
          tabsWidth="md"
          classNames={{
            root: "h-full",
            contentWrapper: "h-full overflow-hidden",
            tabsContent: "h-full overflow-auto p-6",
            tabsList: "p-2",
            tabsTrigger: "mb-1",
          }}
        />
      </div>
    </div>
  );
}