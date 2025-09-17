import React from "react";

interface CompanyStatsProps {
  partners: number;
  trials: number;
  active: number;
  inactive: number;
}

export const CompanyStats: React.FC<CompanyStatsProps> = ({
  partners,
  trials,
  active,
  inactive,
}) => {
  const stats = [
    { label: "Parceiros", value: partners, color: "bg-emerald-500" },
    { label: "Teste", value: trials, color: "bg-blue-500" },
    { label: "Ativas", value: active, color: "bg-green-500" },
    { label: "Inativas", value: inactive, color: "bg-red-500" },
  ];

  return (
    <div className="flex items-center gap-4 text-sm text-gray-600">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${stat.color}`} aria-hidden="true" />
          <span>
            {stat.value} {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
};
