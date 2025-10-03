"use client";

import {
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChartProps } from "../types";

export const LineChartComponent = ({
  data,
  config,
  dataKey,
  xAxisKey,
  showTooltip = true,
  showLegend = true,
  height = 300,
  width = "100%",
  strokeWidth = 2,
  showDots = true,
  showArea = false,
  ...props
}: LineChartProps) => {
  // Tooltip customizado para gráfico de linha
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl shadow-xl p-4 min-w-[120px]">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            {label}
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-gray-700">
              {entry.name}
            </span>
            <span
              className="text-sm font-semibold ml-auto"
              style={{ color: entry.color }}
            >
              {entry.value}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };
  return (
    <ChartContainer
      config={config}
      className="h-96 w-full"
      style={{ height, width }}
      {...props}
    >
      <RechartsLineChart
        data={data}
        margin={{
          top: 20,
          right: 10,
          left: 5,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        {showTooltip && <Tooltip content={<CustomLineTooltip />} />}
        <Line
          type="monotone"
          dataKey={dataKey}
          strokeWidth={strokeWidth}
          dot={showDots}
          activeDot={{ r: 6 }}
        />
      </RechartsLineChart>
    </ChartContainer>
  );
};
