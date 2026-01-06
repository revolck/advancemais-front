"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface CourseInfoCardProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  gradient: string;
  darkGradient: string;
}

export function CourseInfoCard({
  icon: Icon,
  label,
  value,
  gradient,
  darkGradient,
}: CourseInfoCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/20 backdrop-blur-sm p-5",
        "bg-linear-to-br",
        gradient,
        "hover:border-white/40 transition-all duration-300 group shadow-lg"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            "bg-linear-to-br",
            darkGradient,
            "text-white shrink-0 shadow-md"
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-white/70 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-xl font-bold text-white mt-1 line-clamp-2">
            {typeof value === "string" ? value : value}
          </p>
        </div>
      </div>
    </div>
  );
}
