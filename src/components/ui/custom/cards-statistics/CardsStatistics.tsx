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
        "rounded-xl p-6 h-full transition-all",
        cardBg || "bg-white",
        className
      )}
    >
      <div className="flex items-center justify-between h-full">
        {/* Value & Label - Left Side */}
        <div className="flex-1">
          <div className="space-y-1">
            <h3 className="text-3xl font-bold text-gray-900 !mb-0">
              {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
            </h3>
            <p className="text-sm text-gray-600 font-medium">{label}</p>
          </div>
          {/* Info Badge */}
          {showBadge && info && <div className="mt-3">{info}</div>}
        </div>

        {/* Icon - Right Side */}
        <div
          className={cn(
            "rounded-xl flex items-center justify-center size-14 flex-shrink-0",
            iconBg
          )}
        >
          <Icon className="size-7" />
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
            gridClassName
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
