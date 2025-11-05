"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ButtonCustom } from "@/components/ui/custom/button";
import { InputCustom } from "@/components/ui/custom/input";
import { SimpleTextarea } from "@/components/ui/custom";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toastCustom } from "@/components/ui/custom/toast";
import type { StatusProcesso, StatusProcessoFormData } from "../types";
import { STATUS_PROCESSO_VALIDATION } from "../types";

// Schema de validação
const statusProcessoSchema = z.object({
  nome: z
    .string()
    .min(
      STATUS_PROCESSO_VALIDATION.NOME.MIN_LENGTH,
      "Nome deve ter pelo menos 2 caracteres",
    )
    .max(
      STATUS_PROCESSO_VALIDATION.NOME.MAX_LENGTH,
      "Nome deve ter no máximo 100 caracteres",
    ),
  descricao: z
    .string()
    .min(
      STATUS_PROCESSO_VALIDATION.DESCRICAO.MIN_LENGTH,
      "Descrição deve ter pelo menos 5 caracteres",
    )
    .max(
      STATUS_PROCESSO_VALIDATION.DESCRICAO.MAX_LENGTH,
      "Descrição deve ter no máximo 500 caracteres",
    ),
  ativo: z.boolean(),
  isDefault: z.boolean(),
});

interface StatusProcessoFormProps {
  status?: StatusProcesso;
  onSubmit: (data: StatusProcessoFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  hasExistingDefault?: boolean;
  isEditingDefault?: boolean;
}

export function StatusProcessoForm({
  status,
  onSubmit,
  onCancel,
  isSubmitting = false,
  hasExistingDefault = false,
  isEditingDefault = false,
}: StatusProcessoFormProps) {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StatusProcessoFormData>({
    resolver: zodResolver(statusProcessoSchema) as any,
    defaultValues: {
      nome: status?.nome || "",
      descricao: status?.descricao || "",
      ativo: status?.ativo ?? true,
      isDefault: status?.isDefault ?? false,
    },
  });

  const isDisabled = isSubmitting;

  const onFormSubmit = async (data: any) => {
    // Se não há status padrão existente e não está marcando como padrão, forçar
    if (!hasExistingDefault && !data.isDefault) {
      toastCustom.error("O sistema precisa de pelo menos um status padrão");
      return;
    }

    await onSubmit(data as StatusProcessoFormData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="p-1">
      <fieldset disabled={isDisabled} className="space-y-6">
        {/* 1. Configurações do Status - Header com switches */}
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-gray-400/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border bg-blue-500/10 border-blue-500/20">
              <svg
                className="h-4 w-4 text-blue-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-md font-medium text-foreground">
              Configurações do Status
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Status Ativo */}
            <div className="flex items-center gap-3">
              <Label
                htmlFor="ativo"
                className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                  watch("ativo")
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {watch("ativo") ? "Ativo" : "Desativado"}
              </Label>
              <Switch
                id="ativo"
                checked={watch("ativo")}
                onCheckedChange={(checked) => setValue("ativo", checked)}
                disabled={isDisabled}
                className="transition-colors cursor-pointer disabled:cursor-not-allowed data-[state=checked]:bg-emerald-400/60 data-[state=unchecked]:bg-red-300/60 data-[state=checked]:border-emerald-500/50 data-[state=unchecked]:border-red-400/50"
              />
            </div>

            {/* Status Padrão - só mostra se pode alterar */}
            {(!hasExistingDefault || isEditingDefault) && (
              <div className="flex items-center gap-3">
                <Label
                  htmlFor="isDefault"
                  className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                    watch("isDefault")
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {watch("isDefault") ? "Padrão" : "Normal"}
                </Label>
                <Switch
                  id="isDefault"
                  checked={watch("isDefault")}
                  onCheckedChange={(checked) => setValue("isDefault", checked)}
                  disabled={isDisabled}
                  className="transition-colors cursor-pointer disabled:cursor-not-allowed data-[state=checked]:bg-blue-400/60 data-[state=unchecked]:bg-gray-300/60 data-[state=checked]:border-blue-500/50 data-[state=unchecked]:border-gray-400/50"
                />
              </div>
            )}
          </div>
        </div>

        {/* 2. Nome - largura total */}
        <InputCustom
          label="Nome"
          name="nome"
          value={watch("nome")}
          onChange={(e) => setValue("nome", e.target.value)}
          placeholder="Ex: Entrevista Técnica"
          error={errors.nome?.message}
          required
          size="md"
          disabled={isDisabled}
        />

        {/* 3. Descrição - usando SimpleTextarea com limite de 250 caracteres */}
        <SimpleTextarea
          label="Descrição"
          id="descricao"
          value={watch("descricao")}
          onChange={(e) => setValue("descricao", e.target.value)}
          placeholder="Descrição detalhada do status"
          maxLength={250}
          showCharCount={true}
          className="min-h-[100px]"
          required
        />
        {errors.descricao && (
          <p className="text-sm text-destructive flex items-center gap-2 mt-1">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            {errors.descricao.message}
          </p>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-3 pt-4">
          <ButtonCustom
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isDisabled}
            size="md"
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            type="submit"
            variant="primary"
            disabled={isDisabled}
            size="md"
          >
            {isSubmitting ? "Salvando..." : status ? "Atualizar" : "Criar"}{" "}
            Status
          </ButtonCustom>
        </div>
      </fieldset>
    </form>
  );
}
