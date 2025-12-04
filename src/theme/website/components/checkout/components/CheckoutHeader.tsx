"use client";

import React from "react";
import { ArrowLeft, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonCustom } from "@/components/ui/custom/button";

interface CheckoutHeaderProps {
  minutes: number;
  seconds: number;
  isLowTime: boolean;
  onBack: () => void;
}

export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({
  minutes,
  seconds,
  isLowTime,
  onBack,
}) => {
  return (
    <header className="mb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white/90 border border-zinc-200 rounded-2xl px-4 py-3">
        <ButtonCustom
          variant="ghost"
          size="sm"
          onClick={onBack}
          withAnimation={false}
          className="justify-start gap-2 text-zinc-500 hover:text-zinc-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </ButtonCustom>

        <div className="flex items-center justify-between sm:justify-center flex-1 sm:px-4 gap-6">
          <div className="hidden sm:flex flex-col items-center text-center">
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              Checkout
            </span>
            <span className="text-sm font-medium text-zinc-500">
              Complete sua assinatura com segurança
            </span>
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
              <Shield className="w-3.5 h-3.5" />
              Ambiente protegido
            </span>
          </div>

          <span className="flex sm:hidden items-center gap-1 text-xs font-medium text-emerald-600">
            <Shield className="w-3.5 h-3.5" />
            Ambiente protegido
          </span>
        </div>

        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono shrink-0",
            isLowTime
              ? "bg-red-50 text-red-600"
              : "bg-zinc-100 text-zinc-600"
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
      </div>
    </header>
  );
}

