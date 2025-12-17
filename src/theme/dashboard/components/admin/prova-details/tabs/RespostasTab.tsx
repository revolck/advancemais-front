"use client";

import React, { useState } from "react";
import { useRespostas } from "@/theme/dashboard/components/admin/lista-atividades-provas/hooks/useRespostas";
import { CorrigirResposta } from "@/theme/dashboard/components/admin/lista-atividades-provas/components/CorrigirResposta";
import { SelectCustom, ButtonCustom, EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RespostasTabProps {
  cursoId: number | string;
  turmaId: string;
  provaId: string;
}

export function RespostasTab({
  cursoId,
  turmaId,
  provaId,
}: RespostasTabProps) {
  const [questaoFiltro, setQuestaoFiltro] = useState<string>("");
  const [inscricaoFiltro, setInscricaoFiltro] = useState<string>("");
  const [refetchKey, setRefetchKey] = useState(0);

  const handleQuestaoFiltroChange = (value: string | null) => {
    setQuestaoFiltro(value ?? "");
  };

  const handleInscricaoFiltroChange = (value: string | null) => {
    setInscricaoFiltro(value ?? "");
  };

  const { data: respostas, isLoading, error, refetch } = useRespostas({
    cursoId,
    turmaId,
    provaId,
    params: {
      ...(questaoFiltro ? { questaoId: questaoFiltro } : {}),
      ...(inscricaoFiltro ? { inscricaoId: inscricaoFiltro } : {}),
    },
  });

  const handleSuccess = () => {
    setRefetchKey((prev) => prev + 1);
    refetch();
  };

  // Agrupar respostas por inscrição
  const respostasPorInscricao = React.useMemo(() => {
    if (!respostas) return {};

    const agrupadas: Record<string, typeof respostas> = {};
    respostas.forEach((resposta) => {
      const key = resposta.inscricaoId;
      if (!agrupadas[key]) {
        agrupadas[key] = [];
      }
      agrupadas[key].push(resposta);
    });

    return agrupadas;
  }, [respostas]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar respostas: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!respostas || respostas.length === 0) {
    return (
      <EmptyState
        illustration="books"
        title="Nenhuma resposta encontrada"
        description="Ainda não há respostas para esta prova."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Respostas dos Alunos
        </h2>
        <p className="text-sm text-gray-600">
          Visualize e corrija as respostas dos alunos para esta prova.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <SelectCustom
            value={questaoFiltro}
            onChange={handleQuestaoFiltroChange}
            options={[
              { value: "", label: "Todas as questões" },
              ...Array.from(
                new Set(respostas.map((r) => r.questao.id))
              ).map((questaoId) => {
                const questao = respostas.find((r) => r.questao.id === questaoId)?.questao;
                return {
                  value: questaoId,
                  label: questao?.enunciado?.substring(0, 50) || questaoId,
                };
              }),
            ]}
            placeholder="Filtrar por questão"
          />
        </div>
        <div className="flex-1">
          <SelectCustom
            value={inscricaoFiltro}
            onChange={handleInscricaoFiltroChange}
            options={[
              { value: "", label: "Todos os alunos" },
              ...Object.keys(respostasPorInscricao).map((inscricaoId) => ({
                value: inscricaoId,
                label: `Inscrição ${inscricaoId.substring(0, 8)}...`,
              })),
            ]}
            placeholder="Filtrar por aluno"
          />
        </div>
        {(questaoFiltro || inscricaoFiltro) && (
          <ButtonCustom
            variant="outline"
            onClick={() => {
              setQuestaoFiltro("");
              setInscricaoFiltro("");
            }}
          >
            Limpar Filtros
          </ButtonCustom>
        )}
      </div>

      {/* Lista de respostas agrupadas por inscrição */}
      <div className="space-y-6">
        {Object.entries(respostasPorInscricao).map(([inscricaoId, respostasInscricao]) => (
          <div
            key={inscricaoId}
            className="border rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Inscrição: {inscricaoId.substring(0, 8)}...
              </h3>
              <Badge variant="outline">
                {respostasInscricao.filter((r) => r.corrigida).length} / {respostasInscricao.length} corrigidas
              </Badge>
            </div>

            <div className="space-y-4">
              {respostasInscricao.map((resposta) => (
                <CorrigirResposta
                  key={resposta.id}
                  cursoId={cursoId}
                  turmaId={turmaId}
                  provaId={provaId}
                  resposta={resposta}
                  onSuccess={handleSuccess}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

