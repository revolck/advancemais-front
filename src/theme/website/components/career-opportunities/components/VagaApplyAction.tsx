"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ButtonCustom } from "@/components/ui/custom/button";
import { toastCustom } from "@/components/ui/custom/toast";
import { UserRole } from "@/config/roles";
import { useUserRole } from "@/hooks/useUserRole";
import { aplicarVaga, listCurriculos, verificarCandidatura } from "@/api/candidatos";
import type { VerificarCandidaturaResponse } from "@/api/candidatos/types";
import { CheckCircle2 } from "lucide-react";
import {
  SelectCurriculoApplyModal,
  type CurriculoApplyOption,
} from "./SelectCurriculoApplyModal";

function isUuid(value: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    value,
  );
}

function getHasTokenCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((row) => row.startsWith("token="));
}

function getDefaultCurriculoId(raw: unknown): string | null {
  if (!Array.isArray(raw)) return null;
  const items = raw.filter((item) => item && typeof item === "object") as Array<
    Record<string, any>
  >;
  const principal = items.find(
    (c) => c.principal === true && typeof c.id === "string",
  );
  if (principal?.id) return principal.id;
  const first = items.find((c) => typeof c.id === "string");
  return first?.id ?? null;
}

function coerceCurriculosApplyOptions(raw: unknown): CurriculoApplyOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): CurriculoApplyOption | null => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, any>;
      if (typeof obj.id !== "string") return null;
      const titulo =
        typeof obj.titulo === "string" && obj.titulo.trim()
          ? obj.titulo.trim()
          : "Currículo";
      const resumo = typeof obj.resumo === "string" ? obj.resumo : null;
      const principal = obj.principal === true;
      return { id: obj.id, titulo, resumo, principal };
    })
    .filter((v): v is CurriculoApplyOption => v !== null);
}

function getDefaultCurriculoIdFromOptions(
  options: CurriculoApplyOption[],
): string | null {
  if (!options || options.length === 0) return null;
  const principal = options.find((c) => c.principal);
  return principal?.id ?? options[0]?.id ?? null;
}

function composeLoginUrl(redirectPath: string): string {
  return `/auth/login?redirect=${encodeURIComponent(redirectPath)}`;
}

export function VagaApplyAction({
  vagaId,
  vagaTitulo,
  className,
}: {
  vagaId: string;
  vagaTitulo?: string | null;
  className?: string;
}) {
  const role = useUserRole();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedCurriculoId, setSelectedCurriculoId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setIsAuthenticated(getHasTokenCookie());
    const interval = setInterval(() => {
      setIsAuthenticated(getHasTokenCookie());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const canCandidateApply = isAuthenticated && role === UserRole.ALUNO_CANDIDATO;
  const canCheckApplied = canCandidateApply && isUuid(vagaId);

  const appliedQuery = useQuery<VerificarCandidaturaResponse>({
    queryKey: ["aluno-candidato", "candidaturas", "verificar", vagaId],
    queryFn: () => verificarCandidatura(vagaId, { cache: "no-store" }),
    enabled: canCheckApplied,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const hasApplied = appliedQuery.data?.hasApplied === true;

  const curriculosQuery = useQuery({
    queryKey: ["aluno-candidato", "curriculos", "for-apply", "website"],
    queryFn: () => listCurriculos({ cache: "no-store" }),
    enabled: canCandidateApply,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const defaultCurriculoId = useMemo(() => {
    return getDefaultCurriculoId(curriculosQuery.data);
  }, [curriculosQuery.data]);

  const curriculosApplyOptions = useMemo(() => {
    return coerceCurriculosApplyOptions(curriculosQuery.data);
  }, [curriculosQuery.data]);

  const defaultCurriculoIdFromOptions = useMemo(() => {
    return getDefaultCurriculoIdFromOptions(curriculosApplyOptions);
  }, [curriculosApplyOptions]);

  const applyMutation = useMutation({
    mutationFn: async (payload: { vagaId: string; curriculoId: string }) => {
      return aplicarVaga(payload);
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(
        ["aluno-candidato", "candidaturas", "verificar", variables.vagaId],
        { hasApplied: true },
      );
      queryClient.invalidateQueries({
        queryKey: ["aluno-candidato", "candidaturas", "verificar", variables.vagaId],
      });

      toastCustom.success({
        title: "Candidatura enviada",
        description: vagaTitulo
          ? `Sua candidatura para "${vagaTitulo}" foi registrada com sucesso.`
          : "Sua candidatura foi registrada com sucesso.",
      });

      setIsSelectOpen(false);
    },
    onError: (error: any) => {
      const code = error?.details?.code || error?.code;
      const message = error?.details?.message || error?.message;

      if (code === "APPLY_ERROR" && typeof message === "string") {
        toastCustom.error({
          title: "Não foi possível se candidatar",
          description: message,
        });
        return;
      }

      toastCustom.error({
        title: "Erro ao se candidatar",
        description:
          typeof message === "string" && message.length > 0
            ? message
            : "Tente novamente em instantes.",
      });
    },
  });

  const redirectPath =
    typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : "/vagas";

  if (!isAuthenticated) {
    return (
      <ButtonCustom
        asChild
        variant="default"
        className={className ?? "rounded-full text-sm"}
      >
        <a href={composeLoginUrl(redirectPath)}>Candidatar-se</a>
      </ButtonCustom>
    );
  }

  if (role === null) {
    return (
      <ButtonCustom
        variant="default"
        disabled
        className={className ?? "rounded-full text-sm"}
      >
        Carregando...
      </ButtonCustom>
    );
  }

  if (role && role !== UserRole.ALUNO_CANDIDATO) {
    return null;
  }

  if (hasApplied) {
    return (
      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-full flex items-center gap-1 border border-emerald-100">
        <CheckCircle2 className="w-4 h-4" />
        Já se candidatou
      </span>
    );
  }

  return (
    <>
      <ButtonCustom
        variant="default"
        onClick={() => {
          if (!isUuid(vagaId)) {
            toastCustom.error({
              title: "Vaga inválida",
              description:
                "Não foi possível identificar esta vaga para candidatura.",
            });
            return;
          }

          if (curriculosQuery.isLoading) {
            toastCustom.info({
              title: "Carregando currículos",
              description: "Aguarde um instante e tente novamente.",
            });
            return;
          }

          if (curriculosApplyOptions.length === 0) {
            toastCustom.error({
              title: "Nenhum currículo encontrado",
              description: "Crie um currículo para conseguir se candidatar às vagas.",
              linkText: "Criar currículo",
              linkHref: "/dashboard/curriculo/cadastrar",
            });
            return;
          }

          if (curriculosApplyOptions.length === 1) {
            const curriculoId =
              curriculosApplyOptions[0]?.id ??
              defaultCurriculoId ??
              defaultCurriculoIdFromOptions;
            if (!curriculoId) {
              toastCustom.error({
                title: "Nenhum currículo encontrado",
                description:
                  "Crie um currículo para conseguir se candidatar às vagas.",
                linkText: "Criar currículo",
                linkHref: "/dashboard/curriculo/cadastrar",
              });
              return;
            }
            applyMutation.mutate({ vagaId, curriculoId });
            return;
          }

          const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
          const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
          setSelectedCurriculoId((prev) => {
            if (prev && curriculosApplyOptions.some((c) => c.id === prev)) return prev;
            return defaultCurriculoIdFromOptions;
          });
          setIsSelectOpen(true);
          if (typeof window !== "undefined") {
            requestAnimationFrame(() => {
              window.scrollTo(scrollX, scrollY);
              requestAnimationFrame(() => window.scrollTo(scrollX, scrollY));
            });
          }
        }}
        disabled={
          isSelectOpen ||
          applyMutation.isPending ||
          appliedQuery.isFetching ||
          curriculosQuery.isLoading
        }
        className={className ?? "rounded-full text-sm"}
      >
        {applyMutation.isPending ? "Enviando..." : "Candidatar-se"}
      </ButtonCustom>

      <SelectCurriculoApplyModal
        isOpen={isSelectOpen}
        onOpenChange={(open) => {
          if (applyMutation.isPending) return;
          setIsSelectOpen(open);
        }}
        vagaTitulo={vagaTitulo ?? null}
        curriculos={curriculosApplyOptions}
        selectedCurriculoId={selectedCurriculoId}
        onSelectCurriculoId={setSelectedCurriculoId}
        isSubmitting={applyMutation.isPending}
        onConfirm={() => {
          if (!selectedCurriculoId) return;
          applyMutation.mutate({ vagaId, curriculoId: selectedCurriculoId });
        }}
      />
    </>
  );
}
