"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ButtonCustom,
  InputCustom,
  SelectCustom,
  type SelectOption,
} from "@/components/ui/custom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { CandidatoAreaInteresse, CandidatoSubareaInteresse } from "@/api/candidatos/types";

const schema = z.object({
  areaPaiId: z.string().min(1, "Área pai é obrigatória"),
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
});

export type SubareaInteresseFormData = z.infer<typeof schema>;

interface SubareaInteresseFormProps {
  subarea?: (CandidatoSubareaInteresse & { areaPai?: CandidatoAreaInteresse }) | null;
  areas: CandidatoAreaInteresse[];
  isLoadingAreas?: boolean;
  onSubmit: (data: SubareaInteresseFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function SubareaInteresseForm({
  subarea,
  areas,
  isLoadingAreas = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SubareaInteresseFormProps) {
  const isDisabled = isSubmitting || isLoadingAreas;
  const form = useForm<SubareaInteresseFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      areaPaiId:
        String((subarea as any)?.areaPai?.id ?? (subarea as any)?.areaId ?? "") ||
        "",
      nome: subarea?.nome || "",
    },
    mode: "onChange",
  });

  const areaOptions: SelectOption[] = areas
    .map((a) => ({ value: String(a.id), label: a.categoria }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

  return (
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
        <fieldset disabled={isDisabled} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="areaPaiId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <SelectCustom
                      label="Área (pai)"
                      value={field.value || null}
                      onChange={(value) => field.onChange(value)}
                      disabled={isDisabled || Boolean(subarea)}
                      required
                      placeholder={
                        isLoadingAreas
                          ? "Carregando áreas..."
                          : "Selecione uma área"
                      }
                      options={areaOptions}
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
                      label="Nome da Subárea"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isDisabled}
                      required
                      placeholder="Ex.: Desenvolvimento Web"
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
              {subarea ? "Atualizar" : "Criar subárea"}
            </ButtonCustom>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}

