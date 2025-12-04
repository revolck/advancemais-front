// src/app/website/checkout/falha/page.tsx

"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw, MessageCircle, AlertTriangle } from "lucide-react";
import { generateSupportWhatsAppLink } from "@/lib/support";

export default function CheckoutFalhaPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const statusDetail = searchParams.get("status_detail");

  // Mapeia razões de falha para mensagens amigáveis
  const getFailureMessage = () => {
    if (statusDetail) {
      const messages: Record<string, string> = {
        cc_rejected_bad_filled_card_number: "Número do cartão inválido",
        cc_rejected_bad_filled_date: "Data de validade inválida",
        cc_rejected_bad_filled_security_code: "Código de segurança inválido",
        cc_rejected_insufficient_amount: "Saldo insuficiente",
        cc_rejected_call_for_authorize: "Pagamento não autorizado pelo banco",
        cc_rejected_duplicated_payment: "Pagamento duplicado",
        cc_rejected_card_disabled: "Cartão desativado",
        cc_rejected_max_attempts: "Limite de tentativas excedido",
        cc_rejected_high_risk: "Pagamento recusado por segurança",
        cc_rejected_other_reason: "Pagamento recusado pelo banco",
      };
      return messages[statusDetail] || "Não foi possível processar seu pagamento";
    }
    return "Ocorreu um erro ao processar seu pagamento";
  };

  const whatsappLink = generateSupportWhatsAppLink({
    message: `Olá! Tive um problema com meu pagamento${paymentId ? ` (ID: ${paymentId})` : ""}. Podem me ajudar?`,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Ícone de erro */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-14 h-14 text-red-500" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pagamento não aprovado
        </h1>

        {/* Descrição */}
        <p className="text-lg text-gray-600 mb-4">
          {getFailureMessage()}
        </p>

        <p className="text-gray-500 mb-8">
          Não se preocupe, nenhum valor foi cobrado do seu cartão.
        </p>

        {/* Info do pagamento (se disponível) */}
        {paymentId && (
          <div className="bg-white rounded-lg p-4 mb-8 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">ID da tentativa</p>
            <p className="font-mono text-gray-900 text-sm">{paymentId}</p>
          </div>
        )}

        {/* Card de sugestões */}
        <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200 shadow-sm text-left">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-900">O que você pode fazer</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2" />
              <p className="text-gray-600">
                Verifique se os dados do cartão foram inseridos corretamente
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2" />
              <p className="text-gray-600">
                Tente outro método de pagamento (PIX ou boleto)
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2" />
              <p className="text-gray-600">
                Entre em contato com seu banco para verificar o bloqueio
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2" />
              <p className="text-gray-600">
                Use um cartão diferente
              </p>
            </li>
          </ul>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/recrutamento">
            <Button size="lg" className="w-full sm:w-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </Link>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <MessageCircle className="w-4 h-4 mr-2" />
              Falar com suporte
            </Button>
          </a>
        </div>

        {/* Link para voltar */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-8 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para página inicial
        </Link>
      </div>
    </div>
  );
}



