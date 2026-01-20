"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ButtonCustom,
  FilterBar,
  EmptyState,
} from "@/components/ui/custom";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  deleteCurriculo,
  getCurriculo,
  listCurriculos,
  setCurriculoPrincipal,
} from "@/api/candidatos";
import type { Curriculo } from "@/api/candidatos/types";
import type { CurriculosListFilters } from "@/api/candidatos/types";
import { getUserProfile } from "@/api/usuarios";
import type { UsuarioProfileResponse } from "@/api/usuarios/types";
import { ViewCurriculoModal } from "@/theme/dashboard/components/admin/candidato-details/modal-acoes/ViewCurriculoModal";
import { CurriculoRow } from "./components/CurriculoRow";
import { CurriculoTableSkeleton } from "./components/CurriculoTableSkeleton";
import {
  DeleteCurriculoModal,
  type DeleteCurriculoTarget,
} from "./components/modals/DeleteCurriculoModal";
import {
  SetPrincipalConfirmModal,
  type SetPrincipalTarget,
} from "./components/modals/SetPrincipalConfirmModal";

type CurriculoListItem = React.ComponentProps<typeof CurriculoRow>["curriculo"];

const CURRICULOS_QUERY_KEY = ["aluno-candidato", "curriculos"] as const;

function applyPrincipalChange<T extends Record<string, unknown>>(
  items: T[],
  nextPrincipalId: string,
): T[] {
  return items.map((item) => {
    if (!item || typeof item !== "object") return item;
    const id = (item as any)?.id;
    if (typeof id !== "string") return item;
    if (id === nextPrincipalId) return { ...(item as any), principal: true };
    if ((item as any)?.principal === true) return { ...(item as any), principal: false };
    return item;
  });
}

function parseCurrencyToNumber(value: string): number {
  if (!value) return 0;
  const filtered = value.replace(/[^\d.,-]/g, "").trim();
  if (!filtered) return 0;

  const lastComma = filtered.lastIndexOf(",");
  const lastDot = filtered.lastIndexOf(".");

  let normalized = filtered;

  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      normalized = filtered.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = filtered.replace(/,/g, "");
    }
  } else if (lastComma !== -1) {
    normalized = filtered.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = filtered.replace(/,/g, "");
  }

  const num = Number.parseFloat(normalized);
  return Number.isFinite(num) ? num : 0;
}

function coerceCurriculoListItem(value: unknown): CurriculoListItem | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== "string" || typeof v.titulo !== "string") return null;

  const preferencias =
    v.preferencias && typeof v.preferencias === "object"
      ? (v.preferencias as Record<string, unknown>)
      : null;
  const consentimentos =
    v.consentimentos && typeof v.consentimentos === "object"
      ? (v.consentimentos as Record<string, unknown>)
      : null;

  const salarioMinimoRaw = preferencias?.salarioMinimo;
  const salarioMinimo =
    typeof salarioMinimoRaw === "number"
      ? salarioMinimoRaw
      : typeof salarioMinimoRaw === "string"
        ? Number.parseFloat(salarioMinimoRaw)
        : null;

  return {
    id: v.id,
    titulo: v.titulo,
    principal: typeof v.principal === "boolean" ? v.principal : undefined,
    resumo: typeof v.resumo === "string" ? v.resumo : null,
    criadoEm: typeof v.criadoEm === "string" ? v.criadoEm : null,
    ultimaAtualizacao:
      typeof v.ultimaAtualizacao === "string" ? v.ultimaAtualizacao : null,
    pretensaoSalarial:
      typeof salarioMinimo === "number" && Number.isFinite(salarioMinimo)
        ? salarioMinimo
        : null,
    receberOfertas:
      typeof consentimentos?.receberOfertas === "boolean"
        ? consentimentos.receberOfertas
        : null,
    autorizarContato:
      typeof consentimentos?.autorizarContato === "boolean"
        ? consentimentos.autorizarContato
        : null,
  };
}

export function AlunoCurriculoView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [viewCurriculoId, setViewCurriculoId] = useState<string | null>(null);
  const [deleteCurriculoId, setDeleteCurriculoId] = useState<string | null>(
    null,
  );
  const [setPrincipalCurriculoId, setSetPrincipalCurriculoId] = useState<
    string | null
  >(null);
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedPrincipal, setSelectedPrincipal] = useState<string | null>(
    null,
  );
  const [selectedAutorizarContato, setSelectedAutorizarContato] = useState<
    string | null
  >(null);
  const [pendingPretensaoMin, setPendingPretensaoMin] = useState("");
  const [pendingPretensaoMax, setPendingPretensaoMax] = useState("");
  const [appliedPretensaoMin, setAppliedPretensaoMin] = useState("");
  const [appliedPretensaoMax, setAppliedPretensaoMax] = useState("");

  const { data: profileResponse } = useQuery<UsuarioProfileResponse>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await getUserProfile();
      if (
        !response ||
        !("success" in response) ||
        response.success !== true ||
        !("usuario" in response)
      ) {
        throw new Error("Erro ao carregar perfil");
      }
      return response as UsuarioProfileResponse;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const usuarioNome = useMemo(() => {
    return (
      (profileResponse as any)?.usuario?.nome ||
      (profileResponse as any)?.usuario?.nomeCompleto ||
      "Usuário"
    );
  }, [profileResponse]);

  const curriculosFilters = useMemo<CurriculosListFilters>(() => {
    const busca = appliedSearchTerm.trim();
    const principal =
      selectedPrincipal === "SIM"
        ? true
        : selectedPrincipal === "NAO"
          ? false
          : undefined;
    const autorizaContato =
      selectedAutorizarContato === "SIM"
        ? true
        : selectedAutorizarContato === "NAO"
          ? false
          : undefined;

    const salarioMinimo =
      appliedPretensaoMin.trim() !== ""
        ? parseCurrencyToNumber(appliedPretensaoMin)
        : undefined;
    const salarioMaximo =
      appliedPretensaoMax.trim() !== ""
        ? parseCurrencyToNumber(appliedPretensaoMax)
        : undefined;

    return {
      busca: busca || undefined,
      principal,
      autorizaContato,
      salarioMinimo:
        typeof salarioMinimo === "number" && salarioMinimo > 0
          ? salarioMinimo
          : undefined,
      salarioMaximo:
        typeof salarioMaximo === "number" && salarioMaximo > 0
          ? salarioMaximo
          : undefined,
    };
  }, [
    appliedPretensaoMax,
    appliedPretensaoMin,
    appliedSearchTerm,
    selectedAutorizarContato,
    selectedPrincipal,
  ]);

  const {
    data: curriculosRaw,
    isLoading: isLoadingCurriculos,
    isFetching: isFetchingCurriculos,
  } = useQuery({
    queryKey: ["aluno-candidato", "curriculos", curriculosFilters],
    queryFn: () => listCurriculos(curriculosFilters),
    staleTime: 30 * 1000,
    retry: 1,
  });

  const curriculosFromQuery = useMemo<CurriculoListItem[]>(() => {
    if (!Array.isArray(curriculosRaw)) return [];
    return curriculosRaw
      .map(coerceCurriculoListItem)
      .filter((v): v is CurriculoListItem => Boolean(v))
      .sort((a, b) => {
        if (Boolean(a.principal) !== Boolean(b.principal)) {
          return a.principal ? -1 : 1;
        }
        const aTime = a.ultimaAtualizacao || a.criadoEm || "";
        const bTime = b.ultimaAtualizacao || b.criadoEm || "";
	        return bTime.localeCompare(aTime);
	      });
	  }, [curriculosRaw]);

  const [curriculos, setCurriculos] = useState<CurriculoListItem[]>([]);

  useEffect(() => {
    setCurriculos(curriculosFromQuery);
  }, [curriculosFromQuery]);

  const applySearch = () => {
    setAppliedSearchTerm(pendingSearchTerm.trim());
    setAppliedPretensaoMin(pendingPretensaoMin);
    setAppliedPretensaoMax(pendingPretensaoMax);
  };

  const setPrincipalMutation = useMutation({
    mutationFn: async (id: string) => {
      return setCurriculoPrincipal(id);
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({
        queryKey: CURRICULOS_QUERY_KEY,
        exact: false,
      });

      const previous = queryClient.getQueriesData({
        queryKey: CURRICULOS_QUERY_KEY,
        exact: false,
      });

      queryClient.setQueriesData(
        { queryKey: CURRICULOS_QUERY_KEY, exact: false },
        (old) => {
          if (!Array.isArray(old)) return old;
          return applyPrincipalChange(old as Record<string, unknown>[], id);
        },
      );

      setCurriculos((prev) => applyPrincipalChange(prev as any, id) as any);

      return { previous, previousLocal: curriculos };
    },
    onSuccess: async (updated, id) => {
      // Garante que a UI atualize imediatamente o badge/coluna de principal.
      const queries = queryClient.getQueriesData({
        queryKey: CURRICULOS_QUERY_KEY,
        exact: false,
      });

      for (const [key, data] of queries) {
        if (!Array.isArray(data)) continue;
        queryClient.setQueryData(
          key,
          applyPrincipalChange(data as Record<string, unknown>[], id),
        );
      }

      // Atualiza o cache do currículo que voltou no PATCH (quando existir)
      const updatedId =
        updated && typeof updated === "object" && typeof (updated as any).id === "string"
          ? String((updated as any).id)
          : null;
      if (updatedId) {
        queryClient.setQueryData(["aluno-candidato", "curriculo", updatedId], updated);
      }

      setCurriculos((prev) => applyPrincipalChange(prev as any, id) as any);

      toastCustom.success({
        title: "Currículo principal atualizado",
        description: "Este currículo agora está definido como principal.",
      });
      // Refetch explícito do endpoint de listagem para sincronizar com o backend.
      // Isso evita qualquer cenário onde o cache local fique divergente.
      try {
        const fresh = await listCurriculos(curriculosFilters);
        queryClient.setQueryData(
          [...CURRICULOS_QUERY_KEY, curriculosFilters],
          fresh,
        );
      } catch {
        /* ignore - se falhar, mantemos o estado otimista */
      } finally {
        await queryClient.invalidateQueries({
          queryKey: CURRICULOS_QUERY_KEY,
          exact: false,
          refetchType: "all",
        });
        await queryClient.refetchQueries({
          queryKey: CURRICULOS_QUERY_KEY,
          exact: false,
        });
      }
    },
    onError: (error: any, _id, ctx) => {
      if (ctx?.previous) {
        for (const [key, data] of ctx.previous) {
          queryClient.setQueryData(key, data);
        }
      }
      if (ctx?.previousLocal) {
        setCurriculos(ctx.previousLocal);
      }
      toastCustom.error({
        title: "Erro ao definir principal",
        description: error?.message || "Não foi possível atualizar agora.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteCurriculo(id);
    },
    onSuccess: async () => {
      toastCustom.success({
        title: "Currículo removido",
        description: "O currículo foi removido com sucesso.",
      });
      setDeleteCurriculoId(null);
      await queryClient.invalidateQueries({
        queryKey: CURRICULOS_QUERY_KEY,
        exact: false,
        refetchType: "all",
      });
      await queryClient.refetchQueries({
        queryKey: CURRICULOS_QUERY_KEY,
        exact: false,
      });
    },
    onError: (error: any) => {
      toastCustom.error({
        title: "Erro ao remover currículo",
        description: error?.message || "Não foi possível remover agora.",
      });
    },
  });

  const deleteTarget = useMemo(() => {
    if (!deleteCurriculoId) return null;
    return curriculos.find((c) => c.id === deleteCurriculoId) ?? null;
  }, [curriculos, deleteCurriculoId]);

  const setPrincipalTarget = useMemo(() => {
    if (!setPrincipalCurriculoId) return null;
    return curriculos.find((c) => c.id === setPrincipalCurriculoId) ?? null;
  }, [curriculos, setPrincipalCurriculoId]);

  const currentPrincipal = useMemo(() => {
    return curriculos.find((c) => c.principal) ?? null;
  }, [curriculos]);

  const { data: viewCurriculoRaw, isFetching: isFetchingCurriculoView } =
    useQuery({
      queryKey: ["aluno-candidato", "curriculo", viewCurriculoId],
      enabled: Boolean(viewCurriculoId),
      queryFn: async () => {
        if (!viewCurriculoId) return null;
        return getCurriculo(viewCurriculoId);
      },
      retry: 1,
    });

  const viewCurriculo = useMemo(() => {
    if (!viewCurriculoRaw || typeof viewCurriculoRaw !== "object") return null;
    const v = viewCurriculoRaw as Record<string, unknown>;
    if (typeof v.id !== "string") return null;
    return viewCurriculoRaw as Curriculo;
  }, [viewCurriculoRaw]);

  const isBusy =
    deleteMutation.isPending ||
    setPrincipalMutation.isPending ||
    isFetchingCurriculos;

  const showSkeleton = isLoadingCurriculos;
  const showEmptyState = !showSkeleton && curriculos.length === 0;

  return (
    <>
      <div className="min-h-full space-y-6">
        <div className="mb-4 flex flex-col items-stretch gap-3 sm:mb-2 sm:flex-row sm:items-center sm:justify-end">
          <ButtonCustom
            variant="primary"
            size="md"
            icon="Plus"
            fullWidth
            className="sm:w-auto"
            onClick={() => router.push("/dashboard/curriculo/cadastrar")}
            disabled={isBusy}
          >
            Criar currículo
          </ButtonCustom>
        </div>

        <div className="border-b border-gray-200 top-0 z-10">
          <div className="py-4">
            <FilterBar
              className="[&>div]:lg:grid-cols-[minmax(0,1.8fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_auto]"
              fields={[
                {
                  key: "principal",
                  label: "Principal",
                  type: "select",
                  options: [
                    { value: "SIM", label: "Sim" },
                    { value: "NAO", label: "Não" },
                  ],
                  placeholder: "Selecionar",
                },
                {
                  key: "autorizarContato",
                  label: "Autoriza contato",
                  type: "select",
                  options: [
                    { value: "SIM", label: "Sim" },
                    { value: "NAO", label: "Não" },
                  ],
                  placeholder: "Selecionar",
                },
                {
                  key: "pretensaoMin",
                  label: "Pretensão mínima",
                  type: "text",
                  placeholder: "Ex.: R$ 3.000,00",
                  mask: "money",
                },
                {
                  key: "pretensaoMax",
                  label: "Pretensão máxima",
                  type: "text",
                  placeholder: "Ex.: R$ 8.000,00",
                  mask: "money",
                },
              ]}
              values={{
                principal: selectedPrincipal,
                autorizarContato: selectedAutorizarContato,
                pretensaoMin: pendingPretensaoMin,
                pretensaoMax: pendingPretensaoMax,
              }}
              onChange={(key, value) => {
                if (key === "principal") {
                  setSelectedPrincipal((value as string) || null);
                }
                if (key === "autorizarContato") {
                  setSelectedAutorizarContato((value as string) || null);
                }
                if (key === "pretensaoMin") {
                  const next = String(value ?? "");
                  setPendingPretensaoMin(next);
                  if (value === null) {
                    setAppliedPretensaoMin("");
                  }
                }
                if (key === "pretensaoMax") {
                  const next = String(value ?? "");
                  setPendingPretensaoMax(next);
                  if (value === null) {
                    setAppliedPretensaoMax("");
                  }
                }
              }}
              onClearAll={() => {
                setPendingSearchTerm("");
                setAppliedSearchTerm("");
                setSelectedPrincipal(null);
                setSelectedAutorizarContato(null);
                setPendingPretensaoMin("");
                setPendingPretensaoMax("");
                setAppliedPretensaoMin("");
                setAppliedPretensaoMax("");
              }}
              search={{
                label: "Pesquisar currículo",
                value: pendingSearchTerm,
                onChange: (value) => setPendingSearchTerm(value),
                placeholder: "Buscar por título ou resumo...",
                helperText: "Pesquise pelo título ou resumo do currículo.",
                helperPlacement: "tooltip",
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applySearch();
                  }
                },
              }}
              rightActions={
                <ButtonCustom
                  variant="primary"
                  size="lg"
                  onClick={applySearch}
                  disabled={isBusy}
                  className="md:w-full xl:w-auto"
                >
                  Pesquisar
                </ButtonCustom>
              }
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {showEmptyState ? (
            <div className="p-8">
              <EmptyState
                title="Nenhum currículo encontrado"
                description="Crie seu currículo ou ajuste a busca para visualizar resultados."
                illustration="myFiles"
                actions={
                  <ButtonCustom
                    variant="primary"
                    onClick={() =>
                      router.push("/dashboard/curriculo/cadastrar")
                    }
                    disabled={isBusy}
                  >
                    Criar currículo
                  </ButtonCustom>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className={cn("min-w-[1200px]")}>
                <TableHeader>
                  <TableRow className="border-gray-200 bg-gray-50/50">
                    <TableHead className="font-medium text-gray-700 py-4">
                      Currículo
                    </TableHead>
                    <TableHead className="font-medium text-gray-700">
                      Resumo
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 whitespace-nowrap">
                      Pretensão salarial
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 whitespace-nowrap">
                      Receber ofertas
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 whitespace-nowrap">
                      Autoriza contato
                    </TableHead>
                    <TableHead className="font-medium text-gray-700">
                      Principal
                    </TableHead>
                    <TableHead className="w-[168px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {showSkeleton ? (
                    <CurriculoTableSkeleton rows={5} />
                  ) : (
                    curriculos.map((curriculo) => (
                      <CurriculoRow
                        key={curriculo.id}
                        curriculo={curriculo}
                        isBusy={isBusy}
                        onView={(id) => setViewCurriculoId(id)}
                        onEdit={(id) => router.push(`/dashboard/curriculo/editar/${id}`)}
                        onSetPrincipal={(id) => setSetPrincipalCurriculoId(id)}
                        onRemove={(id) => setDeleteCurriculoId(id)}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {viewCurriculoId && viewCurriculo ? (
        <ViewCurriculoModal
          isOpen={Boolean(viewCurriculoId)}
          onOpenChange={(open) => {
            if (!open) setViewCurriculoId(null);
          }}
          curriculo={viewCurriculo}
          usuarioNome={usuarioNome}
          usuarioData={(profileResponse as any)?.usuario ?? null}
        />
      ) : null}

      {viewCurriculoId && !viewCurriculo && isFetchingCurriculoView ? (
        <div className="text-sm text-gray-600">Carregando currículo...</div>
      ) : null}

      <DeleteCurriculoModal
        isOpen={Boolean(deleteCurriculoId)}
        onOpenChange={(open) => {
          if (!open) setDeleteCurriculoId(null);
        }}
        target={
          (deleteTarget
            ? {
                id: deleteTarget.id,
                titulo: deleteTarget.titulo,
                principal: deleteTarget.principal,
              }
            : null) satisfies DeleteCurriculoTarget
        }
        isBusy={isBusy}
        isDeleting={deleteMutation.isPending}
        onConfirmDelete={(id) => deleteMutation.mutate(id)}
      />

      <SetPrincipalConfirmModal
        isOpen={Boolean(setPrincipalCurriculoId)}
        onOpenChange={(open) => {
          if (!open) setSetPrincipalCurriculoId(null);
        }}
        target={
          (setPrincipalTarget
            ? { id: setPrincipalTarget.id, titulo: setPrincipalTarget.titulo }
            : null) satisfies SetPrincipalTarget
        }
        currentPrincipal={
          (currentPrincipal
            ? { id: currentPrincipal.id, titulo: currentPrincipal.titulo }
            : null) satisfies SetPrincipalTarget
        }
        isBusy={isBusy}
        isSaving={setPrincipalMutation.isPending}
        onConfirm={(id) => {
          setSetPrincipalCurriculoId(null);
          setPrincipalMutation.mutate(id);
        }}
      />
    </>
  );
}
