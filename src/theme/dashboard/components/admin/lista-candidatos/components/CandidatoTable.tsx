"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CandidatoRow } from "./CandidatoRow";
import { CandidatoTableSkeleton } from "./CandidatoTableSkeleton";
import { CANDIDATO_TABLE_COLUMNS } from "../constants";
import type { CandidatoTableProps } from "../types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { EmptyState } from "@/components/ui/custom";

export function CandidatoTable({
  candidatos,
  isLoading,
  onViewDetails,
  sortField,
  sortDirection,
  onToggleSortName,
  onSetSortName,
}: CandidatoTableProps) {
  const columnClassName: Record<string, string> = {
    candidato: "",
    contato: "w-[220px]",
    localizacao: "w-[200px]",
    candidaturas: "text-center",
    ultimaAtividade: "text-center",
    acoes: "w-12 text-right",
  };
  const renderHeaderCell = (
    column: (typeof CANDIDATO_TABLE_COLUMNS)[number]
  ) => {
    if (column.key === "candidato") {
      return (
        <TableHead
          key={column.key}
          className={cn(
            "font-medium text-gray-700 py-4",
            columnClassName[column.key] || ""
          )}
          aria-sort={
            sortField === "name"
              ? sortDirection === "asc"
                ? "ascending"
                : "descending"
              : "none"
          }
        >
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleSortName}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
                sortField === "name" && "text-gray-900"
              )}
            >
              {column.label}
            </button>

            <div className="ml-1 flex flex-col -space-y-1.5 items-center leading-none">
              <button
                type="button"
                className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                aria-label="Ordenar A → Z"
                onClick={() => onSetSortName("asc")}
              >
                <ChevronUp
                  className={cn(
                    "h-3 w-3 text-gray-400",
                    sortField === "name" &&
                      sortDirection === "desc" &&
                      "text-[var(--primary-color)]"
                  )}
                />
              </button>
              <button
                type="button"
                className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                aria-label="Ordenar Z → A"
                onClick={() => onSetSortName("desc")}
              >
                <ChevronDown
                  className={cn(
                    "h-3 w-3 text-gray-400 -mt-0.5",
                    sortField === "name" &&
                      sortDirection === "asc" &&
                      "text-[var(--primary-color)]"
                  )}
                />
              </button>
            </div>
          </div>
        </TableHead>
      );
    }

    return (
      <TableHead
        key={column.key}
        className={cn(
          "font-medium text-gray-700 py-4",
          columnClassName[column.key] || ""
        )}
      >
        {column.label}
      </TableHead>
    );
  };

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 bg-gray-50/50">
            {CANDIDATO_TABLE_COLUMNS.map((column) => renderHeaderCell(column))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <CandidatoTableSkeleton />
        </TableBody>
      </Table>
    );
  }

  if (candidatos.length === 0) {
    return (
      <EmptyState
        fullHeight
        maxContentWidth="sm"
        illustration="userProfiles"
        illustrationAlt="Ilustração de perfis de usuários"
        title="Nenhum candidato encontrado"
        description="Revise os filtros aplicados ou verifique se há candidaturas cadastradas no sistema."
      />
    );
  }

  return (
    <Table className="min-w-[960px]">
      <TableHeader>
        <TableRow className="border-gray-200 bg-gray-50/50">
          {CANDIDATO_TABLE_COLUMNS.map((column) => renderHeaderCell(column))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidatos.map((candidato) => (
          <CandidatoRow
            key={candidato.id}
            candidato={candidato}
            onViewDetails={onViewDetails}
          />
        ))}
      </TableBody>
    </Table>
  );
}
