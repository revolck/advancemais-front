"use client";

import React, { useState } from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom";
import { InputCustom } from "@/components/ui/custom/input";
import { toastCustom } from "@/components/ui/custom";
import {
  createAdminCompany,
  validateAdminCompanyCnpj,
} from "@/api/empresas/admin";
import { Loader2, Check, AlertTriangle } from "lucide-react";

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  cnpj: string;
}

const initialFormData: FormData = {
  nome: "",
  email: "",
  telefone: "",
  cnpj: "",
};

export function CreateCompanyModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCompanyModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingCnpj, setIsValidatingCnpj] = useState(false);
  const [cnpjValidationStatus, setCnpjValidationStatus] = useState<
    "idle" | "validating" | "success" | "error"
  >("idle");
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Validação do nome: string não vazia (até 255 caracteres)
    const nomeTrimmed = formData.nome.trim();
    if (!nomeTrimmed) {
      newErrors.nome = "Nome da empresa é obrigatório";
    } else if (nomeTrimmed.length > 255) {
      newErrors.nome = "Nome deve ter no máximo 255 caracteres";
    }

    // Validação do email: string em formato de e-mail, normalizada para minúsculas
    const emailTrimmed = formData.email.trim().toLowerCase();
    if (!emailTrimmed) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      newErrors.email = "Email inválido";
    }

    // Validação do telefone: string entre 10 e 20 caracteres após trim (DDD + número)
    const telefoneTrimmed = formData.telefone.trim();
    if (!telefoneTrimmed) {
      newErrors.telefone = "Telefone é obrigatório";
    } else if (telefoneTrimmed.length < 10 || telefoneTrimmed.length > 20) {
      newErrors.telefone = "Telefone deve ter entre 10 e 20 caracteres";
    }

    // Validação do CNPJ: string entre 14 e 18 caracteres (aceita pontuação)
    const cnpjTrimmed = formData.cnpj.trim();
    if (!cnpjTrimmed) {
      newErrors.cnpj = "CNPJ é obrigatório";
    } else if (cnpjTrimmed.length < 14 || cnpjTrimmed.length > 18) {
      newErrors.cnpj = "CNPJ deve ter entre 14 e 18 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCnpj = async (cnpj: string) => {
    if (!cnpj || cnpj.length < 14) {
      setCnpjValidationStatus("idle");
      return;
    }

    setIsValidatingCnpj(true);
    setCnpjValidationStatus("validating");

    try {
      const result = await validateAdminCompanyCnpj(cnpj);
      if (result.exists) {
        setCnpjValidationStatus("error");
        toastCustom.error({
          title: "CNPJ já cadastrado",
          description: "Este CNPJ já está cadastrado em nossa base de dados",
        });
      } else {
        setCnpjValidationStatus("success");
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.cnpj;
          return newErrors;
        });
      }
    } catch (error) {
      console.error("Erro ao validar CNPJ:", error);
      setCnpjValidationStatus("error");
      toastCustom.error({
        title: "Erro de validação",
        description: "Não foi possível validar o CNPJ. Tente novamente.",
      });
    } finally {
      setIsValidatingCnpj(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro quando o usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Validar CNPJ quando o usuário parar de digitar
    if (field === "cnpj") {
      // Resetar status quando o usuário começar a digitar
      setCnpjValidationStatus("idle");

      const timeoutId = setTimeout(() => {
        validateCnpj(value);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Validar CNPJ antes de submeter
    if (formData.cnpj.trim()) {
      try {
        const result = await validateAdminCompanyCnpj(formData.cnpj.trim());
        if (result.exists) {
          toastCustom.error({
            title: "CNPJ já cadastrado",
            description: "Este CNPJ já está cadastrado em nossa base de dados",
          });
          return;
        }
      } catch (error) {
        console.error("Erro ao validar CNPJ:", error);
        toastCustom.error({
          title: "Erro de validação",
          description: "Não foi possível validar o CNPJ. Tente novamente.",
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      // Normalizar dados conforme especificação da API
      const nomeNormalized = formData.nome.trim();
      const emailNormalized = formData.email.trim().toLowerCase();
      const telefoneNormalized = formData.telefone.trim();
      const cnpjNormalized = formData.cnpj.trim();

      // Gerar supabaseId automaticamente usando o mesmo modelo da tela de cadastro
      const supabaseIdGenerated = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;

      const payload = {
        nome: nomeNormalized,
        email: emailNormalized,
        telefone: telefoneNormalized,
        supabaseId: supabaseIdGenerated,
        cnpj: cnpjNormalized,
        aceitarTermos: true,
      };

      await createAdminCompany(payload as any);

      // Resetar formulário
      setFormData(initialFormData);
      setErrors({});

      // Toast de sucesso
      toastCustom.success({
        title: "Empresa cadastrada com sucesso!",
        description: `A empresa "${nomeNormalized}" foi cadastrada com sucesso.`,
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Erro ao criar empresa:", error);

      // Toast de erro com mensagem específica
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível criar a empresa. Tente novamente.";

      toastCustom.error({
        title: "Erro ao cadastrar empresa",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setCnpjValidationStatus("idle");
    onClose();
  };

  const renderCnpjStatusIcon = () => {
    switch (cnpjValidationStatus) {
      case "validating":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "success":
        return <Check className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={handleClose}
      size="2xl"
      backdrop="blur"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Cadastrar Empresa</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <fieldset disabled={isLoading} className="space-y-6">
          <ModalBody className="space-y-6 p-1">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <InputCustom
                    label="CNPJ"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => handleInputChange("cnpj", e.target.value)}
                    error={errors.cnpj}
                    required
                    mask="cnpj"
                    placeholder="00.000.000/0000-00"
                    disabled={isValidatingCnpj || isLoading}
                  />
                  {cnpjValidationStatus !== "idle" && (
                    <div className="absolute right-3 top-2/3 -translate-y-1/2 flex items-center">
                      {renderCnpjStatusIcon()}
                    </div>
                  )}
                </div>

                <InputCustom
                  label="Nome da Empresa"
                  name="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  error={errors.nome}
                  required
                  placeholder="Digite o nome da empresa"
                  disabled={isLoading}
                />

                <InputCustom
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={errors.email}
                  required
                  placeholder="contato@empresa.com.br"
                  disabled={isLoading}
                />

                <InputCustom
                  label="Telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={(e) =>
                    handleInputChange("telefone", e.target.value)
                  }
                  error={errors.telefone}
                  required
                  mask="phone"
                  placeholder="(11) 99999-9999"
                  disabled={isLoading}
                />
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="pt-5">
            <ButtonCustom
              variant="outline"
              size="md"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              type="submit"
              size="md"
              variant="primary"
              disabled={
                isLoading ||
                isValidatingCnpj ||
                cnpjValidationStatus === "error"
              }
              isLoading={isLoading}
            >
              {isLoading
                ? "Cadastrando..."
                : isValidatingCnpj
                ? "Validando..."
                : "Cadastrar Empresa"}
            </ButtonCustom>
          </ModalFooter>
          </fieldset>
        </form>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
