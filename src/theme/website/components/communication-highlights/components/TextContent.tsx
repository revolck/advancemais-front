"use client";

import React from "react";
import type { TextContentProps } from "../types";

export const TextContent: React.FC<TextContentProps> = ({ content }) => {
  const renderParagraphWithHighlight = (
    text: string,
    highlight?: string,
    citation?: string
  ) => {
    if (!highlight) {
      return text;
    }

    const parts = text.split(highlight);
    if (parts.length === 1) {
      return text;
    }

    return (
      <>
        {parts[0]}
        <span className="font-bold text-[var(--primary-color)]">
          {highlight}
        </span>
        {citation && (
          <span className="italic text-gray-600 ml-1">{citation}</span>
        )}
        {parts[1]}
      </>
    );
  };

  return (
    <div className="w-full">
      <div className="text-left mb-10">
        {/* Título Principal */}
        <h2 className="!text-4xl lg:text-4xl font-extrabold !mb-6 text-[var(--primary-color)] leading-tight">
          {content.title}
        </h2>

        {/* Parágrafos de Conteúdo */}
        <div className="space-y-4">
          {content.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="text-gray-700 leading-relaxed !text-justify lg:text-left"
            >
              {index === 0
                ? renderParagraphWithHighlight(
                    paragraph,
                    content.highlightText,
                    content.citation
                  )
                : paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
