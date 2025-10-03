import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export interface StatisticCard {
  icon: LucideIcon;
  iconBg: string;
  value: string | number;
  label: string;
  info?: ReactNode;
}

export interface CardsStatisticsProps {
  cards: StatisticCard[];
  className?: string;
  containerClassName?: string;
  gridClassName?: string;
  showBadges?: boolean;
}

export interface StatisticCardProps {
  card: StatisticCard;
  className?: string;
  showBadge?: boolean;
}
