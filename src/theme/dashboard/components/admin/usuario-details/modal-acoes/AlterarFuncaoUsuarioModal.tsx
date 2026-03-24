"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ButtonCustom,
  SelectCustom,
  SimpleTextarea,
} from "@/components/ui/custom";
import type { SelectOption } from "@/components/ui/custom/select";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { getRoleLabel } from "@/config/roles";
import type { Role, UpdateUsuarioRolePayload } from "@/api/usuarios";

interface AlterarFuncaoUsuarioModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioNome: string;
  usuarioEmail: string;
  roleAtual: Role;
  availableRoles: Role[];
  onConfirm: (payload: UpdateUsuarioRolePayload) => Promise<void>;
}

export function AlterarFuncaoUsuarioModal({
  isOpen,
  onOpenChange,
  usuarioNome,
  usuarioEmail,
  roleAtual,
  availableRoles,
  onConfirm,
}: AlterarFuncaoUsuarioModalProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(roleAtual);
  const [motivo, setMotivo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedRole(roleAtual);
    setMotivo("Alteração manual de função pelo painel");
    setIsSubmitting(false);
  }, [isOpen, roleAtual]);

  const roleOptions = useMemo<SelectOption[]>(
    () =>
      availableRoles.map((role) => ({
        value: role,
        label:
          role === roleAtual
            ? `${getRoleLabel(role)} (Atual)`
            : getRoleLabel(role),
      })),
    [availableRoles, roleAtual]
  );

  const motivoNormalizado = useMemo(() => motivo.trim(), [motivo]);
  const motivoInvalido =
    motivoNormalizado.length > 0 &&
    (motivoNormalizado.length < 3 || motivoNormalizado.length > 500);
  const selectedRoleChanged = selectedRole !== roleAtual;

  const handleClose = () => {
    if (!isSubmitting) onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (isSubmitting || motivoInvalido || !selectedRoleChanged) return;

    setIsSubmitting(true);
    try {
      await onConfirm({
        role: selectedRole,
        ...(motivoNormalizado ? { motivo: motivoNormalizado } : {}),
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="xl"
      backdrop="blur"
      scrollBehavior="inside"
      isDismissable={!isSubmitting}
      isKeyboardDismissDisabled={isSubmitting}
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Alterar função</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
            <div className="text-sm text-gray-700">
              Você vai alterar a função de <strong>{usuarioNome}</strong>.
            </div>
            <div className="mt-1 text-sm text-gray-500">{usuarioEmail}</div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span>Função atual:</span>
              <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700">
                {getRoleLabel(roleAtual)}
              </span>
            </div>
          </div>

          <SelectCustom
            label="Nova função"
            placeholder="Selecione a nova função"
            options={roleOptions}
            value={selectedRole}
            onChange={(value) => setSelectedRole((value as Role | null) ?? roleAtual)}
            disabled={isSubmitting}
            clearable={false}
          />

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900">Motivo</div>
            <SimpleTextarea
              value={motivo}
              onChange={(event) => setMotivo(event.target.value.slice(0, 500))}
              placeholder="Alteração manual de função pelo painel"
              rows={4}
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
              <span>
                Opcional. Use entre 3 e 500 caracteres quando informar um motivo.
              </span>
              <span>{motivo.length}/500</span>
            </div>
            {motivoInvalido ? (
              <div className="text-xs text-red-600">
                O motivo deve ter entre 3 e 500 caracteres.
              </div>
            ) : null}
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex w-full justify-end gap-3">
            <ButtonCustom
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Salvando..."
              disabled={isSubmitting || motivoInvalido || !selectedRoleChanged}
            >
              Confirmar alteração
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
