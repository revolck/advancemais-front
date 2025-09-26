"use client";

import React from "react";
import { ButtonCustom } from "@/components/ui/custom";
import { AlertTriangle, LogOut } from "lucide-react";

interface BlockedUserModalProps {
  isOpen: boolean;
  reason?: string;
  blockedUntil?: string;
  checkboxChecked: boolean;
  onCheckboxChange: (checked: boolean) => void;
  onAcceptTerms: () => void;
}

export const BlockedUserModal: React.FC<BlockedUserModalProps> = ({
  isOpen,
  reason = "Violação dos termos de uso",
  blockedUntil,
  checkboxChecked,
  onCheckboxChange,
  onAcceptTerms,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Acesso Bloqueado</h2>
          <p className="mt-2 text-sm text-gray-600">
            Seu acesso ao sistema foi temporariamente suspenso
          </p>
        </div>

        {/* Content */}
        <div className="mb-6 space-y-4">
          <div className="rounded-lg bg-red-50 p-4">
            <h3 className="font-semibold text-red-800">Motivo do Bloqueio:</h3>
            <p className="mt-1 text-sm text-red-700">{reason}</p>
          </div>

          {blockedUntil && (
            <div className="rounded-lg bg-amber-50 p-4">
              <h3 className="font-semibold text-amber-800">
                Período de Bloqueio:
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                Bloqueado até: {blockedUntil}
              </p>
            </div>
          )}

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-800">Próximos Passos:</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <li>• Entre em contato com o suporte</li>
              <li>• Aguarde a revisão do seu caso</li>
              <li>• Não tente contornar o bloqueio</li>
            </ul>
          </div>
        </div>

        {/* Terms Acceptance */}
        <div className="mb-6 rounded-lg border border-gray-200 p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={checkboxChecked}
                onChange={(e) => onCheckboxChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                required
              />
            </div>
            <label htmlFor="acceptTerms" className="text-sm text-gray-700">
              <span className="font-medium">Li e aceito os termos:</span>
              <br />
              Reconheço que meu acesso foi bloqueado e concordo em sair do
              sistema imediatamente. Entendo que não devo tentar contornar este
              bloqueio e que devo aguardar a revisão do meu caso pelo suporte.
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-3">
          <ButtonCustom
            onClick={onAcceptTerms}
            variant="primary"
            size="md"
            fullWidth
            disabled={!checkboxChecked}
            className={`${
              checkboxChecked
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Aceitar e Sair do Sistema
          </ButtonCustom>
        </div>
      </div>
    </div>
  );
};
