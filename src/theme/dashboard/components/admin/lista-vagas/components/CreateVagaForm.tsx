"use client";

import React, { useState } from "react";
import { ButtonCustom } from "@/components/ui/custom";
import { InputCustom } from "@/components/ui/custom/input";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { SelectCustom } from "@/components/ui/custom/select";
import { useEmpresasForSelect } from "../hooks/useEmpresasForSelect";

interface CreateVagaFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

export function CreateVagaForm({
  onSuccess,
  onCancel,
  isSubmitting,
  setIsSubmitting,
}: CreateVagaFormProps) {
  const {
    empresas,
    isLoading: isLoadingEmpresas,
    error: empresasError,
  } = useEmpresasForSelect();

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    empresaId: "",
    localizacao: "",
    salario: "",
    status: "PUBLICADO", // Status padrão como PUBLICADO
  });

  const isDisabled = isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Implementar criação da vaga
      console.log("Criando vaga:", formData);

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess();

      // Reset form
      setFormData({
        titulo: "",
        descricao: "",
        empresaId: "",
        localizacao: "",
        salario: "",
        status: "PUBLICADO",
      });
    } catch (error) {
      console.error("Erro ao criar vaga:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6 p-1">
        <fieldset disabled={isDisabled} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informações Básicas
              </h3>
              <div className="space-y-4">
                <InputCustom
                  label="Título da Vaga"
                  placeholder="Ex: Desenvolvedor Frontend"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange("titulo", e.target.value)}
                  required
                  maxLength={100}
                  disabled={isDisabled}
                />

                <SimpleTextarea
                  label="Descrição"
                  placeholder="Descreva as responsabilidades e requisitos da vaga..."
                  value={formData.descricao}
                  onChange={(e) => handleInputChange("descricao", e.target.value)}
                  rows={4}
                  maxLength={500}
                  showCharCount
                  disabled={isDisabled}
                />
              </div>
            </div>

            {/* Detalhes da Vaga */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Detalhes da Vaga
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectCustom
                  label="Empresa *"
                  placeholder={
                    isLoadingEmpresas
                      ? "Carregando empresas..."
                      : "Selecione uma empresa"
                  }
                  options={empresas}
                  value={formData.empresaId || null}
                  onChange={(value) =>
                    handleInputChange("empresaId", value || "")
                  }
                  disabled={isDisabled || isLoadingEmpresas}
                  error={empresasError || undefined}
                  required
                />

                <InputCustom
                  label="Localização"
                  placeholder="Cidade, Estado"
                  value={formData.localizacao}
                  onChange={(e) =>
                    handleInputChange("localizacao", e.target.value)
                  }
                  maxLength={100}
                  disabled={isDisabled}
                />

                <InputCustom
                  label="Salário"
                  placeholder="Ex: R$ 5.000 - R$ 8.000"
                  value={formData.salario}
                  onChange={(e) => handleInputChange("salario", e.target.value)}
                  maxLength={50}
                  disabled={isDisabled}
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <ButtonCustom
              type="button"
              variant="outline"
              size="md"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              disabled={
                isSubmitting || !formData.titulo.trim() || !formData.empresaId
              }
              withAnimation
            >
              {isSubmitting ? "Criando..." : "Criar Vaga"}
            </ButtonCustom>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
