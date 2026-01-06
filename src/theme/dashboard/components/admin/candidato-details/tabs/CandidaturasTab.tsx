"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import { useTenantCompany } from "@/hooks/useTenantCompany";
import { EmptyState } from "@/components/ui/custom";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { InputCustom } from "@/components/ui/custom/input";
import { SelectCustom } from "@/components/ui/custom/select";
import {
  DatePickerRangeCustom,
  type DateRange,
} from "@/components/ui/custom/date-picker";
import { ButtonCustom } from "@/components/ui/custom";
import { AvatarCustom } from "@/components/ui/custom/avatar";
import { ChevronRight, Calendar } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CandidaturasTabProps } from "../types";
import { formatDate } from "../utils/formatters";
import { buscarCandidatoPorId } from "@/api/candidatos/admin";
import type { Candidatura } from "@/api/candidatos/types";

// Função para formatar CNPJ
const formatCnpj = (cnpj?: string | null): string => {
  if (!cnpj) return "—";
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return digits.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5"
  );
};

// Função para obter iniciais da empresa
const getEmpresaInitials = (nome?: string | null): string => {
  if (!nome) return "—";
  const words = nome.trim().split(" ");
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "CONTRATADO":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "ENTREVISTA":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "EM_ANALISE":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "RECUSADO":
      return "bg-red-100 text-red-700 border-red-200";
    case "DESISTIU":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "APROVADO":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "CONTRATADO":
      return "Contratado";
    case "ENTREVISTA":
      return "Em Entrevista";
    case "EM_ANALISE":
      return "Em Análise";
    case "RECUSADO":
      return "Recusado";
    case "DESISTIU":
      return "Desistiu";
    case "APROVADO":
      return "Aprovado";
    default:
      return status;
  }
};

const canViewAllCompanies = (role: UserRole | null) =>
  role === UserRole.ADMIN ||
  role === UserRole.MODERADOR ||
  role === UserRole.PEDAGOGICO ||
  role === UserRole.SETOR_DE_VAGAS;

const shouldScopeToCompany = (role: UserRole | null) =>
  role === UserRole.EMPRESA || role === UserRole.RECRUTADOR;

const matchCompany = (candidatura: Candidatura, companyId: string) =>
  candidatura.empresaUsuarioId === companyId ||
  candidatura.empresa?.id === companyId ||
  candidatura.vaga?.usuarioId === companyId;

export function CandidaturasTab({
  candidato,
  candidaturas = [],
  onUpdateStatus,
  isLoading = false,
}: CandidaturasTabProps) {
  const role = useUserRole();
  const isPrivileged = canViewAllCompanies(role);
  const scopedCompany = shouldScopeToCompany(role);
  const { tenantId: companyId, isLoading: isLoadingCompany } =
    useTenantCompany(scopedCompany);

  // Estados de filtros (pendentes)
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [pendingEmpresa, setPendingEmpresa] = useState<string | null>(null);
  const [pendingDateRange, setPendingDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });

  // Estados de filtros (aplicados)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStatus, setAppliedStatus] = useState<string | null>(null);
  const [appliedEmpresa, setAppliedEmpresa] = useState<string | null>(null);
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: candidatoData,
    isLoading: isLoadingCandidato,
    error,
  } = useQuery({
    queryKey: ["candidato-candidaturas", candidato.id, scopedCompany ? companyId : "all"],
    queryFn: async () => {
      try {
        console.log("🔍 Buscando candidaturas para candidato:", candidato.id);
        const candidatoCompleto = await buscarCandidatoPorId(candidato.id);

        if (!candidatoCompleto) {
          console.warn("⚠️ Candidato não encontrado para ID:", candidato.id);
          return null;
        }

        if (scopedCompany && !isPrivileged) {
          if (!companyId) {
            return { ...candidatoCompleto, candidaturas: [] };
          }
          const candidaturasScoped =
            candidatoCompleto.candidaturas?.filter((item) =>
              matchCompany(item as Candidatura, companyId)
            ) ?? [];
          return { ...candidatoCompleto, candidaturas: candidaturasScoped };
        }

        console.log("✅ Candidato encontrado:", {
          id: candidatoCompleto.id,
          nome: candidatoCompleto.nomeCompleto,
          totalCandidaturas: candidatoCompleto.candidaturas?.length || 0,
          candidaturas: candidatoCompleto.candidaturas?.map((c) => ({
            id: c.id,
            vagaTitulo: c.vaga?.titulo,
            empresaNome: c.empresa?.nome,
            empresaId: c.empresa?.id,
            empresaCnpj: c.empresa?.cnpj,
            empresaLogoUrl: c.empresa?.logoUrl,
          })),
        });

        return candidatoCompleto;
      } catch (error) {
        console.error("❌ Erro ao buscar candidaturas do candidato:", error);
        return null;
      }
    },
    enabled: Boolean(candidato.id) && (!scopedCompany || isPrivileged || Boolean(companyId)),
    staleTime: 5 * 60 * 1000,
  });

  const todasCandidaturas: Candidatura[] = useMemo(
    () => candidatoData?.candidaturas || [],
    [candidatoData?.candidaturas]
  );

  const candidaturasVisiveis = useMemo(() => {
    if (!scopedCompany || isPrivileged) return todasCandidaturas;
    if (!companyId) return [];
    return todasCandidaturas.filter((item) => matchCompany(item, companyId));
  }, [companyId, isPrivileged, scopedCompany, todasCandidaturas]);

  // Sincronizar estados pending com applied quando os dados mudarem
  useEffect(() => {
    if (appliedStatus !== pendingStatus) {
      setPendingStatus(appliedStatus);
    }
    if (appliedEmpresa !== pendingEmpresa) {
      setPendingEmpresa(appliedEmpresa);
    }
    if (
      appliedDateRange.from !== pendingDateRange.from ||
      appliedDateRange.to !== pendingDateRange.to
    ) {
      setPendingDateRange(appliedDateRange);
    }
  }, [
    appliedStatus,
    appliedEmpresa,
    appliedDateRange,
    pendingStatus,
    pendingEmpresa,
    pendingDateRange,
  ]);

  useEffect(() => {
    if (scopedCompany && !isPrivileged) {
      setAppliedEmpresa(null);
      setPendingEmpresa(null);
    }
  }, [isPrivileged, scopedCompany]);

  // Opções de status únicos
  const statusOptions = useMemo(() => {
    const statuses = new Set<string>();
    candidaturasVisiveis.forEach((c) => {
      if (c.status) statuses.add(c.status);
    });
    return Array.from(statuses)
      .sort()
      .map((status) => ({
        value: status,
        label: getStatusLabel(status),
      }));
  }, [candidaturasVisiveis]);

  // Opções de empresas únicas
  const empresaOptions = useMemo(() => {
    const empresas = new Map<string, string>();
    candidaturasVisiveis.forEach((c) => {
      const empresaNome = c.empresa?.nomeCompleto || c.empresa?.nome;
      if (empresaNome && c.empresa?.id) {
        empresas.set(c.empresa.id, empresaNome);
      }
    });
    return Array.from(empresas.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([id, nome]) => ({
        value: id,
        label: nome,
      }));
  }, [candidaturasVisiveis]);

  // Função para aplicar apenas o filtro de pesquisa (nome/código)
  const handleSearch = () => {
    // Se o campo de pesquisa estiver vazio e não houver outros filtros, limpar tudo
    if (
      !pendingSearchTerm.trim() &&
      !appliedStatus &&
      !appliedEmpresa &&
      !appliedDateRange.from &&
      !appliedDateRange.to
    ) {
      setAppliedSearchTerm("");
      setCurrentPage(1);
    } else {
      setAppliedSearchTerm(pendingSearchTerm);
      setCurrentPage(1);
    }
  };

  // Aplicar filtro de data automaticamente
  const handleDateRangeChange = (value: {
    from: Date | null;
    to: Date | null;
  }) => {
    const newValue = {
      from: value.from,
      to: value.to,
    };
    setPendingDateRange(newValue);
    setAppliedDateRange(newValue);
    setCurrentPage(1);
  };

  // Aplicar filtro de status automaticamente
  const handleStatusChange = (value: string | null) => {
    setPendingStatus(value);
    setAppliedStatus(value);
    setCurrentPage(1);
  };

  // Aplicar filtro de empresa automaticamente
  const handleEmpresaChange = (value: string | null) => {
    setPendingEmpresa(value);
    setAppliedEmpresa(value);
    setCurrentPage(1);
  };

  // Aplicar filtros
  const candidaturasFiltradas = useMemo(() => {
    return candidaturasVisiveis.filter((candidatura) => {
      // Filtro por nome da vaga ou código
      if (appliedSearchTerm) {
        const vagaTitulo = candidatura.vaga?.titulo?.toLowerCase() || "";
        const vagaCodigo = candidatura.vaga?.codigo?.toLowerCase() || "";
        const searchLower = appliedSearchTerm.toLowerCase();
        if (
          !vagaTitulo.includes(searchLower) &&
          !vagaCodigo.includes(searchLower)
        ) {
          return false;
        }
      }

      // Filtro por status
      if (appliedStatus && candidatura.status !== appliedStatus) {
        return false;
      }

      // Filtro por empresa
      if (
        !scopedCompany &&
        appliedEmpresa &&
        candidatura.empresa?.id !== appliedEmpresa
      ) {
        return false;
      }

      // Filtro por data de aplicação
      if (appliedDateRange.from || appliedDateRange.to) {
        const aplicadaEm = new Date(candidatura.aplicadaEm);
        if (
          appliedDateRange.from &&
          aplicadaEm < new Date(appliedDateRange.from)
        ) {
          return false;
        }
        if (appliedDateRange.to) {
          const toDate = new Date(appliedDateRange.to);
          toDate.setHours(23, 59, 59, 999);
          if (aplicadaEm > toDate) {
            return false;
          }
        }
      }

      return true;
    });
  }, [
    candidaturasVisiveis,
    appliedSearchTerm,
    appliedStatus,
    appliedEmpresa,
    appliedDateRange,
    scopedCompany,
  ]);

  // Paginação
  const totalPages = Math.ceil(candidaturasFiltradas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const candidaturasPaginadas = candidaturasFiltradas.slice(startIndex, endIndex);

  // Verificar se há filtros aplicados
  const hasActiveFilters =
    appliedSearchTerm ||
    appliedStatus ||
    appliedEmpresa ||
    appliedDateRange.from ||
    appliedDateRange.to;

  // Verificar se há mudanças pendentes apenas no campo de pesquisa
  const hasPendingSearchChanges = pendingSearchTerm !== appliedSearchTerm;

  if (isLoading || isLoadingCandidato || (scopedCompany && isLoadingCompany)) {
    return (
      <div className="space-y-4">
        {/* Filtros com skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row flex-wrap items-end gap-3">
            {/* Skeleton do campo de pesquisa */}
            <div className="w-full sm:w-full md:w-[480px] lg:w-[480px] flex-1 min-w-0">
              <Skeleton className="h-10 w-full bg-gray-200 rounded-md" />
            </div>

            {/* Skeleton do filtro de data */}
            <div className="w-full sm:w-full md:w-[280px] lg:w-[280px] flex-shrink-0">
              <Skeleton className="h-10 w-full bg-gray-200 rounded-md" />
            </div>

            {/* Skeleton do filtro de status */}
            <div className="w-full sm:w-[calc(50%-0.375rem)] md:w-[220px] lg:w-[220px] flex-shrink-0">
              <Skeleton className="h-10 w-full bg-gray-200 rounded-md" />
            </div>

            {/* Skeleton do filtro de empresa */}
            {!scopedCompany && (
              <div className="w-full sm:w-[calc(50%-0.375rem)] md:w-[300px] lg:w-[300px] flex-shrink-0">
                <Skeleton className="h-10 w-full bg-gray-200 rounded-md" />
              </div>
            )}

            {/* Skeleton do botão pesquisar */}
            <div className="w-full sm:w-full md:w-auto lg:w-auto flex-shrink-0">
              <Skeleton className="h-10 w-full sm:w-full md:w-32 lg:w-32 bg-gray-200 rounded-md" />
            </div>
          </div>
        </div>

        {/* Tabela com skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="font-medium text-gray-700 py-4">
                    Vaga
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Empresa
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Aplicada em
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i} className="border-gray-100">
                    <TableCell className="py-4">
                      <Skeleton className="h-5 w-48 bg-gray-200" />
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full bg-gray-200" />
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-4 w-32 bg-gray-200" />
                          <Skeleton className="h-3 w-24 bg-gray-200" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-4 w-24 bg-gray-200" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-6 w-20 rounded-full bg-gray-200" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-8 w-8 rounded-full bg-gray-200" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">
            Erro ao carregar candidaturas
          </p>
          <p className="text-sm text-gray-600">
            Não foi possível buscar as candidaturas. Tente novamente.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {error instanceof Error ? error.message : "Erro desconhecido"}
          </p>
        </div>
      </div>
    );
  }

  // Se não há candidaturas totais (sem filtros), mostrar EmptyState
  if (candidaturasVisiveis.length === 0) {
    return (
      <EmptyState
        illustration="fileNotFound"
        illustrationAlt="Nenhuma candidatura"
        title="Nenhuma candidatura encontrada"
        description="Este candidato ainda não se candidatou a nenhuma vaga."
        maxContentWidth="md"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-end gap-3">
          {/* Busca por nome da vaga ou código */}
          <div className="w-full sm:w-full md:w-[480px] lg:w-[480px] flex-1 min-w-0">
            <InputCustom
              type="text"
              placeholder="Pesquisar por nome da vaga ou código..."
              value={pendingSearchTerm}
              onChange={(e) => setPendingSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  // Se o campo estiver vazio e não houver outros filtros, limpar tudo
                  if (
                    !pendingSearchTerm.trim() &&
                    !appliedStatus &&
                    !appliedEmpresa &&
                    !appliedDateRange.from &&
                    !appliedDateRange.to
                  ) {
                    setAppliedSearchTerm("");
                    setAppliedStatus(null);
                    setAppliedEmpresa(null);
                    setAppliedDateRange({ from: null, to: null });
                    setPendingStatus(null);
                    setPendingEmpresa(null);
                    setPendingDateRange({ from: null, to: null });
                    setCurrentPage(1);
                  } else {
                    handleSearch();
                  }
                }
              }}
              size="md"
              fullWidth
              rightIcon={pendingSearchTerm ? "X" : undefined}
              onRightIconClick={() => {
                setPendingSearchTerm("");
                // Se não houver outros filtros aplicados, limpar tudo
                if (
                  !appliedStatus &&
                  !appliedEmpresa &&
                  !appliedDateRange.from &&
                  !appliedDateRange.to
                ) {
                  setAppliedSearchTerm("");
                  setAppliedStatus(null);
                  setAppliedEmpresa(null);
                  setAppliedDateRange({ from: null, to: null });
                  setPendingStatus(null);
                  setPendingEmpresa(null);
                  setPendingDateRange({ from: null, to: null });
                  setCurrentPage(1);
                } else {
                  // Apenas limpar o campo de pesquisa
                  setAppliedSearchTerm("");
                  setCurrentPage(1);
                }
              }}
            />
          </div>

          {/* Filtro por data */}
          <div className="w-full sm:w-full md:w-[280px] lg:w-[280px] flex-shrink-0">
            <DatePickerRangeCustom
              value={appliedDateRange}
              onChange={handleDateRangeChange}
              placeholder="Filtrar por data"
              size="md"
              clearable={true}
              format="dd/MM/yyyy"
            />
          </div>

          {/* Filtro por status */}
          <div className="w-full sm:w-[calc(50%-0.375rem)] md:w-[220px] lg:w-[220px] flex-shrink-0">
            <SelectCustom
              mode="single"
              options={statusOptions}
              value={appliedStatus}
              onChange={handleStatusChange}
              placeholder="Filtrar por status"
              size="md"
              fullWidth
            />
          </div>

          {/* Filtro por empresa */}
          {!scopedCompany && (
            <div className="w-full sm:w-[calc(50%-0.375rem)] md:w-[300px] lg:w-[300px] flex-shrink-0">
              <SelectCustom
                mode="single"
                options={empresaOptions}
                value={appliedEmpresa}
                onChange={handleEmpresaChange}
                placeholder="Filtrar por empresa"
                size="md"
                fullWidth
              />
            </div>
          )}

          {/* Botão pesquisar */}
          <div className="w-full sm:w-full md:w-auto lg:w-auto flex-shrink-0">
            <ButtonCustom
              variant="primary"
              size="lg"
              icon="Search"
              onClick={handleSearch}
              className="w-full sm:w-full md:w-auto"
            >
              Pesquisar
            </ButtonCustom>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 bg-gray-50/50">
                <TableHead className="font-medium text-gray-700 py-4">
                  Vaga
                </TableHead>
                <TableHead className="font-medium text-gray-700">
                  Empresa
                </TableHead>
                <TableHead className="font-medium text-gray-700">
                  Aplicada em
                </TableHead>
                <TableHead className="font-medium text-gray-700">
                  Status
                </TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidaturasPaginadas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    <p className="text-gray-500">
                      {hasActiveFilters
                        ? "Nenhuma candidatura encontrada com os filtros aplicados."
                        : "Nenhuma candidatura encontrada."}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                candidaturasPaginadas.map((candidatura) => {
                  const vaga = candidatura.vaga;
                  const vagaTitulo = vaga?.titulo || "Vaga sem título";
                  const vagaId = vaga?.id || candidatura.vagaId;
                  const status = candidatura.status;
                  const empresa = candidatura.empresa;
                  const empresaNome =
                    empresa?.nomeCompleto || empresa?.nome || "—";

                  return (
                    <TableRow
                      key={candidatura.id}
                      className="border-gray-100 hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="font-medium text-gray-900">
                            {vagaTitulo}
                          </div>
                          {vaga?.codigo && (
                            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0">
                              {vaga.codigo}
                            </code>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <AvatarCustom
                            name={empresaNome || "Empresa"}
                            src={empresa?.logoUrl || undefined}
                            size="sm"
                            showStatus={false}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {empresaNome}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatCnpj(empresa?.cnpj)}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span>{formatDate(candidatura.aplicadaEm)}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        {status ? (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-medium",
                              getStatusColor(status)
                            )}
                          >
                            {getStatusLabel(status)}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>

                      <TableCell className="py-4">
                        {vagaId && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] cursor-pointer"
                                aria-label="Visualizar vaga"
                              >
                                <Link
                                  href={`/dashboard/empresas/vagas/${vagaId}`}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8}>
                              Visualizar vaga
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                Mostrando{" "}
                {Math.min(startIndex + 1, candidaturasFiltradas.length)} a{" "}
                {Math.min(endIndex, candidaturasFiltradas.length)} de{" "}
                {candidaturasFiltradas.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <ButtonCustom
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3"
              >
                Anterior
              </ButtonCustom>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <ButtonCustom
                      key={pageNum}
                      variant={currentPage === pageNum ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="h-8 w-8 p-0"
                    >
                      {pageNum}
                    </ButtonCustom>
                  );
                })}
              </div>

              <ButtonCustom
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="h-8 px-3"
              >
                Próxima
              </ButtonCustom>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
