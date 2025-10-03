"use client";

import { cn } from "@/lib/utils";
import { CardsStatisticsProps, StatisticCardProps } from "./types";

const StatisticCard = ({
  card,
  className,
  showBadge = true,
}: StatisticCardProps) => {
  const { icon: Icon, iconBg, value, label, info } = card;

  return (
    <div
      className={cn(
        "bg-gray-100/20 rounded-lg border border-gray-200/50 p-6",
        className
      )}
    >
      {/* Icon and Badge Row */}
      <div className="flex items-center justify-between mb-4">
        {/* Icon */}
        <div
          className={cn(
            `rounded-lg flex items-center justify-center size-10 border border-opacity-20`,
            iconBg
          )}
        >
          <Icon className="size-5" />
        </div>

        {/* Info Badge */}
        {showBadge && info && <div>{info}</div>}
      </div>

      {/* Value & Label */}
      <div className="space-y-1">
        <h3 className="!mb-0">{value}</h3>
        <p className="!text-sm">{label}</p>
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
