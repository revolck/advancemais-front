import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminCompanyVacancyListItem } from "@/api/empresas/admin/types";
import { VacancyRow } from "./VacancyRow";

interface VacancyTableProps {
  vacancies: AdminCompanyVacancyListItem[];
  onView: (vacancy: AdminCompanyVacancyListItem) => void;
  onEdit: (vacancy: AdminCompanyVacancyListItem) => void;
  getCandidateAvatars?: (vacancy: AdminCompanyVacancyListItem) => string[];
}

export function VacancyTable({ vacancies, onView, onEdit, getCandidateAvatars }: VacancyTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-200 bg-gray-50/50">
          <TableHead className="font-medium text-gray-700 py-4">Vaga</TableHead>
          <TableHead className="font-medium text-gray-700">Regime/Modalidade</TableHead>
          <TableHead className="font-medium text-gray-700">Candidatos/Inscrições</TableHead>
          <TableHead className="font-medium text-gray-700">Publicado/Inscrições até</TableHead>
          <TableHead className="font-medium text-gray-700">Status</TableHead>
          <TableHead className="w-40" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {vacancies.map((vacancy) => (
          <VacancyRow
            key={vacancy.id}
            vacancy={vacancy}
            onView={onView}
            onEdit={onEdit}
            candidateAvatars={getCandidateAvatars?.(vacancy) ?? []}
          />
        ))}
      </TableBody>
    </Table>
  );
}

export default VacancyTable;
