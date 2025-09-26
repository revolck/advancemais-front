"use client";

import React from "react";
import { useBlockedUser } from "@/hooks/useBlockedUser";
import { BlockedUserModal } from "@/components/ui/custom/BlockedUserModal";

interface BlockedUserWrapperProps {
  children: React.ReactNode;
}

export const BlockedUserWrapper: React.FC<BlockedUserWrapperProps> = ({
  children,
}) => {
  const {
    isBlocked,
    reason,
    blockedUntil,
    showModal,
    checkboxChecked,
    setCheckboxChecked,
    handleAcceptTerms,
  } = useBlockedUser();

  return (
    <>
      {children}

      <BlockedUserModal
        isOpen={showModal}
        reason={reason}
        blockedUntil={blockedUntil}
        checkboxChecked={checkboxChecked}
        onCheckboxChange={setCheckboxChecked}
        onAcceptTerms={handleAcceptTerms}
      />
    </>
  );
};
