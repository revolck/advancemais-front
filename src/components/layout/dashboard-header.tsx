"use client";

import { useBreadcrumb } from "@/config/breadcrumb";
import { DashboardBreadcrumb } from "./dashboard-breadcrumb";
import { DashboardDateTime } from "./dashboard-datetime";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useParams } from "next/navigation";
import { useUserName } from "@/hooks/useUserName";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { buscarEstruturaCursoCandidato } from "@/api/candidatos";
import { getMockAlunoCursos } from "@/mockData/aluno-candidato";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardHeaderProps {
  title?: string;
  className?: string;
  children?: React.ReactNode;
  showBreadcrumb?: boolean; // permite ocultar o breadcrumb
}

export function DashboardHeader({
  title: customTitle,
  className,
  children,
  showBreadcrumb = true,
}: DashboardHeaderProps) {
  const { title, items } = useBreadcrumb();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const { userName, userGender } = useUserName();
  const displayTitle = customTitle || title;

  // Não mostrar breadcrumb se houver apenas 1 item (página raiz)
  const shouldShowBreadcrumb = showBreadcrumb && items.length > 1;

  // Verifica se está na página principal do dashboard
  const isDashboardPage =
    pathname === "/" ||
    pathname === "/dashboard" ||
    (title === "Dashboard" && items.length === 1);

  // Verifica se está na página de estrutura do curso
  const isEstruturaCursoPage = pathname?.match(
    /^\/dashboard\/cursos\/alunos\/cursos\/[^/]+\/[^/]+$/,
  );
  const estruturaCursoMatch = pathname?.match(
    /^\/dashboard\/cursos\/alunos\/cursos\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/,
  );
  const estruturaCursoId = estruturaCursoMatch?.[1] ?? null;
  const estruturaTurmaId = estruturaCursoMatch?.[2] ?? null;
  const estruturaItemId = estruturaCursoMatch?.[3] ?? null;

  const { data: estruturaCursoData, isLoading: isEstruturaCursoLoading } =
    useQuery({
      queryKey: ["turma-estrutura", estruturaCursoId, estruturaTurmaId],
      queryFn: async () => {
        if (!estruturaCursoId || !estruturaTurmaId) return null;
        const response = await buscarEstruturaCursoCandidato(
          estruturaCursoId,
          estruturaTurmaId,
        );
        return response.success ? response.data : null;
      },
      enabled: Boolean(estruturaCursoId && estruturaTurmaId),
      staleTime: 30 * 1000,
      retry: false,
    });

  // Verifica se está na página de aula individual
  const isAulaPage = pathname?.match(
    /^\/dashboard\/cursos\/alunos\/cursos\/[^/]+\/[^/]+\/[^/]+$/,
  );

  const isMarketingPopupEditorPage = pathname?.match(
    /^\/dashboard\/marketing\/popup\/(criar|editor|[^/]+\/editar)$/,
  );

  const isMarketingEmailEditorPage = pathname?.match(
    /^\/dashboard\/marketing\/emails\/(criar|editor|[^/]+\/editar)$/,
  );

  // Buscar tipo de turma para exibir badge de modalidade
  const turmaTipo = useMemo(() => {
    if (estruturaCursoData?.turma?.metodo) {
      return estruturaCursoData.turma.metodo === "LIVE"
        ? "AO_VIVO"
        : estruturaCursoData.turma.metodo;
    }

    if (isEstruturaCursoLoading) return null;
    if (!isEstruturaCursoPage || !params) return null;
    const cursoId = params.cursoId as string;
    const turmaId = params.turmaId as string;
    if (!cursoId || !turmaId) return null;
    const cursos = getMockAlunoCursos();
    const curso = cursos.find(
      (c) => c.cursoId === cursoId && c.turmaId === turmaId,
    );
    return curso?.turmaTipo || null;
  }, [
    estruturaCursoData?.turma?.metodo,
    isEstruturaCursoLoading,
    isEstruturaCursoPage,
    params,
  ]);

  const cursoTitle = useMemo(() => {
    if (estruturaCursoData?.curso?.nome) return estruturaCursoData.curso.nome;
    if (isEstruturaCursoLoading) return null;
    if (!estruturaCursoMatch || !params) return null;

    const cursoId = params.cursoId as string;
    const turmaId = params.turmaId as string;
    const cursos = getMockAlunoCursos();
    const curso = cursos.find(
      (item) => item.cursoId === cursoId && item.turmaId === turmaId,
    );

    return curso?.cursoNome || null;
  }, [
    estruturaCursoData?.curso?.nome,
    estruturaCursoMatch,
    isEstruturaCursoLoading,
    params,
  ]);

  const itemMeta = useMemo(() => {
    if (!estruturaItemId || !estruturaCursoData?.estrutura) return null;

    const modules = Array.isArray(estruturaCursoData.estrutura.modules)
      ? estruturaCursoData.estrutura.modules
      : [];
    const standaloneItems = Array.isArray(
      estruturaCursoData.estrutura.standaloneItems,
    )
      ? estruturaCursoData.estrutura.standaloneItems
      : [];
    const allItems = [
      ...modules.flatMap((module) => module.items || []),
      ...standaloneItems,
    ];
    const item = allItems.find(
      (estruturaItem) =>
        estruturaItem.id === estruturaItemId ||
        estruturaItem.aulaId === estruturaItemId ||
        estruturaItem.platformActivityId === estruturaItemId,
    );

    if (!item) return null;

    return {
      title: item.title,
      type: item.type,
    };
  }, [estruturaCursoData?.estrutura, estruturaItemId]);
  const itemTitle = itemMeta?.title || null;
  const headerBadge = useMemo(() => {
    if (isAulaPage && itemMeta?.type) {
      switch (itemMeta.type) {
        case "AULA":
          return {
            label: "Aula",
            className: "bg-blue-100 text-blue-700 border border-blue-200",
          };
        case "PROVA":
          return {
            label: "Prova",
            className: "bg-rose-100 text-rose-700 border border-rose-200",
          };
        case "ATIVIDADE":
          return {
            label: "Atividade",
            className: "bg-amber-100 text-amber-700 border border-amber-200",
          };
        default:
          return null;
      }
    }

    if (!isEstruturaCursoPage || !turmaTipo) return null;

    return {
      label: turmaTipo.replace("_", " "),
      className:
        turmaTipo === "ONLINE"
          ? "bg-blue-100 text-blue-700 border border-blue-200"
          : turmaTipo === "AO_VIVO"
            ? "bg-purple-100 text-purple-700 border border-purple-200"
            : turmaTipo === "PRESENCIAL"
              ? "bg-green-100 text-green-700 border border-green-200"
              : turmaTipo === "SEMIPRESENCIAL"
                ? "bg-amber-100 text-amber-700 border border-amber-200"
                : "bg-gray-100 text-gray-700 border border-gray-200",
    };
  }, [isAulaPage, isEstruturaCursoPage, itemMeta?.type, turmaTipo]);

  // Monta o título com saudação personalizada por gênero
  const finalTitle = (() => {
    if (!isDashboardPage || !userName) {
      return displayTitle;
    }

    const greeting = userGender === "feminino" ? "bem vinda" : "bem vindo";
    return `Olá ${userName}, ${greeting}`;
  })();

  const headerTitle =
    isAulaPage && itemTitle
      ? itemTitle
      : isEstruturaCursoPage && cursoTitle
        ? cursoTitle
        : finalTitle;

  const isEstruturaHeaderLoading =
    Boolean(estruturaCursoMatch) && isEstruturaCursoLoading;

  const handleBack = () => {
    if (estruturaItemId && estruturaCursoId && estruturaTurmaId) {
      router.push(
        `/dashboard/cursos/alunos/cursos/${estruturaCursoId}/${estruturaTurmaId}`,
      );
      return;
    }

    router.back();
  };

  const breadcrumbItems = useMemo(() => {
    if ((!cursoTitle && !itemTitle) || items.length === 0) {
      return items;
    }

    if (isAulaPage) {
      return items.map((item, index) => {
        const isCourseCrumb = index === items.length - 2;
        const isCurrentCrumb = index === items.length - 1;

        if (isCourseCrumb && cursoTitle) {
          return { ...item, label: cursoTitle };
        }

        if (isCurrentCrumb && itemTitle) {
          return { ...item, label: itemTitle };
        }

        return item;
      });
    }

    if (!isEstruturaCursoPage || !cursoTitle) {
      return items;
    }

    return items.map((item, index) =>
      index === items.length - 1 ? { ...item, label: cursoTitle } : item,
    );
  }, [cursoTitle, isAulaPage, isEstruturaCursoPage, itemTitle, items]);

  return (
    <header className={cn("flex items-center justify-between pb-6", className)}>
      {/* Lado esquerdo - Título */}
      <div className="flex min-w-0 items-center gap-3">
        {(isEstruturaCursoPage ||
          isAulaPage ||
          isMarketingPopupEditorPage ||
          isMarketingEmailEditorPage) && (
          <button
            onClick={handleBack}
            className="flex items-center mt-[-15px] justify-center w-6 h-6 shrink-0 self-center"
            aria-label="Voltar para página anterior"
          >
            <ArrowLeft className="h-4 w-4 text-[var(--primary-color)] cursor-pointer hover:text-[var(--secondary-color)] transition-all duration-200 " />
          </button>
        )}
        <div className="flex min-w-0 items-center gap-3">
          {isEstruturaHeaderLoading ? (
            <Skeleton className="mt-[-12px] h-8 w-[min(52vw,420px)] rounded-md" />
          ) : (
            <h1
              className="max-w-[min(52vw,680px)] truncate !text-2xl font-semibold leading-tight tracking-tight text-gray-800"
              title={typeof headerTitle === "string" ? headerTitle : undefined}
            >
              {headerTitle}
            </h1>
          )}
          {!isEstruturaHeaderLoading && headerBadge && (
            <span
              className={cn(
                "px-2.5 py-1 rounded-md text-xs! font-semibold! capitalize shrink-0 mt-[-12px]",
                headerBadge.className,
              )}
            >
              {headerBadge.label}
            </span>
          )}
        </div>
      </div>

      {/* Lado direito - Data/Hora, Breadcrumb e conteúdo customizável */}
      <div className="flex items-center gap-6">
        {/* Data e Hora - apenas na página inicial do dashboard */}
        {isDashboardPage && <DashboardDateTime />}

        {/* Separador e Breadcrumb */}
        {shouldShowBreadcrumb && (
          <>
            {/* Separador antes do breadcrumb se houver data/hora antes */}
            {isDashboardPage && <div className="h-6 w-px bg-gray-300" />}
            <DashboardBreadcrumb
              items={breadcrumbItems}
              isLastItemLoading={isEstruturaHeaderLoading}
            />
          </>
        )}

        {/* Separador e Conteúdo customizável */}
        {children && (
          <>
            {/* Separador antes de children se houver data/hora ou breadcrumb antes */}
            {(isDashboardPage || shouldShowBreadcrumb) && (
              <div className="h-6 w-px bg-gray-300" />
            )}
            <div className="flex items-center gap-4">{children}</div>
          </>
        )}
      </div>
    </header>
  );
}
