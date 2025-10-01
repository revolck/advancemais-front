"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  SimpleTextarea,
  InputCustom,
  SelectCustom,
  ButtonCustom,
} from "@/components/ui/custom";
import type {
  EmpresaVagaSubcategoria,
  EmpresaVagaCategoria,
} from "@/api/empresas";

const subcategoriaFormSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(120, "Nome deve ter no máximo 120 caracteres"),
  descricao: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(200, "Descrição deve ter no máximo 200 caracteres"),
  categoriaPaiId: z.string().min(1, "Categoria pai é obrigatória"),
});

export type SubcategoriaFormData = z.infer<typeof subcategoriaFormSchema>;

interface SubcategoriaFormProps {
  subcategoria?: EmpresaVagaSubcategoria & { categoriaPai?: EmpresaVagaCategoria };
  categorias: EmpresaVagaCategoria[];
  isLoadingCategorias?: boolean;
  onSubmit: (data: SubcategoriaFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function SubcategoriaForm({
  subcategoria,
  categorias,
  isLoadingCategorias = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SubcategoriaFormProps) {
  const isDisabled = isSubmitting || isLoadingCategorias;
  const form = useForm<SubcategoriaFormData>({
    resolver: zodResolver(subcategoriaFormSchema),
    defaultValues: {
      nome: subcategoria?.nome || "",
      descricao: subcategoria?.descricao || "",
      categoriaPaiId: subcategoria?.categoriaPai?.id || subcategoria?.categoriaId || "",
    },
  });

  const handleSubmit = async (data: SubcategoriaFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="p-1">
        <fieldset disabled={isDisabled} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="categoriaPaiId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <SelectCustom
                      label="Categoria"
                      value={field.value?.toString() || ""}
                      onChange={(value) => field.onChange(value)}
                      disabled={isDisabled}
                      required
                      placeholder={
                        isLoadingCategorias
                          ? "Carregando categorias..."
                          : "Selecione uma categoria"
                      }
                      options={categorias.map((categoria) => ({
                        value: categoria.id,
                        label: categoria.nome,
                      }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputCustom
                      label="Nome da Subcategoria"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isDisabled}
                      required
                      placeholder="Digite o nome da subcategoria..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <SimpleTextarea
                      label="Descrição"
                      placeholder="Explique rapidamente o foco desta subcategoria de vagas"
                      value={field.value}
                      onChange={field.onChange}
                      required
                      rows={4}
                      maxLength={200}
                      disabled={isDisabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
              disabled={isDisabled || !form.formState.isValid}
              isLoading={isSubmitting}
              size="md"
            >
              {subcategoria ? "Atualizar" : "Criar subcategoria"}
            </ButtonCustom>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}
