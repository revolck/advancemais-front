import React from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/custom/modal";
import { Icon } from "@/components/ui/custom/Icons";
import type { BuilderModule, BuilderItem, BuilderData } from "../types";
import { toastCustom } from "@/components/ui/custom";

interface MoveToModuleModalProps {
  isOpen: boolean;
  itemId: string | null;
  itemTitle: string;
  modules: BuilderModule[];
  standaloneItems: BuilderItem[];
  value: BuilderData;
  onChange: (data: BuilderData) => void;
  onClose: () => void;
}

/**
 * Modal para selecionar módulo destino ao mover item standalone
 */
export function MoveToModuleModal({
  isOpen,
  itemId,
  itemTitle,
  modules,
  standaloneItems,
  value,
  onChange,
  onClose,
}: MoveToModuleModalProps) {
  const handleMoveToModule = (targetModule: BuilderModule, moduleIndex: number) => {
    if (!itemId) return;

    const itemToMove = standaloneItems.find((i) => i.id === itemId);
    if (!itemToMove) return;

    const nextStandalone = standaloneItems.filter((i) => i.id !== itemId);
    const nextModules = modules.map((m) =>
      m.id === targetModule.id
        ? { ...m, items: [...m.items, itemToMove] }
        : m
    );

    onChange({
      ...value,
      modules: nextModules,
      standaloneItems: nextStandalone,
    });

    onClose();
    toastCustom.success({
      description: `Movido para "${targetModule.title || `Módulo ${moduleIndex + 1}`}"`,
    });
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      radius="lg"
      backdrop="blur"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Mover para módulo</ModalTitle>
          <ModalDescription className="text-gray-500! leading-relaxed! mb-0!">
            Selecione para mover o destino de{" "}
            <span className="font-medium text-indigo-600">
              {itemTitle || "o item"}
            </span>{" "}
            para qualquer módulo selecionado abaixo.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="max-h-72 overflow-y-auto -mx-2 px-2">
          {modules.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mx-auto mb-3">
                <Icon name="Inbox" className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm! font-medium! text-gray-600! mb-0!">
                Nenhum módulo disponível
              </p>
              <p className="text-xs! text-gray-400! mt-0!">
                Crie um módulo primeiro para mover itens
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {modules.map((mod, idx) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleMoveToModule(mod, idx)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left group cursor-pointer"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors shrink-0">
                    <Icon name="Boxes" className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm! font-medium! text-gray-900! truncate! mb-0!">
                      {mod.title || `Módulo ${idx + 1}`}
                    </p>
                    <p className="text-xs! text-gray-500! mb-0!">
                      {mod.items.length}{" "}
                      {mod.items.length === 1 ? "item" : "itens"}
                    </p>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-gray-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors">
                    <Icon
                      name="ChevronRight"
                      className="h-3.5 w-3.5 text-gray-400 group-hover:text-indigo-600 transition-colors"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </ModalBody>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

