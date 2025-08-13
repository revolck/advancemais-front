"use client";

import { useNetworkStatus } from "@/hooks";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/custom/modal";

export function OfflineModal() {
  const isOffline = useNetworkStatus();

  return (
    <ModalCustom
      isOpen={isOffline}
      isDismissable={false}
      isKeyboardDismissDisabled
    >
      <ModalContentWrapper
        className="sm:max-w-md"
        isDismissable={false}
        isKeyboardDismissDisabled
        hideCloseButton
      >
        <ModalHeader>
          <ModalTitle>Conexão perdida</ModalTitle>
          <ModalDescription>
            Você está sem conexão com a internet. Verifique sua rede para
            continuar o cadastro.
          </ModalDescription>
        </ModalHeader>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
