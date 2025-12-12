"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Video,
  Clock,
  Calendar,
  User,
  BookOpen,
  CheckCircle2,
  Circle,
  type LucideIcon,
} from "lucide-react";
import type { Aula } from "@/api/aulas";
import { Badge } from "@/components/ui/badge";
import { getModalidadeIcon, getModalidadeBadgeColor, formatDate, formatTime } from "../utils";

interface AboutTabProps {
  aula: Aula;
  isLoading?: boolean;
  onUpdate?: () => void;
}

export function AboutTab({ aula, isLoading = false }: AboutTabProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const aboutDescription = aula.descricao?.trim();
  const ModalidadeIcon = getModalidadeIcon(aula.modalidade);

  const aboutSidebar: Array<{
    label: string;
    value: React.ReactNode | null;
    icon: LucideIcon;
  }> = [
    {
      label: "Modalidade",
      value: (
        <Badge
          className={getModalidadeBadgeColor(aula.modalidade)}
          variant="outline"
        >
          {aula.modalidade}
        </Badge>
      ),
      icon: ModalidadeIcon,
    },
    {
      label: "Turma",
      value: aula.turma?.nome || "—",
      icon: BookOpen,
    },
    {
      label: "Instrutor",
      value: aula.instrutor?.nome || "—",
      icon: User,
    },
    {
      label: "Duração",
      value: aula.duracaoMinutos ? `${aula.duracaoMinutos} minutos` : "—",
      icon: Clock,
    },
    {
      label: "Obrigatória",
      value: aula.obrigatoria ? "Sim" : "Não",
      icon: aula.obrigatoria ? CheckCircle2 : Circle,
    },
    {
      label: "Data de Início",
      value: aula.dataInicio
        ? `${formatDate(aula.dataInicio)} às ${formatTime(aula.dataInicio)}`
        : "—",
      icon: Calendar,
    },
    {
      label: "Data de Término",
      value: aula.dataFim
        ? `${formatDate(aula.dataFim)} às ${formatTime(aula.dataFim)}`
        : "—",
      icon: Calendar,
    },
  ];

  // Adicionar campos específicos para AO_VIVO
  if (aula.modalidade === "AO_VIVO" || aula.modalidade === "SEMIPRESENCIAL") {
    if (aula.meetUrl) {
      aboutSidebar.push({
        label: "Link do Google Meet",
        value: (
          <a
            href={aula.meetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Abrir sala
          </a>
        ),
        icon: Video,
      });
    }
    if (aula.gravarAula) {
      aboutSidebar.push({
        label: "Gravação",
        value: aula.linkGravacao ? (
          <a
            href={aula.linkGravacao}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Ver gravação
          </a>
        ) : (
          <span className="text-gray-500">
            Será gravada ({aula.statusGravacao || "aguardando"})
          </span>
        ),
        icon: Video,
      });
    }
  }

  // Adicionar YouTube URL se aplicável
  if (aula.youtubeUrl) {
    aboutSidebar.push({
      label: "Link do YouTube",
      value: (
        <a
          href={aula.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline truncate max-w-xs"
        >
          {aula.youtubeUrl}
        </a>
      ),
      icon: Video,
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main Content */}
        <div className="space-y-6 rounded-3xl bg-white p-6">
          <section>
            <h4 className="mb-4 text-base font-semibold text-gray-900">
              Descrição
            </h4>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : aboutDescription ? (
              <div
                className="prose prose-sm max-w-none text-sm text-gray-700 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: aboutDescription }}
              />
            ) : (
              <p className="text-sm text-gray-500">
                Nenhuma descrição disponível.
              </p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-6">
            <h4 className="mb-4 text-base font-semibold text-gray-900">
              Informações
            </h4>
            <div className="space-y-4">
              {aboutSidebar.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {item.label}
                      </p>
                      {isLoading ? (
                        <Skeleton className="h-5 w-24" />
                      ) : (
                        <div className="text-sm font-medium text-gray-900 break-words">
                          {item.value}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

