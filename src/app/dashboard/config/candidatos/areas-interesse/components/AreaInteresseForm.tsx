"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ButtonCustom, InputCustom } from "@/components/ui/custom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { CandidatoAreaInteresse } from "@/api/candidatos/types";

const areaSchema = z.object({
  categoria: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
});

export type AreaInteresseFormData = z.infer<typeof areaSchema>;

interface AreaInteresseFormProps {
  area?: CandidatoAreaInteresse;
  onSubmit: (data: AreaInteresseFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function AreaInteresseForm({
  area,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AreaInteresseFormProps) {
  const isDisabled = isSubmitting;
  const form = useForm<AreaInteresseFormData>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      categoria: area?.categoria || "",
    },
    mode: "onChange",
  });

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (data) => {
            try {
              await onSubmit(data);
            } catch (error) {
              console.error("Erro ao submeter formulário:", error);
            }
          })}
          className="p-1"
        >
          <fieldset disabled={isDisabled} className="space-y-4">
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputCustom
                      label="Nome da Área"
                      placeholder="Ex: Tecnologia"
                      {...field}
                      error={form.formState.errors.categoria?.message}
                      required
                      disabled={isDisabled}
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
                disabled={isDisabled}
              >
                Cancelar
              </ButtonCustom>
              <ButtonCustom
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                disabled={isDisabled || !form.formState.isValid}
              >
                {area ? "Atualizar Área" : "Criar Área"}
              </ButtonCustom>
            </div>
          </fieldset>
        </form>
      </Form>
    </div>
  );
}

