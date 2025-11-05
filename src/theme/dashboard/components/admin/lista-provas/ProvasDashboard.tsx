"use client";

import React, { useMemo, useState } from "react";
import { ButtonCustom, FilterBar, EmptyState } from "@/components/ui/custom";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useCursosForSelect } from "../lista-turmas/hooks/useCursosForSelect";
import { useTurmaOptions } from "../lista-alunos/hooks/useTurmaOptions";
import { listProvas } from "@/api/cursos";
import type { TurmaProva } from "@/api/cursos";
import { ProvaRow } from "./components/ProvaRow";
import { ProvaTableSkeleton } from "./components/ProvaTableSkeleton";

export function ProvasDashboard({ className }: { className?: string }) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provas, setProvas] = useState<TurmaProva[]>([]);

  const { cursos } = useCursosForSelect();
  const { turmas } = useTurmaOptions(selectedCourseId);

  const runFetch = async () => {
    if (!selectedCourseId || !selectedTurmaId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listProvas(selectedCourseId, selectedTurmaId);
      setProvas(data || []);
      if (!data || data.length === 0) {
        setError("Nenhuma prova encontrada.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar provas.");
      setProvas([]);
    } finally {
      setLoading(false);
    }
  };

  const filterFields = useMemo(
    () => [
      { key: "curso", label: "Curso", options: cursos, placeholder: "Selecionar" },
      { key: "turma", label: "Turma", options: turmas, placeholder: selectedCourseId ? "Selecionar" : "Selecione um curso" },
    ],
    [cursos, turmas, selectedCourseId]
  );

  const filterValues = useMemo(
    () => ({ curso: selectedCourseId, turma: selectedTurmaId }),
    [selectedCourseId, selectedTurmaId]
  );

  return (
    <div className={cn("min-h-full space-y-4", className)}>
      <div className="border-b border-gray-200 top-0 z-10">
        <div className="py-4">
          <FilterBar
            fields={filterFields as any}
            values={filterValues as any}
            onChange={(key, value) => {
              if (key === "curso") {
                setSelectedCourseId((value as string) || null);
                setSelectedTurmaId(null);
                setProvas([]);
                setError(null);
              }
              if (key === "turma") {
                setSelectedTurmaId((value as string) || null);
              }
            }}
            rightActions={
              <ButtonCustom variant="primary" size="lg" onClick={runFetch} disabled={!selectedCourseId || !selectedTurmaId || loading}>
                Pesquisar
              </ButtonCustom>
            }
          />
        </div>
      </div>

      {!loading && (!selectedCourseId || !selectedTurmaId || provas.length === 0) ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <EmptyState
            fullHeight
            maxContentWidth="sm"
            illustration="books"
            illustrationAlt="Ilustração de provas"
            title={
              !selectedCourseId || !selectedTurmaId
                ? "Selecione curso e turma"
                : "Nenhuma prova encontrada"
            }
            description={
              !selectedCourseId || !selectedTurmaId
                ? "Selecione o curso e a turma para listar as provas disponíveis."
                : error || "Nenhuma prova encontrada para os filtros aplicados. Tente ajustar sua busca."
            }
          />
        </div>
      ) : (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="border-gray-200 bg-gray-50/50">
                <TableHead className="font-medium text-gray-700 py-4">Prova</TableHead>
                <TableHead className="font-medium text-gray-700">Tipo</TableHead>
                <TableHead className="font-medium text-gray-700">Início</TableHead>
                <TableHead className="font-medium text-gray-700">Fim</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && <ProvaTableSkeleton rows={6} />}
              {!loading &&
                provas.map((prova, index) => {
                  const safeId = prova?.id != null ? String(prova.id) : `prova-${index}`;
                  return <ProvaRow key={safeId} prova={{ ...prova, id: safeId }} />;
                })}
            </TableBody>
          </Table>
        </div>
      </div>
      )}
    </div>
  );
}

export default ProvasDashboard;
