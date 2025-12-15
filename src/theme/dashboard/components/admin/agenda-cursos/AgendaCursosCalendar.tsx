"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Video,
  Building2,
  Radio,
  FileText,
  Cake,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { getAgenda, type AgendaEvento } from "@/api/aulas";
import { startOfMonth, endOfMonth } from "date-fns";
import type { EventClickArg, EventInput } from "@fullcalendar/core";

// Cores dos eventos
const EVENT_COLORS = {
  AULA: "#3B82F6", // Azul
  PROVA: "#EF4444", // Vermelho
  ATIVIDADE: "#8B5CF6", // Roxo
  ANIVERSARIO: "#10B981", // Verde
  TURMA_INICIO: "#6366F1", // Indigo
  TURMA_FIM: "#F59E0B", // Amber
} as const;

// Ícones dos eventos
const EVENT_ICONS = {
  AULA: Video,
  PROVA: FileText,
  ATIVIDADE: FileText,
  ANIVERSARIO: Cake,
  TURMA_INICIO: GraduationCap,
  TURMA_FIM: GraduationCap,
} as const;

type EventType = keyof typeof EVENT_COLORS;

export function AgendaCursosCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([
    "AULA",
    "PROVA",
    "ATIVIDADE",
    "ANIVERSARIO",
    "TURMA_INICIO",
    "TURMA_FIM",
  ]);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvento | null>(null);

  const dataInicio = startOfMonth(currentMonth).toISOString();
  const dataFim = endOfMonth(currentMonth).toISOString();

  // Buscar eventos da API
  const {
    data: agendaData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["agenda", dataInicio, dataFim, selectedTypes],
    queryFn: () =>
      getAgenda({
        dataInicio,
        dataFim,
        tipos: selectedTypes,
      }),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  // Transformar eventos da API para formato FullCalendar
  const events: EventInput[] = useMemo(() => {
    if (!agendaData?.eventos) return [];

    return agendaData.eventos.map((evento) => {
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
  }, [agendaData]);

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
    { value: "ANIVERSARIO", label: "Aniversários", icon: Cake },
    { value: "TURMA_INICIO", label: "Início de Turmas", icon: GraduationCap },
    { value: "TURMA_FIM", label: "Fim de Turmas", icon: GraduationCap },
  ];

  const toggleType = (type: EventType) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

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
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agenda de Cursos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros de tipo */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Filtrar por tipo:
            </h4>
            <div className="flex flex-wrap gap-4">
              {tipoOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedTypes.includes(option.value);
                return (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={isSelected}
                      onCheckedChange={() => toggleType(option.value)}
                    />
                    <Label
                      htmlFor={option.value}
                      className="flex items-center gap-2 cursor-pointer text-sm font-normal"
                    >
                      <Icon
                        className="h-4 w-4"
                        style={{
                          color: EVENT_COLORS[option.value],
                        }}
                      />
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendário */}
          {isLoading ? (
            <Skeleton className="h-[600px] w-full rounded-lg" />
          ) : (
            <div className="fullcalendar-wrapper">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={ptBrLocale}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                buttonText={{
                  today: "Hoje",
                  month: "Mês",
                  week: "Semana",
                  day: "Dia",
                }}
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
                  setCurrentMonth(dateInfo.start);
                }}
                nowIndicator={true}
                allDaySlot={true}
                allDayText="Dia inteiro"
                weekends={true}
                firstDay={0} // Domingo
                dayMaxEvents={3}
                moreLinkText={(num) => `+${num} mais`}
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

function EventDetailsModal({
  evento,
  open,
  onOpenChange,
}: EventDetailsModalProps) {
  const Icon = EVENT_ICONS[evento.tipo] || Calendar;
  const color = EVENT_COLORS[evento.tipo] || "#6B7280";

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "block" : "hidden"}`}
      onClick={() => onOpenChange(false)}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Card
          className="w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="h-6 w-6" style={{ color }} />
              </div>
              <div className="flex-1">
                <CardTitle>{evento.titulo}</CardTitle>
                <Badge
                  variant="outline"
                  className="mt-1"
                  style={{
                    backgroundColor: `${color}20`,
                    color,
                    borderColor: color,
                  }}
                >
                  {evento.tipo.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {evento.descricao && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Descrição
                </h4>
                <p className="text-sm text-gray-600">{evento.descricao}</p>
              </div>
            )}

            {(evento.dataInicio || evento.data) && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Data/Horário
                </h4>
                <p className="text-sm text-gray-600">
                  {evento.dataInicio
                    ? `${formatDateTime(evento.dataInicio)}${
                        evento.dataFim
                          ? ` - ${new Date(evento.dataFim).toLocaleTimeString(
                              "pt-BR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}`
                          : ""
                      }`
                    : formatDateTime(evento.data)}
                </p>
              </div>
            )}

            {evento.turma && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Turma
                </h4>
                <p className="text-sm text-gray-600">{evento.turma.nome}</p>
              </div>
            )}

            {evento.modalidade && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Modalidade
                </h4>
                <Badge variant="outline">{evento.modalidade}</Badge>
              </div>
            )}

            {evento.meetUrl && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Google Meet
                </h4>
                <a
                  href={evento.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Entrar na sala
                </a>
              </div>
            )}

            {evento.usuario && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  {evento.tipo === "ANIVERSARIO" ? "Aniversariante" : "Responsável"}
                </h4>
                <p className="text-sm text-gray-600">{evento.usuario.nome}</p>
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={() => onOpenChange(false)}
                className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
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
      --fc-today-bg-color: #dbeafe;
    }

    .fc .fc-button {
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 500;
      text-transform: none;
    }

    .fc .fc-toolbar-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
    }

    .fc .fc-daygrid-day-number {
      color: #374151;
      padding: 0.5rem;
      font-weight: 500;
    }

    .fc .fc-col-header-cell-cushion {
      color: #6b7280;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .fc .fc-event {
      border-radius: 0.375rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
      cursor: pointer;
      border-width: 1px;
    }

    .fc .fc-event:hover {
      opacity: 0.9;
    }

    .fc .fc-daygrid-day.fc-day-today {
      background-color: #dbeafe !important;
    }

    .fc .fc-highlight {
      background-color: #fef3c7;
    }
  `}</style>
);



