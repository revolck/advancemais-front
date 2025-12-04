"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { FileText, ChevronDown, Check, Shield } from "lucide-react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import { cn } from "@/lib/utils";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onCancel?: () => void;
}

const termsContent = [
  {
    title: "Objeto do Contrato",
    content:
      "Este contrato tem como objeto a prestação de serviços de plataforma de recrutamento e seleção, conforme o plano escolhido pelo CONTRATANTE.",
  },
  {
    title: "Cobrança Recorrente",
    content:
      "O CONTRATANTE autoriza expressamente a cobrança recorrente mensal do valor correspondente ao plano selecionado, que será debitado automaticamente no método de pagamento cadastrado.",
  },
  {
    title: "Cancelamento",
    content:
      "O CONTRATANTE poderá cancelar a assinatura a qualquer momento através do painel de controle. O cancelamento será efetivado ao final do período já pago, sem reembolso proporcional.",
  },
  {
    title: "Garantia de 7 Dias",
    content:
      "Oferecemos garantia de reembolso total em até 7 dias corridos após a primeira cobrança, caso o CONTRATANTE não esteja satisfeito com os serviços prestados.",
  },
  {
    title: "Alteração de Plano",
    content:
      "O CONTRATANTE poderá solicitar upgrade ou downgrade de plano a qualquer momento. Em caso de upgrade, será cobrada a diferença proporcional. Em caso de downgrade, o novo valor será aplicado no próximo ciclo de cobrança.",
  },
  {
    title: "Privacidade e Segurança",
    content:
      "Todos os dados fornecidos são protegidos conforme a Lei Geral de Proteção de Dados (LGPD). As transações são processadas em ambiente seguro com certificação SSL e PCI DSS.",
  },
  {
    title: "Responsabilidades",
    content:
      "O CONTRATANTE é responsável por manter seus dados cadastrais atualizados e por garantir que o método de pagamento tenha saldo suficiente para as cobranças recorrentes.",
  },
  {
    title: "Suspensão do Serviço",
    content:
      "Em caso de inadimplência, o serviço poderá ser suspenso após 5 dias corridos da data de vencimento. O acesso será restabelecido automaticamente após a regularização do pagamento.",
  },
  {
    title: "Foro e Legislação",
    content:
      "Este contrato é regido pelas leis brasileiras. Fica eleito o foro da comarca da sede da CONTRATADA para dirimir quaisquer questões oriundas deste contrato.",
  },
];

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  onCancel,
}) => {
  const termsContentRef = useRef<HTMLDivElement>(null);
  const [termsScrollComplete, setTermsScrollComplete] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTermsScrollComplete(false);
      setScrollProgress(0);
    }
  }, [isOpen]);

  const handleTermsScroll = useCallback(() => {
    if (!termsContentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = termsContentRef.current;
    const progress = Math.min(
      100,
      Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)
    );
    setScrollProgress(progress);

    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;

    if (isAtBottom && !termsScrollComplete) {
      setTermsScrollComplete(true);
    }
  }, [termsScrollComplete]);

  const handleAcceptTerms = () => {
    onAccept();
  };

  const handleCloseTerms = () => {
    onCancel?.();
    onClose();
  };

  const scrollToBottom = () => {
    if (termsContentRef.current) {
      termsContentRef.current.scrollTo({
        top: termsContentRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={handleCloseTerms}
      size="lg"
      isDismissable={true}
      isKeyboardDismissDisabled={false}
      backdrop="blur"
    >
      <ModalContentWrapper
        className="!p-0 overflow-hidden"
        hideCloseButton={true}
      >
        <ModalHeader className="bg-gradient-to-br from-[var(--primary-color)] via-[var(--primary-color)]/95 to-[var(--primary-color)]/85 px-6 py-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <ModalTitle className="!pt-2 !text-lg !font-semibold !text-white !leading-tight !mb-0">
                Termos de Contratação
              </ModalTitle>
              <ModalDescription className="!text-sm !text-white/80 !mb-0">
                Leia atentamente antes de aceitar
              </ModalDescription>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
              <span>Progresso da leitura</span>
              <span>{scrollProgress}%</span>
            </div>
            <div className="h-1 bg-white/25 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300 rounded-full",
                  termsScrollComplete
                    ? "bg-white"
                    : "bg-gradient-to-r from-white via-white/80 to-white/60"
                )}
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="p-0 relative">
          {/* Conteúdo scrollável */}
          <div
            ref={termsContentRef}
            onScroll={handleTermsScroll}
            className="max-h-[55vh] overflow-y-auto px-6 py-5 space-y-5 scroll-smooth"
          >
            {termsContent.map((section, index) => (
              <section key={index} className="group">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-zinc-100 text-zinc-600 text-xs font-semibold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h5 className="!mb-3 !pt-1.5">{section.title}</h5>
                    <p className="!text-sm !text-zinc-600 !leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </section>
            ))}
          </div>

          {/* Indicador de scroll - fixo no fundo do ModalBody */}
          {!termsScrollComplete && (
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-10">
              <div className="h-16 bg-gradient-to-t from-white via-white/95 to-transparent flex items-end justify-center pb-3">
                <button
                  onClick={scrollToBottom}
                  className="pointer-events-auto flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 transition-colors animate-bounce bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-zinc-200"
                  type="button"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>Role para continuar</span>
                </button>
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter className="border-t border-zinc-100 px-6 py-4 bg-zinc-50/50 gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ButtonCustom
              variant="ghost"
              onClick={handleCloseTerms}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              onClick={handleAcceptTerms}
              disabled={!termsScrollComplete}
              className={cn(
                "flex-1 sm:flex-none transition-all",
                termsScrollComplete && "!bg-emerald-600 hover:!bg-emerald-700"
              )}
            >
              {termsScrollComplete ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  Aceitar termos
                </>
              ) : (
                "Leia os termos"
              )}
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
};
