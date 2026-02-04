"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/custom/Icons";
import { EmptyState } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import { listModulos, listProvas, type CreateTurmaEstruturaPayload, type TurmaEstruturaTipo } from "@/api/cursos";
import { listAulas, type Aula } from "@/api/aulas";

type EstruturaItemType = "AULA" | "PROVA" | "ATIVIDADE";

interface EstruturaItem {
  id: string;
  title: string;
  type: EstruturaItemType;
  startDate?: string | null;
  endDate?: string | null;
  order?: number | null;
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
  cursoId: number;
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

const buildFromPayload = (
  payload?: CreateTurmaEstruturaPayload | null
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

  const modules: EstruturaModule[] = modulesRaw.map((mod: any, index: number) => {
    const itemsRaw = Array.isArray(mod.items)
      ? mod.items
      : Array.isArray(mod.itens)
      ? mod.itens
      : [];
    const items = itemsRaw.map((item: any, itemIndex: number) => ({
      id: String(item.id ?? `${mod.id ?? index}-item-${itemIndex}`),
      title: String(item.title ?? item.titulo ?? item.nome ?? "Item"),
      type: normalizeType(item.type ?? item.tipo),
      startDate: item.startDate ?? item.dataInicio ?? item.inicioPrevisto ?? null,
      endDate: item.endDate ?? item.dataFim ?? item.fimPrevisto ?? null,
      order: parseOrder(item.ordem ?? item.order ?? item.posicao),
    }));

    return {
      id: String(mod.id ?? `mod-${index + 1}`),
      title: String(mod.title ?? mod.nome ?? `Módulo ${index + 1}`),
      order: parseOrder(mod.ordem ?? mod.order ?? mod.posicao),
      items: items.sort(sortByOrderAndTitle),
    };
  });

  const standaloneItems: EstruturaItem[] = standaloneRaw.map(
    (item: any, index: number) => ({
      id: String(item.id ?? `standalone-${index + 1}`),
      title: String(item.title ?? item.titulo ?? item.nome ?? "Item"),
      type: normalizeType(item.type ?? item.tipo),
      startDate: item.startDate ?? item.dataInicio ?? item.inicioPrevisto ?? null,
      endDate: item.endDate ?? item.dataFim ?? item.fimPrevisto ?? null,
      order: parseOrder(item.ordem ?? item.order ?? item.posicao),
    })
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
});

const mapProvaToItem = (prova: any): EstruturaItem => ({
  id: String(prova.id ?? `prova-${Math.random().toString(36).slice(2, 7)}`),
  title: String(prova.titulo ?? prova.nome ?? "Prova"),
  type: normalizeType(prova.tipo ?? prova.type),
  startDate: prova.dataInicio ?? prova.data ?? prova.inicioPrevisto ?? null,
  endDate: prova.dataFim ?? prova.fimPrevisto ?? null,
  order: parseOrder(prova.ordem),
});

async function fetchEstrutura(
  cursoId: number,
  turmaId: string
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
      { data: [], pagination: { totalPages: 1 } } as any
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

export function EstruturaTab({
  cursoId,
  turmaId,
  initialEstrutura,
  estruturaTipo,
}: EstruturaTabProps) {
  const initialData = useMemo(
    () => buildFromPayload(initialEstrutura),
    [initialEstrutura]
  );

  const {
    data,
    isLoading,
    error,
  } = useQuery<EstruturaData>({
    queryKey: ["admin-turma-estrutura", String(cursoId), turmaId],
    queryFn: () => fetchEstrutura(cursoId, turmaId),
    enabled: Boolean(cursoId && turmaId),
    initialData: initialData ?? undefined,
    staleTime: 5 * 60 * 1000,
  });

  const estrutura = data ?? { modules: [], standaloneItems: [] };
  const totalModules = estrutura.modules.length;
  const totalItems =
    estrutura.modules.reduce((acc, mod) => acc + mod.items.length, 0) +
    estrutura.standaloneItems.length;

  if (isLoading && !initialData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-28" />
        </div>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="rounded border border-gray-200 bg-gray-50">
            <div className="px-3 py-2 border-b border-gray-200 bg-white">
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
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
    estrutura.modules.length > 0 || estrutura.standaloneItems.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Estrutura da turma
          </h3>
          <p className="text-xs text-gray-500">
            Módulos, aulas e avaliações configuradas no builder.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {estruturaTipo && (
            <Badge variant="outline">
              Estrutura {ESTRUTURA_LABELS[estruturaTipo]}
            </Badge>
          )}
          {totalItems > 0 && (
            <span className="text-xs text-gray-500">
              {totalModules} módulo{totalModules !== 1 ? "s" : ""} ·{" "}
              {totalItems} {totalItems === 1 ? "item" : "itens"}
            </span>
          )}
        </div>
      </div>

      {hasStructure ? (
        <div className="space-y-3">
          {estrutura.modules.map((mod, index) => (
            <div
              key={mod.id}
              className="rounded border border-gray-200 bg-gray-50"
            >
              <div className="px-3 py-2 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">
                      Módulo {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {mod.title}
                    </span>
                  </div>
                  {mod.items.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {mod.items.length}{" "}
                      {mod.items.length === 1 ? "item" : "itens"}
                    </span>
                  )}
                </div>
              </div>
              {mod.items.length > 0 ? (
                <div className="p-2 space-y-1">
                  {mod.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 px-2 py-1.5 text-sm"
                    >
                      <Icon
                        name={
                          item.type === "AULA"
                            ? "GraduationCap"
                            : item.type === "ATIVIDADE"
                            ? "Paperclip"
                            : "FileText"
                        }
                        className="h-3.5 w-3.5 text-gray-400"
                      />
                      <span className="text-gray-700">{item.title}</span>
                      <span className="text-xs text-gray-500">
                        (
                        {item.type === "AULA"
                          ? "aula"
                          : item.type === "ATIVIDADE"
                          ? "atividade"
                          : "prova"}
                        )
                      </span>
                      {formatDateRange(item.startDate, item.endDate) && (
                        <span className="ml-auto text-xs text-gray-400">
                          {formatDateRange(item.startDate, item.endDate)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-gray-500">
                  Nenhum item neste módulo
                </div>
              )}
            </div>
          ))}

          {estrutura.standaloneItems.length > 0 && (
            <div className="rounded border border-dashed border-gray-300 bg-gray-50">
              <div className="px-3 py-2 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    Itens fora de módulos
                  </span>
                  <span className="text-xs text-gray-500">
                    {estrutura.standaloneItems.length}{" "}
                    {estrutura.standaloneItems.length === 1 ? "item" : "itens"}
                  </span>
                </div>
              </div>
              <div className="p-2 space-y-1">
                {estrutura.standaloneItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm"
                  >
                    <Icon
                      name={
                        item.type === "AULA"
                          ? "GraduationCap"
                          : item.type === "ATIVIDADE"
                          ? "Paperclip"
                          : "FileText"
                      }
                      className="h-3.5 w-3.5 text-gray-400"
                    />
                    <span className="text-gray-700">{item.title}</span>
                    <span className="text-xs text-gray-500">
                      (
                      {item.type === "AULA"
                        ? "aula"
                        : item.type === "ATIVIDADE"
                        ? "atividade"
                        : "prova"}
                      )
                    </span>
                    {formatDateRange(item.startDate, item.endDate) && (
                      <span className="ml-auto text-xs text-gray-400">
                        {formatDateRange(item.startDate, item.endDate)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "rounded border border-dashed border-gray-300 bg-gray-50 p-8",
            "flex items-center justify-center"
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
