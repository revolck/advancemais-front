"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ButtonCustom } from "@/components/ui/custom/button";
import { InputCustom } from "@/components/ui/custom/input";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { CategoriaCurso } from "@/api/cursos/categorias/types";

const categoriaFormSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  descricao: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(100, "Descrição deve ter no máximo 100 caracteres"),
});

export type CategoriaFormData = z.infer<typeof categoriaFormSchema>;

interface CategoriaFormProps {
  categoria?: CategoriaCurso;
  onSubmit: (data: CategoriaFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CategoriaForm({
  categoria,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CategoriaFormProps) {
  const form = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaFormSchema),
    defaultValues: {
      nome: categoria?.nome || "",
      descricao: categoria?.descricao || "",
    },
  });

  const handleSubmit = async (data: CategoriaFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 p-1"
        >
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputCustom
                    label="Nome da Categoria"
                    placeholder="Ex: Tecnologia da Informação"
                    {...field}
                    error={form.formState.errors.nome?.message}
                    required
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
                    placeholder="Descreva brevemente sobre esta categoria de cursos..."
                    {...field}
                    required
                    rows={4}
                    maxLength={100}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end gap-3 pt-4">
            <ButtonCustom
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
              disabled={isSubmitting}
            >
              {categoria ? "Atualizar Categoria" : "Criar Categoria"}
            </ButtonCustom>
          </div>
        </form>
      </Form>
    </div>
  );
}
