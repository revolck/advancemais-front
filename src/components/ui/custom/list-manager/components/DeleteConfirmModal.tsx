"use client";

import React from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalDescription,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";

interface DeleteConfirmModalProps<T = any> {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: T | null;
  itemName: string;
  onConfirmDelete: (item: T) => void;
  isDeleting?: boolean;
  customDeleteContent?: (item: T) => React.ReactNode;
  defaultDeleteContent?: (item: T) => React.ReactNode;
  confirmButtonText?: string;
  title?: string;
  description?: string;
}

export function DeleteConfirmModal<T = any>({
  isOpen,
  onOpenChange,
  item,
  itemName,
  onConfirmDelete,
  isDeleting = false,
  customDeleteContent,
  defaultDeleteContent,
  confirmButtonText = "Sim, excluir",
  title = "Confirmar Exclusão",
  description,
}: DeleteConfirmModalProps<T>) {
  const handleConfirmDelete = () => {
    if (item) {
      onConfirmDelete(item);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const getItemDisplayName = (item: T): string => {
    if (typeof item === "object" && item !== null) {
      // Tenta encontrar propriedades comuns de nome
      if ("nome" in item && typeof (item as any).nome === "string") {
        return (item as any).nome;
      }
      if ("name" in item && typeof (item as any).name === "string") {
        return (item as any).name;
      }
      if ("title" in item && typeof (item as any).title === "string") {
        return (item as any).title;
      }
    }
    return String(item);
  };

  const getDefaultDescription = () => {
    if (description) return description;

    const itemNameValue = item ? getItemDisplayName(item) : itemName;
    return (
      <>
        Você está prestes a excluir {itemName}{" "}
        <span className="font-semibold text-gray-900">"{itemNameValue}"</span>
      </>
    );
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription className="!mb-0 !leading-normal">
            {getDefaultDescription()}
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-6 p-1">
          {item &&
            (customDeleteContent ? (
              customDeleteContent(item)
            ) : defaultDeleteContent ? (
              defaultDeleteContent(item)
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium !text-red-800 !leading-normal">
                        Esta ação é irreversível e pode impactar todo o sistema!
                      </p>
                      <ul className="text-xs text-gray-700 space-y-1 ml-3">
                        <li>• Todos os dados relacionados serão perdidos</li>
                        <li>• A operação não poderá ser desfeita</li>
                        <li>
                          • O item será removido permanentemente do sistema
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <p className="!text-base text-gray-600 !leading-normal !mb-0">
                  Tem certeza absoluta que deseja continuar com esta exclusão?
                </p>
              </div>
            ))}
        </ModalBody>

        <ModalFooter className="px-1 py-2">
          <div className="flex w-full justify-end gap-3">
            <ButtonCustom
              variant="outline"
              onClick={handleCancel}
              disabled={isDeleting}
              size="md"
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
              loadingText="Excluindo..."
              size="md"
            >
              <span className="inline-flex items-center gap-2">
                {confirmButtonText}
              </span>
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
