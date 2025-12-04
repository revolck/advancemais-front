// src/theme/website/components/checkout/components/PayerDataForm.tsx

"use client";

import React, { useState, useCallback } from "react";
import { InputCustom } from "@/components/ui/custom/input";
import { cn } from "@/lib/utils";
import {
  formatCNPJ,
  formatCPF,
  isValidCPF,
  isValidCNPJ,
  sanitizeDocument,
} from "../utils/formatters";
import { Separator } from "@/components/ui/separator";
import { lookupCep, normalizeCep } from "@/lib/cep";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { PaymentMethod } from "../types";

export interface PayerAddress {
  zipCode: string;
  streetName: string;
  streetNumber: string;
  neighborhood: string;
  city: string;
  federalUnit: string;
}

export interface DocumentValidationResult {
  isValid: boolean;
  type: "CPF" | "CNPJ";
  message?: string;
}

interface PayerDataFormProps {
  payerEmail: string;
  payerDocument: string;
  documentType: "CPF" | "CNPJ";
  paymentMethod: PaymentMethod;
  address?: PayerAddress;
  onPayerEmailChange: (value: string) => void;
  onPayerDocumentChange: (value: string) => void;
  onDocumentTypeChange: (type: "CPF" | "CNPJ") => void;
  onAddressChange?: (address: PayerAddress) => void;
  /** Callback quando a validação do documento falha (para mostrar modal) */
  onDocumentValidationError?: (result: DocumentValidationResult) => void;
  /** Callback quando a validação do documento é bem-sucedida */
  onDocumentValidationSuccess?: (result: DocumentValidationResult) => void;
}

export const PayerDataForm: React.FC<PayerDataFormProps> = ({
  payerEmail,
  payerDocument,
  documentType,
  paymentMethod,
  address,
  onPayerEmailChange,
  onPayerDocumentChange,
  onDocumentTypeChange,
  onAddressChange,
  onDocumentValidationError,
  onDocumentValidationSuccess,
}) => {
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [documentValidation, setDocumentValidation] = useState<{
    status: "idle" | "valid" | "invalid" | "incomplete";
    message?: string;
  }>({ status: "idle" });

  // Mostrar campos de endereço apenas para boleto
  const showAddressFields = paymentMethod === "boleto";

  // Valida o documento em tempo real
  const validateDocument = useCallback(
    (doc: string, type: "CPF" | "CNPJ") => {
      const clean = sanitizeDocument(doc);
      const expectedLength = type === "CPF" ? 11 : 14;

      // Se não tem todos os dígitos ainda, é incompleto
      if (clean.length < expectedLength) {
        setDocumentValidation({ status: "incomplete" });
        return;
      }

      // Valida matematicamente
      const isValid = type === "CPF" ? isValidCPF(clean) : isValidCNPJ(clean);

      if (isValid) {
        setDocumentValidation({ status: "valid" });
        onDocumentValidationSuccess?.({
          isValid: true,
          type,
        });
      } else {
        const message =
          type === "CPF"
            ? "CPF inválido. Verifique os dígitos informados."
            : "CNPJ inválido. Verifique os dígitos informados.";

        setDocumentValidation({ status: "invalid", message });
        onDocumentValidationError?.({
          isValid: false,
          type,
          message,
        });
      }
    },
    [onDocumentValidationError, onDocumentValidationSuccess]
  );

  const handleDocumentTypeChange = (type: "CPF" | "CNPJ") => {
    if (documentType !== type) {
      onDocumentTypeChange(type);
      onPayerDocumentChange(""); // Limpa o campo ao trocar tipo
      setDocumentValidation({ status: "idle" }); // Reseta validação
    }
  };

  const handleDocumentChange = (value: string) => {
    const formatted =
      documentType === "CNPJ" ? formatCNPJ(value) : formatCPF(value);
    onPayerDocumentChange(formatted);
    validateDocument(formatted, documentType);
  };

  const handleAddressFieldChange = useCallback(
    (field: keyof PayerAddress, value: string) => {
      if (onAddressChange && address) {
        onAddressChange({
          ...address,
          [field]: value,
        });
      }
    },
    [address, onAddressChange]
  );

  const handleCepChange = useCallback(
    async (value: string) => {
      const formattedCep = normalizeCep(value);
      handleAddressFieldChange("zipCode", formattedCep);
      setCepError(null);

      const cleanCep = value.replace(/\D/g, "");
      if (cleanCep.length !== 8) {
        return;
      }

      setIsLoadingCep(true);
      try {
        const result = await lookupCep(cleanCep);
        if ("error" in result) {
          setCepError(result.error);
          return;
        }

        // Preenche automaticamente os campos
        if (onAddressChange) {
          onAddressChange({
            zipCode: result.cep,
            streetName: result.street || address?.streetName || "",
            neighborhood: result.neighborhood || address?.neighborhood || "",
            city: result.city || address?.city || "",
            federalUnit: result.state || address?.federalUnit || "",
            streetNumber: address?.streetNumber || "",
          });
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        setCepError("Erro ao buscar CEP. Tente novamente.");
      } finally {
        setIsLoadingCep(false);
      }
    },
    [address, handleAddressFieldChange, onAddressChange]
  );

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
      <h5 className="!mb-4">Dados do pagador</h5>
      <Separator className="!bg-zinc-200/30" />

      <InputCustom
        label="E-mail"
        name="payerEmail"
        type="email"
        value={payerEmail}
        onChange={(e) => onPayerEmailChange(e.target.value)}
        placeholder="seu@email.com"
        size="md"
        required
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">
          Documento <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <div className="flex bg-zinc-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => handleDocumentTypeChange("CPF")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
                documentType === "CPF"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              CPF
            </button>
            <button
              type="button"
              onClick={() => handleDocumentTypeChange("CNPJ")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
                documentType === "CNPJ"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              CNPJ
            </button>
          </div>
          <div className="flex-1 relative">
            <InputCustom
              name="payerDocument"
              value={payerDocument}
              onChange={(e) => handleDocumentChange(e.target.value)}
              placeholder={
                documentType === "CNPJ"
                  ? "00.000.000/0000-00"
                  : "000.000.000-00"
              }
              maxLength={documentType === "CNPJ" ? 18 : 14}
              size="md"
              className={cn(
                "pr-10",
                documentValidation.status === "valid" &&
                  "!border-emerald-500 focus:!border-emerald-500 focus:!ring-emerald-200",
                documentValidation.status === "invalid" &&
                  "!border-red-500 focus:!border-red-500 focus:!ring-red-200"
              )}
              required
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
        {/* Mensagem de erro inline (sutil) */}
        {documentValidation.status === "invalid" &&
          documentValidation.message && (
            <p className="!text-xs !text-red-500 !mt-1">
              {documentValidation.message}
            </p>
          )}
      </div>

      {/* Campos de endereço - apenas para boleto */}
      {showAddressFields && (
        <>
          <Separator className="!bg-zinc-200/30 !my-6" />
          <h5 className="!mb-4">Endereço de cobrança</h5>

          {/* CEP */}
          <div className="relative">
            <InputCustom
              label="CEP"
              name="cep"
              value={address?.zipCode || ""}
              onChange={(e) => handleCepChange(e.target.value)}
              placeholder="00000-000"
              maxLength={9}
              size="md"
              required
              error={cepError || undefined}
            />
            {isLoadingCep && (
              <div className="absolute right-3 top-9">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              </div>
            )}
          </div>

          {/* Logradouro e Número */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <InputCustom
                label="Logradouro"
                name="streetName"
                value={address?.streetName || ""}
                onChange={(e) =>
                  handleAddressFieldChange("streetName", e.target.value)
                }
                placeholder="Av. Paulista"
                size="md"
                required
              />
            </div>
            <InputCustom
              label="Número"
              name="streetNumber"
              value={address?.streetNumber || ""}
              onChange={(e) =>
                handleAddressFieldChange("streetNumber", e.target.value)
              }
              placeholder="1000"
              size="md"
              required
            />
          </div>

          {/* Bairro */}
          <InputCustom
            label="Bairro"
            name="neighborhood"
            value={address?.neighborhood || ""}
            onChange={(e) =>
              handleAddressFieldChange("neighborhood", e.target.value)
            }
            placeholder="Bela Vista"
            size="md"
            required
          />

          {/* Cidade e Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <InputCustom
                label="Cidade"
                name="city"
                value={address?.city || ""}
                onChange={(e) =>
                  handleAddressFieldChange("city", e.target.value)
                }
                placeholder="São Paulo"
                size="md"
                required
              />
            </div>
            <InputCustom
              label="Estado"
              name="federalUnit"
              value={address?.federalUnit || ""}
              onChange={(e) =>
                handleAddressFieldChange(
                  "federalUnit",
                  e.target.value.toUpperCase().slice(0, 2)
                )
              }
              placeholder="SP"
              maxLength={2}
              size="md"
              required
            />
          </div>
        </>
      )}
    </div>
  );
};
