"use client";

import React, { useMemo, useState } from "react";
import { ButtonCustom, FilterBar, EmptyState } from "@/components/ui/custom";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useCursosForSelect } from "../lista-turmas/hooks/useCursosForSelect";
import { useTurmaOptions } from "../lista-alunos/hooks/useTurmaOptions";
import { listCertificados } from "@/api/cursos";
import type { TurmaCertificado } from "@/api/cursos";
import { CertificadoRow } from "./components/CertificadoRow";
import { CertificadoTableSkeleton } from "./components/CertificadoTableSkeleton";

export function CertificadosDashboard({ className }: { className?: string }) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificados, setCertificados] = useState<TurmaCertificado[]>([]);

  const { cursos } = useCursosForSelect();
  const { turmas } = useTurmaOptions(selectedCourseId);

  const runFetch = async () => {
    if (!selectedCourseId || !selectedTurmaId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listCertificados(selectedCourseId, selectedTurmaId);
      setCertificados(data || []);
      if (!data || data.length === 0) {
        setError("Nenhum certificado encontrado.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar certificados.");
      setCertificados([]);
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
                setCertificados([]);
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

      {!loading && (!selectedCourseId || !selectedTurmaId || certificados.length === 0) ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <EmptyState
            fullHeight
            maxContentWidth="sm"
            illustration="books"
            illustrationAlt="Ilustração de certificados"
            title={
              !selectedCourseId || !selectedTurmaId
                ? "Selecione curso e turma"
                : "Nenhum certificado encontrado"
            }
            description={
              !selectedCourseId || !selectedTurmaId
                ? "Selecione o curso e a turma para listar os certificados disponíveis."
                : error || "Nenhum certificado encontrado para os filtros aplicados. Tente ajustar sua busca."
            }
          />
        </div>
      ) : (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="border-gray-200 bg-gray-50/50">
                <TableHead className="font-medium text-gray-700 py-4">Aluno</TableHead>
                <TableHead className="font-medium text-gray-700">Código</TableHead>
                <TableHead className="font-medium text-gray-700">Emitido em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && <CertificadoTableSkeleton rows={6} />}
              {!loading &&
                certificados.map((certificado, index) => {
                  const safeId = certificado?.id != null ? String(certificado.id) : `certificado-${index}`;
                  return <CertificadoRow key={safeId} certificado={{ ...certificado, id: safeId }} />;
                })}
            </TableBody>
          </Table>
        </div>
      </div>
      )}
    </div>
  );
}

export default CertificadosDashboard;
