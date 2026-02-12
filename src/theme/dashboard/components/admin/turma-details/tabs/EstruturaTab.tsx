"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/custom/Icons";
import { EmptyState } from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom/button";
import { cn } from "@/lib/utils";
import {
  getTurmaById,
  listModulos,
  listProvas,
  type CreateTurmaEstruturaPayload,
  type TurmaEstruturaTipo,
} from "@/api/cursos";
import { listAulas, type Aula } from "@/api/aulas";
import { useInstrutoresForSelect } from "../../lista-turmas/hooks/useInstrutoresForSelect";
import {
  ITEM_TYPE_STYLES,
  TYPE_META,
  getIconForType,
} from "@/components/ui/custom/builder-manager/config";
import Link from "next/link";

type EstruturaItemType = "AULA" | "PROVA" | "ATIVIDADE";

interface EstruturaItem {
  id: string;
  title: string;
  type: EstruturaItemType;
  startDate?: string | null;
  endDate?: string | null;
  order?: number | null;
  instructorId?: string | null;
  instructorName?: string | null;
  attachmentsCount?: number | null;
}

interface EstruturaModule {
  id: string;
  title: string;
  order?: number | null;
  items: EstruturaItem[];
}

interface EstruturaData {
  modules: EstruturaModule[];
  standaloneItems: EstruturaItem[];
}

interface EstruturaTabProps {
  cursoId: number | string;
  turmaId: string;
  initialEstrutura?: CreateTurmaEstruturaPayload | null;
  estruturaTipo?: TurmaEstruturaTipo | null;
}

const ESTRUTURA_LABELS: Record<TurmaEstruturaTipo, string> = {
  MODULAR: "Modular",
  DINAMICA: "Dinâmica",
  PADRAO: "Padrão",
};

const normalizeType = (value: unknown): EstruturaItemType => {
  const raw = typeof value === "string" ? value.toUpperCase() : "";
  if (raw === "PROVA") return "PROVA";
  if (raw === "ATIVIDADE") return "ATIVIDADE";
  return "AULA";
};

const parseOrder = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const sortByOrderAndTitle = (a: EstruturaItem, b: EstruturaItem) => {
  const orderA = parseOrder(a.order);
  const orderB = parseOrder(b.order);
  if (orderA != null && orderB != null) return orderA - orderB;
  if (orderA != null) return -1;
  if (orderB != null) return 1;
  return a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" });
};

const sortModules = (a: EstruturaModule, b: EstruturaModule) => {
  const orderA = parseOrder(a.order);
  const orderB = parseOrder(b.order);
  if (orderA != null && orderB != null) return orderA - orderB;
  if (orderA != null) return -1;
  if (orderB != null) return 1;
  return a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" });
};

const formatDateRange = (start?: string | null, end?: string | null) => {
  if (!start && !end) return null;
  const format = (value?: string | null) => {
    if (!value) return "…";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "…";
    return date.toLocaleDateString("pt-BR");
  };
  return `${format(start)} — ${format(end)}`;
};

const getItemBadgeClass = (type: EstruturaItemType) =>
  TYPE_META[type]?.cls ?? "bg-gray-50 text-gray-700 border-gray-200";

const getItemStyle = (type: EstruturaItemType) =>
  ITEM_TYPE_STYLES[type] ?? {
    border: "border-gray-200",
    bg: "bg-gray-50/50",
    hoverBg: "hover:bg-gray-50",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
    selectedRing: "ring-gray-300",
  };

const buildFromPayload = (
  payload?: CreateTurmaEstruturaPayload | null,
): EstruturaData | null => {
  if (!payload) return null;
  const raw = payload as any;
  const modulesRaw = Array.isArray(raw.modules)
    ? raw.modules
    : Array.isArray(raw.modulos)
      ? raw.modulos
      : [];
  const standaloneRaw = Array.isArray(raw.standaloneItems)
    ? raw.standaloneItems
    : Array.isArray(raw.itensAvulsos)
      ? raw.itensAvulsos
      : Array.isArray(raw.itens)
        ? raw.itens
        : [];

  const modules: EstruturaModule[] = modulesRaw.map(
    (mod: any, index: number) => {
      const itemsRaw = Array.isArray(mod.items)
        ? mod.items
        : Array.isArray(mod.itens)
          ? mod.itens
          : [];
      const items = itemsRaw.map((item: any, itemIndex: number) => ({
        id: String(item.id ?? `${mod.id ?? index}-item-${itemIndex}`),
        title: String(item.title ?? item.titulo ?? item.nome ?? "Item"),
        type: normalizeType(item.type ?? item.tipo),
        startDate:
          item.startDate ?? item.dataInicio ?? item.inicioPrevisto ?? null,
        endDate: item.endDate ?? item.dataFim ?? item.fimPrevisto ?? null,
        order: parseOrder(item.ordem ?? item.order ?? item.posicao),
        instructorId: Array.isArray(item.instructorIds)
          ? String(item.instructorIds[0] ?? "")
          : item.instructorId ?? item.instrutorId ?? null,
        instructorName: item.instructorName ?? item.instrutorNome ?? null,
        attachmentsCount: Array.isArray(item.materiais)
          ? item.materiais.length
          : Array.isArray(item.anexos)
            ? item.anexos.length
            : null,
      }));

      return {
        id: String(mod.id ?? `mod-${index + 1}`),
        title: String(mod.title ?? mod.nome ?? `Módulo ${index + 1}`),
        order: parseOrder(mod.ordem ?? mod.order ?? mod.posicao),
        items: items.sort(sortByOrderAndTitle),
      };
    },
  );

  const standaloneItems: EstruturaItem[] = standaloneRaw.map(
    (item: any, index: number) => ({
      id: String(item.id ?? `standalone-${index + 1}`),
      title: String(item.title ?? item.titulo ?? item.nome ?? "Item"),
      type: normalizeType(item.type ?? item.tipo),
      startDate:
        item.startDate ?? item.dataInicio ?? item.inicioPrevisto ?? null,
      endDate: item.endDate ?? item.dataFim ?? item.fimPrevisto ?? null,
      order: parseOrder(item.ordem ?? item.order ?? item.posicao),
      instructorId: Array.isArray(item.instructorIds)
        ? String(item.instructorIds[0] ?? "")
        : item.instructorId ?? item.instrutorId ?? null,
      instructorName: item.instructorName ?? item.instrutorNome ?? null,
      attachmentsCount: Array.isArray(item.materiais)
        ? item.materiais.length
        : Array.isArray(item.anexos)
          ? item.anexos.length
          : null,
    }),
  );

  return {
    modules: modules.sort(sortModules),
    standaloneItems: standaloneItems.sort(sortByOrderAndTitle),
  };
};

const mapAulaToItem = (aula: any): EstruturaItem => ({
  id: String(aula.id ?? `aula-${Math.random().toString(36).slice(2, 7)}`),
  title: String(aula.titulo ?? aula.nome ?? aula.codigo ?? "Aula"),
  type: "AULA",
  startDate: aula.dataInicio ?? null,
  endDate: aula.dataFim ?? null,
  order: parseOrder(aula.ordem),
  instructorId: aula?.instrutor?.id ?? null,
  instructorName: aula?.instrutor?.nome ?? null,
  attachmentsCount: Array.isArray((aula as any)?.materiais)
    ? (aula as any).materiais.length
    : null,
});

const mapProvaToItem = (prova: any): EstruturaItem => ({
  id: String(prova.id ?? `prova-${Math.random().toString(36).slice(2, 7)}`),
  title: String(prova.titulo ?? prova.nome ?? "Prova"),
  type: normalizeType(prova.tipo ?? prova.type),
  startDate: prova.dataInicio ?? prova.data ?? prova.inicioPrevisto ?? null,
  endDate: prova.dataFim ?? prova.fimPrevisto ?? null,
  order: parseOrder(prova.ordem),
  instructorId: prova.instrutorId ?? prova?.instrutor?.id ?? null,
  instructorName: prova?.instrutor?.nome ?? null,
  attachmentsCount: Array.isArray(prova?.anexos)
    ? prova.anexos.length
    : Array.isArray(prova?.arquivos)
      ? prova.arquivos.length
      : prova?.arquivo?.arquivoUrl || prova?.arquivoUrl
        ? 1
        : null,
});

const hasAnyStructure = (
  estrutura: EstruturaData | null,
): estrutura is EstruturaData => {
  if (!estrutura) return false;
  return (
    estrutura.modules.length > 0 ||
    estrutura.standaloneItems.length > 0 ||
    estrutura.modules.some((module) => module.items.length > 0)
  );
};

async function fetchEstruturaLegacy(
  cursoId: number | string,
  turmaId: string,
): Promise<EstruturaData> {
  const safeList = async <T,>(promise: Promise<T>, fallback: T): Promise<T> => {
    try {
      return await promise;
    } catch (err: any) {
      if (err?.status === 404) return fallback;
      throw err;
    }
  };

  const [modulos, provas, aulasResponse] = await Promise.all([
    listModulos(cursoId, turmaId),
    safeList(listProvas(cursoId, turmaId), [] as any[]),
    safeList(
      listAulas({ cursoId: String(cursoId), turmaId, page: 1, pageSize: 200 }),
      { data: [], pagination: { totalPages: 1 } } as any,
    ),
  ]);

  let aulas = aulasResponse.data ?? [];
  const totalPages = aulasResponse.pagination?.totalPages ?? 1;
  if (totalPages > 1) {
    const maxPages = 20;
    for (let page = 2; page <= totalPages && page <= maxPages; page += 1) {
      const response = await listAulas({
        cursoId: String(cursoId),
        turmaId,
        page,
        pageSize: 200,
      });
      aulas = aulas.concat(response.data ?? []);
    }
  }

  const moduleItems = new Map<string, EstruturaItem[]>();
  const standaloneItems: EstruturaItem[] = [];

  aulas.forEach((aula: Aula & { moduloId?: string | null }) => {
    const moduloId = aula?.modulo?.id ?? (aula as any)?.moduloId ?? null;
    const item = mapAulaToItem(aula);
    if (moduloId) {
      const list = moduleItems.get(String(moduloId)) ?? [];
      list.push(item);
      moduleItems.set(String(moduloId), list);
    } else {
      standaloneItems.push(item);
    }
  });

  provas.forEach((prova) => {
    const moduloId = prova?.moduloId ? String(prova.moduloId) : null;
    const item = mapProvaToItem(prova);
    if (moduloId) {
      const list = moduleItems.get(moduloId) ?? [];
      list.push(item);
      moduleItems.set(moduloId, list);
    } else {
      standaloneItems.push(item);
    }
  });

  const modules: EstruturaModule[] = modulos.map((modulo) => ({
    id: String(modulo.id ?? ""),
    title: String(modulo.nome ?? "Módulo"),
    order: parseOrder(modulo.ordem),
    items: (moduleItems.get(String(modulo.id)) ?? []).sort(sortByOrderAndTitle),
  }));

  const orphanModules = Array.from(moduleItems.entries())
    .filter(([moduleId]) => !modules.some((mod) => mod.id === moduleId))
    .map(([moduleId, items]) => ({
      id: moduleId,
      title: `Módulo ${moduleId}`,
      items: items.sort(sortByOrderAndTitle),
    }));

  return {
    modules: modules.concat(orphanModules).sort(sortModules),
    standaloneItems: standaloneItems.sort(sortByOrderAndTitle),
  };
}

async function fetchEstrutura(
  cursoId: number | string,
  turmaId: string,
): Promise<EstruturaData> {
  try {
    const turma = await getTurmaById(cursoId, turmaId, {
      includeAlunos: false,
      includeEstrutura: true,
    });

    const estruturaFromDetail = buildFromPayload(turma.estrutura ?? null);
    if (hasAnyStructure(estruturaFromDetail)) {
      return estruturaFromDetail;
    }
  } catch (error: any) {
    const status = Number(error?.status ?? 0);
    if (status && status < 500) {
      return fetchEstruturaLegacy(cursoId, turmaId);
    }
    throw error;
  }

  return fetchEstruturaLegacy(cursoId, turmaId);
}

export function EstruturaTab({
  cursoId,
  turmaId,
  initialEstrutura,
  estruturaTipo,
}: EstruturaTabProps) {
  const { rawInstrutores, isLoading: isInstrutoresLoading } =
    useInstrutoresForSelect();
  const instructorNameById = useMemo(() => {
    const map = new Map<string, string>();
    rawInstrutores.forEach((instrutor) => {
      if (!instrutor?.id) return;
      const label =
        instrutor.nome || instrutor.email || instrutor.codUsuario || instrutor.id;
      map.set(String(instrutor.id), String(label));
    });
    return map;
  }, [rawInstrutores]);

  const initialData = useMemo(
    () => buildFromPayload(initialEstrutura),
    [initialEstrutura],
  );
  const hasInitialStructure = useMemo(
    () => hasAnyStructure(initialData),
    [initialData],
  );

  const { data, isLoading, isFetching, error } = useQuery<EstruturaData>({
    queryKey: ["admin-turma-estrutura", String(cursoId), turmaId],
    queryFn: () => fetchEstrutura(cursoId, turmaId),
    enabled: Boolean(cursoId && turmaId),
    initialData: hasInitialStructure ? initialData ?? undefined : undefined,
    staleTime: 20 * 1000,
  });

  const estrutura = useMemo(
    () => data ?? { modules: [], standaloneItems: [] },
    [data]
  );
  const resolvedEstrutura = useMemo(() => {
    const resolveName = (item: EstruturaItem) => {
      if (item.instructorName) return item.instructorName;
      if (item.instructorId) {
        const name = instructorNameById.get(String(item.instructorId));
        return name ?? null;
      }
      return null;
    };
    return {
      modules: estrutura.modules.map((mod) => ({
        ...mod,
        items: mod.items.map((item) => ({
          ...item,
          instructorName: resolveName(item),
        })),
      })),
      standaloneItems: estrutura.standaloneItems.map((item) => ({
        ...item,
        instructorName: resolveName(item),
      })),
    };
  }, [estrutura, instructorNameById]);

  const totalModules = resolvedEstrutura.modules.length;
  const totalItems =
    resolvedEstrutura.modules.reduce((acc, mod) => acc + mod.items.length, 0) +
    resolvedEstrutura.standaloneItems.length;

  const shouldShowSkeleton = isLoading || (isFetching && !hasInitialStructure);

  if (shouldShowSkeleton) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-7 w-32 rounded-full" />
            </div>
          </div>
        </div>

        {Array.from({ length: 2 }, (_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 bg-slate-50/60 shadow-sm"
          >
            <div className="px-4 py-3 border-b border-slate-200/80 bg-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
            <div className="p-3 space-y-2">
              {Array.from({ length: 3 }, (_, itemIdx) => (
                <div
                  key={itemIdx}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 px-3 py-2"
                >
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error instanceof Error
            ? error.message
            : "Erro ao carregar estrutura da turma."}
        </AlertDescription>
      </Alert>
    );
  }

  const hasStructure =
    resolvedEstrutura.modules.length > 0 ||
    resolvedEstrutura.standaloneItems.length > 0;

  return (
    <div className="space-y-4">
      <div className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h5 className="mb-0!">Estrutura da turma</h5>
            <p className="text-xs! text-slate-500!">
              Módulos, aulas e avaliações configuradas no builder.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {estruturaTipo && (
              <Badge variant="default">
                Estrutura {ESTRUTURA_LABELS[estruturaTipo]}
              </Badge>
            )}
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1">
                <Icon name="Boxes" className="h-3.5 w-3.5 text-indigo-600" />
                {totalModules} módulo{totalModules !== 1 ? "s" : ""}
              </span>
              <span className="h-3 w-px bg-slate-200" />
              <span className="inline-flex items-center gap-1">
                <Icon name="Layers" className="h-3.5 w-3.5 text-blue-600" />
                {totalItems} {totalItems === 1 ? "item" : "itens"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {hasStructure ? (
        <div className="space-y-3">
          {resolvedEstrutura.modules.map((mod, index) => (
            <div
              key={mod.id}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/60 shadow-sm"
            >
              <div className="px-4 py-3 border-b border-slate-200/80 bg-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                      <Icon name="Boxes" className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium text-slate-500">
                        Módulo {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {mod.title}
                      </span>
                    </div>
                  </div>
                  {mod.items.length > 0 && (
                    <Badge variant="outline" className="text-[11px]">
                      {mod.items.length}{" "}
                      {mod.items.length === 1 ? "item" : "itens"}
                    </Badge>
                  )}
                </div>
              </div>
              {mod.items.length > 0 ? (
                <div className="p-3 space-y-2">
                  {mod.items.map((item) => {
                    const itemStyle = getItemStyle(item.type);
                    const dateRange = formatDateRange(
                      item.startDate,
                      item.endDate,
                    );
                    const detailHref = item.id
                      ? item.type === "AULA"
                        ? `/dashboard/cursos/aulas/${item.id}`
                        : `/dashboard/cursos/atividades-provas/${item.id}`
                      : null;
                    const attachmentsLabel =
                      item.attachmentsCount && item.attachmentsCount > 0
                        ? `${item.attachmentsCount} anexo${
                            item.attachmentsCount > 1 ? "s" : ""
                          }`
                        : null;
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex flex-col gap-2 rounded-xl border px-3 py-2 sm:flex-row sm:items-center",
                          itemStyle.border,
                          itemStyle.bg,
                          itemStyle.hoverBg,
                        )}
                      >
                        <div className="flex flex-1 items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-lg",
                              itemStyle.iconBg,
                            )}
                          >
                            <Icon
                              name={getIconForType(item.type) as any}
                              className={cn("h-4 w-4", itemStyle.iconColor)}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-900 truncate">
                                {item.title}
                              </span>
                              <span
                                className={cn(
                                  "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                  getItemBadgeClass(item.type),
                                )}
                              >
                                {TYPE_META[item.type]?.label ?? item.type}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <Icon name="User" className="h-3 w-3" />
                                {item.instructorId && isInstrutoresLoading ? (
                                  <Skeleton className="h-3 w-28 inline-block" />
                                ) : (
                                  item.instructorName || "Instrutor não definido"
                                )}
                              </span>
                              {attachmentsLabel && (
                                <span className="inline-flex items-center gap-1">
                                  <Icon name="Paperclip" className="h-3 w-3" />
                                  {attachmentsLabel}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="ml-auto flex items-center gap-3">
                          <span className="text-[11px] text-slate-500">
                            {dateRange ?? "—"}
                          </span>
                          {detailHref && (
                            <ButtonCustom
                              asChild
                              variant="primary"
                              size="sm"
                              className="whitespace-nowrap"
                            >
                              <Link
                                href={detailHref}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Ver detalhes
                              </Link>
                            </ButtonCustom>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-slate-500">
                  Nenhum item neste módulo
                </div>
              )}
            </div>
          ))}

          {resolvedEstrutura.standaloneItems.length > 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
              <div className="px-4 py-3 border-b border-slate-200 bg-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                      <Icon
                        name="LayoutList"
                        className="h-4 w-4 text-slate-600"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium text-slate-500 mb-0!">
                        Itens fora de módulos
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        Itens avulsos
                      </span>
                    </div>
                  </div>
                  <Badge variant="default" className="text-[11px]">
                    {resolvedEstrutura.standaloneItems.length}{" "}
                    {resolvedEstrutura.standaloneItems.length === 1
                      ? "item"
                      : "itens"}
                  </Badge>
                </div>
              </div>
              <div className="p-3 space-y-2">
                {resolvedEstrutura.standaloneItems.map((item) => {
                  const itemStyle = getItemStyle(item.type);
                  const dateRange = formatDateRange(
                    item.startDate,
                    item.endDate,
                  );
                  const detailHref = item.id
                    ? item.type === "AULA"
                      ? `/dashboard/cursos/aulas/${item.id}`
                      : `/dashboard/cursos/atividades-provas/${item.id}`
                    : null;
                  const attachmentsLabel =
                    item.attachmentsCount && item.attachmentsCount > 0
                      ? `${item.attachmentsCount} anexo${
                          item.attachmentsCount > 1 ? "s" : ""
                        }`
                      : null;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex flex-col gap-2 rounded-xl border px-3 py-2 sm:flex-row sm:items-center",
                        itemStyle.border,
                        itemStyle.bg,
                        itemStyle.hoverBg,
                      )}
                    >
                      <div className="flex flex-1 items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg",
                            itemStyle.iconBg,
                          )}
                        >
                          <Icon
                            name={getIconForType(item.type) as any}
                            className={cn("h-4 w-4", itemStyle.iconColor)}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900 truncate">
                              {item.title}
                            </span>
                            <span
                              className={cn(
                                "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                getItemBadgeClass(item.type),
                              )}
                            >
                              {TYPE_META[item.type]?.label ?? item.type}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Icon name="User" className="h-3 w-3" />
                              {item.instructorId && isInstrutoresLoading ? (
                                <Skeleton className="h-3 w-28 inline-block" />
                              ) : (
                                item.instructorName || "Instrutor não definido"
                              )}
                            </span>
                            {attachmentsLabel && (
                              <span className="inline-flex items-center gap-1">
                                <Icon name="Paperclip" className="h-3 w-3" />
                                {attachmentsLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-auto flex items-center gap-3">
                        <span className="text-[11px] text-slate-500">
                          {dateRange ?? "—"}
                        </span>
                        {detailHref && (
                          <ButtonCustom
                            asChild
                            variant="primary"
                            size="sm"
                            className="whitespace-nowrap"
                          >
                            <Link
                              href={detailHref}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ver detalhes
                            </Link>
                          </ButtonCustom>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8",
            "flex items-center justify-center",
          )}
        >
          <EmptyState
            illustration="books"
            illustrationAlt="Estrutura da turma vazia"
            title="Nenhuma estrutura definida"
            description="Esta turma ainda não possui itens organizados em módulos."
            maxContentWidth="sm"
          />
        </div>
      )}
    </div>
  );
}
