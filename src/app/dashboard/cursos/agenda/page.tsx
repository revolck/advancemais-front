"use client";

import { AgendaCursosCalendar, FullCalendarStyles } from "@/theme/dashboard/components/admin/agenda-cursos";

export default function DashboardAgendaPage() {
  return (
    <>
      <FullCalendarStyles />
      <div className="space-y-8">
        <AgendaCursosCalendar />
      </div>
    </>
  );
}

