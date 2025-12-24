"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  BookOpen,
  Clock,
  Tag,
  Layers,
  Briefcase,
  DollarSign,
  Gift,
  Percent,
  type LucideIcon,
} from "lucide-react";
import type { Curso } from "@/api/cursos";
import { Badge } from "@/components/ui/badge";

interface AboutTabProps {
  curso: Curso & {
    categoria?: { nome: string };
    subcategoria?: { nome: string };
    turmas?: any[];
    turmasCount?: number;
  };
  isLoading?: boolean;
}

export function AboutTab({ curso, isLoading = false }: AboutTabProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const aboutDescription = curso.descricao?.trim();
  const isPlaceholderImage =
    curso.imagemUrl?.includes("via.placeholder.com") || false;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr} às ${timeStr}`;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calcular desconto se houver valor promocional
  const calcularDesconto = (): number | null => {
    if (
      curso.valorPromocional &&
      curso.valor > 0 &&
      curso.valorPromocional < curso.valor
    ) {
      return ((curso.valor - curso.valorPromocional) / curso.valor) * 100;
    }
    return null;
  };

  const desconto = calcularDesconto();

  const aboutSidebar: Array<{
    label: string;
    value: React.ReactNode | null;
    icon: LucideIcon;
  }> = [
    {
      label: "Categoria",
      value: curso.categoria?.nome ?? curso.categoriaId ?? "—",
      icon: BookOpen,
    },
    {
      label: "Subcategoria",
      value: curso.subcategoria?.nome ?? "—",
      icon: BookOpen,
    },
    {
      label: "Tipo de curso",
      value: curso.gratuito || curso.valor === 0 ? (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200"
        >
          <Gift className="h-3 w-3 mr-1" />
          Gratuito
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          <DollarSign className="h-3 w-3 mr-1" />
          Pago
        </Badge>
      ),
      icon: curso.gratuito || curso.valor === 0 ? Gift : DollarSign,
    },
    {
      label: "Valor do curso",
      value:
        !(curso.gratuito || curso.valor === 0) && curso.valor > 0 ? (
          <div className="flex flex-col gap-1">
            {curso.valorPromocional && curso.valorPromocional < curso.valor ? (
              <>
                <span className="text-xs line-through text-gray-400">
                  {formatCurrency(curso.valor)}
                </span>
                <span className="text-sm font-semibold text-emerald-600">
                  {formatCurrency(curso.valorPromocional)}
                </span>
              </>
            ) : (
              <span className="font-semibold">
                {formatCurrency(curso.valor)}
              </span>
            )}
          </div>
        ) : null, // Não mostra se for gratuito
      icon: DollarSign,
    },
    {
      label: "Desconto",
      value: desconto ? (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          {desconto.toFixed(0)}% OFF
        </Badge>
      ) : null,
      icon: Percent,
    },
    {
      label: "Carga horária",
      value: curso.cargaHoraria ? `${curso.cargaHoraria}h` : "—",
      icon: Clock,
    },
    {
      label: "Estágio obrigatório",
      value:
        "estagioObrigatorio" in curso &&
        Boolean((curso as { estagioObrigatorio?: boolean }).estagioObrigatorio)
          ? "Sim"
          : "Não",
      icon: Briefcase,
    },
    {
      label: "Turmas cadastradas",
      value:
        curso.turmasCount ??
        (Array.isArray(curso.turmas) ? curso.turmas.length : 0),
      icon: Layers,
    },
    {
      label: "Código do curso",
      value: curso.codigo ?? "—",
      icon: Tag,
    },
    {
      label: "Criado em",
      value: formatDateTime(curso.criadoEm),
      icon: CalendarDays,
    },
    {
      label: "Última atualização",
      value: formatDateTime(curso.atualizadoEm),
      icon: CalendarDays,
    },
  ];

  // Se está carregando, mostrar skeleton
  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
        {/* Skeleton da seção principal */}
        <section className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </section>

        {/* Skeleton da sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
            <div className="space-y-4">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex flex-1 flex-col space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
      <section className="rounded-2xl border border-gray-200/60 bg-white p-6">
        {aboutDescription ? (
          <p className="mt-4 whitespace-pre-line !leading-relaxed text-muted-foreground">
            {aboutDescription}
          </p>
        ) : (
          <EmptyState
            illustration="companyDetails"
            illustrationAlt="Ilustração de descrição vazia do curso"
            title="Descrição não adicionada."
            description="Até o momento, este curso não possui uma descrição detalhada."
            maxContentWidth="md"
          />
        )}
      </section>

      <aside className="space-y-4">
        {/* Imagem do curso */}
        {curso.imagemUrl && isClient && (
          <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
              {isPlaceholderImage ? (
                // Para imagens placeholder, usa img normal sem otimização
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={curso.imagemUrl}
                  alt={curso.nome}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              ) : (
                // Para imagens do Blob Storage, usa Image otimizado
                <Image
                  src={curso.imagemUrl}
                  alt={curso.nome}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              )}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <dl className="space-y-5 text-sm">
            {aboutSidebar
              .filter((info) => {
                // Mostrar categoria sempre, mesmo se não tiver valor
                if (info.label === "Categoria") return true;
                // Para subcategoria, mostrar apenas se tiver valor (não for "—")
                if (info.label === "Subcategoria")
                  return info.value !== null && info.value !== "—";
                // Para desconto, mostrar apenas se houver desconto
                if (info.label === "Desconto") return info.value !== null;
                // Para outros campos, mostrar apenas se tiver valor
                return info.value !== null && info.value !== "—";
              })
              .map((info) => (
                <div key={info.label} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    <info.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="flex flex-1 flex-col gap-1">
                    <dt className="text-xs font-medium text-gray-500">
                      {info.label}
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {info.value ?? "—"}
                    </dd>
                  </div>
                </div>
              ))}
          </dl>
        </div>
      </aside>
    </div>
  );
}
