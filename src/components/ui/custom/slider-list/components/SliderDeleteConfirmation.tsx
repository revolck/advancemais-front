"use client";

import React from "react";
import {
  ModalCustom,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ButtonCustom,
  Icon,
} from "@/components/ui/custom";
import type { SliderDeleteConfirmationProps } from "../types";

export const SliderDeleteConfirmation: React.FC<
  SliderDeleteConfirmationProps
> = ({
  isOpen,
  onClose,
  slider,
  onConfirm,
  isLoading = false,
  isLastSlider = false,
}) => {
  if (!slider) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Erro já tratado no componente pai
    }
  };

  // Não permite deletar o último slider
  if (isLastSlider) {
    return (
      <ModalCustom isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2 text-orange-600">
              <Icon name="Shield" className="w-5 h-5" />
              Ação Não Permitida
            </ModalTitle>
          </ModalHeader>

          <ModalBody>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                <Icon
                  name="AlertTriangle"
                  className="w-8 h-8 text-orange-600"
                />
              </div>

              <div>
                <p className="text-foreground font-medium mb-2">
                  Não é possível remover o último slider
                </p>
                <p className="text-sm text-muted-foreground">
                  O site precisa ter pelo menos 1 slider configurado para
                  funcionar corretamente.
                </p>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <ButtonCustom
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Entendi
            </ButtonCustom>
          </ModalFooter>
        </ModalContent>
      </ModalCustom>
    );
  }

  return (
    <ModalCustom isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-destructive">
            <Icon name="AlertTriangle" className="w-5 h-5" />
            Confirmar Exclusão
          </ModalTitle>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* Preview do slider */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/30">
              <div className="w-12 h-8 bg-muted rounded overflow-hidden shrink-0">
                <img
                  src={slider.imagemUrl}
                  alt={slider.imagemTitulo}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-foreground truncate">
                  {slider.imagemTitulo || `Slider ${slider.ordem}`}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Posição {slider.ordem}
                </p>
              </div>
            </div>

            {/* Aviso */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
              <div className="flex gap-3">
                <Icon
                  name="AlertCircle"
                  className="w-5 h-5 text-destructive shrink-0 mt-0.5"
                />
                <div className="space-y-1">
                  <p className="font-medium text-destructive">
                    Esta ação não pode ser desfeita
                  </p>
                  <p className="text-sm text-muted-foreground">
                    O slider será removido permanentemente do sistema e não
                    aparecerá mais no site.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <ButtonCustom
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="danger"
            onClick={handleConfirm}
            isLoading={isLoading}
            loadingText="Removendo..."
            icon="Trash2"
          >
            Confirmar Exclusão
          </ButtonCustom>
        </ModalFooter>
      </ModalContent>
    </ModalCustom>
  );
};
