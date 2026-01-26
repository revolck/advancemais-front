"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BookOpen,
  Calendar,
  Clock,
  Monitor,
  Radio,
  Users,
  Video,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { listarCursosCandidato } from "@/api/candidatos";
import type {
  CandidatoCursoItem,
  CandidatoCursosModalidadeFilter,
  CandidatoCursosProximaAula,
  CandidatoCursosResponse,
} from "@/api/candidatos/types";
import { EmptyState } from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const PAGE_LIMIT = 8;

type ModalidadeFilter = CandidatoCursosModalidadeFilter;

type NormalizedModalidade =
  | "ONLINE"
  | "AO_VIVO"
  | "PRESENCIAL"
  | "SEMI_PRESENCIAL";

function normalizeModalidade(
  value: string | null | undefined,
): NormalizedModalidade {
  const v = String(value || "")
    .trim()
    .toUpperCase();
  if (v === "LIVE" || v === "AO_VIVO") return "AO_VIVO";
  if (v === "SEMIPRESENCIAL" || v === "SEMI_PRESENCIAL")
    return "SEMI_PRESENCIAL";
  if (v === "PRESENCIAL") return "PRESENCIAL";
  return "ONLINE";
}

function normalizeStatusRaw(value: string | null | undefined): string {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function getButtonLabel(statusRaw: string): string {
  const s = normalizeStatusRaw(statusRaw);
  if (s === "INSCRITO") return "Iniciar";
  if (s === "CONCLUIDO") return "Revisar";
  return "Continuar";
}

function getStatusBadge(
  statusRaw: string,
  statusLabel: string,
): { className: string; label: string } {
  const s = normalizeStatusRaw(statusRaw);
  if (s === "CONCLUIDO") {
    return {
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      label: statusLabel || "Concluído",
    };
  }
  if (s === "EM_ANDAMENTO") {
    return {
      className: "bg-blue-50 text-blue-700 border-blue-200",
      label: statusLabel || "Em Andamento",
    };
  }
  if (s === "INSCRITO") {
    return {
      className: "bg-gray-50 text-gray-700 border-gray-200",
      label: statusLabel || "Não iniciado",
    };
  }
  if (s === "REPROVADO") {
    return {
      className: "bg-red-50 text-red-700 border-red-200",
      label: statusLabel || "Reprovado",
    };
  }
  if (s === "TRANCADO" || s === "CANCELADO") {
    return {
      className: "bg-gray-50 text-gray-700 border-gray-200",
      label: statusLabel || "Cancelado",
    };
  }
  return {
    className: "bg-blue-50 text-blue-700 border-blue-200",
    label: statusLabel || "Em Andamento",
  };
}

function CursoCard({
  curso,
  onView,
}: {
  curso: CandidatoCursoItem;
  onView: (curso: CandidatoCursoItem) => void;
}) {
  const [imageError, setImageError] = useState(false);

  const statusBadge = useMemo(
    () => getStatusBadge(curso.statusRaw, curso.status),
    [curso.statusRaw, curso.status],
  );

  const modalidade = normalizeModalidade(curso.modalidade);

  const modalidadeLabel = useMemo(() => {
    if (modalidade === "AO_VIVO") return "Ao Vivo";
    if (modalidade === "SEMI_PRESENCIAL") return "Semi-presencial";
    if (modalidade === "PRESENCIAL") return "Presencial";
    return "Online";
  }, [modalidade]);

  const ModalidadeIcon = useMemo(() => {
    if (modalidade === "AO_VIVO") return Radio;
    if (modalidade === "SEMI_PRESENCIAL") return Video;
    if (modalidade === "PRESENCIAL") return Users;
    return Monitor;
  }, [modalidade]);

  return (
    <Card
      className="group border border-gray-200 bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:border-[var(--primary-color)]/40 h-full flex flex-col cursor-pointer p-0 py-0 shadow-none"
      onClick={() => onView(curso)}
    >
      <CardContent className="p-0 h-full flex flex-col">
        <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {!imageError && curso.foto ? (
            <Image
              src={curso.foto}
              alt={curso.nome}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              unoptimized={curso.foto.startsWith("http")}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-gray-300" />
            </div>
          )}

          {Number.isFinite(curso.quantidadeAulas) && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-900/75 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white">
                <BookOpen className="h-3 w-3" />
                {curso.quantidadeAulas}
              </span>
            </div>
          )}

          <div className="absolute top-2.5 right-2.5 z-10">
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold",
                statusBadge.className,
              )}
            >
              {statusBadge.label}
            </span>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h3 className="!text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-[var(--primary-color)] transition-colors flex-1 min-w-0">
              {curso.nome}
            </h3>
            {curso.cargaHoraria ? (
              <div className="flex items-center gap-1.5 shrink-0 text-gray-500">
                <Clock className="h-4 w-4 shrink-0" />
                <span className="!text-xs font-medium whitespace-nowrap">
                  {curso.cargaHoraria}h
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
            <ModalidadeIcon className="h-3.5 w-3.5 text-gray-400" />
            <span>{modalidadeLabel}</span>
            {curso.dataInicio ? (
              <>
                <span className="text-gray-300">•</span>
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span>
                  {format(new Date(curso.dataInicio), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </>
            ) : null}
          </div>

          <div className="mt-auto">
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="!text-sm text-gray-600 font-medium">
                  Progresso
                </span>
                <span className="!text-sm font-bold text-gray-900">
                  {Math.max(0, Math.min(100, curso.progresso || 0))}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden relative">
                <div
                  className="h-2 rounded-full bg-[var(--primary-color)]"
                  style={{
                    width: `${Math.max(0, Math.min(100, curso.progresso || 0))}%`,
                    animation: "progress 1.5s ease-out",
                  }}
                />
              </div>
            </div>

            <div className="flex items-start gap-4 pt-5 border-t border-gray-100">
              <div className="w-20 h-20 rounded-full border border-gray-200 bg-gray-50 flex flex-col items-center justify-center shrink-0">
                <span className="!text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Nota
                </span>
                <span className="!text-2xl font-bold leading-none text-gray-900">
                  {typeof curso.notaMedia === "number"
                    ? curso.notaMedia.toFixed(1)
                    : "—"}
                </span>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="!text-sm font-semibold mb-1 text-gray-900">
                  Nota média
                </p>
                <p className="!text-xs text-gray-600 leading-relaxed mb-0!">
                  {typeof curso.notaMedia === "number"
                    ? "Acompanhe seu desempenho no curso."
                    : "Ainda não há notas registradas."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <ButtonCustom
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(curso);
              }}
              className="w-full rounded-lg font-medium transition-all bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 border-[var(--primary-color)]"
              withAnimation={false}
            >
              {getButtonLabel(curso.statusRaw)}
            </ButtonCustom>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProximaAulaCard({ aula }: { aula: CandidatoCursosProximaAula }) {
  const handleOpenMeet = () => {
    if (aula.urlMeet) {
      window.open(aula.urlMeet, "_blank", "noopener,noreferrer");
    }
  };

  const dataFormatada = aula.dataInicio
    ? format(new Date(aula.dataInicio), "dd 'de' MMMM", { locale: ptBR })
    : "";
  const hora = aula.dataInicio
    ? format(new Date(aula.dataInicio), "HH:mm", { locale: ptBR })
    : "";

  return (
    <Card className="group border border-gray-200 bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:border-[var(--primary-color)]/40 shadow-none">
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="!text-xs font-semibold text-gray-500 uppercase mb-1!">
              Próxima aula
            </p>
            <h3 className="!text-base font-semibold text-gray-900 mb-0! line-clamp-1">
              {aula.turma?.curso?.nome || "Curso"}
            </h3>
            <p className="!text-xs text-gray-600 mb-0! line-clamp-1">
              {aula.titulo}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            <Radio className="h-3.5 w-3.5" />
            Ao Vivo
          </span>
        </div>

        <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100/50">
          <div className="shrink-0 mt-0.5">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="!text-xs font-medium text-gray-600 mb-0!">
              Acontece em
            </p>
            <p className="!text-sm font-bold text-gray-900 mb-0!">
              {dataFormatada}
              {hora ? ` às ${hora}` : ""}
            </p>
            {aula.descricao ? (
              <p className="!text-xs text-gray-700 line-clamp-2 mb-0!">
                {aula.descricao}
              </p>
            ) : null}
          </div>
        </div>

        {aula.urlMeet ? (
          <ButtonCustom
            variant="default"
            size="sm"
            onClick={handleOpenMeet}
            className="w-full rounded-lg font-medium transition-all bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 border-[var(--primary-color)]"
            withAnimation={false}
          >
            <Video className="h-4 w-4 mr-2" />
            Entrar na sala do Meet
          </ButtonCustom>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AlunoCursosView() {
  const router = useRouter();
  const [modalidade, setModalidade] = useState<ModalidadeFilter>("TODOS");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [modalidade]);

  const cursosQuery = useQuery<CandidatoCursosResponse>({
    queryKey: ["aluno-candidato", "cursos", { modalidade, page }],
    queryFn: () =>
      listarCursosCandidato(
        { modalidade, page, limit: PAGE_LIMIT },
        { cache: "no-store" },
      ),
    staleTime: 30 * 1000,
    retry: 1,
  });

  const payload = cursosQuery.data?.success ? cursosQuery.data.data : null;
  const cursos = payload?.cursos ?? [];
  const paginacao = payload?.paginacao ?? null;
  const proximaAula = payload?.proximaAula ?? null;

  const handleView = (curso: CandidatoCursoItem) => {
    router.push(
      `/dashboard/cursos/alunos/cursos/${curso.cursoId}/${curso.turmaId}`,
    );
  };

  if (cursosQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-9 w-28 rounded-md" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (cursosQuery.isError || !payload) {
    return (
      <EmptyState
        title="Não foi possível carregar seus cursos"
        description="Tente novamente em instantes."
        illustration="books"
      />
    );
  }

  if (cursos.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
          <ButtonCustom
            onClick={() => setModalidade("TODOS")}
            variant={modalidade === "TODOS" ? "default" : "outline"}
            size="sm"
            withAnimation={false}
            className={cn(
              modalidade === "TODOS"
                ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
                : "",
            )}
          >
            Todos
          </ButtonCustom>
          <ButtonCustom
            onClick={() => setModalidade("ONLINE")}
            variant={modalidade === "ONLINE" ? "default" : "outline"}
            size="sm"
            withAnimation={false}
            className={cn(
              modalidade === "ONLINE"
                ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
                : "",
            )}
          >
            Online
          </ButtonCustom>
          <ButtonCustom
            onClick={() => setModalidade("AO_VIVO")}
            variant={modalidade === "AO_VIVO" ? "default" : "outline"}
            size="sm"
            withAnimation={false}
            className={cn(
              modalidade === "AO_VIVO"
                ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
                : "",
            )}
          >
            Ao Vivo
          </ButtonCustom>
          <ButtonCustom
            onClick={() => setModalidade("PRESENCIAL")}
            variant={modalidade === "PRESENCIAL" ? "default" : "outline"}
            size="sm"
            withAnimation={false}
            className={cn(
              modalidade === "PRESENCIAL"
                ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
                : "",
            )}
          >
            Presencial
          </ButtonCustom>
          <ButtonCustom
            onClick={() => setModalidade("SEMI_PRESENCIAL")}
            variant={modalidade === "SEMI_PRESENCIAL" ? "default" : "outline"}
            size="sm"
            withAnimation={false}
            className={cn(
              modalidade === "SEMI_PRESENCIAL"
                ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
                : "",
            )}
          >
            Semi-presencial
          </ButtonCustom>
        </div>

        <EmptyState
          title="Nenhum curso encontrado"
          description="Não há cursos disponíveis para o filtro selecionado."
          illustration="books"
        />
      </div>
    );
  }

  const showProximaAula =
    Boolean(proximaAula?.id) &&
    normalizeModalidade(proximaAula?.modalidade) === "AO_VIVO" &&
    Boolean(proximaAula?.urlMeet);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        <ButtonCustom
          onClick={() => setModalidade("TODOS")}
          variant={modalidade === "TODOS" ? "default" : "outline"}
          size="sm"
          withAnimation={false}
          className={cn(
            modalidade === "TODOS"
              ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
              : "",
          )}
        >
          Todos
        </ButtonCustom>
        <ButtonCustom
          onClick={() => setModalidade("ONLINE")}
          variant={modalidade === "ONLINE" ? "default" : "outline"}
          size="sm"
          withAnimation={false}
          className={cn(
            modalidade === "ONLINE"
              ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
              : "",
          )}
        >
          Online
        </ButtonCustom>
        <ButtonCustom
          onClick={() => setModalidade("AO_VIVO")}
          variant={modalidade === "AO_VIVO" ? "default" : "outline"}
          size="sm"
          withAnimation={false}
          className={cn(
            modalidade === "AO_VIVO"
              ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
              : "",
          )}
        >
          Ao Vivo
        </ButtonCustom>
        <ButtonCustom
          onClick={() => setModalidade("PRESENCIAL")}
          variant={modalidade === "PRESENCIAL" ? "default" : "outline"}
          size="sm"
          withAnimation={false}
          className={cn(
            modalidade === "PRESENCIAL"
              ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
              : "",
          )}
        >
          Presencial
        </ButtonCustom>
        <ButtonCustom
          onClick={() => setModalidade("SEMI_PRESENCIAL")}
          variant={modalidade === "SEMI_PRESENCIAL" ? "default" : "outline"}
          size="sm"
          withAnimation={false}
          className={cn(
            modalidade === "SEMI_PRESENCIAL"
              ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
              : "",
          )}
        >
          Semi-presencial
        </ButtonCustom>
      </div>

      {showProximaAula && proximaAula ? (
        <div className="space-y-4">
          <h2 className="!text-lg font-bold text-gray-900">
            Próximas aulas ao vivo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ProximaAulaCard aula={proximaAula} />
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <h2 className="!text-lg font-bold text-gray-900">Todos os cursos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cursos.map((curso) => (
            <CursoCard key={curso.id} curso={curso} onView={handleView} />
          ))}
        </div>
      </div>

      {paginacao && paginacao.totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <div className="text-sm text-gray-600">
            Página {paginacao.page} de {paginacao.totalPages} •{" "}
            {paginacao.total} cursos
          </div>
          <div className="flex items-center gap-2">
            <ButtonCustom
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!paginacao.hasPrev}
              withAnimation={false}
            >
              Anterior
            </ButtonCustom>
            <ButtonCustom
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(paginacao.totalPages, p + 1))
              }
              disabled={!paginacao.hasNext}
              withAnimation={false}
            >
              Próxima
            </ButtonCustom>
          </div>
        </div>
      ) : null}
    </div>
  );
}
