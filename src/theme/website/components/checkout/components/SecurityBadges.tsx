// src/theme/website/components/checkout/components/SecurityBadges.tsx

"use client";

import React from "react";
import { Lock, ShieldCheck, FileCheck } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const items = [
  {
    icon: Lock,
    title: "Conexão segura",
    detail: "SSL 256-bit",
    description:
      "Criptografia de ponta a ponta: os dados que você informa são protegidos durante toda a transmissão.",
    color: "emerald",
  },
  {
    icon: ShieldCheck,
    title: "Pagamento auditado",
    detail: "PCI DSS",
    description:
      "Infraestrutura aprovada em auditorias internacionais de segurança para processamento de pagamentos.",
    color: "sky",
  },
  {
    icon: FileCheck,
    title: "Privacidade garantida",
    detail: "LGPD",
    description:
      "Usamos seus dados apenas para concluir o pedido e seguimos todas as diretrizes da Lei Geral de Proteção de Dados.",
    color: "violet",
  },
];

export const SecurityBadges: React.FC = () => {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 space-y-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-zinc-800">
          Segurança que acompanha sua compra do início ao fim
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <Tooltip key={item.title}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "group flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 bg-gradient-to-br",
                  "w-full",
                  item.color === "emerald" &&
                    "from-emerald-50/80 via-white to-white border-emerald-100",
                  item.color === "sky" &&
                    "from-sky-50/80 via-white to-white border-sky-100",
                  item.color === "violet" &&
                    "from-violet-50/80 via-white to-white border-violet-100"
                )}
              >
                <span className="w-9 h-9 rounded-full bg-white border border-white shadow-sm flex items-center justify-center">
                  <item.icon
                    className={cn(
                      "w-4 h-4",
                      item.color === "emerald" && "text-emerald-600",
                      item.color === "sky" && "text-sky-600",
                      item.color === "violet" && "text-violet-600"
                    )}
                  />
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-zinc-800">
                    {item.title}
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400">
                    {item.detail}
                  </span>
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={8} className="max-w-56 p-3">
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5 bg-white/10 rounded-md">
                    <item.icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white">
                    {item.detail}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <h6 className="text-sm font-medium text-white leading-snug">
                    {item.title}
                  </h6>
                  <p className="text-white/80 text-xs leading-relaxed text-justify">
                    {item.description}
                  </p>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};
