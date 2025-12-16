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
import { stripHtmlTags } from "@/lib/utils";
import { getModalidadeIcon, getModalidadeBadgeColor, getModalidadeLabel, formatDate, formatTime } from "../utils";

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

  // Debug: log dos dados da aula recebidos
  useEffect(() => {
    console.log("[AboutTab] Dados da aula:", {
      id: aula?.id,
      titulo: aula?.titulo,
      modalidade: aula?.modalidade,
      turma: aula?.turma,
      instrutor: aula?.instrutor,
      dataInicio: aula?.dataInicio,
      dataFim: aula?.dataFim,
      horaInicio: aula?.horaInicio,
      horaFim: aula?.horaFim,
      duracaoMinutos: aula?.duracaoMinutos,
      descricao: aula?.descricao,
      status: aula?.status,
      obrigatoria: aula?.obrigatoria,
    });
  }, [aula]);

  const aboutDescription = aula?.descricao?.trim();
  const ModalidadeIcon = getModalidadeIcon(aula?.modalidade);

  // Verificação de segurança: se não há aula, retorna vazio
  if (!aula) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-500">Carregando dados da aula...</p>
      </div>
    );
  }

  const aboutSidebar: Array<{
    label: string;
    value: React.ReactNode | null;
    icon: LucideIcon;
  }> = [
    {
      label: "Modalidade",
      value: aula.modalidade ? (
        <Badge
          className={getModalidadeBadgeColor(aula.modalidade)}
          variant="outline"
        >
          {getModalidadeLabel(aula.modalidade)}
        </Badge>
      ) : (
        "—"
      ),
      icon: ModalidadeIcon,
    },
    {
      label: "Turma",
      value: aula.turma?.id && aula.turma?.nome 
        ? aula.turma.nome 
        : "Turma não vinculada",
      icon: BookOpen,
    },
    {
      label: "Instrutor",
      value: aula.instrutor?.nome || "—",
      icon: User,
    },
    {
      label: "Duração",
      value:
        aula.duracaoMinutos && aula.duracaoMinutos > 0
          ? `${aula.duracaoMinutos} minutos`
          : "—",
      icon: Clock,
    },
    {
      label: "Obrigatória",
      value: aula.obrigatoria !== undefined ? (aula.obrigatoria ? "Sim" : "Não") : "—",
      icon: aula.obrigatoria ? CheckCircle2 : Circle,
    },
    {
      label: "Data de Início",
      value: (() => {
        if (!aula.dataInicio) return "—";
        
        // A API sempre retorna dataInicio como ISO completo (YYYY-MM-DDTHH:mm:ss.sssZ)
        // Se houver horaInicio separado, preferir usar ele (mais preciso)
        if (aula.horaInicio) {
          try {
            // Extrair apenas a data (YYYY-MM-DD) do ISO
            const dataApenas = aula.dataInicio.split("T")[0];
            const [year, month, day] = dataApenas.split("-");
            const [hour, minute] = aula.horaInicio.split(":");
            const dataHoraCompleta = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
              parseInt(hour),
              parseInt(minute)
            );
            return `${formatDate(dataHoraCompleta.toISOString())} às ${formatTime(dataHoraCompleta.toISOString())}`;
          } catch {
            // Fallback: usar dataInicio ISO diretamente
            return `${formatDate(aula.dataInicio)} às ${formatTime(aula.dataInicio)}`;
          }
        }
        
        // Se não há horaInicio separado, usar dataInicio ISO completo
        return `${formatDate(aula.dataInicio)} às ${formatTime(aula.dataInicio)}`;
      })(),
      icon: Calendar,
    },
    {
      label: "Data de Término",
      value: (() => {
        if (!aula.dataFim) return "—";
        
        // A API sempre retorna dataFim como ISO completo (YYYY-MM-DDTHH:mm:ss.sssZ)
        // Se houver horaFim separado, preferir usar ele (mais preciso)
        if (aula.horaFim) {
          try {
            // Extrair apenas a data (YYYY-MM-DD) do ISO
            const dataApenas = aula.dataFim.split("T")[0];
            const [year, month, day] = dataApenas.split("-");
            const [hour, minute] = aula.horaFim.split(":");
            const dataHoraCompleta = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
              parseInt(hour),
              parseInt(minute)
            );
            return `${formatDate(dataHoraCompleta.toISOString())} às ${formatTime(dataHoraCompleta.toISOString())}`;
          } catch {
            // Fallback: usar dataFim ISO diretamente
            return `${formatDate(aula.dataFim)} às ${formatTime(aula.dataFim)}`;
          }
        }
        
        // Se não há horaFim separado, usar dataFim ISO completo
        return `${formatDate(aula.dataFim)} às ${formatTime(aula.dataFim)}`;
      })(),
      icon: Calendar,
    },
  ];

  // Adicionar campos específicos para AO_VIVO e SEMIPRESENCIAL
  if (aula.modalidade === "AO_VIVO" || aula.modalidade === "SEMIPRESENCIAL") {
    // Para AO_VIVO, sempre mostrar Meet se existir
    // Para SEMIPRESENCIAL, mostrar Meet se tipoLink for MEET
    const shouldShowMeet =
      aula.modalidade === "AO_VIVO" ||
      (aula.modalidade === "SEMIPRESENCIAL" && aula.tipoLink === "MEET");
    
    if (shouldShowMeet && aula.meetUrl) {
      aboutSidebar.push({
        label: "Link do Google Meet",
        value: (
          <a
            href={aula.meetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {aula.meetUrl}
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

  // Adicionar YouTube URL apenas para ONLINE ou SEMIPRESENCIAL com tipoLink YOUTUBE
  const shouldShowYouTube =
    aula.modalidade === "ONLINE" ||
    (aula.modalidade === "SEMIPRESENCIAL" && aula.tipoLink === "YOUTUBE");
  
  if (shouldShowYouTube && aula.youtubeUrl) {
    aboutSidebar.push({
      label: "Link do YouTube",
      value: (
        <a
          href={aula.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          {aula.youtubeUrl}
        </a>
      ),
      icon: Video,
    });
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
        <section className="rounded-2xl border border-gray-200/60 bg-white p-6 min-w-0">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </section>
        <aside className="space-y-4 min-w-0">
          <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
            <div className="space-y-4">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex items-start gap-3 min-w-0">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="flex flex-1 flex-col space-y-2 min-w-0">
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
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
      {/* Seção Descrição */}
      <section className="rounded-2xl border border-gray-200/60 bg-white p-6 min-w-0">
        {aboutDescription ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words mb-0!">
            {stripHtmlTags(aboutDescription)}
          </p>
        ) : (
          <p className="text-sm text-gray-500 mb-0!">
            Nenhuma descrição disponível.
          </p>
        )}
      </section>

      {/* Seção Informações */}
      <aside className="space-y-4 min-w-0">
        <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <dl className="space-y-5 text-sm">
            {aboutSidebar
              .filter((info) => info.value !== null && info.value !== "—")
              .map((info) => (
                <div key={info.label} className="flex items-start gap-3 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    <info.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <dt className="text-xs font-medium text-gray-500">
                      {info.label}
                    </dt>
                    <dd className="text-sm font-medium text-gray-900 break-words">
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



