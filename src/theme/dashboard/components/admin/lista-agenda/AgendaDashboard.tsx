"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarBody,
  CalendarHeader,
  CalendarItem,
  CalendarProvider,
  CalendarState,
  monthsForLocale,
  type CalendarFeature,
  type CalendarStatus,
  useCalendar,
} from "@/components/ui/custom/calendar";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { SelectCustom } from "@/components/ui/custom/select";
import { cn } from "@/lib/utils";
import {
  addDays,
  addMonths,
  differenceInMinutes,
  endOfMonth,
  format,
  isSameDay,
  setHours,
  setMinutes,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

const today = new Date();

const withTime = (date: Date, hours: number, minutes = 0) =>
  setMinutes(setHours(new Date(date), hours), minutes);

const statuses: CalendarStatus[] = [
  { id: "scheduled", name: "Agendado", color: "#4C51BF" },
  { id: "progress", name: "Em andamento", color: "#F59E0B" },
  { id: "completed", name: "Concluído", color: "#10B981" },
];

const toRgba = (hex: string, alpha = 0.15) => {
  const parsed = hex.replace("#", "");
  const bigint = parseInt(parsed, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const calendarEvents: CalendarFeature[] = [
  {
    id: "prep-week",
    name: "Semana de ambientação dos instrutores",
    startAt: withTime(addMonths(startOfMonth(today), -2), 8, 30),
    endAt: withTime(addDays(addMonths(startOfMonth(today), -2), 2), 17),
    status: statuses[2],
  },
  {
    id: "kickoff-online",
    name: "Kickoff turmas online",
    startAt: withTime(addMonths(startOfMonth(today), -1), 9),
    endAt: withTime(addDays(addMonths(startOfMonth(today), -1), 6), 18),
    status: statuses[2],
  },
  {
    id: "mentoria-carreiras",
    name: "Mentoria de carreiras",
    startAt: withTime(addMonths(startOfMonth(today), -1), 19),
    endAt: withTime(addDays(addMonths(startOfMonth(today), -1), 18), 21),
    status: statuses[1],
  },
  {
    id: "certificacao-teams",
    name: "Treinamento certificação Teams",
    startAt: withTime(startOfMonth(today), 9),
    endAt: withTime(addDays(startOfMonth(today), 4), 12),
    status: statuses[1],
  },
  {
    id: "meetup-engenharia",
    name: "Meetup engenharia de dados",
    startAt: withTime(startOfMonth(today), 18, 30),
    endAt: withTime(addDays(startOfMonth(today), 11), 21),
    status: statuses[0],
  },
  {
    id: "simulado-enade",
    name: "Simulado ENADE",
    startAt: withTime(addDays(startOfMonth(today), 15), 10),
    endAt: withTime(addDays(startOfMonth(today), 15), 12, 30),
    status: statuses[0],
  },
  {
    id: "aulao-integrador",
    name: "Aulão projeto integrador",
    startAt: withTime(endOfMonth(today), 19),
    endAt: withTime(endOfMonth(today), 21, 30),
    status: statuses[0],
  },
  {
    id: "workshop-ai",
    name: "Workshop IA aplicada",
    startAt: withTime(addMonths(startOfMonth(today), 1), 13),
    endAt: withTime(addDays(addMonths(startOfMonth(today), 1), 9), 17),
    status: statuses[0],
  },
  {
    id: "mesa-redonda",
    name: "Mesa redonda com parceiros",
    startAt: withTime(addMonths(startOfMonth(today), 2), 18),
    endAt: withTime(addDays(addMonths(startOfMonth(today), 2), 5), 20),
    status: statuses[0],
  },
  {
    id: "revisao-certificacao",
    name: "Revisão certificação final",
    startAt: withTime(addMonths(startOfMonth(today), 3), 9),
    endAt: withTime(addDays(addMonths(startOfMonth(today), 3), 8), 12),
    status: statuses[0],
  },
];

type ViewMode = "month" | "week" | "day";

const viewModes: Array<{ id: ViewMode; label: string }> = [
  { id: "day", label: "Dia" },
  { id: "week", label: "Semana" },
  { id: "month", label: "Mês" },
];

const formatEventDate = (date: Date) => format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
const formatWeekDay = (date: Date) => format(date, "EEE • dd MMM", { locale: ptBR });
const formatDayTitle = (date: Date) => format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });

export function AgendaDashboard({ className }: { className?: string }) {
  const { month, year, setMonth, setYear } = useCalendar();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [focusDate, setFocusDate] = useState<Date>(today);
  const [selectedEvent, setSelectedEvent] = useState<CalendarFeature | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState<"all" | CalendarStatus["id"]>("all");

  const [pendingMonth, setPendingMonth] = useState(String(month));
  const [pendingYear, setPendingYear] = useState(String(year));
  const [pendingView, setPendingView] = useState<ViewMode>(viewMode);
  const [pendingStatus, setPendingStatus] = useState<"all" | CalendarStatus["id"]>("all");

  useEffect(() => {
    setFocusDate((prev) => {
      const day = prev.getDate();
      const next = new Date(year, month, day);
      return next;
    });
  }, [month, year]);

  useEffect(() => {
    setPendingMonth(String(month));
  }, [month]);

  useEffect(() => {
    setPendingYear(String(year));
  }, [year]);

  useEffect(() => {
    setPendingView(viewMode);
  }, [viewMode]);

  useEffect(() => {
    setPendingStatus(activeStatus);
  }, [activeStatus]);

  const earliestYear = useMemo(
    () => Math.min(...calendarEvents.map((event) => event.startAt.getFullYear())),
    []
  );
  const latestYear = useMemo(
    () => Math.max(...calendarEvents.map((event) => event.endAt.getFullYear())),
    []
  );

  const monthOptions = useMemo(
    () => monthsForLocale("pt-BR", "long").map((label, index) => ({ value: String(index), label: label.charAt(0).toUpperCase() + label.slice(1) })),
    []
  );

  const yearOptions = useMemo(
    () => Array.from({ length: latestYear - earliestYear + 1 }, (_, i) => {
      const current = earliestYear + i;
      return { value: String(current), label: String(current) };
    }),
    [earliestYear, latestYear]
  );

  const viewOptions = useMemo(
    () => viewModes.map((mode) => ({ value: mode.id, label: mode.label })),
    []
  );

  const statusOptions = useMemo(
    () => [{ value: "all", label: "Todos" }, ...statuses.map((status) => ({ value: status.id, label: status.name }))],
    []
  );

  const filteredEvents = useMemo(
    () => (activeStatus === "all" ? calendarEvents : calendarEvents.filter((event) => event.status.id === activeStatus)),
    [activeStatus]
  );

  const upcomingEvents = useMemo(
    () =>
      filteredEvents
        .filter((event) => event.endAt >= today)
        .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
        .slice(0, 6),
    [filteredEvents]
  );

  const weekDays = useMemo(() => {
    const start = startOfWeek(focusDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [focusDate]);

  const eventsByWeek = useMemo(
    () =>
      weekDays.map((day) =>
        filteredEvents
          .filter((event) => isSameDay(day, event.startAt) || (event.startAt <= day && event.endAt >= day))
          .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
      ),
    [weekDays, filteredEvents]
  );

  const eventsForDay = useMemo(
    () =>
      filteredEvents
        .filter((event) => isSameDay(focusDate, event.startAt))
        .sort((a, b) => a.startAt.getTime() - b.startAt.getTime()),
    [focusDate, filteredEvents]
  );

  const handleNavigate = (direction: number) => {
    if (viewMode === "month") {
      const nextDate = addMonths(new Date(year, month, 1), direction);
      setMonth(nextDate.getMonth() as CalendarState["month"]);
      setYear(nextDate.getFullYear());
      setFocusDate(nextDate);
      return;
    }

    const delta = viewMode === "week" ? 7 : 1;
    const next = addDays(focusDate, direction * delta);
    setFocusDate(next);
    setMonth(next.getMonth() as CalendarState["month"]);
    setYear(next.getFullYear());
  };

  const handleResetToToday = () => {
    setFocusDate(today);
    setMonth(today.getMonth() as CalendarState["month"]);
    setYear(today.getFullYear());
    setViewMode("day");
    setPendingView("day");
    setPendingMonth(String(today.getMonth()));
    setPendingYear(String(today.getFullYear()));
  };

  const handleSelectEvent = (event: CalendarFeature, openModal = true) => {
    setFocusDate(event.startAt);
    setMonth(event.startAt.getMonth() as CalendarState["month"]);
    setYear(event.startAt.getFullYear());
    if (openModal) {
      setSelectedEvent(event);
      setEventModalOpen(true);
    }
  };

  const renderInteractiveBadge = (event: CalendarFeature) => (
    <Tooltip key={event.id}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => handleSelectEvent(event)}
          className="w-full cursor-pointer text-left"
        >
          <CalendarItem feature={event} className="cursor-pointer" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">Clique aqui para editar.</TooltipContent>
    </Tooltip>
  );

  const applyFilters = () => {
    const parsedMonth = Number(pendingMonth);
    const targetMonth = Number.isNaN(parsedMonth) ? month : parsedMonth;
    const parsedYear = Number(pendingYear);
    const targetYear = Number.isNaN(parsedYear) ? year : parsedYear;
    const isCurrentPeriod =
      targetMonth === today.getMonth() && targetYear === today.getFullYear();
    const nextFocusDate = isCurrentPeriod ? new Date(today) : new Date(targetYear, targetMonth, 1);

    setMonth(targetMonth as CalendarState["month"]);
    setYear(targetYear);
    setFocusDate(nextFocusDate);
    setViewMode(pendingView);
    setActiveStatus(pendingStatus);
  };

  const resetFilters = () => {
    const defaultMonth = String(today.getMonth());
    const defaultYear = String(today.getFullYear());
    const defaultView: ViewMode = "month";

    setPendingMonth(defaultMonth);
    setPendingYear(defaultYear);
    setPendingView(defaultView);
    setPendingStatus("all");

    setMonth(today.getMonth() as CalendarState["month"]);
    setYear(today.getFullYear());
    setViewMode(defaultView);
    setFocusDate(today);
    setActiveStatus("all");
  };

  return (
    <div className={cn("min-h-full space-y-6", className)}>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gray-900">Agenda de Cursos</h1>
        <p className="text-sm text-gray-500">Visualize cronogramas, workshops e compromissos em um só lugar.</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <div className="flex flex-wrap items-end gap-4">
            <SelectCustom
              className="min-w-[200px] flex-1"
              size="md"
              label="Mês"
              options={monthOptions}
              value={pendingMonth}
              placeholder="Selecionar mês"
              onChange={(value) => value && setPendingMonth(value)}
            />
            <SelectCustom
              className="min-w-[160px] flex-1"
              size="md"
              label="Ano"
              options={yearOptions}
              value={pendingYear}
              placeholder="Selecionar ano"
              onChange={(value) => value && setPendingYear(value)}
            />
            <SelectCustom
              className="min-w-[200px] flex-1"
              size="md"
              label="Visualização"
              options={viewOptions}
              value={pendingView}
              placeholder="Selecionar visualização"
              onChange={(value) => value && setPendingView(value as ViewMode)}
            />
            <SelectCustom
              className="min-w-[200px] flex-1"
              size="md"
              label="Status"
              options={statusOptions}
              value={pendingStatus}
              placeholder="Selecionar status"
              onChange={(value) => value && setPendingStatus(value as "all" | CalendarStatus["id"])}
            />
            <div className="ml-auto flex items-center gap-2">
              <ButtonCustom variant="outline" size="lg" onClick={resetFilters}>
                Resetar
              </ButtonCustom>
              <ButtonCustom variant="primary" size="lg" onClick={applyFilters}>
                Pesquisar
              </ButtonCustom>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
          <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white">
            <div className="absolute -left-36 top-20 h-56 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -right-32 bottom-16 h-52 w-60 rounded-full bg-secondary/15 blur-[120px]" />

            <CalendarProvider>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-4">
                <span className="text-sm font-semibold text-gray-700">Agenda</span>
                <div className="flex items-center gap-2">
                  <ButtonCustom variant="ghost" size="sm" onClick={handleResetToToday} className="rounded-full px-4">
                    Hoje
                  </ButtonCustom>
                  <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => handleNavigate(-1)}
                      className="inline-flex size-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-primary"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate(1)}
                      className="inline-flex size-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-primary"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
              {viewMode === "month" ? (
                <>
                  <CalendarHeader />
                  <CalendarBody features={filteredEvents}>{({ feature }) => renderInteractiveBadge(feature)}</CalendarBody>
                </>
              ) : viewMode === "week" ? (
                <WeekAgendaView days={weekDays} eventsPerDay={eventsByWeek} focusDate={focusDate} onSelectEvent={handleSelectEvent} />
              ) : (
                <DayAgendaView date={focusDate} events={eventsForDay} onSelectEvent={handleSelectEvent} />
              )}
            </CalendarProvider>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Próximos compromissos</h3>
                  <p className="text-xs text-gray-500">Eventos organizados por data.</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">{upcomingEvents.length}</span>
              </div>
              <div className="mt-5 space-y-4">
                {upcomingEvents.map((event) => (
                  <Tooltip key={event.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleSelectEvent(event)}
                        className="w-full cursor-pointer rounded-2xl border border-gray-100 px-4 py-3 text-left transition hover:-translate-y-1 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-gray-900">{event.name}</span>
                            <span className="text-xs text-gray-500">{formatEventDate(event.endAt)}</span>
                          </div>
                          <span
                            className="inline-flex min-w-[96px] items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
                            style={{ backgroundColor: event.status.color }}
                          >
                            {event.status.name}
                          </span>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Clique aqui para editar.</TooltipContent>
                  </Tooltip>
                ))}
                {upcomingEvents.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-500">
                    Nenhum compromisso agendado para os próximos dias.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ModalCustom
        isOpen={eventModalOpen}
        onOpenChange={(open) => {
          setEventModalOpen(open);
          if (!open) {
            setSelectedEvent(null);
          }
        }}
        size="md"
        backdrop="blur"
      >
        <ModalContentWrapper>
          <ModalHeader>
            <ModalTitle>{selectedEvent?.name ?? "Detalhes do evento"}</ModalTitle>
            {selectedEvent && (
              <ModalDescription className="text-sm text-muted-foreground">
                {formatEventDate(selectedEvent.startAt)} · {selectedEvent.status.name}
              </ModalDescription>
            )}
          </ModalHeader>
          <ModalBody className="space-y-4 text-sm text-muted-foreground">
            {selectedEvent ? (
              <>
                <div className="grid gap-1">
                  <span className="font-medium text-gray-700">Início</span>
                  <span className="text-gray-900">
                    {format(selectedEvent.startAt, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <div className="grid gap-1">
                  <span className="font-medium text-gray-700">Término</span>
                  <span className="text-gray-900">
                    {format(selectedEvent.endAt, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <div className="grid gap-1">
                  <span className="font-medium text-gray-700">Status</span>
                  <span
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold"
                    style={{ backgroundColor: toRgba(selectedEvent.status.color, 0.15), color: selectedEvent.status.color }}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selectedEvent.status.color }} />
                    {selectedEvent.status.name}
                  </span>
                </div>
              </>
            ) : (
              <p>Selecione um evento para visualizar os detalhes.</p>
            )}
          </ModalBody>
          <ModalFooter className="flex items-center justify-end gap-2">
            <ButtonCustom variant="outline" onClick={() => setEventModalOpen(false)}>
              Fechar
            </ButtonCustom>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>
    </div>
  );
}

type WeekAgendaViewProps = {
  days: Date[];
  eventsPerDay: CalendarFeature[][];
  focusDate: Date;
  onSelectEvent: (event: CalendarFeature) => void;
};

function WeekAgendaView({ days, eventsPerDay, focusDate, onSelectEvent }: WeekAgendaViewProps) {
  return (
    <>
      <div className="grid grid-cols-7 border border-gray-200 border-b-0 bg-gray-50 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
        {days.map((day, index) => {
          const label = format(day, "EEE", { locale: ptBR }).replace(/\./g, "").toUpperCase();
          return (
            <div
              key={`${day.toISOString()}-label`}
              className={cn("border-r border-gray-200 px-3 py-4 text-center", index === days.length - 1 && "border-r-0")}
            >
              {label}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7 auto-rows-[148px] overflow-hidden border border-gray-200 border-t-0 bg-white">
        {days.map((day, index) => {
          const isFocused = isSameDay(day, focusDate);
          const isCurrentDay = isSameDay(day, today);
          const eventsForDay = eventsPerDay[index];

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "border-b border-r border-gray-200 bg-white",
                index === days.length - 1 && "border-r-0"
              )}
            >
              <div className="grid h-full w-full grid-rows-[auto,1fr,auto] gap-2 px-3 py-2 text-xs text-gray-500">
                <div className="flex justify-end">
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-sm font-semibold text-gray-600 transition-colors",
                      isCurrentDay && "bg-[#F04438] text-white",
                      !isCurrentDay && isFocused && "text-[var(--primary-color,#2563eb)]"
                    )}
                  >
                    {format(day, "d", { locale: ptBR })}
                  </span>
                </div>
                <div className="space-y-2 overflow-hidden text-muted-foreground">
                  {eventsForDay.slice(0, 4).map((event) => (
                    <Tooltip key={`${event.id}-${index}`}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => onSelectEvent(event)}
                          className="w-full cursor-pointer text-left"
                        >
                          <CalendarItem feature={event} className="w-full cursor-pointer" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Clique aqui para editar.</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                {eventsForDay.length > 4 && (
                  <span className="block text-[11px] font-medium text-gray-400">
                    +{eventsForDay.length - 4} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

type DayAgendaViewProps = {
  date: Date;
  events: CalendarFeature[];
  onSelectEvent: (event: CalendarFeature) => void;
};

function DayAgendaView({ date, events, onSelectEvent }: DayAgendaViewProps) {
  return (
    <div className="space-y-4 px-6 pb-8">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-primary/5 px-4 py-3 text-primary">
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">{format(date, "dd MMM", { locale: ptBR })}</span>
        <span className="text-sm font-semibold text-primary">{formatDayTitle(date)}</span>
      </div>
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-500">
            Nenhum evento registrado para este dia.
          </div>
        ) : (
          events.map((event) => {
            const duration = differenceInMinutes(event.endAt, event.startAt);
            return (
              <Tooltip key={event.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onSelectEvent(event)}
                    className="w-full cursor-pointer rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:-translate-y-[1px] hover:border-primary/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase text-gray-400">
                        {format(event.startAt, "HH:mm", { locale: ptBR })} • {duration} min
                      </span>
                      <span
                        className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-[10px] font-semibold text-white"
                        style={{ backgroundColor: event.status.color }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                        {event.status.name}
                      </span>
                    </div>
                    <div className="mt-2 flex items-start gap-3">
                      <span className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: event.status.color }} />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{event.name}</span>
                        <span className="text-xs text-gray-500">
                          {format(event.startAt, "dd 'de' MMMM", { locale: ptBR })} • {format(event.endAt, "HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Clique aqui para editar.</TooltipContent>
              </Tooltip>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AgendaDashboard;
