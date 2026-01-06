"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CreditCard,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/custom/modal";
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

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PagamentoPendente {
  valor: number;
  valorFormatado: string;
  planoNome: string;
}

type Step = "document" | "card" | "pending";

// Validação de CPF (algoritmo)
function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;

  // Validação do segundo dígito verificador
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

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Validação do primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleaned[12])) return false;

  // Validação do segundo dígito verificador
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

export function AddCardModal({
  isOpen,
  onClose,
  onSuccess,
}: AddCardModalProps) {
  // Step atual
  const [currentStep, setCurrentStep] = useState<Step>("document");

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

  // Estados de erro
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Hooks
  const adicionarCartao = useAdicionarCartao();
  const pagarPendenteMutation = usePagarPendente();
  const { tokenize, isTokenizing, error: mpError } = useCardToken();
  const { company } = useTenantCompany();

  // Validação do documento
  const validateDocument = useCallback((doc: string, type: "CPF" | "CNPJ") => {
    const clean = doc.replace(/\D/g, "");
    const expectedLength = type === "CPF" ? 11 : 14;

    if (clean.length < expectedLength) {
      setDocumentValidation({ status: "incomplete" });
      return false;
    }

    // Validação real usando algoritmo
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

  // Pré-preencher CNPJ da empresa
  useEffect(() => {
    if (isOpen && company?.cnpj) {
      setDocumentType("CNPJ");
      const maskService = MaskService.getInstance();
      const formatted = maskService.processInput(company.cnpj, "cnpj");
      setDocumentNumber(formatted);
      validateDocument(formatted, "CNPJ");
    }
  }, [isOpen, company?.cnpj, validateDocument]);

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

  const handleNextStep = () => {
    if (documentValidation.status === "valid") {
      setCurrentStep("card");
    }
  };

  const handleBackStep = () => {
    setCurrentStep("document");
    setTokenError(null);
  };

  const handleSubmit = async () => {
    if (!cardData || !validity?.allValid) {
      toastCustom.error({
        title: "Dados incompletos",
        description: "Preencha todos os campos do cartão corretamente.",
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
        setCurrentStep("pending");
      } else {
        toastCustom.success({
          title: "Cartão adicionado",
          description: "Seu cartão foi cadastrado com sucesso!",
        });
        handleClose();
        onSuccess?.();
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
      handleClose();
      onSuccess?.();
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
    handleClose();
    onSuccess?.();
  };

  const handleClose = () => {
    setCurrentStep("document");
    setCardData(null);
    setValidity(null);
    if (!company?.cnpj) {
      setDocumentType("CPF");
      setDocumentNumber("");
      setDocumentValidation({ status: "idle" });
    }
    setCartaoAdicionadoId(null);
    setPagamentoPendente(null);
    setTokenError(null);
    onClose();
  };

  const isLoading =
    adicionarCartao.isPending ||
    pagarPendenteMutation.isPending ||
    isTokenizing;

  // Step 3: Pagamento Pendente
  if (currentStep === "pending" && pagamentoPendente) {
    return (
      <ModalCustom
        isOpen={isOpen}
        onClose={handleClose}
        size="2xl"
        backdrop="blur"
        isDismissable={!isLoading}
      >
        <ModalContentWrapper>
          <ModalHeader className="pb-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100">
                <AlertCircle className="size-5 text-amber-600" />
              </div>
              <div>
                <ModalTitle className="text-lg! font-semibold! text-gray-900! mb-0!">
                  Pagamento Pendente
                </ModalTitle>
                <ModalDescription className="text-sm! text-gray-500! mb-0!">
                  Cartão adicionado com sucesso
                </ModalDescription>
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="py-6!">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50">
                <CreditCard className="size-8 text-amber-600" />
              </div>

              <div>
                <p className="text-gray-600! mb-2!">
                  Você tem uma fatura em aberto do plano:
                </p>
                <p className="text-lg! font-semibold! text-gray-900! mb-1!">
                  {pagamentoPendente.planoNome}
                </p>
                <p className="text-2xl! font-bold! text-amber-600!">
                  {pagamentoPendente.valorFormatado}
                </p>
              </div>

              <p className="text-sm! text-gray-500!">
                Deseja pagar agora com o cartão recém cadastrado?
              </p>
            </div>
          </ModalBody>

          <ModalFooter className="flex-col sm:flex-row gap-2">
            <ButtonCustom
              variant="outline"
              size="md"
              onClick={handlePagarDepois}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Pagar Depois
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              size="md"
              onClick={handlePagarAgora}
              disabled={isLoading}
              isLoading={pagarPendenteMutation.isPending}
              icon="CreditCard"
              className="w-full sm:w-auto"
            >
              Pagar Agora
            </ButtonCustom>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>
    );
  }

  // Step 1: Documento
  if (currentStep === "document") {
    return (
      <ModalCustom
        isOpen={isOpen}
        onClose={handleClose}
        size="2xl"
        backdrop="blur"
        isDismissable={!isLoading}
      >
        <ModalContentWrapper>
          <ModalHeader className="pb-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--primary-color)]/10">
                <CreditCard className="size-5 text-[var(--primary-color)]" />
              </div>
              <div>
                <ModalTitle className="text-lg! font-semibold! text-gray-900! mb-0!">
                  Adicionar Cartão
                </ModalTitle>
                <ModalDescription className="text-sm! text-gray-500! mb-0!">
                  Passo 1 de 2 - Dados do titular
                </ModalDescription>
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="py-6!">
            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--primary-color)] text-white text-sm font-medium">
                1
              </div>
              <div className="flex-1 h-1 bg-gray-200 rounded-full">
                <div className="w-1/2 h-full bg-[var(--primary-color)] rounded-full" />
              </div>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-500 text-sm font-medium">
                2
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm! font-medium! text-gray-700! mb-2! block">
                  Documento do titular <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {/* Toggle CPF/CNPJ */}
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

                  {/* Input do documento */}
                  <div className="flex-1 relative">
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
                    {/* Indicador de validação */}
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
                </div>
                {/* Mensagem de erro */}
                {documentValidation.status === "invalid" &&
                  documentValidation.message && (
                    <p className="text-xs! text-red-500! mt-2!">
                      {documentValidation.message}
                    </p>
                  )}
              </div>

              {/* Info */}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs! text-blue-700! mb-0!">
                    O documento é necessário para a validação do cartão junto ao
                    Mercado Pago.{" "}
                    {company?.cnpj &&
                      "Pré-preenchido com o CNPJ da sua empresa."}
                  </p>
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <ButtonCustom variant="outline" size="md" onClick={handleClose}>
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              size="md"
              onClick={handleNextStep}
              disabled={documentValidation.status !== "valid"}
            >
              Próximo
              <ChevronRight className="size-4 ml-1" />
            </ButtonCustom>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>
    );
  }

  // Step 2: Cartão (Layout Horizontal)
  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      backdrop="blur"
      isDismissable={!isLoading}
    >
      <ModalContentWrapper>
        <ModalHeader className="pb-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--primary-color)]/10">
              <CreditCard className="size-5 text-[var(--primary-color)]" />
            </div>
            <div>
              <ModalTitle className="text-lg! font-semibold! text-gray-900! mb-0!">
                Adicionar Cartão
              </ModalTitle>
              <ModalDescription className="text-sm! text-gray-500! mb-0!">
                Passo 2 de 2 - Dados do cartão
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="pt-4! space-y-4">
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white text-sm font-medium">
              <CheckCircle2 className="size-4" />
            </div>
            <div className="flex-1 h-1 bg-[var(--primary-color)] rounded-full" />
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--primary-color)] text-white text-sm font-medium">
              2
            </div>
          </div>

          {/* Resumo do documento */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span className="text-sm! text-gray-600!">
                {documentType}: <strong>{documentNumber}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleBackStep}
              className="text-sm text-[var(--primary-color)] hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="size-3" />
              Alterar
            </button>
          </div>

          {/* Formulário do Cartão (Layout Horizontal) */}
          <CreditCardForm
            onChange={handleCardChange}
            showSubmit={false}
            isLoading={isLoading}
            layout="horizontal"
          />

          {/* Erro de tokenização */}
          {(tokenError || mpError) && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-xs! text-red-700! mb-0!">
                  {tokenError || mpError}
                </p>
              </div>
            </div>
          )}

          {/* Info sobre validação */}
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs! text-blue-700! mb-0!">
                <strong>Seguro:</strong> Ao salvar, faremos uma validação de R$
                1,00 que será estornada imediatamente. Seus dados são protegidos
                e criptografados pelo Mercado Pago.
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <ButtonCustom
            variant="outline"
            size="md"
            onClick={handleBackStep}
            disabled={isLoading}
            icon="ArrowLeft"
          >
            Voltar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={!validity?.allValid || isLoading}
            isLoading={isLoading}
          >
            {isTokenizing ? "Validando..." : "Salvar Cartão"}
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
