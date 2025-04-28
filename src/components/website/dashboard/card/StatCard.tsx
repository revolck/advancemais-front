import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export default function StatCard({
  title,
  value,
  description,
  trend,
  icon,
  className,
}: StatCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-5 shadow-sm", className)}>
      <div className="flex justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center gap-1">
            <p className="text-2xl font-bold">{value}</p>

            {/* Indicador de tendência */}
            {trend === "up" ? (
              <span className="text-sm font-medium text-green-500">↑</span>
            ) : trend === "down" ? (
              <span className="text-sm font-medium text-red-500">↓</span>
            ) : null}
          </div>
        </div>

        {/* Ícone do card */}
        {icon && (
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            {icon}
          </div>
        )}
      </div>

      {/* Descrição */}
      {description && (
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
