"use client";

import { useMemo } from "react";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  SelectCustom,
  type SelectOption,
} from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom/button";

export type CurriculoApplyOption = {
  id: string;
  titulo: string;
  resumo?: string | null;
  principal?: boolean;
};

export interface SelectCurriculoApplyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vagaTitulo?: string | null;
  curriculos: CurriculoApplyOption[];
  selectedCurriculoId: string | null;
  onSelectCurriculoId: (id: string | null) => void;
  isSubmitting?: boolean;
  onConfirm: () => void;
}

export function SelectCurriculoApplyModal({
  isOpen,
  onOpenChange,
  vagaTitulo,
  curriculos,
  selectedCurriculoId,
  onSelectCurriculoId,
  isSubmitting,
  onConfirm,
}: SelectCurriculoApplyModalProps) {
  const options = useMemo<SelectOption[]>(() => {
    return (curriculos || []).map((c) => ({
      value: c.id,
      label: c.principal ? `${c.titulo} • Principal` : c.titulo,
    }));
  }, [curriculos]);

  const selected = useMemo(() => {
    if (!selectedCurriculoId) return null;
    return curriculos.find((c) => c.id === selectedCurriculoId) ?? null;
  }, [curriculos, selectedCurriculoId]);

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader className="pb-4">
          <ModalTitle className="mb-0!">Selecionar currículo</ModalTitle>
          <ModalDescription className="text-sm! text-gray-600!">
            {vagaTitulo
              ? `Você tem mais de um currículo. Selecione qual currículo deseja enviar para "${vagaTitulo}".`
              : "Você tem mais de um currículo. Selecione qual currículo deseja enviar."}
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <SelectCustom
            label="Currículo"
            placeholder="Selecionar"
            options={options}
            value={selectedCurriculoId}
            onChange={(v) => onSelectCurriculoId(v)}
            disabled={Boolean(isSubmitting)}
            required
          />

          {selected ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-gray-900">
                  {selected.titulo}
                </div>
                {selected.principal ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Principal
                  </span>
                ) : null}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {selected.resumo?.trim() ? selected.resumo.trim() : "Sem resumo"}
              </div>
            </div>
          ) : null}
        </ModalBody>

        <ModalFooter className="border-t border-gray-100 pt-6">
          <div className="flex w-full items-center justify-end gap-3">
            <ButtonCustom
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={Boolean(isSubmitting)}
              className="rounded-full"
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="default"
              onClick={onConfirm}
              disabled={Boolean(isSubmitting) || !selectedCurriculoId}
              className="bg-[#1f8454] hover:bg-[#16603d] text-white rounded-full"
            >
              {isSubmitting ? "Enviando..." : "Confirmar candidatura"}
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
