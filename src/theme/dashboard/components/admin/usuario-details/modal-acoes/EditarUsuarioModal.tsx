"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { InputCustom } from "@/components/ui/custom/input";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { ButtonCustom } from "@/components/ui/custom/button";
import { toastCustom } from "@/components/ui/custom/toast";
import { SelectCustom } from "@/components/ui/custom/select";
import { DatePickerCustom } from "@/components/ui/custom/date-picker";
import MaskService from "@/services/components/input/maskService";
import type { UsuarioDetailsData } from "../types";
import type { UpdateUsuarioPayload } from "@/api/usuarios";

interface EditarUsuarioModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: UsuarioDetailsData;
  onConfirm: (data: UpdateUsuarioPayload) => Promise<void>;
}

export function EditarUsuarioModal({
  isOpen,
  onOpenChange,
  usuario,
  onConfirm,
}: EditarUsuarioModalProps) {
  const initialValues = useMemo(() => {
    const maskService = MaskService.getInstance();
    const telefoneMasked = usuario.telefone
      ? maskService.applyMask(usuario.telefone, "phone")
      : "";
    return {
      nomeCompleto: usuario.nomeCompleto ?? "",
      email: usuario.email ?? "",
      telefone: telefoneMasked,
      genero: usuario.genero ?? "",
      dataNasc: usuario.dataNasc ? usuario.dataNasc : "",
      descricao: usuario.descricao ?? "",
      status: usuario.status ?? "",
      instagram: usuario.socialLinks?.instagram ?? "",
      linkedin: usuario.socialLinks?.linkedin ?? "",
    };
  }, [usuario]);

  const [formState, setFormState] = useState(initialValues);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormState(initialValues);
      setIsSaving(false);
    }
  }, [initialValues, isOpen]);

  const handleInputChange = useCallback(
    (field: keyof typeof initialValues) =>
      (event: ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({
          ...prev,
          [field]: event.target.value,
        }));
      },
    []
  );

  const handleTextareaChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.target.value.slice(0, 500);
      setFormState((prev) => ({ ...prev, descricao: value }));
    },
    []
  );

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    const sanitize = (v: string) => {
      const t = v.trim();
      return t.length ? t : null;
    };

    const emailSanitizado = sanitize(formState.email);
    if (!emailSanitizado) {
      toastCustom.error({
        title: "Email obrigatório",
        description: "O campo email é obrigatório.",
      });
      return;
    }

    const maskService = MaskService.getInstance();

    const payload: UpdateUsuarioPayload = {};
    let hasChanges = false;

    const nomeSanitizado = sanitize(formState.nomeCompleto);
    if (!nomeSanitizado) {
      toastCustom.error({
        title: "Nome obrigatório",
        description: "Informe o nome completo do usuario.",
      });
      return;
    }
    if (nomeSanitizado !== (usuario.nomeCompleto || "")) {
      payload.nomeCompleto = nomeSanitizado ?? "";
      hasChanges = true;
    }

    if (emailSanitizado !== (usuario.email || "")) {
      payload.email = emailSanitizado;
      hasChanges = true;
    }

    const telefoneSanitizado = sanitize(formState.telefone);
    if (
      !telefoneSanitizado ||
      !maskService.validate(telefoneSanitizado, "phone")
    ) {
      toastCustom.error({
        title: "Telefone obrigatório",
        description: "Informe um telefone válido com DDD.",
      });
      return;
    }
    {
      const digits = maskService.removeMask(telefoneSanitizado, "phone");
      const currentDigits = (usuario.telefone || "").replace(/\D/g, "");
      if (digits !== currentDigits) {
        payload.telefone = digits;
        hasChanges = true;
      }
    }

    const descricaoSanitizada = sanitize(formState.descricao);
    const descricaoAtual = usuario.descricao ?? "";
    if (descricaoSanitizada !== null) {
      if (descricaoAtual !== descricaoSanitizada) {
        payload.descricao = descricaoSanitizada;
        hasChanges = true;
      }
    } else if (usuario.descricao) {
      payload.descricao = undefined;
      hasChanges = true;
    }

    const instagramSanitizado = sanitize(formState.instagram);
    const linkedinSanitizado = sanitize(formState.linkedin);
    const currentInstagram = usuario.socialLinks?.instagram ?? undefined;
    const currentLinkedin = usuario.socialLinks?.linkedin ?? undefined;

    const socialPayload: Record<string, string> = {};
    let socialHasChanges = false;

    if (instagramSanitizado !== currentInstagram) {
      if (instagramSanitizado) {
        socialPayload.instagram = instagramSanitizado;
      }
      socialHasChanges = true;
    }

    if (linkedinSanitizado !== currentLinkedin) {
      if (linkedinSanitizado) {
        socialPayload.linkedin = linkedinSanitizado;
      }
      socialHasChanges = true;
    }

    if (socialHasChanges) {
      payload.socialLinks =
        Object.keys(socialPayload).length > 0 ? socialPayload : undefined;
      hasChanges = true;
    }

    const generoSanitizado = sanitize(formState.genero);
    if (!generoSanitizado) {
      toastCustom.error({
        title: "Gênero obrigatório",
        description: "Selecione o gênero.",
      });
      return;
    }
    if ((generoSanitizado ?? null) !== (usuario.genero ?? null)) {
      payload.genero = generoSanitizado;
      hasChanges = true;
    }

    if (!formState.dataNasc) {
      toastCustom.error({
        title: "Data de nascimento obrigatória",
        description: "Selecione a data de nascimento.",
      });
      return;
    }
    if (formState.dataNasc !== (usuario.dataNasc || undefined)) {
      payload.dataNasc = formState.dataNasc || undefined;
      hasChanges = true;
    }

    if (!hasChanges) {
      toastCustom.info({
        title: "Nenhuma alteração",
        description: "Atualize os campos antes de salvar ou feche a modal.",
      });
      return;
    }

    setIsSaving(true);
    try {
      await onConfirm(payload);
      toastCustom.success({
        title: "Dados atualizados",
        description: "As informações do usuario foram salvas com sucesso.",
      });
      handleClose();
    } catch (error) {
      console.error("Erro ao atualizar usuario", error);
      toastCustom.error({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações agora.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [usuario, formState, handleClose, isSaving, onConfirm]);

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      backdrop="blur"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle className="!mb-0">Editar usuario</ModalTitle>
        </ModalHeader>

        <ModalBody className="max-h-[70vh] overflow-y-auto pr-1 p-1 space-y-6">
          <div>
            <InputCustom
              label="Nome completo"
              size="sm"
              value={formState.nomeCompleto}
              onChange={handleInputChange("nomeCompleto")}
              disabled={isSaving}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InputCustom
              label="E-mail"
              type="email"
              size="sm"
              value={formState.email}
              onChange={handleInputChange("email")}
              disabled={isSaving}
              required
            />
            <InputCustom
              label="Telefone/Whatsapp"
              size="sm"
              value={formState.telefone}
              onChange={handleInputChange("telefone")}
              disabled={isSaving}
              mask="phone"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InputCustom
              label="Instagram"
              size="sm"
              value={formState.instagram}
              onChange={handleInputChange("instagram")}
              disabled={isSaving}
              placeholder="instagram.com/usuario"
            />
            <InputCustom
              label="LinkedIn"
              size="sm"
              value={formState.linkedin}
              onChange={handleInputChange("linkedin")}
              disabled={isSaving}
              placeholder="linkedin.com/in/usuario"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectCustom
              label="Gênero"
              mode="single"
              value={formState.genero || null}
              onChange={(v) =>
                setFormState((prev) => ({ ...prev, genero: v || "" }))
              }
              options={[
                { label: "Masculino", value: "MASCULINO" },
                { label: "Feminino", value: "FEMININO" },
                { label: "Outro", value: "OUTRO" },
                { label: "Prefiro não informar", value: "NAO_INFORMADO" },
              ]}
              size="sm"
              disabled={isSaving}
              placeholder="Selecionar"
              required
            />
            <DatePickerCustom
              label="Data de nascimento"
              value={formState.dataNasc ? new Date(formState.dataNasc) : null}
              onChange={(date) =>
                setFormState((prev) => ({
                  ...prev,
                  dataNasc: date ? new Date(date).toISOString() : "",
                }))
              }
              size="sm"
              disabled={isSaving}
              format="dd/MM/yyyy"
              clearable
              required
            />
          </div>

          <SimpleTextarea
            label="Descrição"
            value={formState.descricao}
            onChange={handleTextareaChange}
            disabled={isSaving}
            placeholder="Breve descrição do usuario"
            maxLength={500}
            showCharCount
            className="min-h-[100px]"
          />
        </ModalBody>

        <ModalFooter className="pt-4">
          <ButtonCustom
            variant="outline"
            onClick={handleClose}
            size="md"
            disabled={isSaving}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            onClick={handleSave}
            size="md"
            isLoading={isSaving}
            loadingText="Salvando..."
          >
            Salvar alterações
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
