import type React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { CourseData } from "@/theme/website/components/course/types";
import { ButtonCustom } from "@/components/ui/custom/button";
import {
  Clock,
  Award,
  ArrowLeft,
  BookOpen,
  Users,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Gift,
  Percent,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ShareJobButton } from "@/theme/website/components/career-opportunities/components/ShareJobButton";
import { env } from "@/lib/env";
import Image from "next/image";

type CursoApiResponse =
  | (Record<string, any> & { id: string; statusPadrao?: string })
  | null;

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
  origin: string,
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

  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const looksLikeUuid = uuidRegex.test(id);
  let curso: CursoApiResponse = null;

  if (looksLikeUuid) {
    curso = await doFetch(
      `/api/v1/cursos/publico/cursos/${encodeURIComponent(id)}`,
    );
  }

  if (!curso) {
    curso = await doFetch(`/api/v1/cursos/cursos/${encodeURIComponent(id)}`);
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
      course.descricao?.slice(0, 155) ?? `Detalhes do curso ${course.nome}`,
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

  const infoCards = [
    { label: "Categoria", value: course.categoria, icon: BookOpen },
    { label: "Carga horária", value: `${course.cargaHoraria}h`, icon: Clock },
    {
      label: "Turmas disponíveis",
      value: course.totalTurmas
        ? `${course.totalTurmas} turma${course.totalTurmas > 1 ? "s" : ""}`
        : null,
      icon: Users,
    },
    {
      label: "Tipo de curso",
      value: course.gratuito ? "Gratuito" : "Pago",
      icon: course.gratuito ? Gift : DollarSign,
      badge: course.gratuito ? (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200"
        >
          <Gift className="h-3 w-3 mr-1" />
          Gratuito
        </Badge>
      ) : null,
    },
    {
      label: "Valor",
      value:
        !course.gratuito && course.valor > 0
          ? formatCurrency(course.valor)
          : null,
      icon: DollarSign,
      badge:
        course.valorPromocional && course.valorPromocional < course.valor ? (
          <div className="flex flex-col gap-1">
            <span className="text-xs line-through text-gray-400">
              {formatCurrency(course.valor)}
            </span>
            <span className="text-sm font-semibold text-emerald-600">
              {formatCurrency(course.valorPromocional)}
            </span>
          </div>
        ) : null,
    },
    {
      label: "Desconto",
      value: desconto ? `${desconto.toFixed(0)}% OFF` : null,
      icon: Percent,
      badge: desconto ? (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          {desconto.toFixed(0)}% OFF
        </Badge>
      ) : null,
    },
    {
      label: "Estágio obrigatório",
      value: course.estagioObrigatorio ? "Sim" : null,
      icon: Award,
    },
    {
      label: "Publicado em",
      value: course.criadoEm
        ? new Date(course.criadoEm).toLocaleDateString("pt-BR")
        : null,
      icon: CalendarDays,
    },
  ]
    .filter((item) => Boolean(item.value))
    .map((item) => ({
      ...item,
      value: item.value as string,
    })) as {
    label: string;
    value: string;
    icon: React.ElementType;
  }[];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-5">
        <header className="space-y-6 border-b border-gray-100 pb-8">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <Link
              href="/cursos"
              className="inline-flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" /> Todos os cursos
            </Link>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {course.imagemUrl && (
                  <div className="w-14 h-14 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {course.imagemUrl.includes("via.placeholder.com") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.imagemUrl}
                        alt={course.nome}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Image
                        src={course.imagemUrl}
                        alt={course.nome}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                )}
                <div>
                  <p className="!text-xs !font-semibold !uppercase !text-gray-400 !mb-0">
                    {course.categoria}
                  </p>
                  <h3 className="!mb-0">{course.nome}</h3>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <ShareJobButton
                  url={`${origin}/cursos/${course.id}`}
                  title={course.nome}
                  description={course.descricao}
                />
                <ButtonCustom
                  asChild
                  variant="default"
                  className="rounded-full text-sm"
                >
                  <a
                    href={`/dashboard/cursos/${course.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Inscrever-se
                  </a>
                </ButtonCustom>
              </div>
            </div>
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[minmax(0,7fr)_3fr] lg:gap-10 space-y-10 lg:space-y-0">
          <main className="space-y-8">
            <section className="space-y-3">
              <h6 className="uppercase text-gray-500">Sobre o curso</h6>
              <p className="!text-gray-700 !leading-relaxed !whitespace-pre-line">
                {course.descricao ||
                  "Informações detalhadas sobre o curso em breve."}
              </p>
            </section>

            {course.estagioObrigatorio && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <h6 className="uppercase text-gray-500">
                    Estágio obrigatório
                  </h6>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-700 bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <Award className="mt-0.5 h-5 w-5 text-purple-600" />
                  <span className="leading-relaxed">
                    Este curso inclui estágio obrigatório como parte da
                    formação.
                  </span>
                </div>
              </section>
            )}
          </main>

          <aside className="lg:pl-4">
            <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                Informações
              </h4>
              <dl className="space-y-4 text-sm text-gray-700">
                {infoCards.map(({ label, value, icon: Icon, badge }: any) => (
                  <div
                    key={`aside-${label}`}
                    className="flex items-start gap-3"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col">
                      <dt className="text-xs font-medium uppercase text-gray-600">
                        {label}
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {badge || value || "—"}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
