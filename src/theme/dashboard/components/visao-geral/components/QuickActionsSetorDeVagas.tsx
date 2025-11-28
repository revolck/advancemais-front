"use client";

import Link from "next/link";
import { Building2, Briefcase, Users, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonCustom } from "@/components/ui/custom/button";

/**
 * Métricas para o Setor de Vagas
 */
export interface SetorDeVagasMetricasGerais {
  // Empresas
  totalEmpresas: number;
  empresasAtivas: number;
  novasEmpresasSemana: number;
  // Vagas
  totalVagas: number;
  vagasAbertas: number;
  vagasPendentes: number;
  vagasEncerradas: number;
  // Candidatos
  totalCandidatos: number;
  candidatosEmProcesso: number;
  candidatosContratados: number;
  // Solicitações
  solicitacoesPendentes: number;
  solicitacoesAprovadasHoje: number;
  solicitacoesRejeitadasHoje: number;
}

interface QuickActionsSetorDeVagasProps {
  data: {
    metricasGerais: SetorDeVagasMetricasGerais;
  };
}

/**
 * Quick Actions específico para Setor de Vagas
 * Inclui apenas empresas, vagas, candidatos e solicitações
 */
export function QuickActionsSetorDeVagas({
  data,
}: QuickActionsSetorDeVagasProps) {
  if (!data?.metricasGerais) {
    return null;
  }

  const { metricasGerais } = data;

  const quickActions = [
    {
      title: "Solicitações",
      icon: ClipboardList,
      color: "amber",
      href: "/dashboard/empresas/solicitacoes",
      stats: [
        {
          label: "Pendentes",
          value: metricasGerais.solicitacoesPendentes,
        },
        {
          label: "Aprovadas Hoje",
          value: metricasGerais.solicitacoesAprovadasHoje,
        },
      ],
    },
    {
      title: "Empresas",
      icon: Building2,
      color: "blue",
      href: "/dashboard/empresas",
      stats: [
        {
          label: "Ativas",
          value: metricasGerais.empresasAtivas,
        },
        {
          label: "Total",
          value: metricasGerais.totalEmpresas,
        },
      ],
    },
    {
      title: "Vagas",
      icon: Briefcase,
      color: "emerald",
      href: "/dashboard/empresas/vagas",
      stats: [
        {
          label: "Abertas",
          value: metricasGerais.vagasAbertas,
        },
        {
          label: "Em Análise",
          value: metricasGerais.vagasPendentes,
        },
      ],
    },
    {
      title: "Candidatos",
      icon: Users,
      color: "purple",
      href: "/dashboard/empresas/candidatos",
      stats: [
        {
          label: "Em Processo",
          value: metricasGerais.candidatosEmProcesso,
        },
        {
          label: "Contratados",
          value: metricasGerais.candidatosContratados,
        },
      ],
    },
  ];

  const colorVariants = {
    amber: {
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      valueBg: "bg-amber-100/60",
    },
    blue: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      valueBg: "bg-blue-100/60",
    },
    emerald: {
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      valueBg: "bg-emerald-100/60",
    },
    purple: {
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      valueBg: "bg-purple-100/60",
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

