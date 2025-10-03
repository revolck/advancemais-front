"use client";

import { Pie, PieChart as RechartsPieChart, Cell, LabelList } from "recharts";
import { useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChartProps } from "../types";

export const PieChartComponent = ({
  data,
  config,
  showTooltip = true,
  showLegend = true,
  height = 300,
  width = "100%",
  innerRadius = 40,
  outerRadius = 100,
  startAngle = 0,
  endAngle = 360,
  cornerRadius = 6,
  ...props
}: PieChartProps) => {
  // Estado para controlar o foco
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  // Função para lidar com clique nas fatias
  const handleSliceClick = (name: string) => {
    if (focusedElement === name) {
      // Se clicou na mesma fatia, remove o foco
      setFocusedElement(null);
    } else {
      // Foca na fatia clicada
      setFocusedElement(name);
    }
  };

  // Função para formatar valores nas fatias
  const formatPieValue = (value: number) => {
    return `${value} candidatos`;
  };

  // Tooltip customizado para adicionar R$ no valor
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl shadow-xl p-4 min-w-[120px]">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.fill }}
            />
            <span className="text-sm font-medium text-gray-700">
              {entry.name}
            </span>
          </div>
          <div className="text-lg font-bold" style={{ color: entry.fill }}>
            {entry.value} candidatos
          </div>
        </div>
      );
    }
    return null;
  };
  return (
    <ChartContainer
      config={config}
      className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-gray-700"
      style={{ height, width }}
      {...props}
    >
      <RechartsPieChart>
        {showTooltip && (
          <ChartTooltip content={<CustomPieTooltip />} cursor={false} />
        )}
        <Pie
          data={data}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          cornerRadius={cornerRadius}
          dataKey="value"
          nameKey="name"
          paddingAngle={2}
          stroke="white"
          strokeWidth={2}
          onClick={(data) => handleSliceClick(data.name)}
        >
          {data.map((entry, index) => {
            const isFocused = focusedElement === entry.name;
            const opacity = !focusedElement ? 1 : isFocused ? 1 : 0.3;

            return (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.fill?.toString() || `hsl(${220 + index * 60}, 70%, 50%)`
                }
                style={{
                  cursor: "pointer",
                  opacity: opacity,
                }}
              />
            );
          })}
          <LabelList
            dataKey="value"
            position="outside"
            formatter={formatPieValue}
            style={{
              fontSize: "11px",
              fontWeight: "600",
              fill: "#374151",
            }}
          />
        </Pie>
      </RechartsPieChart>
    </ChartContainer>
  );
};
