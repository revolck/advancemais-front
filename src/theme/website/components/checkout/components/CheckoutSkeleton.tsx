// src/theme/website/components/checkout/components/CheckoutSkeleton.tsx

"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const CheckoutSkeleton: React.FC = () => {
  return (
    <div className="container w-full mx-auto py-12">
      {/* Header skeleton */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Coluna esquerda */}
        <div className="lg:col-span-7 space-y-6">
          {/* Métodos de pagamento skeleton */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="p-4 border-b border-zinc-100">
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Formulário skeleton */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>

          {/* Dados do pagador skeleton */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
            <Skeleton className="h-5 w-36 mb-4" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>

        {/* Coluna direita */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Resumo skeleton */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6">
              <Skeleton className="h-6 w-24 mb-5" />
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="pt-4 border-t border-zinc-100 flex justify-between items-baseline">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </div>
            </div>

            {/* Cupom skeleton */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-lg" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-7 w-20 rounded-full" />
              </div>
            </div>

            {/* Segurança skeleton */}
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

