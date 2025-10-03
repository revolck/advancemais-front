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
import { UNSAVED_CHANGES_CONFIG } from "./constants";
import type { UnsavedChangesModalProps } from "./types";

export function UnsavedChangesModal({
  isOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  isSubmitting = false,
  title = UNSAVED_CHANGES_CONFIG.title,
  description = UNSAVED_CHANGES_CONFIG.description,
  confirmButtonText = UNSAVED_CHANGES_CONFIG.confirmButtonText,
  cancelButtonText = UNSAVED_CHANGES_CONFIG.cancelButtonText,
}: UnsavedChangesModalProps) {
  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      backdrop="blur"
      scrollBehavior="inside"
      isDismissable={false}
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>

        <ModalBody className="p-1">
          <p className="text-sm text-gray-600 !leading-normal">
            {UNSAVED_CHANGES_CONFIG.warningMessage}
          </p>
        </ModalBody>

        <ModalFooter className="px-1 py-2">
          <div className="flex items-center justify-end gap-3 w-full">
            <ButtonCustom
              type="button"
              variant="outline"
              size="md"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {cancelButtonText}
            </ButtonCustom>
            <ButtonCustom
              type="button"
              variant="danger"
              size="md"
              onClick={onConfirm}
              disabled={isSubmitting}
              withAnimation
            >
              {confirmButtonText}
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
