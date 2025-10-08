"use client";

import { RadialBar, RadialBarChart as RechartsRadialBarChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { RadialChartProps } from "../types";

export const RadialChartComponent = ({
  data,
  config,
  showTooltip = true,
  showLegend = true,
  height = 300,
  width = "100%",
  innerRadius = 30,
  outerRadius = 110,
  startAngle = 0,
  endAngle = 360,
  ...props
}: RadialChartProps) => {
  return (
    <ChartContainer
      config={config}
      className="mx-auto aspect-square max-h-[250px]"
      style={{ height, width }}
      {...props}
    >
      <RechartsRadialBarChart
        data={data}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
      >
        {showTooltip && (
          <ChartTooltip
            content={<ChartTooltipContent hideLabel nameKey="name" />}
          />
        )}
        <RadialBar dataKey="value" background />
      </RechartsRadialBarChart>
    </ChartContainer>
  );
};

