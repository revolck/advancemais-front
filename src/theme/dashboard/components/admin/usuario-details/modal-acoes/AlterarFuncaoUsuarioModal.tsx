"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import type {
  Role,
  TipoUsuario,
  UpdateUsuarioRolePayload,
} from "@/api/usuarios";

interface AlterarFuncaoUsuarioModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioNome: string;
  usuarioEmail: string;
  tipoUsuario: TipoUsuario;
  roleAtual: Role;
  availableRoles: Role[];
  onConfirm: (payload: UpdateUsuarioRolePayload) => Promise<void>;
}

export function AlterarFuncaoUsuarioModal({
  isOpen,
  onOpenChange,
  tipoUsuario,
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

  const isRoleCompatibleWithTipoUsuario = useCallback(
    (role: Role) => {
      if (tipoUsuario === "PESSOA_JURIDICA") return role === "EMPRESA";
      return role !== "EMPRESA";
    },
    [tipoUsuario],
  );

  const roleOptions = useMemo<SelectOption[]>(
    () =>
      availableRoles.filter(isRoleCompatibleWithTipoUsuario).map((role) => ({
        value: role,
        label:
          role === roleAtual
            ? `${getRoleLabel(role)} (Atual)`
            : getRoleLabel(role),
      })),
    [availableRoles, isRoleCompatibleWithTipoUsuario, roleAtual],
  );

  useEffect(() => {
    if (!isOpen) return;
    if (roleOptions.length === 0) return;
    if (roleOptions.some((option) => option.value === selectedRole)) return;
    setSelectedRole(roleOptions[0].value as Role);
  }, [isOpen, roleOptions, selectedRole]);

  const motivoNormalizado = useMemo(() => motivo.trim(), [motivo]);
  const motivoInvalido =
    motivoNormalizado.length > 0 &&
    (motivoNormalizado.length < 3 || motivoNormalizado.length > 500);
  const selectedRoleChanged = selectedRole !== roleAtual;
  const selectedRoleInvalid = !isRoleCompatibleWithTipoUsuario(selectedRole);

  const handleClose = () => {
    if (!isSubmitting) onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (
      isSubmitting ||
      motivoInvalido ||
      !selectedRoleChanged ||
      selectedRoleInvalid
    )
      return;

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
          <SelectCustom
            label="Nova função"
            placeholder="Selecione a nova função"
            options={roleOptions}
            value={selectedRole}
            onChange={(value) =>
              setSelectedRole((value as Role | null) ?? roleAtual)
            }
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
            <div className="flex items-center justify-end gap-3 text-xs text-gray-500">
              <span>{motivo.length}/500</span>
            </div>
            {motivoInvalido ? (
              <div className="text-xs text-red-600">
                O motivo deve ter entre 3 e 500 caracteres.
              </div>
            ) : null}
            {selectedRoleInvalid ? (
              <div className="text-xs text-red-600">
                {tipoUsuario === "PESSOA_JURIDICA"
                  ? "Pessoa jurídica só pode ter função EMPRESA."
                  : "Pessoa física não pode ter função EMPRESA."}
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
              disabled={
                isSubmitting ||
                motivoInvalido ||
                !selectedRoleChanged ||
                selectedRoleInvalid
              }
            >
              Confirmar alteração
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
