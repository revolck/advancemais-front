"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";

import {
  createUsuarioRecrutadorVinculo,
  getUsuarioRecrutadorEmpresasElegiveis,
  getUsuarioRecrutadorVagasElegiveis,
  type CreateUsuarioRecrutadorVinculoPayload,
  type UsuarioRecrutadorEmpresaElegivelItem,
  type UsuarioRecrutadorVagaElegivelItem,
  type UsuarioRecrutadorVinculoTipo,
} from "@/api/usuarios";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ButtonCustom,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  SelectCustom,
  toastCustom,
} from "@/components/ui/custom";
import type { SelectOption } from "@/components/ui/custom/select";

type ApiError = Error & {
  code?: string;
  details?: {
    code?: string;
    message?: string;
  };
};

type FieldErrors = {
  empresaUsuarioId?: string;
  vagaId?: string;
};

interface CreateVinculoRecrutadorModalProps {
  userId: string;
  recrutadorNome: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => Promise<void> | void;
}

const TIPO_VINCULO_OPTIONS: SelectOption[] = [
  {
    value: "EMPRESA",
    label: "Liberar acesso a toda a informação da empresa",
    searchKeywords: ["empresa", "amplo", "escopo completo", "informacao"],
  },
  {
    value: "VAGA",
    label: "Liberar acesso somente a vaga",
    searchKeywords: ["vaga", "restrito", "escopo limitado", "somente"],
  },
];

function getErrorCode(error: unknown): string | undefined {
  const apiError = error as ApiError | undefined;
  return apiError?.details?.code || apiError?.code;
}

function getErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as ApiError | undefined;
  return apiError?.details?.message || apiError?.message || fallback;
}

function buildEmpresaOptionLabel(
  empresa: UsuarioRecrutadorEmpresaElegivelItem,
): string {
  return empresa.nomeExibicao;
}

function buildVagaOptionLabel(vaga: UsuarioRecrutadorVagaElegivelItem): string {
  const suffix = vaga.statusLabel ? ` — ${vaga.statusLabel}` : "";
  return `${vaga.titulo}${suffix}`;
}

export function CreateVinculoRecrutadorModal({
  userId,
  recrutadorNome,
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateVinculoRecrutadorModalProps) {
  const [tipoVinculo, setTipoVinculo] =
    useState<UsuarioRecrutadorVinculoTipo>("EMPRESA");
  const [empresaUsuarioId, setEmpresaUsuarioId] = useState<string | null>(null);
  const [vagaId, setVagaId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetForm = () => {
    setTipoVinculo("EMPRESA");
    setEmpresaUsuarioId(null);
    setVagaId(null);
    setFieldErrors({});
    setSubmitError(null);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const {
    data: empresasResponse,
    error: empresasError,
    isLoading: isLoadingEmpresas,
  } = useQuery({
    queryKey: ["usuario-recrutador-vinculos-opcoes", userId, "empresas"],
    queryFn: () => getUsuarioRecrutadorEmpresasElegiveis(userId),
    enabled: isOpen,
    staleTime: 60 * 1000,
  });

  const empresas = useMemo(
    () => empresasResponse?.data.items ?? [],
    [empresasResponse],
  );

  const empresaOptions = useMemo(() => {
    const source =
      tipoVinculo === "VAGA"
        ? empresas.filter((empresa) => !empresa.jaVinculadoPorEmpresa)
        : empresas;

    return source.map<SelectOption>((empresa) => ({
      value: empresa.id,
      label: buildEmpresaOptionLabel(empresa),
      disabled:
        tipoVinculo === "EMPRESA" ? empresa.jaVinculadoPorEmpresa : false,
      searchKeywords: [empresa.codigo ?? "", empresa.cnpj ?? ""],
    }));
  }, [empresas, tipoVinculo]);

  const selectedEmpresa = useMemo(
    () => empresas.find((empresa) => empresa.id === empresaUsuarioId) ?? null,
    [empresas, empresaUsuarioId],
  );

  useEffect(() => {
    if (!empresaUsuarioId) return;

    const companyStillAvailable = empresaOptions.some(
      (option) => option.value === empresaUsuarioId,
    );

    if (!companyStillAvailable) {
      setEmpresaUsuarioId(null);
      setVagaId(null);
    }
  }, [empresaOptions, empresaUsuarioId]);

  useEffect(() => {
    setVagaId(null);
    setFieldErrors((current) => ({ ...current, vagaId: undefined }));
  }, [empresaUsuarioId, tipoVinculo]);

  const {
    data: vagasResponse,
    error: vagasError,
    isLoading: isLoadingVagas,
  } = useQuery({
    queryKey: [
      "usuario-recrutador-vinculos-opcoes",
      userId,
      "vagas",
      empresaUsuarioId ?? "none",
    ],
    queryFn: () =>
      getUsuarioRecrutadorVagasElegiveis(userId, empresaUsuarioId as string),
    enabled: isOpen && tipoVinculo === "VAGA" && Boolean(empresaUsuarioId),
    staleTime: 60 * 1000,
  });

  const vagas = useMemo(() => vagasResponse?.data.items ?? [], [vagasResponse]);

  const vagaOptions = useMemo(
    () =>
      vagas.map<SelectOption>((vaga) => ({
        value: vaga.id,
        label: buildVagaOptionLabel(vaga),
        disabled: vaga.jaVinculadoNestaVaga,
        searchKeywords: [vaga.codigo ?? "", vaga.statusLabel ?? ""],
      })),
    [vagas],
  );

  const selectedVaga = useMemo(
    () => vagas.find((vaga) => vaga.id === vagaId) ?? null,
    [vagas, vagaId],
  );

  const canShowScopePreview = useMemo(() => {
    if (tipoVinculo === "EMPRESA") {
      return Boolean(selectedEmpresa);
    }

    return Boolean(selectedEmpresa && selectedVaga);
  }, [selectedEmpresa, selectedVaga, tipoVinculo]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateUsuarioRecrutadorVinculoPayload) =>
      createUsuarioRecrutadorVinculo(userId, payload),
    onSuccess: async (response) => {
      toastCustom.success(
        response.message || "Vínculo do recrutador criado com sucesso.",
      );
      await onSuccess();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      const code = getErrorCode(error);
      const fallback =
        code === "RECRUITER_LINK_REDUNDANT"
          ? "O recrutador já possui acesso completo a esta empresa."
          : "Não foi possível criar o vínculo do recrutador.";
      const message = getErrorMessage(error, fallback);
      setSubmitError(message);
      toastCustom.error(message);
    },
  });

  const empresasErrorMessage = useMemo(() => {
    if (!empresasError) return null;
    return getErrorMessage(
      empresasError,
      "Não foi possível carregar as empresas elegíveis.",
    );
  }, [empresasError]);

  const vagasErrorMessage = useMemo(() => {
    if (!vagasError) return null;
    return getErrorMessage(
      vagasError,
      "Não foi possível carregar as vagas elegíveis.",
    );
  }, [vagasError]);

  const handleSubmit = () => {
    const nextErrors: FieldErrors = {};

    if (!empresaUsuarioId) {
      nextErrors.empresaUsuarioId = "Selecione a empresa do vínculo.";
    }

    if (tipoVinculo === "VAGA" && !vagaId) {
      nextErrors.vagaId = "Selecione a vaga do vínculo.";
    }

    setFieldErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0 || !empresaUsuarioId) {
      return;
    }

    createMutation.mutate({
      tipoVinculo,
      empresaUsuarioId,
      ...(tipoVinculo === "VAGA" && vagaId ? { vagaId } : {}),
    });
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Adicionar vínculo</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {empresasErrorMessage ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{empresasErrorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {vagasErrorMessage ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{vagasErrorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {submitError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-4">
            <SelectCustom
              label="Como deseja liberar o acesso"
              placeholder="Selecionar tipo de acesso"
              options={TIPO_VINCULO_OPTIONS}
              value={tipoVinculo}
              onChange={(value) => {
                setTipoVinculo(
                  (value as UsuarioRecrutadorVinculoTipo) || "EMPRESA",
                );
                setSubmitError(null);
              }}
              disabled={createMutation.isPending}
              required
            />

            <SelectCustom
              label="Empresa"
              placeholder={
                isLoadingEmpresas
                  ? "Carregando empresas..."
                  : "Selecionar empresa"
              }
              options={empresaOptions}
              value={empresaUsuarioId}
              onChange={(value) => {
                setEmpresaUsuarioId(value);
                setFieldErrors((current) => ({
                  ...current,
                  empresaUsuarioId: undefined,
                  vagaId: undefined,
                }));
                setSubmitError(null);
              }}
              error={fieldErrors.empresaUsuarioId}
              disabled={
                isLoadingEmpresas ||
                createMutation.isPending ||
                empresaOptions.length === 0
              }
              clearable
              required
            />

            {tipoVinculo === "VAGA" ? (
              <SelectCustom
                label="Vaga"
                placeholder={
                  !empresaUsuarioId
                    ? "Selecione a empresa primeiro"
                    : isLoadingVagas
                      ? "Carregando vagas..."
                      : "Selecionar vaga"
                }
                options={vagaOptions}
                value={vagaId}
                onChange={(value) => {
                  setVagaId(value);
                  setFieldErrors((current) => ({
                    ...current,
                    vagaId: undefined,
                  }));
                  setSubmitError(null);
                }}
                error={fieldErrors.vagaId}
                disabled={
                  !empresaUsuarioId ||
                  isLoadingVagas ||
                  createMutation.isPending ||
                  vagaOptions.length === 0
                }
                clearable
                required
              />
            ) : null}
          </div>

          {canShowScopePreview ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-2! text-sm! font-semibold! text-slate-900!">
                Observações sobre o acesso concedido:
              </p>
              <div className="space-y-1.5">
                {tipoVinculo === "EMPRESA" ? (
                  <>
                    <p className="mb-0! text-sm! leading-6! text-slate-600!">
                      • O acesso será amplo às vagas operáveis da empresa.
                    </p>
                    <p className="mb-0! text-sm! leading-6! text-slate-600!">
                      • Permite visualizar Candidatos e entrevistas seguem o
                      mesmo escopo.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mb-0! text-sm! leading-6! text-slate-600!">
                      • O acesso permite visualizar detalhes e gerenciar somente
                      a vaga selecionada.
                    </p>
                    <p className="mb-0! text-sm! leading-6! text-slate-600!">
                      • Permite visualizar Candidatos e entrevistas ficam
                      limitados a essa vaga.
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </ModalBody>

        <ModalFooter className="gap-3">
          <ButtonCustom
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            type="button"
            variant="primary"
            onClick={handleSubmit}
            isLoading={createMutation.isPending}
            loadingText="Salvando..."
          >
            Salvar vínculo
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
