"use client";

import { Loader2 } from "lucide-react";

import {
  ButtonCustom,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom";
import { MultiSelectCustom } from "@/components/ui/custom/multiselect";
import { Skeleton } from "@/components/ui/skeleton";

type InstrutorOption = {
  value: string;
  label: string;
};

interface GerenciarInstrutoresModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  selectedInstrutorIds: string[];
  onSelectedInstrutorIdsChange: (ids: string[]) => void;
  instrutorOptions: InstrutorOption[];
  onSave: () => void;
}

export function GerenciarInstrutoresModal({
  isOpen,
  onOpenChange,
  isLoading,
  isSaving,
  hasChanges,
  selectedInstrutorIds,
  onSelectedInstrutorIdsChange,
  instrutorOptions,
  onSave,
}: GerenciarInstrutoresModalProps) {
  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      backdrop="blur"
      scrollBehavior="outside"
    >
      <ModalContentWrapper className="overflow-visible">
        <ModalHeader>
          <ModalTitle className="text-lg! font-semibold!">
            Gerenciar instrutores
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-4 overflow-visible!">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : (
            <MultiSelectCustom
              label="Instrutores"
              placeholder="Selecionar instrutores"
              options={instrutorOptions}
              value={instrutorOptions.filter((option) =>
                selectedInstrutorIds.includes(String(option.value)),
              )}
              onChange={(selectedOptions) =>
                onSelectedInstrutorIdsChange(
                  selectedOptions.map((option) => String(option.value)),
                )
              }
              emptyIndicator="Nenhum instrutor disponível"
              maxVisibleTags={3}
              hidePlaceholderWhenSelected={false}
              commandProps={{
                className: "overflow-visible",
              }}
              inputProps={{
                className: "text-sm!",
              }}
            />
          )}
        </ModalBody>

        <ModalFooter className="gap-2">
          <ButtonCustom
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            type="button"
            onClick={onSave}
            disabled={isSaving || isLoading || !hasChanges}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando
              </span>
            ) : (
              "Salvar"
            )}
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
