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
  // Optional animation delay (removed from inline style to avoid parser edge-cases)
  // Normaliza URLs de vídeo para formato de incorporação (embed)
  const normalizeVideoUrl = (raw: string): string => {
    try {
      const url = new URL(raw);
      const host = url.hostname.replace(/^www\./, "");

      // YouTube padrões aceitos: watch?v=, youtu.be/<id>, /shorts/<id>, já embed
      if (host.includes("youtube.com") || host.includes("youtu.be")) {
        // Já é embed
        if (url.pathname.startsWith("/embed/")) return raw;

        // youtu.be/<id>
        if (host === "youtu.be") {
          const id = url.pathname.split("/").filter(Boolean)[0];
          return id ? `https://www.youtube.com/embed/${id}?rel=0` : raw;
        }

        // /watch?v=<id>
        const v = url.searchParams.get("v");
        if (v) return `https://www.youtube.com/embed/${v}?rel=0`;

        // /shorts/<id>
        if (url.pathname.startsWith("/shorts/")) {
          const id = url.pathname.split("/").filter(Boolean)[1];
          if (id) return `https://www.youtube.com/embed/${id}?rel=0`;
        }

        // Fallback: mantém URL original (pode falhar em iframe)
        return raw;
      }

      // Vimeo: vimeo.com/<id> -> player.vimeo.com/video/<id>
      if (host.includes("vimeo.com")) {
        if (host === "player.vimeo.com") return raw;
        const id = url.pathname.split("/").filter(Boolean)[0];
        return id ? `https://player.vimeo.com/video/${id}` : raw;
      }

      return raw;
    } catch {
      return raw;
    }
  };
  const renderVideoPlayer = () => {
    if (!data.videoUrl) return null;
    if (
      data.videoType === "youtube" ||
      data.videoUrl.includes("youtube.com") ||
      data.videoUrl.includes("youtu.be")
    ) {
      const src = normalizeVideoUrl(data.videoUrl);
      return (
        <iframe
          src={src}
          title={`Vídeo: ${data.title}`}
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ transform: "scale(1.03)", transformOrigin: "center" }}
        />
      );
    }
    if (data.videoType === "vimeo" || data.videoUrl.includes("vimeo.com")) {
      const src = normalizeVideoUrl(data.videoUrl);
      return (
        <iframe
          src={src}
          title={`Vídeo: ${data.title}`}
          frameBorder={0}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ transform: "scale(1.03)", transformOrigin: "center" }}
        />
      );
    }
    return (
      <video
        controls
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: "cover" }}
      >
        <source src={data.videoUrl} type="video/mp4" />
        Seu navegador não suporta a reprodução de vídeos.
      </video>
    );
  };
  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-0 sm:px-6">
        <div className="flex flex-col lg:flex-row items-start gap-8 sm:gap-10 lg:gap-16 mx-auto">
          {/* Título, Descrição e Accordion (esquerda) */}
          <div className="w-full lg:w-1/2 flex flex-col justify-start relative z-10 pb-8">
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-bold text-[var(--primary-color)] mb-3 sm:mb-4 leading-tight text-center lg:text-left">
              {data.title}
            </h2>
            {data.description && (
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 text-center lg:text-left">
                {data.description}
              </p>
            )}
            {/* Accordion com Missão, Visão, Valores */}
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
                  className="group border border-gray-200 rounded-xl bg-white overflow-hidden transition-transform duration-200 hover:-translate-y-[1px] hover:border-[var(--primary-color)]/40 data-[state=open]:border-[var(--primary-color)]/50"
                >
                  <AccordionTrigger className="text-left text-base sm:text-lg lg:text-xl font-semibold text-gray-800 hover:text-[var(--primary-color)] transition-colors duration-200 px-4 sm:px-6 py-4 hover:no-underline">
                    <span className="flex items-center gap-3 w-full">
                      <span className="hidden sm:flex flex-shrink-0 w-8 h-8 bg-[var(--primary-color)] text-white rounded-full items-center justify-center text-sm font-bold">
                        {itemIndex + 1}
                      </span>
                      <span className="flex-1">{item.trigger}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 leading-relaxed px-4 sm:px-6 pb-5 pt-2">
                    <div className="pl-0 sm:pl-11">
                      <p className="text-sm sm:text-base lg:text-lg">{item.content}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          {/* Vídeo (direita) */}
          {data.videoUrl && (
            <div className="w-full lg:w-1/2 lg:sticky z-0" style={{ top: `${ACCORDION_CONFIG.stickyOffset}px` }}>
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video">
                {renderVideoPlayer()}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
