"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Wallet,
  Clock,
  CreditCard,
  CalendarCheck,
  AlertCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ButtonCustom, FilterBar, EmptyState } from "@/components/ui/custom";
import { VerticalTabs } from "@/components/ui/custom/vertical-tabs";
import type { VerticalTabItem } from "@/components/ui/custom/vertical-tabs";
import { CardsStatistics } from "@/components/ui/custom/cards-statistics";
import type { StatisticCard } from "@/components/ui/custom/cards-statistics";
import type { FilterField } from "@/components/ui/custom/filters";
import type { DateRange } from "@/components/ui/custom/date-picker";
import {
  PagamentoTable,
  PixModal,
  BoletoModal,
  AddCardView,
} from "./components";
import { usePagamentosData, usePlanosEmpresa } from "./hooks";
import { STATUS_OPTIONS, METODO_OPTIONS } from "./constants";
import type { PagamentosDashboardProps, Pagamento } from "./types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MaskService } from "@/services";
import { useTenantCompany } from "@/hooks/useTenantCompany";
import { Skeleton } from "@/components/ui/skeleton";

const createEmptyDateRange = (): DateRange => ({ from: null, to: null });

export function PagamentosDashboard({ className }: PagamentosDashboardProps) {
  const { data, isLoading, error, filters, updateFilters, loadPage } =
    usePagamentosData();
  const { company, isLoading: isLoadingCompany } = useTenantCompany();

  const pagamentos = useMemo(() => data?.pagamentos ?? [], [data?.pagamentos]);
  const resumo = data?.resumo;
  const pagination = data?.pagination;
  const plano = company?.plano;

  // Buscar planos da API
  const { data: planosData } = usePlanosEmpresa();
  const planoOptions = useMemo(() => {
    if (!planosData?.data) return [];

    // Garantir unicidade por NOME - pega o primeiro plano de cada nome
    const uniqueNames = new Set<string>();
    const uniquePlanos: Array<{ value: string; label: string }> = [];

    planosData.data.forEach((plano) => {
      if (!uniqueNames.has(plano.nome)) {
        uniqueNames.add(plano.nome);
        uniquePlanos.push({
          value: plano.id,
          label: plano.nome,
        });
      }
    });

    return uniquePlanos.sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [planosData]);

  // Estados de filtro
  const [selectedMetodo, setSelectedMetodo] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedPlano, setSelectedPlano] = useState<string[]>([]);
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
  const [selectedPagamento, setSelectedPagamento] = useState<Pagamento | null>(
    null
  );
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [isBoletoModalOpen, setIsBoletoModalOpen] = useState(false);

  // Estado da view de adicionar cartão
  const [isAddingCard, setIsAddingCard] = useState(false);

  // Estado da aba ativa
  const [activeTab, setActiveTab] = useState("assinatura");

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

  // Configuração dos filtros - todos em um único array
  // Linha 1: Método, Status, Plano (33% cada = 4 colunas de 12)
  // Linha 2: Período (50% = 6 colunas), Valor min (25% = 3 colunas), Valor max (25% = 3 colunas)
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
        key: "plano",
        label: "Plano",
        mode: "single",
        options: planoOptions,
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
    [planoOptions]
  );

  const filterValues = useMemo(
    () => ({
      metodo: selectedMetodo[0] ?? null,
      status: selectedStatus[0] ?? null,
      plano: selectedPlano[0] ?? null,
      dateRange: pendingDateRange,
      valorMin: pendingValorMin ?? "",
      valorMax: pendingValorMax ?? "",
    }),
    [
      selectedMetodo,
      selectedStatus,
      selectedPlano,
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
      } else if (key === "plano") {
        const planoValue = value as string | null;
        setSelectedPlano(planoValue ? [planoValue] : []);
        updateFilters({
          planoId: planoValue || undefined,
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
        // Não aplica automaticamente - aguarda o botão "Pesquisar"
      } else if (key === "valorMax") {
        const val = value as string;
        setPendingValorMax(val);
        // Não aplica automaticamente - aguarda o botão "Pesquisar"
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
    setSelectedPlano([]);
    setPendingDateRange(createEmptyDateRange());
    setPendingValorMin("");
    setPendingValorMax("");
    setValorMin("");
    setValorMax("");
    updateFilters({
      metodo: undefined,
      status: undefined,
      planoId: undefined,
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

  const handleViewPix = (pagamento: Pagamento) => {
    setSelectedPagamento(pagamento);
    setIsPixModalOpen(true);
  };

  const handleViewBoleto = (pagamento: Pagamento) => {
    setSelectedPagamento(pagamento);
    setIsBoletoModalOpen(true);
  };

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

  const vagasInfo = company?.vagas;

  // Helper para obter config do status
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ATIVO":
        return {
          color: "text-emerald-600 bg-emerald-50",
          iconColor: "text-emerald-600",
          bgIcon: "bg-emerald-100",
          label: "Ativo",
        };
      case "SUSPENSO":
        return {
          color: "text-amber-600 bg-amber-50",
          iconColor: "text-amber-600",
          bgIcon: "bg-amber-100",
          label: "Pagamento Pendente",
        };
      case "CANCELADO":
      case "EXPIRADO":
        return {
          color: "text-red-600 bg-red-50",
          iconColor: "text-red-600",
          bgIcon: "bg-red-100",
          label: "Cancelado",
        };
      default:
        return {
          color: "text-slate-600 bg-slate-50",
          iconColor: "text-slate-600",
          bgIcon: "bg-slate-100",
          label: status,
        };
    }
  };

  // Conteúdo da tab "Assinatura"
  const assinaturaContent = isLoadingCompany ? (
    <div className="space-y-6">
      {/* Skeleton do Card do Plano */}
      <div className="rounded-xl bg-white p-6 border border-gray-200/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Skeleton className="h-12 w-20" />
            <Skeleton className="h-12 w-20" />
            <Skeleton className="h-12 w-24" />
          </div>
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  ) : (
    <div className="space-y-6">
      {/* Card do Plano - Igual ao Dashboard */}
      {plano &&
        (() => {
          const cobrancaDate = plano.proximaCobranca
            ? new Date(plano.proximaCobranca)
            : null;

          const isPagamentoPendente = plano.status === "SUSPENSO";
          const isBloqueado =
            plano.status === "CANCELADO" || plano.status === "EXPIRADO";
          const statusConfig = getStatusConfig(plano.status);

          return (
            <div className="rounded-xl bg-white p-6 border border-gray-200/60">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl", statusConfig.bgIcon)}>
                    <CreditCard
                      className={cn("size-6", statusConfig.iconColor)}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="!text-lg !font-semibold !text-gray-900 !mb-0">
                        {plano.nome}
                      </h2>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs! font-medium",
                          statusConfig.color
                        )}
                      >
                        {isPagamentoPendente || isBloqueado ? (
                          <AlertTriangle className="size-3.5" />
                        ) : (
                          <CheckCircle2 className="size-3.5" />
                        )}
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="!text-2xl !font-bold !text-blue-600 !mb-0">
                      {vagasInfo?.publicadas ?? 0}
                    </p>
                    <p className="!text-xs !text-gray-500 !mb-0">Publicadas</p>
                  </div>
                  <div className="text-center border-l border-gray-200 pl-6">
                    <p className="!text-2xl !font-bold !text-emerald-600 !mb-0">
                      {vagasInfo?.limitePlano
                        ? vagasInfo.limitePlano - (vagasInfo.publicadas ?? 0)
                        : 0}
                    </p>
                    <p className="!text-xs !text-gray-500 !mb-0">Disponíveis</p>
                  </div>
                  {cobrancaDate && (
                    <div className="text-center border-l border-gray-200 pl-6">
                      <p
                        className={cn(
                          "!text-sm !font-medium !mb-0",
                          isPagamentoPendente || isBloqueado
                            ? "!text-red-600"
                            : "!text-gray-900"
                        )}
                      >
                        {cobrancaDate.toLocaleDateString("pt-BR")}
                      </p>
                      <p
                        className={cn(
                          "!text-xs !mb-0",
                          isPagamentoPendente || isBloqueado
                            ? "!text-red-500"
                            : "!text-gray-500"
                        )}
                      >
                        {isPagamentoPendente || isBloqueado
                          ? "Vencido"
                          : "Próxima Cobrança"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      {/* Alerta de Regularização de Pagamento */}
      {plano &&
        (plano.status === "SUSPENSO" ||
          plano.status === "CANCELADO" ||
          plano.status === "EXPIRADO") && (
          <Alert
            variant="default"
            className={cn(
              "border",
              plano.status === "SUSPENSO"
                ? "border-amber-200 bg-amber-50"
                : "border-red-200 bg-red-50"
            )}
          >
            <AlertCircle
              className={cn(
                "h-4 w-4",
                plano.status === "SUSPENSO" ? "text-amber-600" : "text-red-600"
              )}
            />
            <AlertDescription
              className={cn(
                plano.status === "SUSPENSO" ? "text-amber-700" : "text-red-700"
              )}
            >
              {plano.status === "SUSPENSO"
                ? "Não identificamos seu pagamento. Adicione um cartão abaixo para regularizar."
                : "Seu plano foi cancelado. Adicione um cartão abaixo para reativar."}
            </AlertDescription>
          </Alert>
        )}

      {/* Cartões Cadastrados */}
      <div className="bg-white rounded-xl border border-gray-200/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="!text-base !font-semibold !text-gray-900 !mb-0">
              Cartões Cadastrados
            </h3>
            <p className="!text-sm !text-gray-500 !mb-0">
              Gerencie seus métodos de pagamento
            </p>
          </div>
          <ButtonCustom
            variant="primary"
            size="md"
            icon="Plus"
            onClick={() => setIsAddingCard(true)}
          >
            Adicionar cartão
          </ButtonCustom>
        </div>

        {/* Empty State */}
        <EmptyState
          illustration="subscription"
          title="Nenhum cartão cadastrado"
          description="Adicione um cartão para renovação automática do seu plano"
          size="sm"
        />
      </div>
    </div>
  );

  // Conteúdo da tab "Pagamentos"
  const pagamentosContent = (
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
          <PagamentoTable
            pagamentos={pagamentos}
            isLoading={isLoading}
            onViewPix={handleViewPix}
            onViewBoleto={handleViewBoleto}
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

  // Conteúdo da view de adicionar cartão
  const addCardContent = (
    <AddCardView
      onBack={() => setIsAddingCard(false)}
      onSuccess={() => {
        // Recarregar dados após adicionar cartão
        setIsAddingCard(false);
      }}
    />
  );

  // Tabs do VerticalTabs
  const tabs: VerticalTabItem[] = [
    {
      value: "assinatura",
      label: "Assinatura",
      icon: "CreditCard",
      content: isAddingCard ? addCardContent : assinaturaContent,
    },
    {
      value: "pagamentos",
      label: "Histórico",
      icon: "Receipt",
      content: pagamentosContent,
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
          pix={selectedPagamento.detalhes.pix}
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
          boleto={selectedPagamento.detalhes.boleto}
          valor={selectedPagamento.valorFormatado}
        />
      )}
    </div>
  );
}
