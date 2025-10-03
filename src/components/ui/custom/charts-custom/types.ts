import { ReactNode } from "react";

export type ChartType = "pie" | "radial" | "line" | "bar" | "area";

export interface ChartData {
  [key: string]: string | number;
}

export interface ChartConfig {
  [k: string]: {
    label?: ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> }
  );
}

export interface ChartsCustomProps {
  type: ChartType;
  data: ChartData[];
  config: ChartConfig;
  title?: string;
  description?: string;
  className?: string;
  containerClassName?: string;
  showTooltip?: boolean;
  showLegend?: boolean;
  height?: string | number;
  width?: string | number;
  // Props específicas para cada tipo de gráfico
  dataKey?: string;
  xAxisKey?: string;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  cornerRadius?: number;
  strokeWidth?: number;
  showDots?: boolean;
  showArea?: boolean;
  barWidth?: number;
  orientation?: "horizontal" | "vertical";
  fillOpacity?: number;
}

export interface PieChartProps extends Omit<ChartsCustomProps, "type"> {
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  cornerRadius?: number;
}

export interface RadialChartProps extends Omit<ChartsCustomProps, "type"> {
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
}

export interface LineChartProps extends Omit<ChartsCustomProps, "type"> {
  dataKey: string;
  xAxisKey: string;
  strokeWidth?: number;
  showDots?: boolean;
  showArea?: boolean;
}

export interface BarChartProps extends Omit<ChartsCustomProps, "type"> {
  dataKey: string;
  xAxisKey: string;
  barWidth?: number;
  orientation?: "horizontal" | "vertical";
}

export interface AreaChartProps extends Omit<ChartsCustomProps, "type"> {
  dataKey: string;
  xAxisKey: string;
  strokeWidth?: number;
  fillOpacity?: number;
}
