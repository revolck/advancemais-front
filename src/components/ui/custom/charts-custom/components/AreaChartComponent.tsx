"use client";

import {
  Area,
  AreaChart as RechartsAreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChartProps } from "../types";

export const AreaChartComponent = ({
  data,
  config,
  dataKey,
  xAxisKey,
  showTooltip = true,
  showLegend = true,
  height = 300,
  width = "100%",
  strokeWidth = 2,
  fillOpacity = 0.1,
  ...props
}: AreaChartProps) => {
  return (
    <ChartContainer
      config={config}
      className="h-96 w-full"
      style={{ height, width }}
      {...props}
    >
      <RechartsAreaChart
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
        {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
        <Area
          type="monotone"
          dataKey={dataKey}
          strokeWidth={strokeWidth}
          fillOpacity={fillOpacity}
        />
      </RechartsAreaChart>
    </ChartContainer>
  );
};
