"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from "recharts";
import { useState } from "react";
import { BarChartProps } from "../types";

export const BarChartComponent = ({
  data,
  config,
  dataKey,
  xAxisKey,
  showTooltip = true,
  showLegend = true,
  height = 300,
  width = "100%",
  barWidth = 20,
  orientation = "vertical",
  ...props
}: BarChartProps) => {
  // Estado para controlar o foco
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  // Função para lidar com clique nas barras
  const handleBarClick = (dataKey: string, region: string) => {
    const elementKey = `${dataKey}-${region}`;

    if (focusedElement === elementKey) {
      // Se clicou no mesmo elemento, remove o foco
      setFocusedElement(null);
    } else {
      // Foca no elemento clicado
      setFocusedElement(elementKey);
    }
  };
  // Calcular valores mínimos e máximos para o domínio do eixo Y
  const allValues = data
    .flatMap((d) => [d.vaga, d.mercado])
    .filter((v) => v != null)
    .map((v) => Number(v));
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const padding = Math.max((maxValue - minValue) * 0.2, 1000);

  // Garantir que o domínio tenha valores "redondos" para evitar ticks duplicados
  const yMin = Math.max(0, Math.floor((minValue - padding) / 1000) * 1000);
  const yMax = Math.ceil((maxValue + padding) / 1000) * 1000;
  const yDomain = [yMin, yMax];

  // Função para formatar valores do eixo Y
  const formatYAxisValue = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return `R$ ${value}`;
  };

  // Função para formatar valores nas barras
  const formatBarValue = (value: number) => {
    return `R$ ${value.toLocaleString("pt-BR")}`;
  };

  // Componente de tooltip customizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Se há foco, mostra apenas o elemento focado
      if (focusedElement) {
        const [dataKey, region] = focusedElement.split("-");
        const entry = payload.find((p: any) => p.dataKey === dataKey);

        if (entry) {
          const labelText = entry.dataKey === "vaga" ? "Vaga Atual" : "Mercado";
          const color = entry.dataKey === "vaga" ? "#3b82f6" : "#10b981";

          return (
            <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl shadow-xl p-4 min-w-[140px]">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                {region}
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {labelText}
                  </span>
                </div>
                <span className="text-sm font-semibold" style={{ color }}>
                  R$ {entry.value.toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          );
        }
      }

      // Tooltip normal quando não há foco
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl shadow-xl p-4 min-w-[140px]">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            {label}
          </div>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
              const label = entry.dataKey === "vaga" ? "Vaga Atual" : "Mercado";
              const color = entry.dataKey === "vaga" ? "#3b82f6" : "#10b981";
              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color }}>
                    R$ {entry.value.toLocaleString("pt-BR")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid
            strokeDasharray="2 4"
            stroke="#e5e7eb"
            strokeOpacity={0.3}
            vertical={false}
          />
          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickMargin={10}
            tickFormatter={formatYAxisValue}
            domain={yDomain}
            allowDecimals={false}
            ticks={(() => {
              const step = Math.ceil((yMax - yMin) / 5 / 1000) * 1000;
              const ticks = [];
              for (let i = yMin; i <= yMax; i += step) {
                ticks.push(i);
              }
              return ticks;
            })()}
          />
          {showTooltip && (
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "#f3f4f6", fillOpacity: 0.3 }}
            />
          )}
          <Bar
            dataKey="vaga"
            name="Vaga Atual"
            radius={[6, 6, 0, 0]}
            strokeWidth={1}
            fill="#3b82f6"
            stroke="#1d4ed8"
            onClick={(data) => handleBarClick("vaga", data.region)}
            style={{ cursor: "pointer" }}
            fillOpacity={
              focusedElement
                ? focusedElement.startsWith("vaga-")
                  ? 1
                  : 0.3
                : 1
            }
            strokeOpacity={
              focusedElement
                ? focusedElement.startsWith("vaga-")
                  ? 1
                  : 0.3
                : 1
            }
          >
            <LabelList
              dataKey="vaga"
              position="top"
              formatter={formatBarValue}
              style={{
                fill: "#1d4ed8",
                fontSize: "11px",
                fontWeight: "600",
                opacity: focusedElement
                  ? focusedElement.startsWith("vaga-")
                    ? 1
                    : 0.3
                  : 1,
              }}
            />
          </Bar>
          <Bar
            dataKey="mercado"
            name="Mercado"
            radius={[6, 6, 0, 0]}
            strokeWidth={1}
            fill="#10b981"
            stroke="#059669"
            onClick={(data) => handleBarClick("mercado", data.region)}
            style={{ cursor: "pointer" }}
            fillOpacity={
              focusedElement
                ? focusedElement.startsWith("mercado-")
                  ? 1
                  : 0.3
                : 1
            }
            strokeOpacity={
              focusedElement
                ? focusedElement.startsWith("mercado-")
                  ? 1
                  : 0.3
                : 1
            }
          >
            <LabelList
              dataKey="mercado"
              position="top"
              formatter={formatBarValue}
              style={{
                fill: "#059669",
                fontSize: "11px",
                fontWeight: "600",
                opacity: focusedElement
                  ? focusedElement.startsWith("mercado-")
                    ? 1
                    : 0.3
                  : 1,
              }}
            />
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
