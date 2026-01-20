"use client";

import { useBreadcrumb } from "@/config/breadcrumb";
import { DashboardBreadcrumb } from "./dashboard-breadcrumb";
import { DashboardDateTime } from "./dashboard-datetime";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useParams } from "next/navigation";
import { useUserName } from "@/hooks/useUserName";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { getMockAlunoCursos } from "@/mockData/aluno-candidato";

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
    /^\/dashboard\/cursos\/alunos\/cursos\/[^/]+\/[^/]+$/
  );

  // Verifica se está na página de aula individual
  const isAulaPage = pathname?.match(
    /^\/dashboard\/cursos\/alunos\/cursos\/[^/]+\/[^/]+\/[^/]+$/
  );

  // Buscar tipo de turma para exibir badge de modalidade
  const turmaTipo = useMemo(() => {
    if (!isEstruturaCursoPage || !params) return null;
    const cursoId = params.cursoId as string;
    const turmaId = params.turmaId as string;
    if (!cursoId || !turmaId) return null;
    const cursos = getMockAlunoCursos();
    const curso = cursos.find(
      (c) => c.cursoId === cursoId && c.turmaId === turmaId
    );
    return curso?.turmaTipo || null;
  }, [isEstruturaCursoPage, params]);

  // Monta o título com saudação personalizada por gênero
  const finalTitle = (() => {
    if (!isDashboardPage || !userName) {
      return displayTitle;
    }

    const greeting = userGender === "feminino" ? "bem vinda" : "bem vindo";
    return `Olá ${userName}, ${greeting}`;
  })();

  return (
    <header className={cn("flex items-center justify-between pb-6", className)}>
      {/* Lado esquerdo - Título */}
      <div className="flex items-center gap-3">
        {(isEstruturaCursoPage || isAulaPage) && (
          <button
            onClick={() => router.back()}
            className="flex items-center mt-[-15px] justify-center w-6 h-6 shrink-0 self-center"
            aria-label="Voltar para página anterior"
          >
            <ArrowLeft className="h-4 w-4 text-[var(--primary-color)] cursor-pointer hover:text-[var(--secondary-color)] transition-all duration-200 " />
          </button>
        )}
        <div className="flex items-center gap-3">
          <h1 className="!text-2xl font-semibold text-gray-800 tracking-tight leading-tight">
            {finalTitle}
          </h1>
          {/* Badge de modalidade para cursos */}
          {turmaTipo && (
            <span
              className={cn(
                "px-2.5 py-1 rounded-md text-xs! font-semibold! capitalize shrink-0 mt-[-12px]",
                turmaTipo === "ONLINE"
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : turmaTipo === "AO_VIVO"
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : turmaTipo === "PRESENCIAL"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : turmaTipo === "SEMIPRESENCIAL"
                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                  : "bg-gray-100 text-gray-700 border border-gray-200"
              )}
            >
              {turmaTipo.replace("_", " ")}
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
            <DashboardBreadcrumb items={items} />
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
