import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminCompanyVagaItem } from "@/api/empresas/admin/types";
import { VacancyRow } from "./VacancyRow";

interface VacancyTableProps {
  vacancies: AdminCompanyVagaItem[];
  onView: (vacancy: AdminCompanyVagaItem) => void;
  onEdit: (vacancy: AdminCompanyVagaItem) => void;
  onDelete?: (vacancy: AdminCompanyVagaItem) => void;
  isDeleting?: boolean;
  loadingStates?: Record<string, boolean>;
  errorStates?: Record<string, string>;
  onLoadCandidates?: (vacancyId: string) => void;
}

export function VacancyTable({
  vacancies,
  onView,
  onEdit,
  onDelete,
  isDeleting,
  loadingStates = {},
  errorStates = {},
  onLoadCandidates,
}: VacancyTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 bg-gray-50/50">
            <TableHead className="font-medium text-gray-700 py-4">
              Vaga
            </TableHead>
            <TableHead className="font-medium text-gray-700">Vagas</TableHead>
            <TableHead className="font-medium text-gray-700">
              Candidaturas
            </TableHead>
            <TableHead className="font-medium text-gray-700">
              Publicado em
            </TableHead>
            <TableHead className="font-medium text-gray-700">
              Inscrições até
            </TableHead>
            <TableHead className="font-medium text-gray-700">Status</TableHead>
            <TableHead className="font-medium text-gray-700">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vacancies.map((vacancy, index) => (
            <VacancyRow
              key={vacancy.id}
              vacancy={vacancy}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              index={index}
              isDeleting={isDeleting}
              isLoadingCandidates={loadingStates[vacancy.id] || false}
              candidateError={errorStates[vacancy.id]}
              onLoadCandidates={onLoadCandidates}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default VacancyTable;
