import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type {
  CourseData,
  CourseTurmaPublica,
} from "@/theme/website/components/course/types";
import { ButtonCustom } from "@/components/ui/custom/button";
import {
  Clock,
  Award,
  ArrowLeft,
  BookOpen,
  Users,
  CalendarDays,
  DollarSign,
  Gift,
  Percent,
  CheckCircle2,
  CreditCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ShareJobButton } from "@/theme/website/components/career-opportunities/components/ShareJobButton";
import { env } from "@/lib/env";
import { stripHtmlTags } from "@/lib/utils";
import Image from "next/image";
import { CourseTurmasPurchaseSection } from "@/theme/website/components/course/components/CourseTurmasPurchaseSection";
import { HtmlContent } from "@/components/ui/custom/html-content";

type CursoApiResponse =
  | (Record<string, any> & { id: string; statusPadrao?: string })
  | null;

function normalizeTurmasPublicadas(curso: any): CourseTurmaPublica[] {
  const rawCandidates: any[] =
    (Array.isArray(curso?.turmasPublicadas) && curso.turmasPublicadas) ||
    (Array.isArray(curso?.turmas) && curso.turmas) ||
    (Array.isArray(curso?.Turmas) && curso.Turmas) ||
    (Array.isArray(curso?.data?.turmas) && curso.data.turmas) ||
    [];

  const normalized: CourseTurmaPublica[] = [];

  rawCandidates.forEach((turma) => {
    if (!turma) return;
    const id = turma.id?.toString?.() ?? "";
    if (!id) return;

    const dataInicio =
      turma.dataInicio ||
      turma.dataInicioPrevista ||
      turma.inicioEm ||
      turma.inicio ||
      turma.dataInicioAtividades;
    const dataFim =
      turma.dataFim ||
      turma.dataFimPrevista ||
      turma.fimEm ||
      turma.fim ||
      turma.dataFimAtividades;

    const dataInscricaoInicio =
      turma.dataInscricaoInicio ||
      turma.inscricoesInicio ||
      turma.inscricaoInicio ||
      turma.inscricaoInicioEm;
    const dataInscricaoFim =
      turma.dataInscricaoFim ||
      turma.inscricoesFim ||
      turma.inscricaoFim ||
      turma.inscricaoFimEm;

    const vagas =
      turma.vagasDisponiveis ??
      turma.vagas ??
      turma.quantidadeVagas ??
      turma.limiteVagas ??
      undefined;

    const vagasTotais =
      turma.vagasTotais ??
      turma.totalVagas ??
      turma.quantidadeVagasTotais ??
      turma.limiteVagas ??
      undefined;

    const vagasDisponiveis =
      turma.vagasDisponiveis ??
      turma.disponiveis ??
      turma.vagasDisponiveisCalculadas ??
      undefined;

    const valor =
      turma.valor != null
        ? Number(turma.valor)
        : turma.preco != null
        ? Number(turma.preco)
        : undefined;
    const valorPromocional =
      turma.valorPromocional != null
        ? Number(turma.valorPromocional)
        : undefined;
    const gratuito =
      turma.gratuito != null ? Boolean(turma.gratuito) : undefined;

    normalized.push({
      id,
      nome: turma.nome || turma.titulo || turma.codigo || undefined,
      dataInicio: dataInicio ? String(dataInicio) : undefined,
      dataFim: dataFim ? String(dataFim) : undefined,
      dataInscricaoInicio: dataInscricaoInicio
        ? String(dataInscricaoInicio)
        : undefined,
      dataInscricaoFim: dataInscricaoFim ? String(dataInscricaoFim) : undefined,
      metodo: turma.metodo || turma.modalidade || turma.tipo || undefined,
      turno: turma.turno || undefined,
      status: turma.status || turma.statusPadrao || undefined,
      vagasTotais: typeof vagasTotais === "number" ? vagasTotais : undefined,
      vagasDisponiveis:
        typeof vagasDisponiveis === "number" ? vagasDisponiveis : undefined,
      vagas: typeof vagas === "number" ? vagas : undefined,
      valor,
      valorPromocional,
      gratuito,
    });
  });

  return normalized;
}

function normalizeCourse(curso: any): CourseData {
  return {
    id: curso.id?.toString() || "",
    nome: curso.nome || "Curso",
    descricao: curso.descricao || "",
    cargaHoraria: curso.cargaHoraria || 0,
    categoria: curso.categoria?.nome || curso.Categoria?.nome || "Geral",
    subcategoria: curso.subcategoria?.nome || curso.Subcategoria?.nome,
    imagemUrl: curso.imagemUrl,
    statusPadrao: curso.statusPadrao || "PUBLICADO",
    estagioObrigatorio: Boolean(curso.estagioObrigatorio),
    totalTurmas: curso.totalTurmas || curso._count?.turmas || 0,
    totalAlunos: curso.totalAlunos || 0,
    criadoEm: curso.criadoEm || new Date().toISOString(),
    // Campos de precificação
    valor: Number(curso.valor ?? 0),
    valorPromocional:
      curso.valorPromocional != null
        ? Number(curso.valorPromocional)
        : undefined,
    gratuito: Boolean(curso.gratuito ?? false),
    turmasPublicadas: normalizeTurmasPublicadas(curso),
  };
}

function resolveApiUrl(path: string, origin: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base =
    (env.apiBaseUrl && env.apiBaseUrl.length > 0 ? env.apiBaseUrl : origin) ||
    origin;
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function fetchCursoById(
  id: string,
  origin: string
): Promise<CourseData | null> {
  const normalize = (data: any): any => {
    if (!data) return null;
    if (Array.isArray(data)) return data[0] ?? null;
    if (Array.isArray(data?.data)) return data.data[0] ?? null;
    if (data?.data?.data && typeof data.data.data === "object")
      return data.data.data;
    if (data?.data && typeof data.data === "object") return data.data;
    return data;
  };

  const doFetch = async (path: string): Promise<CursoApiResponse> => {
    const url = resolveApiUrl(path, origin);
    try {
      console.log("[curso-detalhe][fetch] GET", url);
      const res = await fetch(url, {
        cache: "no-store",
        next: { revalidate: 0 },
      });
      if (!res.ok) {
        console.log("[curso-detalhe][fetch] FAIL", res.status, url);
        return null;
      }
      const data = await res.json();
      console.log("[curso-detalhe][fetch] OK", url);
      return normalize(data);
    } catch {
      console.log("[curso-detalhe][fetch] ERROR", url);
      return null;
    }
  };

  let curso: CursoApiResponse = null;

  curso = await doFetch(
    `/api/v1/cursos/publico/cursos/${encodeURIComponent(id)}`
  );

  if (!curso) {
    curso = await doFetch(`/api/v1/cursos/${encodeURIComponent(id)}`);
  }

  if (!curso) return null;
  const mapped = normalizeCourse(curso);
  return mapped;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const host =
    headersList.get("x-forwarded-host") ??
    headersList.get("host") ??
    "localhost:3000";
  const origin = `${protocol}://${host}`;

  const course = await fetchCursoById(id, origin);
  if (!course) {
    return {
      title: "Curso não encontrado | Advance+",
      description: "O curso solicitado não está mais disponível.",
    };
  }

  return {
    title: `${course.nome} | Cursos | Advance+`,
    description:
      stripHtmlTags(course.descricao)?.slice(0, 155) ??
      `Detalhes do curso ${course.nome}`,
  };
}

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const host =
    headersList.get("x-forwarded-host") ??
    headersList.get("host") ??
    "localhost:3000";
  const origin = `${protocol}://${host}`;

  const course = await fetchCursoById(id, origin);
  if (!course) {
    notFound();
  }

  const descricaoText = stripHtmlTags(course.descricao)?.trim() ?? "";
  const descricaoHtml = course.descricao?.trim() ?? "";
  const isHtmlDescription = Boolean(descricaoHtml && /<[^>]+>/.test(descricaoHtml));
  const descricaoResumo =
    descricaoText.length > 220
      ? `${descricaoText.slice(0, 220).trim()}…`
      : descricaoText;

  // Formatar valor
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calcular desconto
  const calcularDesconto = (): number | null => {
    if (
      course.valorPromocional &&
      course.valor > 0 &&
      course.valorPromocional < course.valor
    ) {
      return ((course.valor - course.valorPromocional) / course.valor) * 100;
    }
    return null;
  };

  const desconto = calcularDesconto();

  const precoBase =
    course.valorPromocional != null &&
    course.valorPromocional > 0 &&
    course.valor > 0 &&
    course.valorPromocional < course.valor
      ? course.valorPromocional
      : course.valor;

  const hasPromo =
    !course.gratuito &&
    course.valorPromocional != null &&
    course.valorPromocional > 0 &&
    course.valor > 0 &&
    course.valorPromocional < course.valor;

  const hasCoursePrice =
    (course.valor != null && course.valor > 0) ||
    (course.valorPromocional != null && course.valorPromocional > 0);

  const precoLabel = course.gratuito
    ? "Gratuito"
    : hasCoursePrice
    ? formatCurrency(precoBase)
    : "Consulte a turma";

  const precoSubLabel = course.gratuito
    ? "Sem custo para matrícula"
    : !hasCoursePrice
    ? "Valor definido por turma"
    : hasPromo && desconto
    ? `De ${formatCurrency(course.valor)} • ${desconto.toFixed(0)}% OFF`
    : "Preço base do curso";

  const parseTurmaDate = (value?: string): Date | null => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const nextTurmaInfo = (() => {
    const turmas = course.turmasPublicadas ?? [];
    if (turmas.length === 0) {
      return {
        label: "Sem turmas",
        subLabel: "Aguarde novas turmas",
      };
    }

    const dates = turmas
      .map((turma) => parseTurmaDate(turma.dataInicio))
      .filter((date): date is Date => Boolean(date))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length === 0) {
      return {
        label: "A confirmar",
        subLabel: "Datas serão divulgadas",
      };
    }

    const now = new Date();
    const nextFuture = dates.find((date) => date.getTime() >= now.getTime());
    if (nextFuture) {
      return {
        label: nextFuture.toLocaleDateString("pt-BR"),
        subLabel: "Próxima data de início",
      };
    }

    return {
      label: "Novas turmas em breve",
      subLabel: "Consulte a lista abaixo",
    };
  })();

  // Backwards-compat: evita ReferenceError caso algum bundle antigo ainda
  // referencie os nomes anteriores durante hot reload.
  const nextTurmaLabel = nextTurmaInfo.label;
  const nextTurmaSubLabel = nextTurmaInfo.subLabel;

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-[var(--primary-color)]">
        {course.imagemUrl ? (
          <div className="absolute inset-0 z-0 pointer-events-none">
            {course.imagemUrl.includes("via.placeholder.com") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={course.imagemUrl}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover opacity-15 blur-[1px] scale-110"
              />
            ) : (
              <Image
                src={course.imagemUrl}
                alt=""
                aria-hidden="true"
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-15 blur-[1px] scale-110"
              />
            )}
          </div>
        ) : null}

        <div className="absolute inset-0 z-10 bg-gradient-to-br from-[var(--primary-color)]/95 via-[var(--primary-color)]/80 to-slate-950/70" />
        <div className="absolute -top-40 -right-40 z-20 h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 z-20 h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 relative z-30">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-4">
              <nav className="flex items-center gap-2 text-sm text-white/80">
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
                <span className="text-white/50">/</span>
                <Link href="/cursos" className="hover:text-white">
                  Cursos
                </Link>
                <span className="text-white/50">/</span>
                <span className="text-white/90 truncate max-w-[220px] sm:max-w-[420px]">
                  {course.nome}
                </span>
              </nav>

              <Link
                href="/cursos"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Link>
            </div>

            <div className="flex flex-col items-center text-center gap-7">
              <div className="w-full max-w-3xl space-y-6">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Badge className="bg-white/15 text-white hover:bg-white/20 border border-white/15">
                    {course.categoria}
                  </Badge>
                  {course.subcategoria ? (
                    <Badge
                      variant="outline"
                      className="bg-white/10 text-white border-white/20"
                    >
                      {course.subcategoria}
                    </Badge>
                  ) : null}
                  {course.gratuito ? (
                    <Badge className="bg-emerald-500/20 text-white border border-emerald-300/30">
                      <Gift className="h-3 w-3 mr-1" /> Gratuito
                    </Badge>
                  ) : null}
                  {desconto ? (
                    <Badge className="bg-red-500/20 text-white border border-red-300/30">
                      <Percent className="h-3 w-3 mr-1" /> {desconto.toFixed(0)}
                      % OFF
                    </Badge>
                  ) : null}
                  {course.estagioObrigatorio ? (
                    <Badge className="bg-purple-500/20 text-white border border-purple-300/30">
                      <Award className="h-3 w-3 mr-1" /> Estágio obrigatório
                    </Badge>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <h1 className="!text-3xl sm:!text-4xl !font-semibold !text-white !leading-tight !mb-0">
                    {course.nome}
                  </h1>
                  <p className="!text-white/80 !text-sm !leading-relaxed !max-w-prose !mx-auto">
                    {descricaoResumo || "Detalhes do curso em breve."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <ShareJobButton
                    url={`${origin}/cursos/${course.id}`}
                    title={course.nome}
                    description={descricaoText}
                  />
                  <ButtonCustom
                    asChild
                    variant="secondary"
                    className="!rounded-full text-sm"
                  >
                    <a href="#turmas">Ver turmas</a>
                  </ButtonCustom>
                </div>

                <div className="flex flex-wrap justify-center gap-2 text-sm mb-20">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white/90 px-3 py-1 border border-white/15">
                    <Clock className="h-4 w-4" />
                    {course.cargaHoraria}h
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white/90 px-3 py-1 border border-white/15">
                    <Users className="h-4 w-4" />
                    {course.totalTurmas} turma
                    {course.totalTurmas === 1 ? "" : "s"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white/90 px-3 py-1 border border-white/15">
                    <DollarSign className="h-4 w-4" />
                    {precoLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 pb-14 relative z-10 space-y-10">
        <section className="rounded-3xl border border-gray-200/70 bg-white p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: "Categoria",
                value: course.categoria,
                subValue: course.subcategoria || undefined,
                icon: BookOpen,
              },
              {
                label: "Carga horária",
                value: `${course.cargaHoraria}h`,
                subValue: "Carga horária total",
                icon: Clock,
              },
              {
                label: "Próxima turma",
                value: nextTurmaLabel,
                subValue: nextTurmaSubLabel,
                icon: CalendarDays,
              },
              {
                label: "Valor",
                value: precoLabel,
                subValue: precoSubLabel,
                icon: course.gratuito ? Gift : DollarSign,
              },
            ].map(({ label, value, subValue, icon: Icon }) => (
              <div
                key={`overview-${label}`}
                className="group relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white p-4 transition hover:shadow-sm hover:border-[var(--primary-color)]/25"
              >
                <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-gradient-to-br from-[var(--primary-color)]/[0.06] via-transparent to-transparent" />
                <div className="relative flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold tracking-wide uppercase text-gray-500">
                      {label}
                    </div>
                    <div className="mt-1 text-base font-semibold text-gray-900 truncate">
                      {value}
                    </div>
                    {subValue ? (
                      <div className="mt-0.5 text-xs text-gray-500 truncate">
                        {subValue}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
          <main className="space-y-8">
            <section className="rounded-3xl border border-gray-200/70 bg-white p-6 sm:p-8">
              <div className="flex flex-col gap-2">
                <h4 className="!text-lg !font-semibold !text-gray-900 !mb-0">
                  Sobre o curso
                </h4>
              </div>
              <div className="mt-3">
                {descricaoHtml ? (
                  isHtmlDescription ? (
                    <HtmlContent html={descricaoHtml} />
                  ) : (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {descricaoText}
                    </p>
                  )
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    Informações detalhadas sobre o curso em breve.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200/70 bg-white p-6 sm:p-8">
              <h4 className="mb-0!">Como funciona</h4>

              <ul className="mt-5 space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-gray-50 border border-gray-200/70 text-gray-700">
                    <Users className="h-4 w-4" />
                  </span>
                  <span>Escolha a turma com datas, vagas e valor.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-gray-50 border border-gray-200/70 text-gray-700">
                    <CreditCard className="h-4 w-4" />
                  </span>
                  <span>
                    Finalize a matrícula (gratuito) ou compre o acesso online.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-gray-50 border border-gray-200/70 text-gray-700">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <span>Acesse o curso na Academia após a confirmação.</span>
                </li>
              </ul>
            </section>

            {course.estagioObrigatorio ? (
              <section className="rounded-3xl border border-purple-200 bg-purple-50 p-6 sm:p-8">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-purple-200 text-purple-700">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="!text-lg !font-semibold !text-gray-900 !mb-0">
                      Estágio obrigatório
                    </h3>
                    <p className="!text-sm !text-gray-700 !leading-relaxed">
                      Este curso inclui estágio obrigatório como parte da
                      formação.
                    </p>
                  </div>
                </div>
              </section>
            ) : null}
          </main>

          <aside className="lg:sticky lg:top-6 h-fit space-y-4">
            <CourseTurmasPurchaseSection
              variant="sidebar"
              course={course}
              turmas={course.turmasPublicadas ?? []}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
