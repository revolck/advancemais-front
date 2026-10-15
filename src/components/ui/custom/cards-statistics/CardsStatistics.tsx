"use client";

import { cn } from "@/lib/utils";
import { CardsStatisticsProps, StatisticCardProps } from "./types";

const StatisticCard = ({
  card,
  className,
  showBadge = true,
}: StatisticCardProps) => {
  const { icon: Icon, iconBg, value, label, info, cardBg } = card;

  return (
    <div
      className={cn(
        "rounded-xl p-6 h-full transition-all max-md:p-4",
        cardBg || "bg-white",
        className
      )}
    >
      {/* Celular: ícone em cima e número embaixo, para caber 2 cards por linha */}
      <div className="flex items-center justify-between h-full max-md:flex-col-reverse max-md:items-start max-md:justify-end max-md:gap-3">
        {/* Value & Label - Left Side */}
        <div className="flex-1">
          <div className="space-y-1">
            <h3 className="text-3xl font-bold text-gray-900 !mb-0 max-md:!text-2xl max-md:break-words">
              {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
            </h3>
            <p className="text-sm text-gray-600 font-medium max-md:!text-xs max-md:leading-snug">{label}</p>
          </div>
          {/* Info Badge */}
          {showBadge && info && <div className="mt-3">{info}</div>}
        </div>

        {/* Icon - Right Side */}
        <div
          className={cn(
            "rounded-xl flex items-center justify-center size-14 flex-shrink-0 max-md:size-10",
            iconBg
          )}
        >
          <Icon className="size-7 max-md:size-5" />
        </div>
      </div>
    </div>
  );
};

export const CardsStatistics = ({
  cards,
  className,
  containerClassName,
  gridClassName,
  showBadges = true,
}: CardsStatisticsProps) => {
  return (
    <div className={cn("w-full", containerClassName)}>
      <div className={cn("w-full", className)}>
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
            gridClassName,
            // Celular: 2 por linha (1 por linha ocupava a tela toda)
            "max-md:grid-cols-2 max-md:gap-3"
          )}
        >
          {cards.map((card, index) => (
            <StatisticCard key={index} card={card} showBadge={showBadges} />
          ))}
        </div>
      </div>
    </div>
  );
};
