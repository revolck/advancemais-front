"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Copy, CheckCircle2, XCircle, Key } from "lucide-react";
import { ButtonCustom, EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  listProvaTokens,
  getProvaById,
  type ProvaToken,
  type ListProvaTokensResponse,
  type TurmaProva,
} from "@/api/cursos";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/config/roles";
import { toastCustom } from "@/components/ui/custom";
import {
  RECUPERACAO_PAGAMENTO_VALOR_CENTS,
  isRecuperacaoPagamentoPago,
  registrarRecuperacaoPagamento,
} from "@/mockData/recuperacaoPagamento";
import {
  getNotaForEnrollmentFromStore,
  getNotasStoreSnapshot,
} from "@/mockData/notas";

interface TokensTabProps {
  cursoId: number | string;
  turmaId: string;
  provaId: string;
}

/**
 * Aba para visualizar tokens únicos de provas/atividades online ou ao vivo
 * Controle de acesso:
 * - Usuário: vê apenas seu próprio token
 * - Instrutor: vê tokens da prova/atividade que ele é instrutor
 * - Admin, Moderador, Pedagógico: veem todos os tokens
 */
export function TokensTab({ cursoId, turmaId, provaId }: TokensTabProps) {
  const { user } = useAuth();
  const [, setPaymentsRefresh] = React.useState(0);

  // Buscar dados da prova para verificar modalidade e instrutor
  const { data: prova } = useQuery<TurmaProva>({
    queryKey: ["prova", cursoId, turmaId, provaId],
    queryFn: () => getProvaById(cursoId, turmaId, provaId),
    staleTime: 5 * 60 * 1000,
  });

  // Buscar tokens
  const {
    data: tokensResponse,
    isLoading,
    error,
  } = useQuery<ListProvaTokensResponse>({
    queryKey: ["prova-tokens", cursoId, turmaId, provaId],
    queryFn: () => listProvaTokens(cursoId, turmaId, provaId),
    enabled:
      !!prova &&
      (prova.modalidade === "ONLINE" || prova.modalidade === "AO_VIVO"),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  const tokens = useMemo(() => tokensResponse?.data || [], [tokensResponse?.data]);

  // Verificar permissões de acesso
  const canViewAllTokens = useMemo(() => {
    if (!user) return false;

    const role = user.role as UserRole;

    // Admin, Moderador e Pedagógico veem todos
    if (
      [UserRole.ADMIN, UserRole.MODERADOR, UserRole.PEDAGOGICO].includes(role)
    ) {
      return true;
    }

    // Instrutor vê apenas se for o instrutor da prova
    if (role === UserRole.INSTRUTOR) {
      // Verificar se o usuário é o instrutor da prova
      // Isso precisa ser verificado no backend também
      return true; // Por enquanto permite, backend deve validar
    }

    return false;
  }, [user]);

  // Filtrar tokens baseado em permissões
  const visibleTokens = useMemo(() => {
    if (canViewAllTokens) {
      return tokens;
    }

    // Usuário comum vê apenas seu próprio token
    // Isso requer buscar a inscrição do usuário atual
    // Por enquanto, retorna vazio se não tiver permissão
    return [];
  }, [tokens, canViewAllTokens]);

  // Verificar se a prova é online ou ao vivo
  const isOnlineOrLive = useMemo(() => {
    return prova?.modalidade === "ONLINE" || prova?.modalidade === "AO_VIVO";
  }, [prova]);

  // Estatísticas - deve ser calculado antes de qualquer return
  const stats = useMemo(() => {
    const total = visibleTokens.length;
    const respondidos = visibleTokens.filter((t) => t.respondido).length;
    const naoRespondidos = total - respondidos;
    const comNota = visibleTokens.filter(
      (t) => t.nota !== null && t.nota !== undefined
    ).length;

    return { total, respondidos, naoRespondidos, comNota };
  }, [visibleTokens]);

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toastCustom.success("Token copiado para a área de transferência!");
  };

  const formatBRL = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const notasStore = getNotasStoreSnapshot();

  if (!isOnlineOrLive) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tokens únicos são gerados apenas para provas/atividades com
            modalidade Online ou Ao Vivo.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar tokens:{" "}
            {error instanceof Error ? error.message : "Erro desconhecido"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (visibleTokens.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          illustration="books"
          title="Nenhum token encontrado"
          description={
            canViewAllTokens
              ? "Nenhum token foi gerado para esta prova/atividade ainda."
              : "Você não tem permissão para visualizar tokens ou não há tokens disponíveis."
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">
            Total de Tokens
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Respondidos</div>
          <div className="text-2xl font-bold text-green-900">
            {stats.respondidos}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-600 font-medium">
            Não Respondidos
          </div>
          <div className="text-2xl font-bold text-yellow-900">
            {stats.naoRespondidos}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium">Com Nota</div>
          <div className="text-2xl font-bold text-purple-900">
            {stats.comNota}
          </div>
        </div>
      </div>

      {/* Lista de Tokens */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Tokens dos Alunos
        </h3>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aluno
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nota
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Respondido em
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pagamento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visibleTokens.map((token) => (
                  <tr key={token.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {token.aluno?.nomeCompleto ||
                              token.aluno?.nome ||
                              "Aluno não identificado"}
                          </div>
                          {token.aluno?.email && (
                            <div className="text-xs text-gray-500">
                              {token.aluno.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {token.token.substring(0, 20)}...
                        </code>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {token.respondido ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Respondido
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-700 border-yellow-200"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {token.nota !== null && token.nota !== undefined ? (
                        <span className="text-sm font-medium text-gray-900">
                          {token.nota.toFixed(1)} / 10
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {token.respondidoEm
                        ? new Date(token.respondidoEm).toLocaleString("pt-BR")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {(() => {
                        const alunoId =
                          token.inscricao?.alunoId || token.aluno?.id || null;
                        if (!alunoId) {
                          return (
                            <span className="text-sm text-gray-400">—</span>
                          );
                        }

                        const notaFinal =
                          getNotaForEnrollmentFromStore(notasStore, {
                            cursoId: String(cursoId),
                            turmaId,
                            alunoId,
                          }).nota ?? 0;

                        const needsPayment = notaFinal <= 6;
                        if (!needsPayment) {
                          return (
                            <span className="text-sm text-gray-400">—</span>
                          );
                        }

                        const paid = isRecuperacaoPagamentoPago({
                          cursoId: String(cursoId),
                          turmaId,
                          provaId,
                          inscricaoId: token.inscricaoId,
                        });

                        return paid ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Pago
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200"
                          >
                            Pendente
                          </Badge>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {(() => {
                        const alunoId =
                          token.inscricao?.alunoId || token.aluno?.id || null;
                        const notaFinal =
                          alunoId
                            ? getNotaForEnrollmentFromStore(notasStore, {
                                cursoId: String(cursoId),
                                turmaId,
                                alunoId,
                              }).nota ?? 0
                            : 0;
                        const needsPayment = Boolean(alunoId && notaFinal <= 6);
                        const paid = needsPayment
                          ? isRecuperacaoPagamentoPago({
                              cursoId: String(cursoId),
                              turmaId,
                              provaId,
                              inscricaoId: token.inscricaoId,
                            })
                          : true;

                        const disabled = needsPayment && !paid;

                        return (
                          <div className="flex items-center gap-2">
                            <ButtonCustom
                              variant="ghost"
                              size="sm"
                              icon="Copy"
                              disabled={disabled}
                              title={
                                disabled
                                  ? `Pagamento pendente (${formatBRL(
                                      RECUPERACAO_PAGAMENTO_VALOR_CENTS
                                    )}) — aluno reprovado`
                                  : undefined
                              }
                              onClick={() => handleCopyToken(token.token)}
                            >
                              Copiar
                            </ButtonCustom>
                            {disabled && canViewAllTokens && (
                              <ButtonCustom
                                variant="outline"
                                size="sm"
                                icon="CreditCard"
                                onClick={() => {
                                  registrarRecuperacaoPagamento({
                                    cursoId: String(cursoId),
                                    turmaId,
                                    provaId,
                                    inscricaoId: token.inscricaoId,
                                  });
                                  setPaymentsRefresh((v) => v + 1);
                                  toastCustom.success(
                                    `Pagamento registrado (${formatBRL(
                                      RECUPERACAO_PAGAMENTO_VALOR_CENTS
                                    )}).`
                                  );
                                }}
                              >
                                Registrar pagamento
                              </ButtonCustom>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
