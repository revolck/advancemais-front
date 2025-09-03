"use client";

import React from "react";
import { Icon } from "@/components/ui/custom/Icons";
import type { AdvantageCardProps } from "../types";

export const AdvantageCard: React.FC<AdvantageCardProps> = ({
  card,
  index,
}) => {
  return (
    <div
      className="aboutAdvantagesCard flex flex-col items-center bg-[var(--primary-color)] text-white rounded-lg p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
      style={{
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <div className="aboutAdvantagesIconWrapper relative mb-4">
        <div className="bg-[var(--secondary-color)] p-4 rounded-full flex items-center justify-center w-16 h-16">
          <Icon name={card.icon as any} size={24} className="text-white" />
        </div>
      </div>
      <h3 className="!text-lg font-bold text-white mb-2 text-center">
        {card.title}
      </h3>
      <p className="!text-neutral-300 text-center !text-sm leading-relaxed">
        {card.description}
      </p>
    </div>
  );
};
