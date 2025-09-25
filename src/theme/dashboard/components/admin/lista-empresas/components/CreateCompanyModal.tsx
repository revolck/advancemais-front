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
import { createAdminCompany } from "@/api/empresas/admin";

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

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro quando o usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
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

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Erro ao criar empresa:", error);
      toastCustom.error({
        title: "Erro ao criar empresa",
        description: "Não foi possível criar a empresa. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    onClose();
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
          <ModalBody className="space-y-6 p-1">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputCustom
                  label="CNPJ"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange("cnpj", e.target.value)}
                  error={errors.cnpj}
                  required
                  mask="cnpj"
                  placeholder="00.000.000/0000-00"
                />

                <InputCustom
                  label="Nome da Empresa"
                  name="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  error={errors.nome}
                  required
                  placeholder="Digite o nome da empresa"
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
              disabled={isLoading}
              isLoading={isLoading}
            >
              {isLoading ? "Cadastrando..." : "Cadasrar Empresa"}
            </ButtonCustom>
          </ModalFooter>
        </form>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
