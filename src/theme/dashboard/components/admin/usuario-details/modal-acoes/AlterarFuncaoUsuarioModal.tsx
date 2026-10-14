"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Info, LogOut, ShieldAlert } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { getRoleLabel } from "@/config/roles";
import { getImpactoTrocaDeFuncao } from "@/api/usuarios";
import type {
  Role,
  TipoUsuario,
  UpdateUsuarioRolePayload,
} from "@/api/usuarios";
import { saiDeAluno, viraGestor } from "../utils/funcoes";

interface AlterarFuncaoUsuarioModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Para mostrar o que a pessoa tem como aluno antes de confirmar */
  usuarioId?: string;
  usuarioNome: string;
  usuarioEmail: string;
  tipoUsuario: TipoUsuario;
  roleAtual: Role;
  availableRoles: Role[];
  onConfirm: (payload: UpdateUsuarioRolePayload) => Promise<void>;
}

const plural = (n: number, um: string, varios: string) =>
  `${n.toLocaleString("pt-BR")} ${n === 1 ? um : varios}`;

export function AlterarFuncaoUsuarioModal({
  isOpen,
  onOpenChange,
  usuarioId,
  usuarioNome,
  usuarioEmail,
  tipoUsuario,
  roleAtual,
  availableRoles,
  onConfirm,
}: AlterarFuncaoUsuarioModalProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(roleAtual);
  const [motivo, setMotivo] = useState("");
  const [entendeu, setEntendeu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const primeiroNome = usuarioNome.trim().split(/\s+/)[0] || "a pessoa";

  useEffect(() => {
    if (!isOpen) return;
    setSelectedRole(roleAtual);
    setMotivo("");
    setEntendeu(false);
    setIsSubmitting(false);
  }, [isOpen, roleAtual]);

  // Nova escolha, nova confirmação
  useEffect(() => setEntendeu(false), [selectedRole]);

  const { data: impacto, isLoading: carregandoImpacto } = useQuery({
    queryKey: ["usuarios", "role-impacto", usuarioId],
    queryFn: async () => (await getImpactoTrocaDeFuncao(usuarioId!)).data,
    enabled: isOpen && Boolean(usuarioId) && roleAtual === "ALUNO_CANDIDATO",
    staleTime: 60 * 1000,
    retry: 1,
  });

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
    motivoNormalizado.length < 3 || motivoNormalizado.length > 500;
  const selectedRoleChanged = selectedRole !== roleAtual;
  const selectedRoleInvalid = !isRoleCompatibleWithTipoUsuario(selectedRole);
  const saindoDeAluno = saiDeAluno(roleAtual, selectedRole);
  const promovendoGestor = selectedRoleChanged && viraGestor(selectedRole);
  const precisaConfirmar = saindoDeAluno || promovendoGestor;
  const bloqueado =
    isSubmitting ||
    motivoInvalido ||
    !selectedRoleChanged ||
    selectedRoleInvalid ||
    (precisaConfirmar && !entendeu);

  const handleClose = () => {
    if (!isSubmitting) onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (bloqueado) return;

    setIsSubmitting(true);
    try {
      await onConfirm({ role: selectedRole, motivo: motivoNormalizado });
      onOpenChange(false);
    } catch {
      // quem chama mostra o erro; o modal fica aberto para tentar de novo
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
          <div className="rounded-xl bg-gray-50 px-4 py-3">
            <div className="truncate text-sm font-semibold text-gray-900">
              {usuarioNome}
            </div>
            <div className="truncate text-xs text-gray-500">
              {usuarioEmail} · hoje: {getRoleLabel(roleAtual)}
            </div>
          </div>

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

          {saindoDeAluno ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-950">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="size-4 shrink-0" />
                O que muda para {primeiroNome}
              </div>
              <ul className="mt-2 space-y-1.5 pl-6 leading-relaxed [list-style:disc]">
                <li>
                  Deixa de acessar a área do aluno: cursos, aulas e
                  certificados
                  {impacto
                    ? ` (${plural(impacto.inscricoesAtivas, "curso em andamento", "cursos em andamento")})`
                    : ""}
                  .
                </li>
                <li>
                  Não consegue se candidatar a vagas nem acompanhar as
                  candidaturas
                  {impacto
                    ? ` (${plural(impacto.candidaturas, "candidatura", "candidaturas")}, ${plural(
                        impacto.curriculos,
                        "currículo",
                        "currículos",
                      )})`
                    : ""}
                  .
                </li>
                <li>
                  Passa a ver o painel de{" "}
                  <strong>{getRoleLabel(selectedRole)}</strong>.
                </li>
                <li>
                  Nada é apagado: se a função voltar para Aluno/Candidato,
                  tudo volta como estava.
                </li>
              </ul>
              {carregandoImpacto ? (
                <Skeleton className="mt-3 h-4 w-48" />
              ) : null}
              {impacto && impacto.inscricoesAtivas > 0 ? (
                <div className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-xs font-medium text-amber-900 ring-1 ring-amber-200">
                  {primeiroNome} tem curso em andamento. Se ainda vai estudar,
                  combine antes de trocar a função.
                </div>
              ) : null}
            </div>
          ) : null}

          {promovendoGestor ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-900">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" />
              <span className="leading-relaxed">
                <strong>{getRoleLabel(selectedRole)}</strong> tem acesso de
                gestão a todo o sistema, incluindo dados de alunos, empresas e
                configurações.
              </span>
            </div>
          ) : null}

          {selectedRoleChanged ? (
            <div className="flex items-start gap-2.5 text-xs text-gray-500">
              <LogOut className="mt-0.5 size-3.5 shrink-0" />
              <span>
                As sessões abertas de {primeiroNome} são encerradas. No próximo
                acesso, o login e a senha são os mesmos e o painel já aparece
                com a função nova.
              </span>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900">
              Motivo <span className="text-red-500">*</span>
            </div>
            <SimpleTextarea
              value={motivo}
              onChange={(event) => setMotivo(event.target.value.slice(0, 500))}
              placeholder="Ex.: passou a trabalhar no Setor de Vagas"
              rows={3}
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Info className="size-3" />
                Fica registrado no histórico do usuário.
              </span>
              <span>{motivo.length}/500</span>
            </div>
            {motivo.length > 0 && motivoInvalido ? (
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

          {precisaConfirmar ? (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-3 text-sm transition-colors hover:bg-gray-50">
              <input
                type="checkbox"
                className="mt-0.5 size-4 cursor-pointer accent-[var(--primary-color)]"
                checked={entendeu}
                onChange={(event) => setEntendeu(event.target.checked)}
                disabled={isSubmitting}
              />
              <span className="text-gray-800">
                Entendi o que muda para {primeiroNome} e confirmei com o
                responsável.
              </span>
            </label>
          ) : null}
        </ModalBody>

        <ModalFooter>
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
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
              disabled={bloqueado}
            >
              {selectedRoleChanged
                ? `Mudar para ${getRoleLabel(selectedRole)}`
                : "Confirmar alteração"}
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
