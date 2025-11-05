"use client";

import React, { useMemo, useState } from "react";
import { ButtonCustom, FilterBar, EmptyState } from "@/components/ui/custom";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useCursosForSelect } from "../lista-turmas/hooks/useCursosForSelect";
import { useTurmaOptions } from "../lista-alunos/hooks/useTurmaOptions";
import { listInscricoes } from "@/api/cursos";
import type { TurmaEstagio } from "@/api/cursos";
import { EstagioRow } from "./components/EstagioRow";
import { EstagioTableSkeleton } from "./components/EstagioTableSkeleton";

export function EstagiosDashboard({ className }: { className?: string }) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estagios, setEstagios] = useState<TurmaEstagio[]>([]);

  const { cursos } = useCursosForSelect();
  const { turmas } = useTurmaOptions(selectedCourseId);

  const runFetch = async () => {
    if (!selectedCourseId || !selectedTurmaId) return;
    setLoading(true);
    setError(null);
    try {
      const inscricoes = await listInscricoes(selectedCourseId, selectedTurmaId);
      const normalized: TurmaEstagio[] = [];
      (inscricoes || []).forEach((inscricao: any, inscricaoIndex: number) => {
        const alunoInfo: TurmaEstagio["aluno"] | undefined =
          inscricao?.aluno
            ? {
                id: String(inscricao.aluno.id ?? inscricao.alunoId ?? inscricao.id ?? inscricaoIndex),
                nome: inscricao.aluno.nome,
                email: inscricao.aluno.email,
                telefone: inscricao.aluno.telefone,
              }
            : inscricao?.alunoId
            ? { id: String(inscricao.alunoId) }
            : undefined;

        const estagiosArray: any[] = [];
        if (Array.isArray(inscricao?.estagios)) {
          estagiosArray.push(...inscricao.estagios);
        }
        if (inscricao?.estagio) {
          estagiosArray.push(inscricao.estagio);
        }

        if (estagiosArray.length === 0 && alunoInfo) {
          // Nenhum estágio para este aluno; não adiciona linha
          return;
        }

        estagiosArray.forEach((estagio: any, estagioIndex: number) => {
          const safeId =
            estagio?.id != null
              ? String(estagio.id)
              : `estagio-${inscricaoIndex}-${estagioIndex}`;
          normalized.push({
            id: safeId,
            status: estagio?.status,
            empresa:
              estagio?.empresa != null
                ? String(estagio.empresa)
                : estagio?.empresaNome != null
                ? String(estagio.empresaNome)
                : estagio?.empresaId != null
                ? String(estagio.empresaId)
                : undefined,
            cargo: estagio?.cargo || estagio?.funcao,
            criadoEm: estagio?.criadoEm || estagio?.dataInicio,
            atualizadoEm: estagio?.atualizadoEm || estagio?.dataFim,
            inicioPrevisto: estagio?.dataInicioPrevista,
            fimPrevisto: estagio?.dataFimPrevista,
            aluno: alunoInfo,
          });
        });
      });

      setEstagios(normalized);
      if (normalized.length === 0) {
        setError("Nenhum estágio encontrado.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar estágios.");
      setEstagios([]);
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
                setEstagios([]);
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

      {!loading && (!selectedCourseId || !selectedTurmaId || estagios.length === 0) ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <EmptyState
            fullHeight
            maxContentWidth="sm"
            illustration="books"
            illustrationAlt="Ilustração de estágios"
            title={
              !selectedCourseId || !selectedTurmaId
                ? "Selecione curso e turma"
                : "Nenhum estágio encontrado"
            }
            description={
              !selectedCourseId || !selectedTurmaId
                ? "Selecione o curso e a turma para listar os estágios disponíveis."
                : error || "Nenhum estágio encontrado para os filtros aplicados. Tente ajustar sua busca."
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
                <TableHead className="font-medium text-gray-700">Empresa</TableHead>
                <TableHead className="font-medium text-gray-700">Status</TableHead>
                <TableHead className="font-medium text-gray-700">Atualizado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && <EstagioTableSkeleton rows={6} />}
              {!loading &&
                estagios.map((estagio, index) => {
                  const safeId = estagio?.id != null ? String(estagio.id) : `estagio-${index}`;
                  return <EstagioRow key={safeId} estagio={{ ...estagio, id: safeId }} />;
                })}
            </TableBody>
          </Table>
        </div>
      </div>
      )}
    </div>
  );
}

export default EstagiosDashboard;
