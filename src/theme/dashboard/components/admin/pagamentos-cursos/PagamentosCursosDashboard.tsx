"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Clock,
  CalendarCheck,
  AlertCircle,
  Search,
  BookOpen,
  Receipt,
  Calendar,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ButtonCustom, FilterBar, EmptyState } from "@/components/ui/custom";
import { VerticalTabs } from "@/components/ui/custom/vertical-tabs";
import type { VerticalTabItem } from "@/components/ui/custom/vertical-tabs";
import { CardsStatistics } from "@/components/ui/custom/cards-statistics";
import type { StatisticCard } from "@/components/ui/custom/cards-statistics";
import type { FilterField } from "@/components/ui/custom/filters";
import type { DateRange } from "@/components/ui/custom/date-picker";
import { PagamentoCursoTable } from "./components/PagamentoCursoTable";
import { PixModal, BoletoModal } from "@/theme/dashboard/components/admin/lista-pagamentos/components/modals";
import { usePagamentosCursosData } from "./hooks/usePagamentosCursosData";
import { STATUS_OPTIONS, METODO_OPTIONS } from "@/theme/dashboard/components/admin/lista-pagamentos/constants";
import type { PagamentosCursosDashboardProps, PagamentoCurso } from "./types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MaskService } from "@/services";
import { getMockPagamentosCursos } from "@/mockData/pagamentos-cursos";
import { createCheckoutAndGetUrl } from "@/lib/checkout-session";
import { toastCustom } from "@/components/ui/custom/toast";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return cookie?.split("=")[1] || null;
}

const createEmptyDateRange = (): DateRange => ({ from: null, to: null });

export function PagamentosCursosDashboard({
  className,
}: PagamentosCursosDashboardProps) {
  const router = useRouter();
  const { data, isLoading, error, filters, updateFilters, loadPage } =
    usePagamentosCursosData();

  // Buscar pagamentos pendentes (antes de definir aba padrão) - apenas os que estão realmente abertos para pagamento
  // Exclui os que já foram pagos e estão em processamento (que têm PIX/Boleto gerado)
  const pagamentosPendentes = useMemo(() => {
    const allData = getMockPagamentosCursos();
    return allData.pagamentos.filter(
      (p) => p.status === "PENDENTE" && 
             !p.detalhes?.pix && 
             !p.detalhes?.boleto &&
             p.tipoPagamento === "recuperacao-final"
    );
  }, []);

  // Estado da aba ativa - padrão "pendentes" se houver pagamentos pendentes
  const [activeTab, setActiveTab] = useState(() => 
    pagamentosPendentes.length > 0 ? "pendentes" : "historico"
  );

  const pagamentos = useMemo(() => data?.pagamentos ?? [], [data?.pagamentos]);
  const resumo = data?.resumo;
  const pagination = data?.pagination;

  // Estados de filtro
  const [selectedMetodo, setSelectedMetodo] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [pendingDateRange, setPendingDateRange] = useState<DateRange>(
    createEmptyDateRange()
  );
  // Valores pendentes (digitados pelo usuário, ainda não aplicados)
  const [pendingValorMin, setPendingValorMin] = useState<string>("");
  const [pendingValorMax, setPendingValorMax] = useState<string>("");
  // Valores aplicados (enviados para a API)
  const [valorMin, setValorMin] = useState<string>("");
  const [valorMax, setValorMax] = useState<string>("");

  const maskService = MaskService.getInstance();

  // Estados das modais
  const [selectedPagamento, setSelectedPagamento] = useState<PagamentoCurso | null>(
    null
  );
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [isBoletoModalOpen, setIsBoletoModalOpen] = useState(false);

  // Buscar cursos únicos para filtro
  const cursoOptions = useMemo(() => {
    const allData = getMockPagamentosCursos();
    const cursosMap = new Map<string, { value: string; label: string }>();
    
    allData.pagamentos.forEach((p) => {
      if (p.curso && !cursosMap.has(p.curso.id)) {
        cursosMap.set(p.curso.id, {
          value: p.curso.id,
          label: p.curso.nome,
        });
      }
    });

    return Array.from(cursosMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "pt-BR")
    );
  }, []);

  // Cards de resumo
  const summaryCards = useMemo((): StatisticCard[] => {
    if (!resumo) return [];

    const formatCurrency = (value: number) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);

    return [
      {
        icon: Wallet,
        iconBg: "bg-emerald-100 text-emerald-600",
        value: formatCurrency(resumo.totalPago),
        label: "Total Pago",
        cardBg: "bg-emerald-50/50",
      },
      {
        icon: Clock,
        iconBg: "bg-amber-100 text-amber-600",
        value: formatCurrency(resumo.totalPendente),
        label: "Pendente",
        cardBg: "bg-amber-50/50",
      },
      {
        icon: CalendarCheck,
        iconBg: "bg-violet-100 text-violet-600",
        value: resumo.ultimoPagamento
          ? format(new Date(resumo.ultimoPagamento), "dd/MM/yyyy", {
              locale: ptBR,
            })
          : "—",
        label: "Último Pagamento",
        cardBg: "bg-violet-50/50",
      },
    ];
  }, [resumo]);

  // Configuração dos filtros
  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "metodo",
        label: "Método",
        mode: "single",
        options: METODO_OPTIONS,
        placeholder: "Todos",
      },
      {
        key: "status",
        label: "Status",
        mode: "single",
        options: STATUS_OPTIONS,
        placeholder: "Todos",
      },
      {
        key: "curso",
        label: "Curso",
        mode: "single",
        options: cursoOptions,
        placeholder: "Todos",
      },
      {
        key: "dateRange",
        label: "Período",
        type: "date-range",
        placeholder: "Selecionar período",
      },
      {
        key: "valorMin",
        label: "Valor mínimo",
        type: "text",
        placeholder: "R$ 0,00",
        mask: "money",
      },
      {
        key: "valorMax",
        label: "Valor máximo",
        type: "text",
        placeholder: "R$ 1000,00",
        mask: "money",
      },
    ],
    [cursoOptions]
  );

  const filterValues = useMemo(
    () => ({
      metodo: selectedMetodo[0] ?? null,
      status: selectedStatus[0] ?? null,
      curso: null, // Pode adicionar filtro de curso depois
      dateRange: pendingDateRange,
      valorMin: pendingValorMin ?? "",
      valorMax: pendingValorMax ?? "",
    }),
    [
      selectedMetodo,
      selectedStatus,
      pendingDateRange,
      pendingValorMin,
      pendingValorMax,
    ]
  );

  // Handlers
  const handleFilterChange = useCallback(
    (key: string, value: unknown) => {
      if (key === "metodo") {
        const metodoValue = value as string | null;
        setSelectedMetodo(metodoValue ? [metodoValue] : []);
        updateFilters({
          metodo: metodoValue || undefined,
          page: 1,
        });
      } else if (key === "status") {
        const statusValue = value as string | null;
        setSelectedStatus(statusValue ? [statusValue] : []);
        updateFilters({
          status: statusValue as any,
          page: 1,
        });
      } else if (key === "curso") {
        const cursoValue = value as string | null;
        updateFilters({
          cursoId: cursoValue || undefined,
          page: 1,
        });
      } else if (key === "dateRange") {
        const range = value as DateRange | null;
        setPendingDateRange(range ?? createEmptyDateRange());
        updateFilters({
          dataInicio: range?.from
            ? new Date(range.from).toISOString().split("T")[0]
            : undefined,
          dataFim: range?.to
            ? new Date(range.to).toISOString().split("T")[0]
            : undefined,
          page: 1,
        });
      } else if (key === "valorMin") {
        const val = value as string;
        setPendingValorMin(val);
      } else if (key === "valorMax") {
        const val = value as string;
        setPendingValorMax(val);
      }
    },
    [updateFilters]
  );

  // Função para aplicar os filtros de valor quando o botão "Pesquisar" for clicado
  const handleSearch = useCallback(() => {
    // Remove a máscara dos valores antes de enviar
    const valorMinUnmasked = pendingValorMin
      ? maskService.removeMask(pendingValorMin, "money")
      : "";
    const valorMaxUnmasked = pendingValorMax
      ? maskService.removeMask(pendingValorMax, "money")
      : "";

    // Aplica os valores aos estados aplicados
    setValorMin(pendingValorMin);
    setValorMax(pendingValorMax);

    // Atualiza os filtros na API
    updateFilters({
      valorMin: valorMinUnmasked ? parseFloat(valorMinUnmasked) : undefined,
      valorMax: valorMaxUnmasked ? parseFloat(valorMaxUnmasked) : undefined,
      page: 1,
    });
  }, [pendingValorMin, pendingValorMax, updateFilters, maskService]);

  const handleClearAll = useCallback(() => {
    setSelectedMetodo([]);
    setSelectedStatus([]);
    setPendingDateRange(createEmptyDateRange());
    setPendingValorMin("");
    setPendingValorMax("");
    setValorMin("");
    setValorMax("");
    updateFilters({
      metodo: undefined,
      status: undefined,
      cursoId: undefined,
      dataInicio: undefined,
      dataFim: undefined,
      valorMin: undefined,
      valorMax: undefined,
      page: 1,
    });
  }, [updateFilters]);

  const handlePageChange = (page: number) => {
    loadPage(page);
  };

  const handleViewPix = (pagamento: PagamentoCurso) => {
    setSelectedPagamento(pagamento);
    setIsPixModalOpen(true);
  };

  const handleViewBoleto = (pagamento: PagamentoCurso) => {
    setSelectedPagamento(pagamento);
    setIsBoletoModalOpen(true);
  };

  const handlePayRecuperacao = useCallback((pagamento: PagamentoCurso) => {
    // Verificar autenticação antes de criar checkout
    const token = getCookieValue("token");
    if (!token) {
      toastCustom.error({
        title: "Autenticação necessária",
        description: "Você precisa estar autenticado para realizar o pagamento.",
      });
      return;
    }

    if (!pagamento.prova?.id || !pagamento.curso?.id || !pagamento.turma?.id) {
      toastCustom.error({
        title: "Erro",
        description: "Dados incompletos do pagamento. Não é possível iniciar o checkout.",
      });
      return;
    }

    try {
      const { url } = createCheckoutAndGetUrl({
        // Pagamento de curso (recuperação final) usa Checkout Pro (redirect) e
        // retorna para páginas de resultado em `/dashboard/cursos/pagamentos/*`.
        productType: "curso_pagamento",
        productId: pagamento.prova.id,
        productName: pagamento.prova.titulo,
        productPrice: pagamento.valor || 50.0,
        currency: "BRL",
        originUrl: "/dashboard/cursos/pagamentos?tab=pendentes",
        metadata: {
          tipoPagamento: "recuperacao-final",
          tipo: "recuperacao-final",
          titulo: pagamento.prova.titulo,
          valor: pagamento.valor || 50.0,
          cursoId: pagamento.curso.id,
          cursoNome: pagamento.curso.nome,
          turmaId: pagamento.turma.id,
          turmaNome: pagamento.turma.nome,
          provaId: pagamento.prova.id,
          provaTitulo: pagamento.prova.titulo,
        },
      });

      router.push(url);
    } catch (error: any) {
      toastCustom.error({
        title: "Erro ao iniciar pagamento",
        description: error?.message || "Não foi possível iniciar o checkout. Tente novamente.",
      });
    }
  }, [router]);

  // Paginação
  const currentPage = pagination?.page ?? filters.page ?? 1;
  const pageSize = pagination?.pageSize ?? filters.pageSize ?? 10;
  const totalItems = pagination?.total ?? pagamentos.length;
  const totalPages = pagination?.totalPages ?? Math.ceil(totalItems / pageSize);

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    for (let i = adjustedStart; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }, [currentPage, totalPages]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Conteúdo da aba "Histórico"
  const historicoContent = (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <CardsStatistics
        cards={summaryCards}
        gridClassName="grid-cols-1 sm:grid-cols-3"
      />

      {/* Filtros */}
      <FilterBar
        className="w-full lg:grid-cols-[repeat(12,minmax(0,1fr))] [&>div>*:nth-child(1)]:lg:col-span-4 [&>div>*:nth-child(2)]:lg:col-span-4 [&>div>*:nth-child(3)]:lg:col-span-4 [&>div>*:nth-child(4)]:lg:col-span-6 [&>div>*:nth-child(4)]:lg:row-start-2 [&>div>*:nth-child(5)]:lg:col-span-3 [&>div>*:nth-child(5)]:lg:row-start-2 [&>div>*:nth-child(6)]:lg:col-span-3 [&>div>*:nth-child(6)]:lg:row-start-2 [&>div>*:nth-child(7)]:lg:col-span-3 [&>div>*:nth-child(7)]:lg:row-start-2"
        fields={filterFields}
        values={filterValues}
        onChange={handleFilterChange}
        onClearAll={handleClearAll}
        rightActions={
          <ButtonCustom
            variant="primary"
            size="md"
            onClick={handleSearch}
            className="w-full lg:w-auto"
          >
            <Search className="h-4 w-4 mr-2" />
            Pesquisar
          </ButtonCustom>
        }
      />

      {/* Tabela de Pagamentos */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <PagamentoCursoTable
            pagamentos={pagamentos}
            isLoading={isLoading}
            showActions={false}
          />
        </div>

        {/* Paginação */}
        {(isLoading || totalItems > 0) && (
          <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
              {totalItems === 0
                ? "Nenhum pagamento listado"
                : `Mostrando ${startItem} a ${endItem} de ${totalItems} pagamento${
                    totalItems === 1 ? "" : "s"
                  }`}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <ButtonCustom
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="h-8 px-3"
                >
                  Anterior
                </ButtonCustom>

                {visiblePages[0] > 1 && (
                  <>
                    <ButtonCustom
                      variant={currentPage === 1 ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      className="h-8 w-8 p-0"
                      disabled={isLoading}
                    >
                      1
                    </ButtonCustom>
                    {visiblePages[0] > 2 && (
                      <span className="text-gray-400">...</span>
                    )}
                  </>
                )}

                {visiblePages.map((page) => (
                  <ButtonCustom
                    key={page}
                    variant={currentPage === page ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="h-8 w-8 p-0"
                    disabled={isLoading}
                  >
                    {page}
                  </ButtonCustom>
                ))}

                {visiblePages[visiblePages.length - 1] < totalPages && (
                  <>
                    {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                      <span className="text-gray-400">...</span>
                    )}
                    <ButtonCustom
                      variant={
                        currentPage === totalPages ? "primary" : "outline"
                      }
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      className="h-8 w-8 p-0"
                      disabled={isLoading}
                    >
                      {totalPages}
                    </ButtonCustom>
                  </>
                )}

                <ButtonCustom
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="h-8 px-3"
                >
                  Próxima
                </ButtonCustom>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Conteúdo da aba "Pendentes"
  const pendentesContent = (
    <div className="space-y-6">
      {pagamentosPendentes.length === 0 ? (
        <div className="py-16">
          <EmptyState
            title="Nenhum pagamento pendente"
            description="Não há pagamentos pendentes no momento."
            illustration="myFiles"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {pagamentosPendentes.map((pagamento) => {
            const descricaoProva = pagamento.prova?.titulo || "Recuperação Final";
            const cursoNome = pagamento.curso?.nome;
            const turmaNome = pagamento.turma?.nome;
            
            const validadeFormatada = pagamento.validadeAte
              ? format(new Date(pagamento.validadeAte), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
              : null;

            return (
              <div
                key={pagamento.id}
                className="bg-white rounded-2xl border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between gap-6">
                  {/* Conteúdo principal - Foco no valor */}
                  <div className="flex-1 min-w-0">
                    {/* Valor em destaque */}
                    <div className="mb-4">
                      <div className="text-4xl font-bold text-gray-900 leading-tight">
                        {pagamento.valorFormatado || new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(pagamento.valor || 0)}
                      </div>
                    </div>

                    {/* Informações secundárias */}
                    <div className="space-y-2">
                      <div className="text-base font-semibold text-gray-900">
                        {descricaoProva}
                      </div>
                      
                      {(cursoNome || turmaNome) && (
                        <div className="text-sm text-gray-500">
                          {cursoNome && <span>{cursoNome}</span>}
                          {cursoNome && turmaNome && <span> • </span>}
                          {turmaNome && <span>{turmaNome}</span>}
                        </div>
                      )}

                      {validadeFormatada && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Válido até {validadeFormatada}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botão de ação */}
                  <div className="flex-shrink-0">
                    <ButtonCustom
                      variant="primary"
                      size="lg"
                      onClick={() => handlePayRecuperacao(pagamento)}
                      className="min-w-[120px]"
                    >
                      Pagar
                    </ButtonCustom>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Tabs do VerticalTabs
  const tabs: VerticalTabItem[] = [
    {
      value: "pendentes",
      label: "Pendentes",
      icon: "Clock",
      badge: pagamentosPendentes.length > 0 ? pagamentosPendentes.length : undefined,
      content: pendentesContent,
    },
    {
      value: "historico",
      label: "Histórico",
      icon: "Receipt",
      content: historicoContent,
    },
  ];

  return (
    <div className={cn("min-h-full", className)}>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Erro ao carregar dados: {error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-3xl p-5 h-full min-h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex-1 min-h-0">
          <VerticalTabs
            items={tabs}
            value={activeTab}
            onValueChange={setActiveTab}
            variant="spacious"
            size="sm"
            withAnimation
            showIndicator
            tabsWidth="md"
            classNames={{
              root: "h-full",
              contentWrapper: "h-full overflow-hidden",
              tabsContent: "h-full overflow-auto py-6 px-2",
              tabsList: "p-2",
              tabsTrigger: "mb-1",
            }}
          />
        </div>
      </div>

      {/* Modals */}
      {selectedPagamento?.detalhes?.pix && (
        <PixModal
          isOpen={isPixModalOpen}
          onClose={() => {
            setIsPixModalOpen(false);
            setSelectedPagamento(null);
          }}
          pix={selectedPagamento.detalhes.pix as any}
          valor={selectedPagamento.valorFormatado}
        />
      )}

      {selectedPagamento?.detalhes?.boleto && (
        <BoletoModal
          isOpen={isBoletoModalOpen}
          onClose={() => {
            setIsBoletoModalOpen(false);
            setSelectedPagamento(null);
          }}
          boleto={selectedPagamento.detalhes.boleto as any}
          valor={selectedPagamento.valorFormatado}
        />
      )}
    </div>
  );
}

export { PENDING_CURSOS_PAYMENT_KEY } from "@/lib/pending-storage-keys";
