"use client";

import React, { useState, useMemo } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Line, LineChart, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SelectCustom } from "@/components/ui/custom/select";
import { DatePickerRangeCustom } from "@/components/ui/custom/date-picker";
import type { DateRange } from "@/components/ui/custom/date-picker";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface MetricConfig {
  key: string;
  label: string;
  value: number;
  previousValue?: number;
  format: (val: number) => string;
  isNegative?: boolean; // Lower is better (e.g., response time)
  showChange?: boolean;
  showComparison?: boolean;
  comparisonLabel?: string;
}

export type PeriodType = "day" | "week" | "month" | "year" | "custom";

export interface InteractiveLineChartProps {
  data: Array<Record<string, string | number>>;
  metrics: MetricConfig[];
  config: ChartConfig;
  selectedMetric?: string;
  onMetricChange?: (metricKey: string) => void;
  className?: string;
  height?: number;
  showGrid?: boolean;
  dateKey?: string;
  dateFormatter?: (value: string | number) => string;
  showPeriodFilter?: boolean;
  defaultPeriod?: PeriodType;
  periodType?: PeriodType;
  onPeriodTypeChange?: (period: PeriodType) => void;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  useServerPeriodData?: boolean;
  datePickerMinDate?: Date;
  datePickerMaxDate?: Date;
  datePickerYears?: "old" | "new" | "default";
  periodTitle?: string;
  periodDescription?: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({
  active,
  payload,
  metrics,
}: TooltipProps & { metrics: MetricConfig[] }) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const metric = metrics.find((m) => m.key === entry.dataKey);

    if (metric) {
      return (
        <div className="rounded-lg border bg-white border-gray-200 p-3 shadow-lg min-w-[120px]">
          <div className="flex items-center gap-2 text-sm">
            <div
              className="size-1.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{metric.label}:</span>
            <span className="font-semibold text-gray-900">
              {metric.format(entry.value)}
            </span>
          </div>
        </div>
      );
    }
  }
  return null;
};

// Helper para parsear data (usado no filtro e formatação)
function parseDateForFilter(dateStr: string | number): Date | null {
  if (typeof dateStr === "string") {
    // Formato "YYYY-MM" (bucket mensal vindo da API)
    const yearMonthMatch = dateStr.match(/^(\d{4})-(\d{2})$/);
    if (yearMonthMatch) {
      const year = Number(yearMonthMatch[1]);
      const month = Number(yearMonthMatch[2]);
      if (Number.isFinite(year) && Number.isFinite(month)) {
        return new Date(year, Math.max(0, month - 1), 1);
      }
    }

    // Se for formato "Mês-YYYY", converter para data válida
    if (/^[A-Za-z]{3}-\d{4}$/.test(dateStr)) {
      const [month, year] = dateStr.split("-");
      const monthMap: Record<string, number> = {
        Jan: 0,
        Fev: 1,
        Mar: 2,
        Abr: 3,
        Mai: 4,
        Jun: 5,
        Jul: 6,
        Ago: 7,
        Set: 8,
        Out: 9,
        Nov: 10,
        Dez: 11,
      };
      return new Date(parseInt(year), monthMap[month] || 0, 1);
    }
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

export function InteractiveLineChart({
  data,
  metrics,
  config,
  selectedMetric,
  onMetricChange,
  className,
  height = 384,
  showGrid = true,
  dateKey = "date",
  dateFormatter,
  showPeriodFilter = true,
  defaultPeriod = "month",
  periodType: externalPeriodType,
  onPeriodTypeChange,
  dateRange: externalDateRange,
  onDateRangeChange,
  useServerPeriodData = false,
  datePickerMinDate,
  datePickerMaxDate,
  datePickerYears = "default",
  periodTitle,
  periodDescription,
}: InteractiveLineChartProps) {
  const [internalSelectedMetric, setInternalSelectedMetric] = useState<string>(
    selectedMetric || metrics[0]?.key || ""
  );
  const [internalPeriodType, setInternalPeriodType] =
    useState<PeriodType>(defaultPeriod);
  const [internalDateRange, setInternalDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });

  const periodType = externalPeriodType ?? internalPeriodType;
  const dateRange = externalDateRange ?? internalDateRange;

  const currentMetric = selectedMetric || internalSelectedMetric;
  const metric = metrics.find((m) => m.key === currentMetric);

  const metricsGridClassName = useMemo(() => {
    const lgCols =
      metrics.length >= 4
        ? "lg:grid-cols-4"
        : metrics.length === 3
        ? "lg:grid-cols-3"
        : "lg:grid-cols-2";

    const smCols = metrics.length === 1 ? "sm:grid-cols-1" : "sm:grid-cols-2";

    return cn(
      "grid grid-cols-1 gap-px rounded-lg overflow-hidden bg-gray-200/60 mb-6",
      smCols,
      lgCols
    );
  }, [metrics.length]);

  const handleMetricClick = (metricKey: string) => {
    if (onMetricChange) {
      onMetricChange(metricKey);
    } else {
      setInternalSelectedMetric(metricKey);
    }
  };

  const handlePeriodChange = (newPeriod: PeriodType) => {
    // Limpar sempre o dateRange ao mudar de período
    const clearedRange: DateRange = { from: null, to: null };

    if (onDateRangeChange) {
      onDateRangeChange(clearedRange);
    } else {
      setInternalDateRange(clearedRange);
    }

    if (onPeriodTypeChange) {
      onPeriodTypeChange(newPeriod);
    } else {
      setInternalPeriodType(newPeriod);
    }
  };

  const handleDateRangeChange = (range: DateRange) => {
    if (onDateRangeChange) {
      onDateRangeChange(range);
    } else {
      setInternalDateRange(range);
    }
  };

  // Converter Date para uso no filtro
  const startDate = dateRange.from || undefined;
  const endDate = dateRange.to || undefined;

  const periodOptions = [
    { value: "day", label: "Dia" },
    { value: "week", label: "Semana" },
    { value: "month", label: "Mês" },
    { value: "year", label: "Ano" },
    { value: "custom", label: "Período" },
  ];

  const effectiveDateKey = dateKey || "date";

  const placeholderChartData = useMemo(() => {
    const buildPoint = (dateValue: string): Record<string, string | number> => {
      const point: Record<string, string | number> = {
        [effectiveDateKey]: dateValue,
      };
      metrics.forEach((m) => {
        point[m.key] = Number.isFinite(m.value) ? m.value : 0;
      });
      return point;
    };

    const now = new Date();

    if (periodType === "custom") {
      if (!startDate || !endDate) return [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      if (start > end) return [];

      const days = eachDayOfInterval({ start, end });
      return days.map((d) => buildPoint(format(d, "yyyy-MM-dd")));
    }

    if (periodType === "day") {
      const base = new Date(now);
      base.setHours(0, 0, 0, 0);
      return Array.from({ length: 24 }, (_, hour) => {
        const d = new Date(base);
        d.setHours(hour, 0, 0, 0);
        return buildPoint(format(d, "yyyy-MM-dd'T'HH:00:00"));
      });
    }

    if (periodType === "week") {
      const weekStart = startOfWeek(now, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      return days.map((d) => buildPoint(format(d, "yyyy-MM-dd")));
    }

    if (periodType === "year") {
      const months: Record<string, string | number>[] = [];
      const year = now.getFullYear();
      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const d = new Date(year, monthIndex, 1);
        months.push(buildPoint(format(d, "yyyy-MM")));
      }
      return months;
    }

    // month (default): dias do mês atual (até hoje) para evitar datas futuras
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now);
    monthStart.setHours(0, 0, 0, 0);
    monthEnd.setHours(0, 0, 0, 0);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return days.map((d) => buildPoint(format(d, "yyyy-MM-dd")));
  }, [periodType, startDate, endDate, metrics, effectiveDateKey]);

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    if (useServerPeriodData) {
      return data;
    }

    if (periodType === "custom" && startDate && endDate) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);

      const filtered = data.filter((item) => {
        const itemDate = parseDateForFilter(item[dateKey] as string);
        if (!itemDate) return false;
        const normalizedDate = new Date(itemDate);
        normalizedDate.setHours(0, 0, 0, 0);
        return normalizedDate >= startDateTime && normalizedDate <= endDateTime;
      });

      return filtered;
    }

    if (periodType === "day") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const filtered = data.filter((item) => {
        const itemDate = parseDateForFilter(item[dateKey] as string);
        if (!itemDate) return false;
        const normalizedDate = new Date(itemDate);
        normalizedDate.setHours(0, 0, 0, 0);
        const now = new Date();
        return (
          normalizedDate >= today &&
          normalizedDate < tomorrow &&
          normalizedDate <= now
        );
      });

      // Se não encontrou dados de hoje, retornar dados mais recentes
      if (filtered.length === 0) {
        return data;
      }

      return filtered;
    }

    if (periodType === "week") {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      endOfWeek.setHours(23, 59, 59, 999);

      const filtered = data.filter((item) => {
        const itemDate = parseDateForFilter(item[dateKey] as string);
        if (!itemDate) return false;
        const normalizedDate = new Date(itemDate);
        normalizedDate.setHours(0, 0, 0, 0);
        return (
          normalizedDate >= startOfWeek &&
          normalizedDate <= endOfWeek &&
          normalizedDate <= today
        );
      });

      // Se não encontrou dados da semana atual, retornar últimos 7 dias
      if (filtered.length === 0) {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const fallbackData = data.filter((item) => {
          const itemDate = parseDateForFilter(item[dateKey] as string);
          if (!itemDate) return false;
          const normalizedDate = new Date(itemDate);
          normalizedDate.setHours(0, 0, 0, 0);
          return normalizedDate >= sevenDaysAgo && normalizedDate <= today;
        });

        return fallbackData.length > 0 ? fallbackData : data;
      }

      return filtered;
    }

    if (periodType === "month") {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      endOfMonth.setHours(0, 0, 0, 0);

      const filtered = data.filter((item) => {
        const itemDate = parseDateForFilter(item[dateKey] as string);
        if (!itemDate) return false;
        const normalizedDate = new Date(itemDate);
        normalizedDate.setHours(0, 0, 0, 0);
        return (
          normalizedDate >= startOfMonth &&
          normalizedDate < endOfMonth &&
          normalizedDate <= today
        );
      });

      // Se não encontrou dados do mês atual, retornar últimos 30 dias
      if (filtered.length === 0) {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const fallbackData = data.filter((item) => {
          const itemDate = parseDateForFilter(item[dateKey] as string);
          if (!itemDate) return false;
          const normalizedDate = new Date(itemDate);
          normalizedDate.setHours(0, 0, 0, 0);
          return normalizedDate >= thirtyDaysAgo && normalizedDate <= today;
        });

        return fallbackData.length > 0 ? fallbackData : data;
      }

      return filtered;
    }

    if (periodType === "year") {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const currentYear = today.getFullYear();
      const startOfYear = new Date(currentYear - 4, 0, 1);
      startOfYear.setHours(0, 0, 0, 0);
      const endOfYear = new Date(currentYear + 1, 0, 1);
      endOfYear.setHours(0, 0, 0, 0);

      const filtered = data.filter((item) => {
        const itemDate = parseDateForFilter(item[dateKey] as string);
        if (!itemDate) return false;
        const normalizedDate = new Date(itemDate);
        normalizedDate.setHours(0, 0, 0, 0);
        const isNotFuture = normalizedDate <= today;
        return isNotFuture;
      });

      // Se não encontrou dados, retornar todos os dados disponíveis
      if (filtered.length === 0) {
        return data;
      }

      return filtered;
    }

    // Fallback: retornar todos os dados
    return data;
  }, [data, periodType, startDate, endDate, dateKey, useServerPeriodData]);

  // Formatador dinâmico baseado no período selecionado
  const defaultDateFormatter = useMemo(() => {
    return (value: string | number, index?: number) => {
      const date = parseDateForFilter(value);
      if (!date || isNaN(date.getTime())) {
        return String(value);
      }

      switch (periodType) {
        case "day":
          // Dia: mostrar horários (HH:mm)
          // Sempre usar o índice para distribuir horários proporcionalmente
          let itemIndex = typeof index === "number" ? index : -1;

          // Se não temos índice, buscar nos dados filtrados
          if (itemIndex < 0) {
            itemIndex = filteredData.findIndex((item) => {
              const itemDate = parseDateForFilter(item[dateKey] as string);
              return itemDate && itemDate.getTime() === date.getTime();
            });
          }

          // Se encontrou o índice, distribuir horários
          if (itemIndex >= 0 && filteredData.length > 0) {
            const totalItems = filteredData.length;
            const hoursInDay = 12; // 8h às 20h = 12 horas
            const hour = 8 + Math.floor((itemIndex * hoursInDay) / totalItems);
            const minutes = Math.floor(
              ((itemIndex * hoursInDay * 60) / totalItems) % 60
            );
            return `${String(Math.min(hour, 20)).padStart(2, "0")}:${String(
              Math.min(minutes, 59)
            ).padStart(2, "0")}`;
          }

          // Se tem horário na data, usar diretamente
          if (date.getHours() !== 0 || date.getMinutes() !== 0) {
            return format(date, "HH:mm", { locale: ptBR });
          }

          // Último fallback
          return "00:00";

        case "week":
          // Semana: mostrar nomes dos dias da semana (Seg, Ter, Qua, etc.)
          return format(date, "EEE", { locale: ptBR });

        case "month":
          // Mês: mostrar dias do mês (dd/MM)
          return format(date, "dd/MM", { locale: ptBR });

        case "year":
          // Ano: mostrar anos (yyyy)
          return format(date, "yyyy", { locale: ptBR });

        case "custom":
          // Período customizado: adaptar baseado no intervalo
          if (startDate && endDate) {
            const diffDays = Math.ceil(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diffDays <= 7) {
              // Menos de 7 dias: mostrar dia e hora
              // Se não tem horário, distribuir
              if (
                date.getHours() === 0 &&
                date.getMinutes() === 0 &&
                typeof index === "number"
              ) {
                const hours = Math.floor(
                  (index * 24) / Math.max(filteredData.length, 1)
                );
                return (
                  format(date, "dd/MM", { locale: ptBR }) +
                  ` ${String(hours).padStart(2, "0")}:00`
                );
              }
              return format(date, "dd/MM HH:mm", { locale: ptBR });
            } else if (diffDays <= 30) {
              // Menos de 30 dias: mostrar dia/mês
              return format(date, "dd/MM", { locale: ptBR });
            } else if (diffDays <= 365) {
              // Menos de 1 ano: mostrar mês/ano
              return format(date, "MMM/yyyy", { locale: ptBR });
            } else {
              // Mais de 1 ano: mostrar apenas ano
              return format(date, "yyyy", { locale: ptBR });
            }
          }
          // Fallback para período customizado sem datas
          return format(date, "dd/MM/yyyy", { locale: ptBR });

        default:
          return format(date, "dd/MM/yyyy", { locale: ptBR });
      }
    };
  }, [periodType, startDate, endDate, dateKey, filteredData]);

  const formatDate = dateFormatter || defaultDateFormatter;

  // Processar dados para semana: garantir que todos os dias da semana apareçam
  const processedDataForWeek = useMemo(() => {
    if (useServerPeriodData) {
      return filteredData;
    }

    if (periodType !== "week") {
      return filteredData;
    }

    const today = new Date();
    // Semana começa no domingo (0) e vai até sábado (6)
    const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Domingo = 0
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 }); // Sábado

    // Criar array com todos os dias da semana (sempre 7 dias: domingo a sábado)
    const allDaysOfWeek = eachDayOfInterval({
      start: weekStart,
      end: weekEnd,
    });

    // Verificar se temos exatamente 7 dias
    if (allDaysOfWeek.length !== 7) {
      console.warn(
        `Esperado 7 dias, mas encontrado ${allDaysOfWeek.length} dias`
      );
    }

    // Criar mapa dos dados existentes por data (agregar múltiplos valores do mesmo dia)
    const dataMap = new Map<
      string,
      {
        date: string;
        values: Record<string, number[]>;
        sampleItem: Record<string, string | number>;
      }
    >();

    if (filteredData && filteredData.length > 0) {
      filteredData.forEach((item) => {
        const itemDate = parseDateForFilter(item[dateKey] as string);
        if (itemDate) {
          // Normalizar para comparar apenas a data (sem hora)
          const normalizedDate = new Date(itemDate);
          normalizedDate.setHours(0, 0, 0, 0);
          const dateKeyStr = format(normalizedDate, "yyyy-MM-dd");

          if (!dataMap.has(dateKeyStr)) {
            dataMap.set(dateKeyStr, {
              date: dateKeyStr,
              values: {},
              sampleItem: { ...item },
            });
          }

          const dayData = dataMap.get(dateKeyStr)!;
          // Agregar valores de todas as métricas
          metrics.forEach((metric) => {
            if (!dayData.values[metric.key]) {
              dayData.values[metric.key] = [];
            }
            const value =
              typeof item[metric.key] === "number"
                ? (item[metric.key] as number)
                : parseFloat(String(item[metric.key])) || 0;
            dayData.values[metric.key].push(value);
          });
        }
      });
    }

    // Criar array completo com todos os dias da semana na ordem correta
    // allDaysOfWeek já garante 7 dias únicos e ordenados (domingo a sábado)
    // Vamos mapear diretamente para garantir que cada dia aparece apenas uma vez
    const weekDataMap = new Map<string, Record<string, string | number>>();

    allDaysOfWeek.forEach((day) => {
      // Normalizar o dia para comparar apenas a data
      const normalizedDay = new Date(day);
      normalizedDay.setHours(0, 0, 0, 0);
      const dateKeyStr = format(normalizedDay, "yyyy-MM-dd");

      // Evitar duplicatas - só adicionar se ainda não existir
      if (!weekDataMap.has(dateKeyStr)) {
        const dayData = dataMap.get(dateKeyStr);

        if (dayData) {
          // Agregar valores (somar se houver múltiplos valores no mesmo dia)
          const aggregatedItem: Record<string, string | number> = {
            ...dayData.sampleItem,
            [dateKey]: dateKeyStr,
          };

          // Somar valores das métricas
          metrics.forEach((metric) => {
            const values = dayData.values[metric.key] || [];
            aggregatedItem[metric.key] = values.reduce(
              (sum, val) => sum + val,
              0
            );
          });

          weekDataMap.set(dateKeyStr, aggregatedItem);
        } else {
          // Criar entrada vazia para dias sem dados
          const emptyEntry: Record<string, string | number> = {
            [dateKey]: dateKeyStr,
          };

          // Preencher com 0 para todas as métricas
          metrics.forEach((metric) => {
            emptyEntry[metric.key] = 0;
          });

          weekDataMap.set(dateKeyStr, emptyEntry);
        }
      }
    });

    // Converter de volta para array na ordem correta (domingo a sábado)
    const weekData = allDaysOfWeek
      .map((day) => {
        const dateKeyStr = format(day, "yyyy-MM-dd");
        return weekDataMap.get(dateKeyStr)!;
      })
      .filter(Boolean); // Remover possíveis undefined

    // Garantir que temos exatamente 7 dias
    if (weekData.length !== 7) {
      // Se não temos 7 dias, completar com os dias faltantes
      const existingDates = new Set(
        weekData.map((item) => item[dateKey] as string)
      );
      const completeWeekData = allDaysOfWeek.map((day) => {
        const dateKeyStr = format(day, "yyyy-MM-dd");
        const existing = weekData.find(
          (item) => (item[dateKey] as string) === dateKeyStr
        );
        if (existing) {
          return existing;
        }

        // Criar entrada vazia para o dia faltante
        const emptyEntry: Record<string, string | number> = {
          [dateKey]: dateKeyStr,
        };
        metrics.forEach((metric) => {
          emptyEntry[metric.key] = 0;
        });
        return emptyEntry;
      });

      return completeWeekData;
    }

    return weekData;
  }, [filteredData, periodType, dateKey, metrics, useServerPeriodData]);

  // Agregar dados para período "year" (mostrar por mês em vez de por dia)
  const aggregatedDataForYear = useMemo(() => {
    if (useServerPeriodData) {
      return filteredData;
    }

    if (periodType !== "year" || !filteredData || filteredData.length === 0) {
      return filteredData;
    }

    // Agrupar por mês/ano
    const grouped = new Map<
      string,
      {
        date: Date;
        values: number[];
        item: Record<string, string | number>;
      }
    >();

    filteredData.forEach((item) => {
      const itemDate = parseDateForFilter(item[dateKey] as string);
      if (!itemDate) return;

      // Criar chave única para mês/ano
      const monthKey = `${itemDate.getFullYear()}-${String(
        itemDate.getMonth() + 1
      ).padStart(2, "0")}`;
      const monthStart = new Date(
        itemDate.getFullYear(),
        itemDate.getMonth(),
        1
      );

      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, {
          date: monthStart,
          values: [],
          item: { ...item },
        });
      }

      const value =
        typeof item[currentMetric] === "number"
          ? (item[currentMetric] as number)
          : parseFloat(String(item[currentMetric])) || 0;

      grouped.get(monthKey)!.values.push(value);
    });

    // Somar valores do mesmo mês e criar array ordenado
    return Array.from(grouped.values())
      .map(({ date, values, item }) => {
        const sum = values.reduce((acc, val) => acc + val, 0);
        return {
          ...item,
          [dateKey]: `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-01`,
          [currentMetric]: sum,
        };
      })
      .sort((a, b) => {
        const dateA = parseDateForFilter(a[dateKey] as string)?.getTime() || 0;
        const dateB = parseDateForFilter(b[dateKey] as string)?.getTime() || 0;
        return dateA - dateB;
      });
  }, [filteredData, periodType, currentMetric, dateKey, useServerPeriodData]);

  // Dados finais para o gráfico
  const chartData = useMemo(() => {
    if (periodType === "year") {
      return aggregatedDataForYear;
    }
    if (periodType === "week") {
      return processedDataForWeek;
    }
    return filteredData;
  }, [periodType, aggregatedDataForYear, processedDataForWeek, filteredData]);

  const hasRealChartData = chartData.length > 0;
  const finalChartData = hasRealChartData ? chartData : placeholderChartData;
  const isPlaceholderSeries =
    !hasRealChartData && placeholderChartData.length > 0;

  // Calcular domínio do eixo Y dinamicamente baseado nos dados do gráfico
  const yAxisDomain = useMemo(() => {
    if (!finalChartData || finalChartData.length === 0) {
      return [0, 100] as [number, number];
    }

    const values = finalChartData
      .map((item) => {
        const value = item[currentMetric];
        return typeof value === "number"
          ? value
          : parseFloat(String(value)) || 0;
      })
      .filter((v) => !isNaN(v) && isFinite(v) && v >= 0);

    if (values.length === 0) {
      return [0, 100] as [number, number];
    }

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Se todos os valores são zero, retornar domínio padrão
    if (maxValue === 0) {
      return [0, 100] as [number, number];
    }

    // Padding inteligente: 10% do range ou 5% do máximo, o que for maior
    const range = maxValue - minValue;
    const padding = Math.max(range * 0.1, maxValue * 0.05);

    let yMin = Math.max(0, minValue - padding);
    let yMax = maxValue + padding;

    // Arredondar para valores "limpos" baseado na magnitude
    const magnitude = Math.pow(10, Math.floor(Math.log10(yMax)));
    const roundFactor = magnitude / 10;

    yMin = Math.max(0, Math.floor(yMin / roundFactor) * roundFactor);
    yMax = Math.ceil(yMax / roundFactor) * roundFactor;

    // Garantir que o mínimo não seja negativo
    if (yMin < 0) yMin = 0;

    return [yMin, yMax] as [number, number];
  }, [finalChartData, currentMetric]);

  // Calcular intervalos inteligentes para o eixo X baseado no período
  const xAxisInterval = useMemo(() => {
    if (!finalChartData || finalChartData.length === 0) return undefined;

    const dataLength = finalChartData.length;

    switch (periodType) {
      case "day":
        // Para dia: mostrar no máximo 12 labels (a cada 2 horas)
        return dataLength > 12 ? Math.ceil(dataLength / 12) : 0;

      case "week":
        // Para semana: sempre mostrar todos os 7 dias (sem intervalo)
        return 0;

      case "month":
        // Para mês: mostrar no máximo 10 labels (a cada 3 dias)
        return dataLength > 10 ? Math.ceil(dataLength / 10) : 0;

      case "year":
        // Para ano: mostrar no máximo 12 labels (um por mês)
        return dataLength > 12 ? Math.ceil(dataLength / 12) : 0;

      case "custom":
        // Para período customizado: adaptar baseado no tamanho
        if (dataLength > 15) {
          return Math.ceil(dataLength / 10);
        }
        return 0;

      default:
        return 0;
    }
  }, [finalChartData, periodType]);

  // Ajustar formatador do ano para mostrar meses
  const finalDateFormatter = useMemo(() => {
    if (periodType === "year" && finalChartData.length > 0) {
      return (value: string | number, index?: number) => {
        const date = parseDateForFilter(value);
        if (!date || isNaN(date.getTime())) {
          return String(value);
        }
        // Mostrar mês/ano para dados agregados por mês
        return format(date, "MMM/yyyy", { locale: ptBR });
      };
    }
    return formatDate;
  }, [periodType, formatDate, finalChartData.length]);

  return (
    <div className={cn("w-full", className)}>
      {/* Period Filter */}
      {showPeriodFilter && (periodTitle || periodDescription) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {periodTitle && <h4 className="!mb-0">{periodTitle}</h4>}
            {periodDescription && (
              <p className="text-sm!">{periodDescription}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <SelectCustom
              mode="single"
              value={periodType}
              onChange={(value) =>
                handlePeriodChange((value || "month") as PeriodType)
              }
              options={periodOptions}
              placeholder="Selecione o período"
              size="md"
              fullWidth={false}
              className="w-[180px]"
            />

            {periodType === "custom" && (
              <div className="w-[300px]">
                <DatePickerRangeCustom
                  key={`date-range-${periodType}`}
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  placeholder="Selecione o período"
                  size="md"
                  clearable={true}
                  minDate={datePickerMinDate}
                  maxDate={datePickerMaxDate}
                  years={datePickerYears}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className={metricsGridClassName}>
        {metrics.map((metricItem) => {
          const showChange = metricItem.showChange !== false;
          const showComparison = metricItem.showComparison !== false;
          const comparisonLabel =
            metricItem.comparisonLabel || "Período anterior";
          const previousValue = metricItem.previousValue;

          const change =
            showChange &&
            typeof previousValue === "number" &&
            Number.isFinite(previousValue) &&
            previousValue !== 0
              ? ((metricItem.value - previousValue) / previousValue) * 100
              : null;

          const isPositive =
            metricItem.isNegative && typeof change === "number"
              ? change < 0
              : typeof change === "number"
              ? change > 0
              : false;

          return (
            <button
              key={metricItem.key}
              onClick={() => handleMetricClick(metricItem.key)}
              className={cn(
                "cursor-pointer flex-1 text-start p-4 bg-white transition-all hover:bg-gray-50",
                currentMetric === metricItem.key && "bg-blue-50"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {metricItem.label}
                </span>
                {typeof change === "number" && (
                  <Badge
                    variant={isPositive ? "default" : "destructive"}
                    className={cn(
                      "text-xs flex items-center gap-1",
                      isPositive
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    )}
                  >
                    {isPositive ? (
                      <ArrowUp className="size-3" />
                    ) : (
                      <ArrowDown className="size-3" />
                    )}
                    {Math.abs(change).toFixed(1)}%
                  </Badge>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metricItem.format(metricItem.value)}
              </div>
              {showComparison &&
                typeof previousValue === "number" &&
                Number.isFinite(previousValue) && (
                  <div className="text-xs text-gray-500 mt-1">
                    {comparisonLabel}: {metricItem.format(previousValue)}
                  </div>
                )}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {!hasRealChartData && (
          <p className="text-xs! text-gray-500! mb-3!">
            Sem histórico para o período selecionado. Exibindo valores
            agregados.
          </p>
        )}
        <ChartContainer
          config={config}
          className={cn(
            "w-full overflow-visible",
            "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-gray-300"
          )}
          style={{ height: `${height}px` }}
        >
          <LineChart
            data={finalChartData}
            margin={{
              top: 20,
              right: 20,
              left: 60,
              bottom: 20,
            }}
            style={{ overflow: "visible" }}
          >
            {/* Background pattern for chart area */}
            <defs>
              <pattern
                id="dotGrid"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="1"
                  fill="currentColor"
                  fillOpacity="0.2"
                />
              </pattern>
              <filter
                id="lineShadow"
                x="-100%"
                y="-100%"
                width="300%"
                height="300%"
              >
                <feDropShadow
                  dx="4"
                  dy="6"
                  stdDeviation="25"
                  floodColor={`${
                    config[currentMetric as keyof typeof config]?.color ||
                    "#3b82f6"
                  }60`}
                />
              </filter>
              <filter
                id="dotShadow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feDropShadow
                  dx="2"
                  dy="2"
                  stdDeviation="3"
                  floodColor="rgba(0,0,0,0.5)"
                />
              </filter>
            </defs>

            {showGrid && (
              <rect
                x="60px"
                y="-20px"
                width="calc(100% - 80px)"
                height="calc(100% - 10px)"
                fill="url(#dotGrid)"
                style={{ pointerEvents: "none" }}
              />
            )}

            <XAxis
              dataKey={effectiveDateKey}
              axisLine={true}
              tickLine={true}
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickMargin={10}
              interval={xAxisInterval}
              tickFormatter={(value, index) => finalDateFormatter(value, index)}
              stroke="#e5e7eb"
              angle={
                periodType === "year" && finalChartData.length > 6 ? -45 : 0
              }
              textAnchor={
                periodType === "year" && finalChartData.length > 6
                  ? "end"
                  : "middle"
              }
              height={
                periodType === "year" && finalChartData.length > 6 ? 60 : 30
              }
            />

            <YAxis
              axisLine={true}
              tickLine={true}
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickMargin={10}
              width={60}
              domain={yAxisDomain}
              tickCount={6}
              allowDecimals={false}
              tickFormatter={(value) => {
                if (!metric) return value.toString();
                return metric.format(value);
              }}
              stroke="#e5e7eb"
            />

            <ChartTooltip
              content={<CustomTooltip metrics={metrics} />}
              cursor={{ strokeDasharray: "3 3", stroke: "#9ca3af" }}
            />

            <Line
              type="monotone"
              dataKey={currentMetric}
              stroke={
                config[currentMetric as keyof typeof config]?.color || "#3b82f6"
              }
              strokeWidth={2}
              filter={isPlaceholderSeries ? undefined : "url(#lineShadow)"}
              strokeDasharray={isPlaceholderSeries ? "6 4" : undefined}
              dot={
                isPlaceholderSeries
                  ? {
                      r: 2,
                      fill:
                        config[currentMetric as keyof typeof config]?.color ||
                        "#3b82f6",
                      stroke: "white",
                      strokeWidth: 1,
                    }
                  : false
              }
              activeDot={{
                r: 6,
                fill:
                  config[currentMetric as keyof typeof config]?.color ||
                  "#3b82f6",
                stroke: "white",
                strokeWidth: 2,
                filter: "url(#dotShadow)",
              }}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}
