// src/app/website/checkout/page.tsx

"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CheckoutView } from "@/theme/website/components/checkout";
import { Lock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname() || "";
  const [isVerifying, setIsVerifying] = useState(true);

  const sessionId = searchParams.get("sid");
  const token = searchParams.get("token");
  const ref = searchParams.get("ref");
  const plan = searchParams.get("plan");
  const plansPath =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/")
      ? "/dashboard/upgrade"
      : "/recrutamento";

  // Verifica se tem os parâmetros necessários e redireciona se não tiver
  useEffect(() => {
    const checkAccess = () => {
      if (!sessionId || !token) {
        // Redireciona para a página de planos
        router.replace(plansPath);
        return;
      }

      // Tem parâmetros válidos, pode continuar
      setIsVerifying(false);
    };

    // Pequeno delay para garantir que estamos no cliente
    const timer = setTimeout(checkAccess, 100);
    return () => clearTimeout(timer);
  }, [sessionId, token, router, plansPath]);

  // Estado de verificação - mostra loading enquanto valida
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <Lock className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="!text-zinc-600 !text-sm">Verificando sessão...</p>
        </motion.div>
      </div>
    );
  }

  // Se chegou aqui, tem sessão válida
  return (
    <CheckoutView
      sessionId={sessionId!}
      securityToken={token!}
      refTimestamp={ref || undefined}
      planSlug={plan || undefined}
    />
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              <Lock className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-gray-600 mt-4 font-medium">
              Carregando checkout seguro...
            </p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
