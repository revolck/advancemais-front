// src/app/website/checkout/page.tsx

"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckoutView } from "@/theme/website/components/checkout";
import { Loader2, Lock } from "lucide-react";

function CheckoutContent() {
  const searchParams = useSearchParams();
  
  const sessionId = searchParams.get("sid");
  const token = searchParams.get("token");
  const ref = searchParams.get("ref");
  const plan = searchParams.get("plan");

  // Se não tem os parâmetros necessários, mostra erro
  if (!sessionId || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Acesso Negado
            </h2>
            <p className="text-gray-600 mb-6">
              Esta página só pode ser acessada através de uma sessão de checkout válida. 
              Por favor, selecione um plano para iniciar o processo de compra.
            </p>
            <a 
              href="/recrutamento" 
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ver Planos Disponíveis
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CheckoutView 
      sessionId={sessionId} 
      securityToken={token}
      refTimestamp={ref || undefined}
      planSlug={plan || undefined}
    />
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
            <Lock className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 mt-4 font-medium">Carregando checkout seguro...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

