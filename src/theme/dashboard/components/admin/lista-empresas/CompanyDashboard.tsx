"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  CompanyRow,
  CompanyStats,
  CompanyTableSkeleton,
  EmptyState,
} from "./components";
import { COMPANY_DASHBOARD_CONFIG, TRIAL_PARTNERSHIP_TYPES } from "./constants";
import { useCompanyDashboardData } from "./hooks/useCompanyDashboardData";
import type { CompanyDashboardProps, PlanFilter } from "./types";

export function CompanyDashboard({
  className,
  partnerships: partnershipsProp,
  fetchFromApi = true,
  itemsPerPage: itemsPerPageProp,
  pageSize,
  onDataLoaded,
  onError,
}: CompanyDashboardProps) {
  const itemsPerPage = itemsPerPageProp ?? COMPANY_DASHBOARD_CONFIG.itemsPerPage;
  const shouldFetch = fetchFromApi && !partnershipsProp;

  const { partnerships: fetchedPartnerships, isLoading, error, refetch } = useCompanyDashboardData({
    enabled: shouldFetch,
    pageSize: pageSize ?? COMPANY_DASHBOARD_CONFIG.api.pageSize,
    onSuccess: (data, response) => onDataLoaded?.(data, response),
    onError,
  });

  useEffect(() => {
    if (partnershipsProp) {
      onDataLoaded?.(partnershipsProp, null);
    }
  }, [onDataLoaded, partnershipsProp]);

  const partnerships = partnershipsProp ?? fetchedPartnerships;

  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
  const [partnershipFilter, setPartnershipFilter] = useState<"all" | "partner" | "trial">("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, planFilter, partnershipFilter]);

  const uniquePlans = useMemo(() => {
    const names = partnerships
      .map((partnership) => partnership.plano.nome)
      .filter((name): name is string => Boolean(name));

    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [partnerships]);

  const filteredPartnerships = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return partnerships.filter((partnership) => {
      const company = partnership.empresa;
      const plan = partnership.plano;

      const matchesSearch =
        query.length === 0 ||
        company.nome.toLowerCase().includes(query) ||
        company.codUsuario.toLowerCase().includes(query) ||
        (company.cnpj?.toLowerCase().includes(query) ?? false);

      const matchesPlan = planFilter === "all" || plan.nome === planFilter;

      const isPartner = partnership.tipo === "parceiro" || company.parceira;
      const isTrial = partnership.tipo ? TRIAL_PARTNERSHIP_TYPES.includes(partnership.tipo) : false;

      const matchesPartnership =
        partnershipFilter === "all" ||
        (partnershipFilter === "partner" && isPartner) ||
        (partnershipFilter === "trial" && isTrial);

      return matchesSearch && matchesPlan && matchesPartnership;
    });
  }, [partnershipFilter, partnerships, planFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredPartnerships.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedPartnerships = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredPartnerships.slice(start, end);
  }, [filteredPartnerships, currentPage, itemsPerPage]);

  const metrics = useMemo(() => {
    const partners = partnerships.filter(
      (partnership) => partnership.tipo === "parceiro" || partnership.empresa.parceira,
    ).length;
    const trials = partnerships.filter((partnership) =>
      partnership.tipo ? TRIAL_PARTNERSHIP_TYPES.includes(partnership.tipo) : false,
    ).length;
    const active = partnerships.filter((partnership) => partnership.empresa.ativo).length;
    const inactive = partnerships.filter((partnership) => !partnership.empresa.ativo).length;

    return { partners, trials, active, inactive };
  }, [partnerships]);

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    for (let i = adjustedStart; i <= end; i += 1) {
      pages.push(i);
    }

    return pages;
  }, [currentPage, totalPages]);

  const isLoadingData = shouldFetch && isLoading;
  const showEmptyState = !isLoadingData && filteredPartnerships.length === 0;

  return (
    <div className={cn("min-h-screen bg-gray-50/50", className)}>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-xl bg-white/95">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Empresas</h1>
              <p className="text-sm text-gray-500 mt-1">
                {filteredPartnerships.length} de {partnerships.length} empresas
              </p>
            </div>
            <CompanyStats
              partners={metrics.partners}
              trials={metrics.trials}
              active={metrics.active}
              inactive={metrics.inactive}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar empresa, código ou CNPJ..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-[160px] bg-white border-gray-200">
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {uniquePlans.map((plan) => (
                  <SelectItem key={plan} value={plan}>
                    {plan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={partnershipFilter} onValueChange={(value) => setPartnershipFilter(value as typeof partnershipFilter)}>
              <SelectTrigger className="w-full sm:w-[140px] bg-white border-gray-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="partner">Parceiros</SelectItem>
                <SelectItem value="trial">Teste</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && shouldFetch && (
            <div className="mt-4 text-sm text-red-600 flex items-center gap-2">
              <span>{error}</span>
              <Button variant="link" size="sm" onClick={() => refetch()} className="p-0 h-auto">
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 bg-gray-50/50">
                <TableHead className="font-medium text-gray-700 py-4">Empresa</TableHead>
                <TableHead className="font-medium text-gray-700">Plano</TableHead>
                <TableHead className="font-medium text-gray-700">Localização</TableHead>
                <TableHead className="font-medium text-gray-700">Status Empresa</TableHead>
                <TableHead className="font-medium text-gray-700">Status Plano</TableHead>
                <TableHead className="font-medium text-gray-700">Vagas</TableHead>
                <TableHead className="font-medium text-gray-700">Data Criação</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingData && <CompanyTableSkeleton rows={5} />}
              {!isLoadingData &&
                paginatedPartnerships.map((partnership) => (
                  <CompanyRow key={partnership.id} partnership={partnership} />
                ))}
            </TableBody>
          </Table>

          {totalPages > 1 && filteredPartnerships.length > 0 && (
            <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredPartnerships.length)} de {filteredPartnerships.length} empresas
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="border-gray-200"
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {visiblePages.map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="border-gray-200"
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>

        {showEmptyState && (
          <EmptyState
            title="Nenhuma empresa encontrada"
            description="Tente ajustar os filtros ou termo de busca"
          />
        )}
      </div>
    </div>
  );
}

export default CompanyDashboard;
