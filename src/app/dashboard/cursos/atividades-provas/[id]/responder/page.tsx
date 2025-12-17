"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { ButtonCustom, EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useQuestoes,
  useRespostas,
  useResponderQuestao,
} from "@/theme/dashboard/components/admin/lista-atividades-provas/hooks";
import { ResponderQuestao } from "@/theme/dashboard/components/admin/lista-atividades-provas/components/ResponderQuestao";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

/**
 * Página para aluno responder uma prova
 * Rota: /dashboard/cursos/atividades-provas/[id]/responder?cursoId=X&turmaId=Y&inscricaoId=Z
 */
export default function ResponderProvaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const provaId = params?.id as string;

  // Obter parâmetros da URL
  const cursoId = searchParams?.get("cursoId") || "";
  const turmaId = searchParams?.get("turmaId") || "";
  const inscricaoIdParam = searchParams?.get("inscricaoId") || "";
  
  // Estado para inscricaoId (pode vir da URL ou do usuário)
  const [inscricaoId, setInscricaoId] = useState<string>(inscricaoIdParam);

  // Buscar questões
  const {
    data: questoes,
    isLoading: loadingQuestoes,
    error: errorQuestoes,
  } = useQuestoes({
    cursoId,
    turmaId,
    provaId,
    enabled: !!cursoId && !!turmaId && !!provaId,
  });

  // Buscar respostas do aluno atual
  const {
    data: respostas,
    isLoading: loadingRespostas,
  } = useRespostas({
    cursoId,
    turmaId,
    provaId,
    params: {
      inscricaoId: inscricaoId || undefined,
    },
    enabled: !!cursoId && !!turmaId && !!provaId && !!inscricaoId,
  });

  const responderQuestao = useResponderQuestao({
    cursoId,
    turmaId,
    provaId,
  });

  // Atualizar inscricaoId quando vier da URL
  useEffect(() => {
    if (inscricaoIdParam) {
      setInscricaoId(inscricaoIdParam);
    }
  }, [inscricaoIdParam]);

  // Criar mapa de respostas por questão
  const respostasMap = React.useMemo(() => {
    if (!respostas) return {};
    const map: Record<string, typeof respostas[0]> = {};
    respostas.forEach((r) => {
      map[r.questaoId] = r;
    });
    return map;
  }, [respostas]);

  // Verificar se todas questões obrigatórias foram respondidas
  const questoesObrigatoriasRespondidas = React.useMemo(() => {
    if (!questoes) return { total: 0, respondidas: 0 };
    const obrigatorias = questoes.filter((q) => q.obrigatoria);
    const respondidas = obrigatorias.filter((q) => respostasMap[q.id]);
    return {
      total: obrigatorias.length,
      respondidas: respondidas.length,
    };
  }, [questoes, respostasMap]);

  const handleSuccess = () => {
    // Refetch respostas após salvar
    // O hook já invalida o cache automaticamente
  };

  if (loadingQuestoes || loadingRespostas) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (errorQuestoes) {
    return (
      <div className="space-y-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar questões: {errorQuestoes.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!cursoId || !turmaId || !inscricaoId) {
    return (
      <div className="space-y-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {!cursoId || !turmaId
              ? "Não foi possível identificar o contexto da prova. Por favor, acesse a prova através da turma."
              : "Não foi possível identificar sua inscrição. Por favor, acesse a prova através da turma."}
          </AlertDescription>
        </Alert>
        <Link href="/dashboard/cursos/atividades-provas">
          <ButtonCustom variant="outline" icon="ArrowLeft">
            Voltar para Provas
          </ButtonCustom>
        </Link>
      </div>
    );
  }

  if (!questoes || questoes.length === 0) {
    return (
      <div className="space-y-8">
        <EmptyState
          illustration="books"
          title="Nenhuma questão encontrada"
          description="Esta prova ainda não possui questões cadastradas."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Link href={`/dashboard/cursos/atividades-provas/${provaId}`}>
                <ButtonCustom variant="ghost" size="sm" icon="ArrowLeft">
                  Voltar
                </ButtonCustom>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">
                Responder Prova
              </h1>
            </div>

            {/* Progresso */}
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {questoesObrigatoriasRespondidas.respondidas} / {questoesObrigatoriasRespondidas.total} questões obrigatórias respondidas
              </Badge>
              {questoesObrigatoriasRespondidas.respondidas === questoesObrigatoriasRespondidas.total && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Todas respondidas
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de questões */}
      <div className="space-y-6">
        {questoes.map((questao, index) => {
          const respostaAtual = respostasMap[questao.id];
          return (
            <div
              key={questao.id}
              className={cn(
                "bg-white rounded-xl border",
                respostaAtual
                  ? "border-green-200 bg-green-50/30"
                  : "border-gray-200"
              )}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">
                    Questão {questao.ordem}
                  </span>
                  {questao.peso && (
                    <Badge variant="outline" className="text-xs">
                      Peso: {questao.peso}
                    </Badge>
                  )}
                  {questao.obrigatoria && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                      Obrigatória
                    </Badge>
                  )}
                </div>
                {respostaAtual && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Respondida
                  </Badge>
                )}
              </div>

              <div className="p-6">
                <ResponderQuestao
                  cursoId={cursoId}
                  turmaId={turmaId}
                  provaId={provaId}
                  questao={questao}
                  inscricaoId={inscricaoId}
                  respostaAtual={respostaAtual}
                  onSuccess={handleSuccess}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

