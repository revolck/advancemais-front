"use client";

import Link from "next/link";
import { BookOpen, Users, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { PlataformaUsuariosStats, PlataformaCursosStats } from "@/api/dashboard/types";

/**
 * Métricas gerais filtradas para pedagógico (sem empresas/vagas/financeiro)
 */
interface PedagogicoMetricasGerais {
  // Cursos
  totalCursos: number;
  cursosPublicados: number;
  cursosRascunho: number;
  totalTurmas: number;
  turmasAtivas: number;
  turmasInscricoesAbertas: number;
  // Alunos
  totalAlunos: number;
  totalAlunosAtivos: number;
  totalAlunosInscritos: number;
  totalAlunosConcluidos: number;
  // Instrutores
  totalInstrutores: number;
  totalInstrutoresAtivos: number;
  // Usuários
  totalUsuarios: number;
  // Candidatos
  totalCandidatos: number;
  totalCandidatosAtivos: number;
}

/**
 * Tipo filtrado para pedagógico - apenas cursos e usuários (sem empresas/vagas)
 */
interface PedagogicoData {
  metricasGerais: PedagogicoMetricasGerais;
  usuarios: PlataformaUsuariosStats;
  cursos: PlataformaCursosStats;
}

interface QuickActionsPedagogicoProps {
  data: PedagogicoData;
}

/**
 * Quick Actions específico para setor pedagógico
 * Não inclui empresas ou vagas
 */
export function QuickActionsPedagogico({
  data,
}: QuickActionsPedagogicoProps) {
  if (!data?.metricasGerais) {
    return null;
  }

  const { metricasGerais } = data;

  const quickActions = [
    {
      title: "Cursos",
      icon: BookOpen,
      color: "indigo",
      href: "/dashboard/cursos",
      stats: [
        {
          label: "Publicados",
          value: metricasGerais.cursosPublicados,
        },
        {
          label: "Turmas Ativas",
          value: metricasGerais.turmasAtivas,
        },
      ],
    },
    {
      title: "Alunos",
      icon: Users,
      color: "blue",
      href: "/dashboard/cursos/alunos",
      stats: [
        {
          label: "Total",
          value: metricasGerais.totalAlunos,
        },
        {
          label: "Concluídos",
          value: metricasGerais.totalAlunosConcluidos,
        },
      ],
    },
    {
      title: "Instrutores",
      icon: GraduationCap,
      color: "purple",
      href: "/dashboard/cursos/instrutores",
      stats: [
        {
          label: "Total",
          value: metricasGerais.totalInstrutores,
        },
        {
          label: "Ativos",
          value: metricasGerais.totalInstrutoresAtivos,
        },
      ],
    },
  ];

  const colorVariants = {
    indigo: {
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      valueBg: "bg-indigo-100/60",
    },
    blue: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      valueBg: "bg-blue-100/60",
    },
    purple: {
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      valueBg: "bg-purple-100/60",
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {quickActions.map((action) => {
        const colors =
          colorVariants[action.color as keyof typeof colorVariants];
        const Icon = action.icon;

        return (
          <div
            key={action.title}
            className="rounded-xl bg-white p-4 md:p-5 space-y-4 border border-gray-200"
          >
            {/* Header com ícone e título */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center justify-center size-10 rounded-lg shrink-0",
                  colors.iconBg,
                  colors.iconColor
                )}
              >
                <Icon className="size-5" />
              </div>
              <h4 className="pt-5">{action.title}</h4>
            </div>

            {/* Métricas com totalizadores destacados */}
            <div className="space-y-0">
              {action.stats.map((stat, index) => (
                <div key={stat.label}>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">{stat.label}</span>
                    <span
                      className={cn(
                        "inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full text-sm font-semibold text-gray-900 tabular-nums",
                        colors.valueBg
                      )}
                    >
                      {stat.value.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  {index < action.stats.length - 1 && (
                    <div className="border-t border-gray-100 my-1" />
                  )}
                </div>
              ))}
            </div>

            {/* Botão "Ver todos" centralizado */}
            <div className="flex justify-center">
              <ButtonCustom
                asChild
                variant="primary"
                size="sm"
                className="w-full"
              >
                <Link href={action.href}>Ver todos</Link>
              </ButtonCustom>
            </div>
          </div>
        );
      })}
    </div>
  );
}

