"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  SelectCustom,
} from "@/components/ui/custom";
import { MultiSelectFilter } from "@/components/ui/custom/filters";
import { ButtonCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import {
  Video,
  Building2,
  Briefcase,
  FileText,
  Cake,
  GraduationCap,
  AlertCircle,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  UserCheck,
} from "lucide-react";
import { getAgenda, getAgendaAniversariantes, type AgendaEvento } from "@/api/aulas";
import { startOfMonth, endOfMonth, format, setMonth, setYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { EventClickArg, EventInput } from "@fullcalendar/core";

// Cores dos eventos
const EVENT_COLORS = {
  AULA: "#3B82F6", // Azul
  PROVA: "#EF4444", // Vermelho
  ATIVIDADE: "#8B5CF6", // Roxo
  ENTREVISTA: "#0F172A", // Slate
  ANIVERSARIO: "#10B981", // Verde
  TURMA_INICIO: "#6366F1", // Indigo
  TURMA_FIM: "#F59E0B", // Amber
} as const;

// Ícones dos eventos
const EVENT_ICONS = {
  AULA: Video,
  PROVA: FileText,
  ATIVIDADE: FileText,
  ENTREVISTA: UserCheck,
  ANIVERSARIO: Cake,
  TURMA_INICIO: GraduationCap,
  TURMA_FIM: GraduationCap,
} as const;

type EventType = keyof typeof EVENT_COLORS;

export function AgendaCursosCalendar() {
  const role = useUserRole();
  const canSeeInterviewEvents = role !== UserRole.SETOR_DE_VAGAS;
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([
    "AULA",
    "PROVA",
    "ATIVIDADE",
    "ENTREVISTA",
    "ANIVERSARIO",
    "TURMA_INICIO",
    "TURMA_FIM",
  ]);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvento | null>(null);
  const [calendarView, setCalendarView] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay">("dayGridMonth");
  const calendarRef = React.useRef<any>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const expectedDateRef = React.useRef<Date | null>(null);

  // Opções de mês (capitalizar a primeira letra)
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2024, i, 1);
      const monthName = format(date, "MMMM", { locale: ptBR });
      return {
        value: String(i),
        label: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      };
    });
  }, []);

  // Opções de ano (de 2025 até ano atual + 1)
  const yearOptions = useMemo(() => {
    const currentYear = today.getFullYear();
    const startYear = 2025;
    // Se o ano atual for menor que 2025, usar 2025 como base
    const baseYear = Math.max(startYear, currentYear);
    const endYear = baseYear + 1; // Sempre mostrar até +1 ano do ano atual (ou 2026 se estiver em 2025)
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push({
        value: String(year),
        label: String(year),
      });
    }
    return years;
  }, [today]);

  const dataInicio = startOfMonth(currentMonth).toISOString();
  const dataFim = endOfMonth(currentMonth).toISOString();
  const effectiveSelectedTypes = useMemo(
    () =>
      canSeeInterviewEvents
        ? selectedTypes
        : selectedTypes.filter((tipo) => tipo !== "ENTREVISTA"),
    [canSeeInterviewEvents, selectedTypes]
  );
  const selectedTiposAgenda = useMemo(
    () => effectiveSelectedTypes.filter((tipo) => tipo !== "ANIVERSARIO"),
    [effectiveSelectedTypes]
  );
  const incluirAniversariantes = effectiveSelectedTypes.includes("ANIVERSARIO");

  useEffect(() => {
    if (!canSeeInterviewEvents) {
      setSelectedTypes((prev) => prev.filter((tipo) => tipo !== "ENTREVISTA"));
    }
  }, [canSeeInterviewEvents]);

  // Buscar eventos da agenda (sem aniversariantes)
  const {
    data: agendaData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["agenda", dataInicio, dataFim, selectedTiposAgenda],
    queryFn: () =>
      selectedTiposAgenda.length
        ? getAgenda({
            dataInicio,
            dataFim,
            tipos: selectedTiposAgenda,
          })
        : Promise.resolve({ eventos: [] }),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  // Buscar aniversariantes por rota dedicada
  const { data: aniversariantesData } = useQuery({
    queryKey: ["agenda-aniversariantes", dataInicio, dataFim],
    queryFn: async () => {
      try {
        return await getAgendaAniversariantes({
          dataInicio,
          dataFim,
        });
      } catch (err) {
        const status = (err as { status?: number })?.status;
        if (status === 403) {
          // Fallback para perfis sem permissão na rota dedicada
          return { eventos: [], resumo: { total: 0 } };
        }
        throw err;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    enabled: incluirAniversariantes,
  });

  // Transformar eventos da API para formato FullCalendar
  const events: EventInput[] = useMemo(() => {
    const eventosBase = (agendaData?.eventos ?? []).filter(
      (evento) => canSeeInterviewEvents || evento.tipo !== "ENTREVISTA"
    );
    const aniversariantes = incluirAniversariantes
      ? (aniversariantesData?.eventos ?? [])
      : [];
    const eventosCombinados = [...eventosBase, ...aniversariantes];
    if (!eventosCombinados.length) return [];

    return eventosCombinados.map((evento) => {
      const start = evento.dataInicio || evento.data;
      const end = evento.dataFim;

      return {
        id: evento.id,
        title: evento.titulo,
        start: start || undefined,
        end: end || undefined,
        backgroundColor: EVENT_COLORS[evento.tipo] || "#6B7280",
        borderColor: EVENT_COLORS[evento.tipo] || "#6B7280",
        extendedProps: evento,
        allDay: !evento.dataInicio, // Se não tem horário, é dia inteiro
      };
    });
  }, [agendaData, aniversariantesData, canSeeInterviewEvents, incluirAniversariantes]);

  // Sincronizar o estado inicial quando o calendário montar
  useEffect(() => {
    // Aguardar o calendário estar pronto
    const timer = setTimeout(() => {
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        calendarApi.gotoDate(today);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [today]);

  // Handler de clique no evento
  const handleEventClick = (info: EventClickArg) => {
    const evento = info.event.extendedProps as AgendaEvento;
    setSelectedEvent(evento);
  };

  // Filtros de tipo
  const tipoOptions: Array<{ value: EventType; label: string; icon: any }> = [
    { value: "AULA", label: "Aulas", icon: Video },
    { value: "PROVA", label: "Provas", icon: FileText },
    { value: "ATIVIDADE", label: "Atividades", icon: FileText },
    { value: "ENTREVISTA", label: "Entrevistas", icon: UserCheck },
    { value: "ANIVERSARIO", label: "Aniversariantes", icon: Cake },
    { value: "TURMA_INICIO", label: "Início de Turmas", icon: GraduationCap },
    { value: "TURMA_FIM", label: "Fim de Turmas", icon: GraduationCap },
  ];
  const visibleTipoOptions = canSeeInterviewEvents
    ? tipoOptions
    : tipoOptions.filter((option) => option.value !== "ENTREVISTA");
  const totalAniversariantes = aniversariantesData?.resumo?.total ?? 0;

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar agenda. Tente novamente mais tarde.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card Principal */}
      <Card className="border border-gray-200/80 shadow-sm">
        <CardContent className="p-6 pt-5">
          {/* Header Customizado */}
          <div className="mb-6 flex items-center justify-between pb-4 border-b border-gray-100">
            {/* Lado Esquerdo - Data */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center rounded-md bg-gray-100 px-2.5 py-1.5 min-w-[48px]">
                <span className="text-[10px] font-semibold text-gray-600 uppercase leading-tight">
                  {format(today, "MMM", { locale: ptBR })}
                </span>
                <span className="text-xl font-bold text-gray-900 leading-tight">
                  {format(today, "d")}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-gray-900 capitalize">
                  {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                </span>
                {calendarView === "dayGridMonth" && (
                  <span className="text-xs text-gray-500">
                    {format(startOfMonth(currentMonth), "d 'de' MMM", { locale: ptBR })} - {format(endOfMonth(currentMonth), "d 'de' MMM, yyyy", { locale: ptBR })}
                  </span>
                )}
              </div>
            </div>

            {/* Lado Direito - Navegação e Filtros */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5 rounded-md border border-gray-200 bg-white p-0.5">
                <button
                  onClick={() => {
                    const calendarApi = calendarRef.current?.getApi();
                    calendarApi?.prev();
                  }}
                  className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => {
                    const calendarApi = calendarRef.current?.getApi();
                    calendarApi?.today();
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  Hoje
                </button>
                <button
                  onClick={() => {
                    const calendarApi = calendarRef.current?.getApi();
                    calendarApi?.next();
                  }}
                  className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              {/* Selects de Mês e Ano */}
              <div className="flex items-center gap-2">
                <SelectCustom
                  mode="single"
                  value={String(currentMonth.getMonth())}
                  onChange={(value) => {
                    if (value !== null && value !== undefined) {
                      const monthIndex = Number(value);
                      const year = currentMonth.getFullYear();
                      const newDate = new Date(year, monthIndex, 1);
                      
                      // Ativar flag de navegação manual
                      setIsNavigating(true);
                      // Armazenar a data esperada para comparação no datesSet
                      expectedDateRef.current = newDate;
                      
                      // Atualizar o estado primeiro
                      setCurrentMonth(newDate);
                      
                      // Depois navegar no calendário
                      const calendarApi = calendarRef.current?.getApi();
                      if (calendarApi) {
                        calendarApi.gotoDate(newDate);
                      }
                    }
                  }}
                  options={monthOptions}
                  placeholder="Mês"
                  className="w-[140px]"
                  size="sm"
                />
                <SelectCustom
                  mode="single"
                  value={String(currentMonth.getFullYear())}
                  onChange={(value) => {
                    if (value !== null && value !== undefined) {
                      const year = Number(value);
                      const month = currentMonth.getMonth();
                      const newDate = new Date(year, month, 1);
                      
                      // Ativar flag de navegação manual
                      setIsNavigating(true);
                      // Armazenar a data esperada para comparação no datesSet
                      expectedDateRef.current = newDate;
                      
                      // Atualizar o estado primeiro
                      setCurrentMonth(newDate);
                      
                      // Depois navegar no calendário
                      const calendarApi = calendarRef.current?.getApi();
                      if (calendarApi) {
                        calendarApi.gotoDate(newDate);
                      }
                    }
                  }}
                  options={yearOptions}
                  placeholder="Ano"
                  className="w-[100px]"
                  size="sm"
                />
              </div>
              <SelectCustom
                mode="single"
                value={calendarView}
                onChange={(value) => {
                  if (value) {
                    setCalendarView(value as any);
                    const calendarApi = calendarRef.current?.getApi();
                    calendarApi?.changeView(value);
                  }
                }}
                options={[
                  { value: "dayGridMonth", label: "Mês" },
                  { value: "timeGridWeek", label: "Semana" },
                  { value: "timeGridDay", label: "Dia" },
                ]}
                placeholder="Month view"
                className="w-[140px]"
                size="sm"
              />
              <div className="[&_button]:!h-10 [&_button]:!text-sm [&_button]:!py-2">
                <MultiSelectFilter
                  title="Tipos"
                  placeholder="Tipos"
                  options={visibleTipoOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                  selectedValues={effectiveSelectedTypes}
                  onSelectionChange={(values) => {
                    const nextValues = values as EventType[];
                    setSelectedTypes(
                      canSeeInterviewEvents
                        ? nextValues
                        : nextValues.filter((tipo) => tipo !== "ENTREVISTA")
                    );
                  }}
                  className="w-auto min-w-[180px]"
                />
              </div>
              {incluirAniversariantes && (
                <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700">
                  <Cake className="h-3.5 w-3.5" />
                  <span>{totalAniversariantes} aniversariante(s)</span>
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {/* Skeleton dos dias da semana */}
              <div className="grid grid-cols-7 gap-2 mb-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md bg-gray-100" />
                ))}
              </div>
              {/* Skeleton das semanas do calendário */}
              {Array.from({ length: 6 }).map((_, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }).map((_, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="h-24 w-full rounded-lg border border-gray-200/60 bg-white p-2 space-y-1.5"
                    >
                      {/* Número do dia */}
                      <Skeleton className="h-4 w-6 rounded" />
                      {/* Eventos simulados */}
                      {dayIndex % 3 === 0 && (
                        <Skeleton className="h-3 w-full rounded" />
                      )}
                      {dayIndex % 4 === 0 && (
                        <Skeleton className="h-3 w-3/4 rounded" />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="fullcalendar-wrapper">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={calendarView}
                initialDate={today}
                locale={ptBrLocale}
                headerToolbar={false}
                events={events}
                eventClick={handleEventClick}
                height="auto"
                contentHeight={600}
                eventDisplay="block"
                displayEventTime={true}
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  meridiem: false,
                }}
                slotLabelFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  meridiem: false,
                }}
                datesSet={(dateInfo) => {
                  const calendarDate = dateInfo.view.currentStart;
                  
                  // Se estamos em navegação manual (via selects)
                  if (isNavigating && expectedDateRef.current) {
                    // Comparar ano e mês da data esperada com a data do calendário
                    const expectedMonth = expectedDateRef.current.getMonth();
                    const expectedYear = expectedDateRef.current.getFullYear();
                    const calendarMonth = calendarDate.getMonth();
                    const calendarYear = calendarDate.getFullYear();
                    
                    // Se coincidem, a navegação foi concluída com sucesso
                    if (expectedMonth === calendarMonth && expectedYear === calendarYear) {
                      // Limpar a data esperada e desativar flag de navegação
                      expectedDateRef.current = null;
                      setIsNavigating(false);
                      // Atualizar o estado com a data confirmada pelo calendário
                      setCurrentMonth(calendarDate);
                    }
                    // Se não coincidem, ignorar completamente (é uma atualização intermediária)
                    // NÃO atualizar nada durante a navegação manual
                    return;
                  }
                  
                  // Se não está em navegação manual, é navegação via botões (< > Hoje)
                  // Atualizar normalmente
                  setCurrentMonth(calendarDate);
                }}
                nowIndicator={true}
                allDaySlot={true}
                allDayText="Dia inteiro"
                weekends={true}
                firstDay={0} // Domingo
                dayMaxEvents={3}
                moreLinkText={(num) => `+${num} mais`}
                loading={(isLoading) => {
                  // Callback de loading do FullCalendar
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes do evento */}
      {selectedEvent && (
        <EventDetailsModal
          evento={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

// Componente de modal de detalhes
interface EventDetailsModalProps {
  evento: AgendaEvento;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EventMetaCard({
  label,
  value,
  icon,
  emphasis = false,
  className,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      {icon && (
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
          {icon}
        </div>
      )}
      <div className="min-w-0 space-y-1">
        <p className="mb-0! text-[11px]! font-medium! uppercase! tracking-[0.08em]! text-gray-500!">
          {label}
        </p>
        <p
          className={cn(
            "mb-0! leading-6! text-gray-900! break-words",
            emphasis ? "text-base! font-semibold!" : "text-sm! font-medium!"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function EventDetailsModal({
  evento,
  open,
  onOpenChange,
}: EventDetailsModalProps) {
  const role = useUserRole();
  const isInterview = evento.tipo === "ENTREVISTA";
  const isCandidateViewingOwnInterview =
    isInterview && role === UserRole.ALUNO_CANDIDATO;
  const isDetailedInterviewView =
    isInterview && !isCandidateViewingOwnInterview;
  const headerTitle = isCandidateViewingOwnInterview
    ? "Sua entrevista"
    : isInterview
      ? "Entrevista"
      : evento.titulo;
  const headerSubtitle = !isInterview
    ? [evento.vaga?.titulo, evento.empresa?.nomeExibicao]
        .filter(Boolean)
        .join(" • ")
    : "";
  const displayDescription =
    evento.descricao &&
    evento.descricao !== evento.vaga?.titulo &&
    evento.descricao !== evento.candidato?.nome
      ? evento.descricao
      : null;

  const parseEventDate = (value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };
  const capitalizeText = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);
  const startDate = parseEventDate(evento.dataInicio || evento.data);
  const endDate = parseEventDate(evento.dataFim);
  const dateLabel = startDate
    ? capitalizeText(
        startDate.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      )
    : "Data não informada";
  const timeLabel =
    startDate && endDate
      ? `${startDate.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })} às ${endDate.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      : startDate && evento.dataInicio
        ? startDate.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null;
  const modalityLabel =
    evento.modalidadeLabel ||
    (evento.modalidade === "ONLINE"
      ? "Online"
      : evento.modalidade === "PRESENCIAL"
        ? "Presencial"
        : evento.modalidade);
  const hasMeet = Boolean(evento.meetUrl);
  const meetButtonLabel = isInterview ? "Acessar entrevista" : "Acessar reunião";
  const whenLabel = timeLabel ? `${dateLabel} • ${timeLabel}` : dateLabel;
  const isAnonymousCompany = Boolean(
    evento.empresaAnonima || evento.empresa?.anonima
  );
  const companyDisplayName = isAnonymousCompany
    ? "Empresa anônima"
    : evento.empresa?.nomeExibicao;
  const isOnline = modalityLabel === "Online";
  const formattedEnderecoPresencial = evento.enderecoPresencial
    ? [
        [evento.enderecoPresencial.logradouro, evento.enderecoPresencial.numero]
          .filter(Boolean)
          .join(", "),
        evento.enderecoPresencial.complemento,
        evento.enderecoPresencial.bairro,
        [
          evento.enderecoPresencial.cidade,
          evento.enderecoPresencial.estado,
        ]
          .filter(Boolean)
          .join(" - "),
        evento.enderecoPresencial.cep,
        evento.enderecoPresencial.pontoReferencia,
      ]
        .filter(Boolean)
        .join(" • ")
    : null;
  const presencialLocation =
    evento.local?.trim() || formattedEnderecoPresencial || null;
  const shouldShowPresencialLocation =
    isInterview && evento.modalidade === "PRESENCIAL" && Boolean(presencialLocation);

  return (
    <ModalCustom
      isOpen={open}
      onOpenChange={onOpenChange}
      size="lg"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader className="pb-4!">
          <div className="min-w-0">
            <ModalTitle className="mb-0! text-lg! font-semibold! text-gray-900!">
              {headerTitle}
            </ModalTitle>
            {headerSubtitle && (
              <p className="mb-0! mt-1! text-sm! text-gray-500!">
                {headerSubtitle}
              </p>
            )}
          </div>
        </ModalHeader>
        <ModalBody className="max-h-[65vh] overflow-y-auto py-0!">
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex flex-col gap-4">
                  <div className="min-w-0">
                    <p className="mb-0! text-[11px]! font-medium! uppercase! tracking-[0.08em]! text-slate-500!">
                      {isInterview ? "Data e horário" : "Quando"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="mb-0! text-base! font-semibold! text-slate-900!">
                        {whenLabel}
                      </p>
                      {modalityLabel && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                            isOnline
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                          )}
                        >
                          {modalityLabel}
                        </Badge>
                      )}
                      {!isInterview && (
                        <p className="mb-0! text-xs! font-medium! uppercase! tracking-[0.08em]! text-slate-400!">
                          {evento.tipo.replace(/_/g, " ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-5 py-4">
                {(companyDisplayName || evento.vaga) && (
                  <div className="space-y-4">
                    {companyDisplayName && (
                      <EventMetaCard
                        label="Empresa"
                        value={companyDisplayName}
                        emphasis
                        icon={<Building2 className="h-4 w-4" />}
                      />
                    )}

                    {evento.vaga && (
                      <EventMetaCard
                        label="Vaga"
                        value={evento.vaga.titulo}
                        emphasis
                        icon={<Briefcase className="h-4 w-4" />}
                      />
                    )}

                    {shouldShowPresencialLocation && (
                      <EventMetaCard
                        label="Local"
                        value={presencialLocation as string}
                        icon={<MapPin className="h-4 w-4" />}
                      />
                    )}
                  </div>
                )}

                {isDetailedInterviewView && (evento.candidato || evento.usuario) && (
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    {evento.candidato && (
                      <EventMetaCard
                        label="Candidato"
                        value={evento.candidato.nome}
                        icon={<User className="h-4 w-4" />}
                      />
                    )}
                    {evento.usuario && (
                      <EventMetaCard
                        label="Responsável"
                        value={evento.usuario.nome}
                        icon={<UserCheck className="h-4 w-4" />}
                      />
                    )}
                  </div>
                )}

                {!isInterview && evento.usuario && (
                  <div className="border-t border-slate-100 pt-4">
                    <EventMetaCard
                      label={
                        evento.tipo === "ANIVERSARIO"
                          ? "Aniversariante"
                          : "Responsável"
                      }
                      value={evento.usuario.nome}
                    />
                  </div>
                )}

                {displayDescription && (
                  <div className="border-t border-slate-100 pt-4">
                    <p className="mb-0! text-[11px]! font-medium! uppercase! tracking-[0.08em]! text-gray-500!">
                      {isCandidateViewingOwnInterview ? "Instruções" : "Descrição"}
                    </p>
                    <p className="mb-0! mt-2! whitespace-pre-wrap text-sm! leading-6! text-gray-700!">
                      {displayDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModalBody>
        {hasMeet && (
          <ModalFooter className="border-t border-gray-100 pt-4">
            <ButtonCustom asChild size="md" variant="primary" className="sm:min-w-[220px]">
              <a
                href={evento.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {meetButtonLabel}
              </a>
            </ButtonCustom>
          </ModalFooter>
        )}
      </ModalContentWrapper>
    </ModalCustom>
  );
}

// Estilos customizados para o FullCalendar
export const FullCalendarStyles = () => (
  <style jsx global>{`
    .fullcalendar-wrapper {
      font-family: inherit;
    }

    .fc {
      --fc-border-color: #e5e7eb;
      --fc-button-bg-color: #3b82f6;
      --fc-button-border-color: #3b82f6;
      --fc-button-hover-bg-color: #2563eb;
      --fc-button-hover-border-color: #2563eb;
      --fc-button-active-bg-color: #1d4ed8;
      --fc-button-active-border-color: #1d4ed8;
      --fc-today-bg-color: #eff6ff;
      --fc-page-bg-color: #ffffff;
    }

    .fc .fc-toolbar {
      padding: 0;
      margin-bottom: 1.75rem;
      gap: 0.5rem;
    }

    .fc .fc-button {
      font-size: 0.8125rem;
      padding: 0.5rem 0.875rem;
      border-radius: 0.375rem;
      font-weight: 500;
      text-transform: none;
      cursor: pointer;
      border: 1px solid #e5e7eb;
      background-color: white;
      color: #6b7280;
      transition: all 0.15s ease;
    }

    .fc .fc-button:hover {
      background-color: #f9fafb;
      border-color: #d1d5db;
      color: #374151;
    }

    .fc .fc-button-primary:not(:disabled):active,
    .fc .fc-button-primary:not(:disabled).fc-button-active {
      background-color: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }

    .fc .fc-toolbar-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
    }

    .fc .fc-daygrid-day-number {
      color: #374151;
      padding: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      font-size: 0.875rem;
    }
    
    .fc .fc-daygrid-day:hover {
      background-color: #fafafa;
    }

    .fc .fc-col-header-cell {
      background-color: transparent;
      border-color: #e5e7eb;
      padding: 0.75rem 0;
    }

    .fc .fc-col-header-cell-cushion {
      color: #6b7280;
      font-weight: 500;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.025em;
      padding: 0.5rem;
    }

    .fc .fc-daygrid-day {
      border-color: #e5e7eb;
      transition: background-color 0.15s ease;
    }

    .fc .fc-daygrid-day-top {
      padding: 0.5rem;
    }

    .fc .fc-event {
      border-radius: 0.375rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      border-width: 0;
      transition: all 0.15s ease;
      margin: 0.125rem 0;
    }

    .fc .fc-event:hover {
      opacity: 0.85;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .fc .fc-daygrid-day.fc-day-today {
      background-color: #f0f9ff !important;
    }

    .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
      color: #0284c7;
      font-weight: 600;
    }

    .fc .fc-highlight {
      background-color: #fef3c7;
    }

    .fc .fc-more-link {
      font-weight: 500;
      color: #3b82f6;
    }

    /* Header fixo para visualizações de Semana e Dia */
    .fc .fc-timeGrid-view .fc-timegrid-header {
      position: sticky;
      top: 0;
      z-index: 20;
      background-color: white;
    }

    .fc .fc-timeGrid-view .fc-col-header {
      position: sticky;
      top: 0;
      z-index: 21;
      background-color: white;
    }

    .fc .fc-timeGrid-view .fc-col-header-cell {
      background-color: white;
      border-bottom: 1px solid #e5e7eb;
    }

    .fc .fc-timeGrid-view .fc-timegrid-axis {
      position: sticky;
      left: 0;
      z-index: 19;
      background-color: white;
      border-right: 1px solid #e5e7eb;
    }

    .fc .fc-timeGrid-view .fc-timegrid-slot-label {
      background-color: white;
    }

    .fc .fc-timeGrid-view .fc-timegrid-slot-minor {
      border-top: 1px dotted #e5e7eb;
    }

    /* Corrige o scroll e layout */
    .fc .fc-timeGrid-view .fc-scroller {
      overflow-x: auto;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }

    .fc .fc-timeGrid-view .fc-timegrid-body {
      position: relative;
    }

    /* Garante que o header não fique sobreposto */
    .fc .fc-timeGrid-view .fc-timegrid-header-table {
      width: 100%;
    }
  `}</style>
);
