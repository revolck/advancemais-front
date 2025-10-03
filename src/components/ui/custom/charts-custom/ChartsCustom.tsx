"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartsCustomProps,
  PieChartProps,
  RadialChartProps,
  LineChartProps,
  BarChartProps,
  AreaChartProps,
} from "./types";
import { PieChartComponent } from "./components/PieChartComponent";
import { RadialChartComponent } from "./components/RadialChartComponent";
import { LineChartComponent } from "./components/LineChartComponent";
import { BarChartComponent } from "./components/BarChartComponent";
import { AreaChartComponent } from "./components/AreaChartComponent";
import { ChartLegend } from "./components/ChartLegend";

export const ChartsCustom = (props: ChartsCustomProps) => {
  const {
    type,
    data,
    config,
    title,
    description,
    className,
    containerClassName,
    showTooltip = true,
    showLegend = true,
    height = 300,
    width = "100%",
    ...restProps
  } = props;

  const renderChart = () => {
    const commonProps = {
      data,
      config,
      showTooltip,
      showLegend,
      height,
      width,
    };

    switch (type) {
      case "pie":
        return (
          <PieChartComponent
            {...commonProps}
            {...(restProps as Omit<PieChartProps, keyof typeof commonProps>)}
          />
        );
      case "radial":
        return (
          <RadialChartComponent
            {...commonProps}
            {...(restProps as Omit<RadialChartProps, keyof typeof commonProps>)}
          />
        );
      case "line":
        return (
          <LineChartComponent
            {...commonProps}
            {...(restProps as Omit<LineChartProps, keyof typeof commonProps>)}
          />
        );
      case "bar":
        return (
          <BarChartComponent
            {...commonProps}
            {...(restProps as Omit<BarChartProps, keyof typeof commonProps>)}
          />
        );
      case "area":
        return (
          <AreaChartComponent
            {...commonProps}
            {...(restProps as Omit<AreaChartProps, keyof typeof commonProps>)}
          />
        );
      default:
        return <div>Chart type not supported</div>;
    }
  };

  return (
    <div className={cn("w-full", containerClassName)}>
      <div
        className={cn(
          "bg-gray-100/20 rounded-lg border border-gray-200/50 p-6",
          className
        )}
      >
        {(title || description) && (
          <div className="mb-6">
            {title && <h4 className="!mb-0">{title}</h4>}
            {description && (
              <p className="!text-sm !text-gray-600">{description}</p>
            )}
          </div>
        )}
        <div className="flex-1">{renderChart()}</div>

        {/* Legenda personalizada baseada no tipo de gráfico */}
        {showLegend && data.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200/50">
            <ChartLegend
              items={(() => {
                if (type === "bar") {
                  // Legenda para gráfico de barras (Vaga Atual vs Mercado)
                  return [
                    {
                      label: "Vaga Atual",
                      color: "#3b82f6",
                      value: data[0]?.vaga
                        ? `R$ ${data[0].vaga.toLocaleString("pt-BR")}`
                        : "R$ 0",
                    },
                    {
                      label: "Mercado",
                      color: "#10b981",
                      value: data[0]?.mercado
                        ? `R$ ${data[0].mercado.toLocaleString("pt-BR")}`
                        : "R$ 0",
                    },
                  ];
                } else if (type === "pie") {
                  // Legenda para gráfico de pizza (Candidaturas por faixa etária)
                  return data.map((item, index) => ({
                    label: String(item.name),
                    color: String(
                      item.fill || `hsl(${220 + index * 60}, 70%, 50%)`
                    ),
                    value: item.value
                      ? `${item.value} candidatos`
                      : "0 candidatos",
                  }));
                }
                // Fallback para outros tipos de gráfico
                return [];
              })()}
              orientation="horizontal"
            />
          </div>
        )}
      </div>
    </div>
  );
};
