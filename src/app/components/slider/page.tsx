"use client";

import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { usePageTitle } from "@/hooks/usePageTitle";
import Slider from "@/theme/website/slider";
import { SliderAdvanced } from "@/theme/website/slider";
import { SliderWithProgress } from "@/theme/website/slider";
import { SliderGallery } from "@/theme/website/slider";
import { SliderTestimonials } from "@/theme/website/slider";

export default function HomePage() {
  usePageTitle("Início");

  return (
    <div className="min-h-screen">
      {/* Slider Hero - Versão básica e funcional */}
      <Slider />

      {/* Resto do conteúdo */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <PageWrapper maxWidth="xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-gray-100">
            Funcionalidades Principais
          </h2>
        </PageWrapper>
      </section>

      <SliderAdvanced
        enableKeyboard={true} // Navegação por teclado
        showPlayPause={true} // Botão play/pause
        enableIntersectionPause={true} // Pausa quando não visível
        config={{
          autoplay: {
            enabled: true,
            delay: 4000, // 4 segundos
          },
          loop: true,
        }}
        className="shadow-xl"
      />

      <section className="py-20">
        <PageWrapper maxWidth="xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Slider Avançado</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Controles Extras:
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>✅ Botão Play/Pause no canto superior direito</li>
                  <li>✅ Navegação por teclado (←/→/Home/End/Espaço)</li>
                  <li>✅ Pausa automática quando não está visível</li>
                  <li>✅ Indicador de status no canto superior esquerdo</li>
                  <li>✅ Configuração personalizada de autoplay</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Como usar:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                  {`import { SliderAdvanced } from "@/theme/website/slider";

<SliderAdvanced 
  showPlayPause={true}
  enableKeyboard={true}
  config={{
    autoplay: { enabled: true, delay: 4000 }
  }}
/>`}
                </pre>
              </div>
            </div>
          </div>
        </PageWrapper>
      </section>

      <SliderWithProgress
        showNumbers={true} // Mostra contador (1/3)
        progressPosition="bottom" // Barra na parte inferior
        className="border-b-4 border-blue-500"
      />

      <section className="py-20">
        <PageWrapper maxWidth="xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Slider com Progresso</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-xl font-semibold mb-4">Características:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>✅ Barra de progresso animada</li>
                  <li>✅ Contador de slides (1/3, 2/3, etc.)</li>
                  <li>✅ Progresso pode ficar no topo ou embaixo</li>
                  <li>✅ Visual moderno e profissional</li>
                  <li>✅ Ideal para apresentações</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Variações:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                  {`// Progresso no topo
<SliderWithProgress 
  progressPosition="top"
/>

// Com contador
<SliderWithProgress 
  showNumbers={true}
/>

// Simples
<SliderWithProgress />`}
                </pre>
              </div>
            </div>
          </div>
        </PageWrapper>
      </section>

      <SliderGallery />
      <section className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-4">
          Características da Galeria:
        </h3>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Sem Autoplay</h4>
            <p className="text-sm text-gray-600">
              Usuário controla totalmente a navegação
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Drag Free</h4>
            <p className="text-sm text-gray-600">
              Navegação livre por arrastar
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Sem Loop</h4>
            <p className="text-sm text-gray-600">Para para no último slide</p>
          </div>
        </div>
      </section>

      <SliderTestimonials />

      <section className="mt-12 grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Por que este slider?</h3>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Autoplay mais lento para leitura</li>
            <li>✅ Barra de progresso para mostrar tempo</li>
            <li>✅ Contador para orientar o usuário</li>
            <li>✅ Background diferenciado</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Código usado:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm">
            {`import { SliderTestimonials } from "@/theme/website/slider";

<SliderTestimonials />`}
          </pre>
        </div>
      </section>
    </div>
  );
}
