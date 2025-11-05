"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: LucideIcon;
  iconBg: string;
  value: string | number;
  label: string;
  className?: string;
  variant?: "primary" | "secondary";
  trend?: number | null;
}

export function MetricCard({
  icon: Icon,
  iconBg,
  value,
  label,
  className,
  variant = "secondary",
  trend = null,
}: MetricCardProps) {
  const isPrimary = variant === "primary";

  if (isPrimary) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-white border border-gray-200/80 shadow-sm hover:shadow-lg transition-all duration-300 group",
          className
        )}
      >
        {/* Gradient Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-5">
            <div
              className={cn(
                "rounded-xl flex items-center justify-center size-14 shadow-lg",
                iconBg
              )}
            >
              <Icon className="size-7 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl font-bold text-gray-900 tracking-tight">
              {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
            </h3>
            <p className="text-sm font-medium text-gray-600 leading-relaxed">
              {label}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200/80 p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "rounded-lg flex items-center justify-center size-11",
            iconBg
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-gray-900">
          {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">{label}</p>
      </div>
    </div>
  );
}

