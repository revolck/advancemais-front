"use client";

import React, { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  ButtonCustom,
  InputCustom,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  SimpleTextarea,
} from "@/components/ui/custom";

export type EditCurriculoTarget = {
  id: string;
  titulo: string;
  resumo?: string | null;
  objetivo?: string | null;
} | null;

const curriculoFormSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  resumo: z.string().optional(),
  objetivo: z.string().optional(),
});

export type CurriculoFormData = z.infer<typeof curriculoFormSchema>;

type EditCurriculoModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  target: EditCurriculoTarget;
  isBusy?: boolean;
  isSaving?: boolean;
  onSave: (id: string, data: CurriculoFormData) => Promise<void>;
};

export function EditCurriculoModal({
  isOpen,
  onOpenChange,
  target,
  isBusy = false,
  isSaving = false,
  onSave,
}: EditCurriculoModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CurriculoFormData>({
    resolver: zodResolver(curriculoFormSchema),
    defaultValues: {
      titulo: "",
      resumo: "",
      objetivo: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      titulo: target?.titulo ?? "",
      resumo: target?.resumo ?? "",
      objetivo: target?.objetivo ?? "",
    });
  }, [isOpen, reset, target?.objetivo, target?.resumo, target?.titulo]);

  useEffect(() => {
    if (isOpen) return;
    reset({ titulo: "", resumo: "", objetivo: "" });
  }, [isOpen, reset]);

  const onSubmit = async (data: CurriculoFormData) => {
    if (!target?.id) return;
    await onSave(target.id, data);
    onOpenChange(false);
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader className="pb-4">
          <ModalTitle className="mb-0!">Editar currículo</ModalTitle>
        </ModalHeader>
        <ModalBody className="space-y-5">
          <Controller
            control={control}
            name="titulo"
            render={({ field }) => (
              <InputCustom
                ref={field.ref}
                name={field.name}
                label="Título"
                required
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={isBusy}
                error={errors.titulo?.message}
                placeholder="Ex: Currículo profissional"
              />
            )}
          />

          <Controller
            control={control}
            name="resumo"
            render={({ field }) => (
              <SimpleTextarea
                label="Resumo"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
                disabled={isBusy}
                error={errors.resumo?.message}
                placeholder="Conte um breve resumo sobre você..."
                rows={5}
              />
            )}
          />

          <Controller
            control={control}
            name="objetivo"
            render={({ field }) => (
              <SimpleTextarea
                label="Objetivo"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
                disabled={isBusy}
                error={errors.objetivo?.message}
                placeholder="Ex: Busco uma oportunidade na área de..."
                rows={4}
              />
            )}
          />
        </ModalBody>
        <ModalFooter className="border-t border-gray-100 pt-6">
          <div className="flex w-full items-center justify-end gap-3">
            <ButtonCustom
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              disabled={isBusy || isSaving}
              isLoading={isSaving}
            >
              Salvar
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

