// src/app/website/checkout/pendente/page.tsx

"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock, Home, Mail, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function CheckoutPendentePage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const preferenceId = searchParams.get("preference_id");
  const externalReference = searchParams.get("external_reference");
  
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    const idToCopy = paymentId || preferenceId || externalReference;
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Ícone de pendente */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-14 h-14 text-amber-500" />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-amber-200 rounded-full animate-pulse opacity-30" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pagamento em análise
        </h1>

        {/* Descrição */}
        <p className="text-lg text-gray-600 mb-8">
          Estamos processando seu pagamento. Assim que for confirmado, você
          receberá um email e sua assinatura será ativada automaticamente.
        </p>

        {/* Info do pagamento */}
        {(paymentId || preferenceId || externalReference) && (
          <div className="bg-white rounded-lg p-4 mb-8 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 mb-2">
              {paymentId ? "ID do pagamento" : preferenceId ? "ID da preferência" : "Referência"}
            </p>
            <div className="flex items-center justify-center gap-2">
              <p className="font-mono text-gray-900">
                {paymentId || preferenceId || externalReference}
              </p>
              <button
                onClick={handleCopyId}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Copiar ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Card informativo */}
        <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200 shadow-sm text-left">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-500" />
            O que acontece agora?
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-amber-600">1</span>
              </div>
              <p className="text-gray-600">
                <strong>Para PIX:</strong> O pagamento é processado em até 30 minutos
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-amber-600">2</span>
              </div>
              <p className="text-gray-600">
                <strong>Para boleto:</strong> O prazo é de 1 a 2 dias úteis após o pagamento
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-amber-600">3</span>
              </div>
              <p className="text-gray-600">
                Você receberá um email assim que o pagamento for aprovado
              </p>
            </li>
          </ul>
        </div>

        {/* Aviso */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-amber-800">
            <strong>Importante:</strong> Não efetue um novo pagamento enquanto
            este estiver em análise para evitar cobranças duplicadas.
          </p>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Ir para o Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Voltar para início
            </Button>
          </Link>
        </div>

        {/* Nota de suporte */}
        <p className="mt-8 text-sm text-gray-500">
          Dúvidas sobre seu pagamento? Entre em contato pelo{" "}
          <a
            href="mailto:suporte@advancemais.com.br"
            className="text-primary hover:underline"
          >
            suporte@advancemais.com.br
          </a>
        </p>
      </div>
    </div>
  );
}



