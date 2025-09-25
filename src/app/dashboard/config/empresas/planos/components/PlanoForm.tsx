"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ButtonCustom } from "@/components/ui/custom/button";
import { InputCustom } from "@/components/ui/custom/input";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { SelectCustom } from "@/components/ui/custom/select";
import { IconSelector } from "@/components/ui/custom/icon-selector";
import { Icon } from "@/components/ui/custom/Icons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { PlanoEmpresarialBackendResponse } from "@/api/empresas/planos-empresariais/types";

const planoFormSchema = z.object({
  icon: z.string().min(1, "Ícone é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(150, "Descrição deve ter no máximo 150 caracteres"),
  valor: z.string().min(1, "Valor é obrigatório"),
  desconto: z
    .number()
    .min(0, "Desconto deve ser maior ou igual a 0")
    .max(100, "Desconto deve ser menor ou igual a 100"),
  quantidadeVagas: z
    .number()
    .min(1, "Quantidade de vagas deve ser maior que 0")
    .max(1000, "Quantidade de vagas deve ser menor ou igual a 1000"),
  vagaEmDestaque: z.string().min(1, "Selecione uma opção"),
  quantidadeVagasDestaque: z
    .number()
    .min(0, "Quantidade de vagas em destaque deve ser maior ou igual a 0")
    .max(100, "Quantidade de vagas em destaque deve ser menor ou igual a 100")
    .optional(),
});

export type PlanoFormData = z.infer<typeof planoFormSchema>;

interface PlanoFormProps {
  plano?: PlanoEmpresarialBackendResponse;
  onSubmit: (data: PlanoFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function PlanoForm({
  plano,
  onSubmit,
  onCancel,
  loading = false,
}: PlanoFormProps) {
  const form = useForm<PlanoFormData>({
    resolver: zodResolver(planoFormSchema),
    defaultValues: {
      icon: plano?.icon || "",
      nome: plano?.nome || "",
      descricao: plano?.descricao || "",
      valor: plano?.valor || "",
      desconto: plano?.desconto || 0,
      quantidadeVagas: plano?.quantidadeVagas || 1,
      vagaEmDestaque: plano?.vagaEmDestaque ? "sim" : "nao",
      quantidadeVagasDestaque: plano?.quantidadeVagasDestaque || 0,
    },
  });

  const vagaEmDestaque = form.watch("vagaEmDestaque") === "sim";

  const handleSubmit = async (data: PlanoFormData) => {
    try {
      // Validação adicional antes de enviar
      if (!data.icon || !data.nome || !data.descricao || !data.valor) {
        throw new Error("Todos os campos obrigatórios devem ser preenchidos.");
      }

      if (
        data.vagaEmDestaque === "sim" &&
        (!data.quantidadeVagasDestaque || data.quantidadeVagasDestaque <= 0)
      ) {
        throw new Error(
          "Quantidade de vagas em destaque deve ser maior que 0 quando ativado."
        );
      }

      await onSubmit(data);
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Erro na validação do formulário:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-2 p-1"
      >
        {/* Primeira linha: Ícone e Nome do Plano */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Ícone */}
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <IconSelector
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Selecionar ícone"
                    className="cursor-pointer"
                    label="Ícone"
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nome */}
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputCustom
                    {...field}
                    label="Nome do Plano"
                    placeholder="Ex: Plano Corporativo"
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Segunda linha: Valor e Desconto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Valor */}
          <FormField
            control={form.control}
            name="valor"
            render={({ field }) => {
              // Função para formatar valor monetário
              const formatCurrency = (value: string) => {
                // Remove tudo que não é dígito
                const numbers = value.replace(/\D/g, "");

                // Se vazio, retorna 0,00
                if (numbers === "") return "0,00";

                // Converte para número e divide por 100 para ter centavos
                const amount = parseInt(numbers) / 100;

                // Formata com 2 casas decimais e vírgula
                return amount.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
              };

              return (
                <FormItem>
                  <FormControl>
                    <InputCustom
                      {...field}
                      label="Valor (R$)"
                      placeholder="0,00"
                      value={field.value || "0,00"}
                      onChange={(e) => {
                        const formatted = formatCurrency(e.target.value);
                        field.onChange(formatted);
                      }}
                      onBlur={(e) => {
                        // Garante que sempre tenha um valor válido
                        const formatted = formatCurrency(e.target.value);
                        field.onChange(formatted);
                      }}
                      onKeyDown={(e) => {
                        // Permite apenas números e teclas de controle
                        if (
                          !/[0-9]/.test(e.key) &&
                          e.key !== "Backspace" &&
                          e.key !== "Delete" &&
                          e.key !== "ArrowLeft" &&
                          e.key !== "ArrowRight" &&
                          e.key !== "Tab" &&
                          e.key !== "Enter"
                        ) {
                          e.preventDefault();
                        }
                      }}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Desconto */}
          <FormField
            control={form.control}
            name="desconto"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputCustom
                    {...field}
                    mask="numeric"
                    label="Desconto (%)"
                    maxLength={3}
                    placeholder="0"
                    value={field.value || 0}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^\d]/g, "");

                      // Se campo estiver vazio, mantém 0
                      if (value === "") {
                        field.onChange(0);
                        return;
                      }

                      let numValue = parseInt(value);

                      // Garante que seja um número válido
                      if (isNaN(numValue)) {
                        numValue = 0;
                      }

                      // Limita entre 0 e 100
                      if (numValue < 0) {
                        numValue = 0;
                      } else if (numValue > 100) {
                        numValue = 100;
                      }

                      field.onChange(numValue);
                    }}
                    onBlur={(e) => {
                      // Garante que sempre tenha um valor válido ao sair do campo
                      const value = e.target.value.replace(/[^\d]/g, "");
                      const numValue = parseInt(value) || 0;

                      if (numValue < 0) {
                        field.onChange(0);
                      } else if (numValue > 100) {
                        field.onChange(100);
                      } else {
                        field.onChange(numValue);
                      }
                    }}
                    onKeyDown={(e) => {
                      // Previne digitação de caracteres inválidos
                      if (
                        !/[0-9]/.test(e.key) &&
                        e.key !== "Backspace" &&
                        e.key !== "Delete" &&
                        e.key !== "ArrowLeft" &&
                        e.key !== "ArrowRight" &&
                        e.key !== "Tab"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Terceira linha: Quantidade de Vagas e Vagas em Destaque */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Quantidade de Vagas */}
          <FormField
            control={form.control}
            name="quantidadeVagas"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputCustom
                    {...field}
                    label="Quantidade de Vagas"
                    mask="numeric"
                    maxLength={4}
                    placeholder="1"
                    value={field.value || 1}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^\d]/g, "");

                      // Se campo estiver vazio, mantém 1 (mínimo)
                      if (value === "") {
                        field.onChange(1);
                        return;
                      }

                      let numValue = parseInt(value);

                      // Garante que seja um número válido
                      if (isNaN(numValue)) {
                        numValue = 1;
                      }

                      // Limita entre 1 e 1000
                      if (numValue < 1) {
                        numValue = 1;
                      } else if (numValue > 1000) {
                        numValue = 1000;
                      }

                      field.onChange(numValue);
                    }}
                    onBlur={(e) => {
                      // Garante que sempre tenha um valor válido ao sair do campo
                      const value = e.target.value.replace(/[^\d]/g, "");
                      const numValue = parseInt(value) || 1;

                      if (numValue < 1) {
                        field.onChange(1);
                      } else if (numValue > 1000) {
                        field.onChange(1000);
                      } else {
                        field.onChange(numValue);
                      }
                    }}
                    onKeyDown={(e) => {
                      // Previne digitação de caracteres inválidos
                      if (
                        !/[0-9]/.test(e.key) &&
                        e.key !== "Backspace" &&
                        e.key !== "Delete" &&
                        e.key !== "ArrowLeft" &&
                        e.key !== "ArrowRight" &&
                        e.key !== "Tab"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Destaque */}
          <FormField
            control={form.control}
            name="vagaEmDestaque"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SelectCustom
                    label="Destaque"
                    required
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecionar opção"
                    options={[
                      { value: "sim", label: "Ativar" },
                      { value: "nao", label: "Desativar" },
                    ]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Quantidade de Vagas em Destaque */}
        {vagaEmDestaque && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="quantidadeVagasDestaque"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputCustom
                      {...field}
                      label="Quantidade de Vagas em Destaque"
                      mask="numeric"
                      maxLength={3}
                      placeholder="0"
                      value={field.value || 0}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^\d]/g, "");

                        // Se campo estiver vazio, mantém 0
                        if (value === "") {
                          field.onChange(0);
                          return;
                        }

                        let numValue = parseInt(value);

                        // Garante que seja um número válido
                        if (isNaN(numValue)) {
                          numValue = 0;
                        }

                        // Limita entre 0 e 100
                        if (numValue < 0) {
                          numValue = 0;
                        } else if (numValue > 100) {
                          numValue = 100;
                        }

                        field.onChange(numValue);
                      }}
                      onBlur={(e) => {
                        // Garante que sempre tenha um valor válido ao sair do campo
                        const value = e.target.value.replace(/[^\d]/g, "");
                        const numValue = parseInt(value) || 0;

                        if (numValue < 0) {
                          field.onChange(0);
                        } else if (numValue > 100) {
                          field.onChange(100);
                        } else {
                          field.onChange(numValue);
                        }
                      }}
                      onKeyDown={(e) => {
                        // Previne digitação de caracteres inválidos
                        if (
                          !/[0-9]/.test(e.key) &&
                          e.key !== "Backspace" &&
                          e.key !== "Delete" &&
                          e.key !== "ArrowLeft" &&
                          e.key !== "ArrowRight" &&
                          e.key !== "Tab"
                        ) {
                          e.preventDefault();
                        }
                      }}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Descrição por último */}
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <SimpleTextarea
                  {...field}
                  placeholder="Descreva os benefícios e características do plano"
                  rows={2}
                  required
                  label="Descrição"
                  maxLength={150}
                  showCharCount={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Footer fixo com botões */}
        <footer className="bottom-0 left-0 right-0 p-1 mt-6">
          <div className="flex items-center justify-end gap-3">
            <ButtonCustom
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Icon name="Loader2" className="h-5 w-5 mr-2 animate-spin" />
                  {plano ? "Atualizando..." : "Criando..."}
                </>
              ) : (
                <>{plano ? "Atualizar" : "Criar"} Plano</>
              )}
            </ButtonCustom>
          </div>
        </footer>
      </form>
    </Form>
  );
}

export default PlanoForm;
