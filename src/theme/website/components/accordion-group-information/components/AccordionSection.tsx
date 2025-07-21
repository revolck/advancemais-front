// src/theme/website/components/accordion-group-information/components/AccordionSection.tsx

"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ACCORDION_CONFIG } from "../constants";
import type { AccordionSectionProps } from "../types";

export const AccordionSection: React.FC<AccordionSectionProps> = ({
  data,
  index,
}) => {
  // Função para renderizar o player de vídeo
  const renderVideoPlayer = () => {
    if (!data.videoUrl) return null;

    // Para YouTube embeds
    if (
      data.videoType === "youtube" ||
      data.videoUrl.includes("youtube.com") ||
      data.videoUrl.includes("youtu.be")
    ) {
      return (
        <div className="video-container">
          <iframe
            src={data.videoUrl}
            title={`Vídeo: ${data.title}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="w-full h-full rounded-xl"
          />
        </div>
      );
    }

    // Para Vimeo embeds
    if (data.videoType === "vimeo" || data.videoUrl.includes("vimeo.com")) {
      return (
        <div className="video-container">
          <iframe
            src={data.videoUrl}
            title={`Vídeo: ${data.title}`}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="w-full h-full rounded-xl"
          />
        </div>
      );
    }

    // Para vídeos MP4 ou outras URLs
    return (
      <div className="video-container">
        <video
          controls={ACCORDION_CONFIG.video.controls}
          autoPlay={ACCORDION_CONFIG.video.autoplay}
          className="w-full h-full rounded-xl"
        >
          <source src={data.videoUrl} type="video/mp4" />
          Seu navegador não suporta a reprodução de vídeos.
        </video>
      </div>
    );
  };

  return (
    <section
      className="py-6 lg:py-16"
      style={{
        // Animação de entrada com stagger
        animationDelay: `${index * ACCORDION_CONFIG.animation.staggerDelay}ms`,
      }}
    >
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16 mx-auto">
          {/* Lado do texto e Accordion */}
          <div className="w-full lg:w-1/2 flex flex-col justify-start">
            {/* Título e Descrição */}
            <div className="mb-8">
              <h2 className="!text-4xl lg:text-4xl xl:text-5xl font-bold text-[var(--primary-color)] mb-6 leading-tight">
                {data.title}
              </h2>
            </div>

            {/* Accordion Melhorado - SEM DARK MODE */}
            <div className="w-full">
              <Accordion
                type="single"
                collapsible
                defaultValue={data.items[0]?.value || ""}
                className="w-full space-y-3"
              >
                {data.items.map((item, itemIndex) => (
                  <AccordionItem
                    key={item.value}
                    value={item.value}
                    className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden transition-all duration-200 hover:shadow-md"
                  >
                    <AccordionTrigger className="text-left text-lg lg:text-xl font-semibold text-gray-800 hover:text-[var(--primary-color)] transition-colors duration-200 px-6 py-4 hover:no-underline">
                      <span className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {itemIndex + 1}
                        </span>
                        <span className="flex-1">{item.trigger}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 leading-relaxed px-6 pb-6 pt-2">
                      <div className="pl-11">
                        <p className="text-base lg:text-lg">{item.content}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Lado do vídeo - STICKY CORRIGIDO */}
          <div
            className="w-full lg:w-1/2 lg:sticky"
            style={{
              // Corrige o problema do sticky tocando no header
              top: `${ACCORDION_CONFIG.stickyOffset}px`,
            }}
          >
            <div className="relative">
              {/* Container do vídeo com sombra e bordas melhoradas */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
                {renderVideoPlayer()}

                {/* Overlay sutil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Decoração de fundo */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl -z-10 blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
