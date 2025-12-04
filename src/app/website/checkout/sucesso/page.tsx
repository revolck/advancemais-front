// src/app/website/checkout/sucesso/page.tsx

"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Home, Sparkles } from "lucide-react";

export default function CheckoutSucessoPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animação de partículas de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            <Sparkles
              className="text-green-200"
              style={{
                width: `${12 + Math.random() * 16}px`,
                height: `${12 + Math.random() * 16}px`,
              }}
            />
          </div>
        ))}
      </div>

      <div className="max-w-lg w-full text-center relative z-10">
        {/* Ícone de sucesso animado */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-bounce-slow">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-20" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pagamento aprovado!
        </h1>

        {/* Descrição */}
        <p className="text-lg text-gray-600 mb-8">
          Sua assinatura foi ativada com sucesso. Você já pode começar a usar
          todos os recursos do seu plano.
        </p>

        {/* Info do pagamento (se disponível) */}
        {paymentId && (
          <div className="bg-white rounded-lg p-4 mb-8 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">ID do pagamento</p>
            <p className="font-mono text-gray-900">{paymentId}</p>
          </div>
        )}

        {/* Card de próximos passos */}
        <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200 shadow-sm text-left">
          <h3 className="font-semibold text-gray-900 mb-4">Próximos passos</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-green-600">1</span>
              </div>
              <p className="text-gray-600">
                Você receberá um email de confirmação com os detalhes da sua assinatura
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-green-600">2</span>
              </div>
              <p className="text-gray-600">
                Acesse o dashboard para começar a publicar suas vagas
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-green-600">3</span>
              </div>
              <p className="text-gray-600">
                Nossa equipe está à disposição para ajudar no que precisar
              </p>
            </li>
          </ul>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Ir para o Dashboard
            </Button>
          </Link>
          <Link href="/recrutamento">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Ver planos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Nota de suporte */}
        <p className="mt-8 text-sm text-gray-500">
          Dúvidas? Entre em contato pelo{" "}
          <a href="mailto:suporte@advancemais.com.br" className="text-primary hover:underline">
            suporte@advancemais.com.br
          </a>
        </p>
      </div>

      {/* CSS para animações */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.8;
          }
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
