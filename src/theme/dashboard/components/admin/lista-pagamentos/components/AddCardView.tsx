"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { ButtonCustom, InputCustom } from "@/components/ui/custom";
import {
  CreditCardForm,
  type CardState,
  type CardValidity,
} from "@/theme/dashboard/components/pagamentos/credit-card-form";
import { useAdicionarCartao, usePagarPendente } from "@/hooks";
import { useTenantCompany } from "@/hooks/useTenantCompany";
import { useCardToken } from "@/lib/mercadopago";
import { toastCustom } from "@/components/ui/custom/toast";
import { MaskService } from "@/services/components/input";
import { cn } from "@/lib/utils";

interface AddCardViewProps {
  onBack: () => void;
  onSuccess?: () => void;
}

interface PagamentoPendente {
  valor: number;
  valorFormatado: string;
  planoNome: string;
}

// Validação de CPF (algoritmo)
function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[10])) return false;

  return true;
}

// Validação de CNPJ (algoritmo)
function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, "");
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleaned[12])) return false;

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cleaned[13])) return false;

  return true;
}

export function AddCardView({ onBack, onSuccess }: AddCardViewProps) {
  // Estados do documento
  const [documentType, setDocumentType] = useState<"CPF" | "CNPJ">("CNPJ");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentValidation, setDocumentValidation] = useState<{
    status: "idle" | "valid" | "invalid" | "incomplete";
    message?: string;
  }>({ status: "idle" });

  // Estados do cartão
  const [cardData, setCardData] = useState<CardState | null>(null);
  const [validity, setValidity] = useState<CardValidity | null>(null);

  // Estados de pagamento pendente
  const [cartaoAdicionadoId, setCartaoAdicionadoId] = useState<string | null>(
    null
  );
  const [pagamentoPendente, setPagamentoPendente] =
    useState<PagamentoPendente | null>(null);
  const [showPendingPayment, setShowPendingPayment] = useState(false);

  // Estados de erro
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Hooks
  const adicionarCartao = useAdicionarCartao();
  const pagarPendenteMutation = usePagarPendente();
  const { tokenize, isTokenizing, error: mpError } = useCardToken();
  const { company } = useTenantCompany();

  // Pré-preencher CNPJ da empresa
  useEffect(() => {
    if (company?.cnpj) {
      setDocumentType("CNPJ");
      const maskService = MaskService.getInstance();
      const formatted = maskService.processInput(company.cnpj, "cnpj");
      setDocumentNumber(formatted);
      validateDocument(formatted, "CNPJ");
    }
  }, [company?.cnpj]);

  // Validação do documento
  const validateDocument = useCallback((doc: string, type: "CPF" | "CNPJ") => {
    const clean = doc.replace(/\D/g, "");
    const expectedLength = type === "CPF" ? 11 : 14;

    if (clean.length < expectedLength) {
      setDocumentValidation({ status: "incomplete" });
      return false;
    }

    const isValid = type === "CPF" ? isValidCPF(clean) : isValidCNPJ(clean);

    if (isValid) {
      setDocumentValidation({ status: "valid" });
      return true;
    } else {
      const message =
        type === "CPF"
          ? "CPF inválido. Verifique os dígitos."
          : "CNPJ inválido. Verifique os dígitos.";
      setDocumentValidation({ status: "invalid", message });
      return false;
    }
  }, []);

  const handleDocumentTypeChange = (type: "CPF" | "CNPJ") => {
    if (documentType !== type) {
      setDocumentType(type);
      setDocumentNumber("");
      setDocumentValidation({ status: "idle" });
    }
  };

  const handleDocumentChange = (value: string) => {
    const maskService = MaskService.getInstance();
    const maskType = documentType === "CPF" ? "cpf" : "cnpj";
    const formatted = maskService.processInput(value, maskType);
    setDocumentNumber(formatted);
    validateDocument(formatted, documentType);
  };

  const handleCardChange = useCallback(
    (state: CardState, val: CardValidity) => {
      setCardData(state);
      setValidity(val);
      setTokenError(null);
    },
    []
  );

  const handleSubmit = async () => {
    if (!cardData || !validity?.allValid) {
      toastCustom.error({
        title: "Dados incompletos",
        description: "Preencha todos os campos do cartão corretamente.",
      });
      return;
    }

    if (documentValidation.status !== "valid") {
      toastCustom.error({
        title: "Documento inválido",
        description: "Verifique o CPF/CNPJ informado.",
      });
      return;
    }

    setTokenError(null);

    try {
      // 1. Tokenizar cartão via SDK do Mercado Pago
      const tokenResult = await tokenize({
        cardNumber: cardData.number.replace(/\s/g, ""),
        cardholderName: cardData.holder.toUpperCase(),
        expirationMonth: cardData.month,
        expirationYear: cardData.year,
        securityCode: cardData.cvv,
        identificationType: documentType,
        identificationNumber: documentNumber.replace(/\D/g, ""),
      });

      if (!tokenResult.success || !tokenResult.token) {
        setTokenError(
          tokenResult.error || "Erro ao validar cartão. Verifique os dados."
        );
        toastCustom.error({
          title: "Erro na validação",
          description: tokenResult.error || "Verifique os dados do cartão.",
        });
        return;
      }

      // 2. Enviar token para API
      const result = await adicionarCartao.mutateAsync({
        token: tokenResult.token,
        tipo: cardData.type === "credit" ? "credito" : "debito",
        isPadrao: true,
      });

      // 3. Verificar se há pagamento pendente
      if (result.pagamentoPendente?.perguntarSeDesejaPagar) {
        setCartaoAdicionadoId(result.cartao.id);
        setPagamentoPendente({
          valor: result.pagamentoPendente.valor,
          valorFormatado: result.pagamentoPendente.valorFormatado,
          planoNome: result.pagamentoPendente.planoNome,
        });
        setShowPendingPayment(true);
      } else {
        toastCustom.success({
          title: "Cartão adicionado",
          description: "Seu cartão foi cadastrado com sucesso!",
        });
        onSuccess?.();
        onBack();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao adicionar cartão";
      setTokenError(errorMessage);
      toastCustom.error({
        title: "Erro",
        description: errorMessage,
      });
    }
  };

  const handlePagarAgora = async () => {
    if (!cartaoAdicionadoId) return;

    try {
      await pagarPendenteMutation.mutateAsync(cartaoAdicionadoId);
      toastCustom.success({
        title: "Pagamento processado!",
        description: "Seu plano foi reativado com sucesso.",
      });
      onSuccess?.();
      onBack();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao processar pagamento";
      toastCustom.error({
        title: "Erro no pagamento",
        description: errorMessage,
      });
    }
  };

  const handlePagarDepois = () => {
    toastCustom.info({
      title: "Cartão salvo",
      description: "O cartão foi salvo. Você pode pagar depois.",
    });
    onSuccess?.();
    onBack();
  };

  const isLoading =
    adicionarCartao.isPending ||
    pagarPendenteMutation.isPending ||
    isTokenizing;

  const isFormValid =
    validity?.allValid && documentValidation.status === "valid";

  // Tela de Pagamento Pendente
  if (showPendingPayment && pagamentoPendente) {
    return (
      <div className="h-full">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => setShowPendingPayment(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="size-4" />
            <span className="text-sm">Voltar</span>
          </button>
        </div>

        {/* Card de Pagamento Pendente */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-6">
            <CreditCard className="size-8 text-amber-600" />
          </div>

          <h2 className="!text-xl !font-semibold !text-gray-900 !mb-2">
            Pagamento Pendente
          </h2>
          <p className="!text-sm !text-gray-500 !mb-6">
            Cartão adicionado com sucesso!
          </p>

          <div className="bg-amber-50 rounded-xl p-4 mb-6">
            <p className="!text-sm !text-gray-600 !mb-1">
              Você tem uma fatura em aberto do plano:
            </p>
            <p className="!text-lg !font-semibold !text-gray-900 !mb-1">
              {pagamentoPendente.planoNome}
            </p>
            <p className="!text-2xl !font-bold !text-amber-600">
              {pagamentoPendente.valorFormatado}
            </p>
          </div>

          <p className="!text-sm !text-gray-500 !mb-6">
            Deseja pagar agora com o cartão recém cadastrado?
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <ButtonCustom
              variant="outline"
              size="lg"
              onClick={handlePagarDepois}
              disabled={isLoading}
              className="flex-1"
            >
              Pagar Depois
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              size="lg"
              onClick={handlePagarAgora}
              disabled={isLoading}
              isLoading={pagarPendenteMutation.isPending}
              icon="CreditCard"
              className="flex-1"
            >
              Pagar Agora
            </ButtonCustom>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto h-full">
      {/* Header */}
      <div className="mb-6 mt-[-20px]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          <span className="text-sm">Voltar para Assinatura</span>
        </button>

        <div className="flex items-center gap-3 mt-8">
          <div className="p-3 rounded-xl bg-[var(--primary-color)]/10">
            <CreditCard className="size-6 text-[var(--primary-color)]" />
          </div>
          <div>
            <h1 className="!text-xl !font-semibold !text-gray-900 !mb-0">
              Adicionar Cartão
            </h1>
            <p className="!text-sm !text-gray-500 !mb-0">
              Cadastre um cartão para pagamento automático do seu plano
            </p>
          </div>
        </div>
      </div>

      {/* Formulário Completo com Layout Horizontal */}
      <div className="space-y-6">
        {/* Documento do Titular */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="!text-base !font-semibold !text-gray-900 !mb-4">
            Documento do Titular
          </h3>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="shrink-0">
              <label className="!text-sm !font-medium !text-gray-700 !mb-2 block">
                Tipo <span className="text-red-500">*</span>
              </label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => handleDocumentTypeChange("CPF")}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer",
                    documentType === "CPF"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  CPF
                </button>
                <button
                  type="button"
                  onClick={() => handleDocumentTypeChange("CNPJ")}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer",
                    documentType === "CNPJ"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  CNPJ
                </button>
              </div>
            </div>

            <div className="flex-1">
              <label className="!text-sm !font-medium !text-gray-700 !mb-2 block">
                Número do Documento <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <InputCustom
                  placeholder={
                    documentType === "CPF"
                      ? "000.000.000-00"
                      : "00.000.000/0000-00"
                  }
                  value={documentNumber}
                  onChange={(e) => handleDocumentChange(e.target.value)}
                  maxLength={documentType === "CPF" ? 14 : 18}
                  size="md"
                  className={cn(
                    "pr-10",
                    documentValidation.status === "valid" &&
                      "border-emerald-500! focus:border-emerald-500! focus:ring-emerald-200!",
                    documentValidation.status === "invalid" &&
                      "border-red-500! focus:border-red-500! focus:ring-red-200!"
                  )}
                />
                {documentValidation.status === "valid" && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                )}
                {documentValidation.status === "invalid" && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
              {documentValidation.status === "invalid" &&
                documentValidation.message && (
                  <p className="!text-xs !text-red-500 !mt-2">
                    {documentValidation.message}
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Dados do Cartão - Layout Horizontal */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="!text-base !font-semibold !text-gray-900 !mb-4">
            Dados do Cartão
          </h3>

          <CreditCardForm
            onChange={handleCardChange}
            showSubmit={false}
            isLoading={isLoading}
            layout="horizontal"
          />
        </div>

        {/* Aviso de ambiente de desenvolvimento */}
        {typeof window !== "undefined" &&
          window.location.protocol !== "https:" && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="!text-sm !font-medium !text-amber-800 !mb-1">
                    Ambiente de desenvolvimento
                  </p>
                  <p className="!text-sm !text-amber-700 !mb-0">
                    A tokenização de cartões do Mercado Pago requer HTTPS. Em
                    localhost, use ngrok ou teste em ambiente de
                    produção/staging.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Erro de tokenização */}
        {(tokenError || mpError) && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="!text-sm !font-medium !text-red-800 !mb-0">
                  Erro na validação do cartão
                </p>
                <p className="!text-sm !text-red-700 !mb-0">
                  {tokenError || mpError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info sobre segurança */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
          <div className="flex items-start gap-3">
            <Shield className="size-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="!text-sm !font-medium !text-blue-800 !mb-1">
                Seus dados estão seguros
              </p>
              <p className="!text-sm !text-blue-700 !mb-0">
                Ao salvar, faremos uma validação de R$ 1,00 que será estornada
                imediatamente. Seus dados são protegidos e criptografados pelo
                Mercado Pago.
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:justify-end">
          <ButtonCustom
            variant="outline"
            size="md"
            onClick={onBack}
            disabled={isLoading}
            className="sm:w-auto"
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            isLoading={isLoading}
            className="sm:min-w-[200px]"
          >
            {isTokenizing ? "Validando..." : "Salvar Cartão"}
          </ButtonCustom>
        </div>
      </div>
    </div>
  );
}
