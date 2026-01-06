"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ButtonCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import { UsuarioRow } from "./UsuarioRow";
import { UsuarioTableSkeleton } from "./UsuarioTableSkeleton";
import type { UsuarioOverview } from "../types";

interface UsuarioTableProps {
  usuarios: UsuarioOverview[];
  isLoading?: boolean;
  pageSize?: number;
  sortDirection?: "asc" | "desc";
  onSortChange?: (direction: "asc" | "desc") => void;
  // Props para paginação
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  visiblePages?: number[];
  // Props para estado de navegação global
  isNavigating?: boolean;
  onNavigateStart?: () => void;
}

export function UsuarioTable({
  usuarios,
  isLoading = false,
  pageSize = 10,
  sortDirection = "asc",
  onSortChange,
  pagination,
  onPageChange,
  visiblePages = [],
  isNavigating = false,
  onNavigateStart,
}: UsuarioTableProps) {
  const startItem =
    pagination && usuarios.length > 0
      ? Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)
      : 0;
  const endItem =
    pagination && usuarios.length > 0
      ? Math.min(startItem + usuarios.length - 1, pagination.total)
      : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow className="border-gray-200 bg-gray-50/50">
              <TableHead className="font-medium text-gray-700 py-4">
                {onSortChange ? (
                  <div className="flex items-center gap-1">
                    <span>Usuário</span>
                    <div className="ml-1 flex flex-col -space-y-1.5 items-center leading-none">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                            aria-label="Ordenar A → Z"
                            onClick={() => onSortChange("asc")}
                          >
                            <ChevronUp
                              className={cn(
                                "h-3 w-3 text-gray-400",
                                sortDirection === "asc" &&
                                  "text-[var(--primary-color)]"
                              )}
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>A → Z</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                            aria-label="Ordenar Z → A"
                            onClick={() => onSortChange("desc")}
                          >
                            <ChevronDown
                              className={cn(
                                "h-3 w-3 text-gray-400 -mt-0.5",
                                sortDirection === "desc" &&
                                  "text-[var(--primary-color)]"
                              )}
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>Z → A</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ) : (
                  "Usuário"
                )}
              </TableHead>
              <TableHead className="font-medium text-gray-700 py-4">
                Email
              </TableHead>
              <TableHead className="font-medium text-gray-700 py-4">
                Localização
              </TableHead>
              <TableHead className="font-medium text-gray-700 py-4">
                Função
              </TableHead>
              <TableHead className="font-medium text-gray-700 py-4">
                Status
              </TableHead>
              <TableHead className="font-medium text-gray-700 py-4">
                Último Acesso
              </TableHead>
              <TableHead className="w-12 py-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <UsuarioTableSkeleton rows={pageSize} />}
            {!isLoading &&
              usuarios.map((usuario) => (
                <UsuarioRow 
                  key={usuario.id} 
                  usuario={usuario}
                  isDisabled={isNavigating}
                  onNavigateStart={onNavigateStart}
                />
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação dentro do mesmo container */}
      {pagination && pagination.total > 0 && (
        <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              Mostrando {startItem} a {endItem} de {pagination.total}{" "}
              usuário{pagination.total === 1 ? "" : "s"}
            </span>
          </div>

          {pagination.totalPages > 1 && onPageChange && visiblePages.length > 0 && (
            <div className="flex items-center gap-2">
              <ButtonCustom
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="h-8 px-3"
              >
                Anterior
              </ButtonCustom>

              {visiblePages[0] > 1 && (
                <>
                  <ButtonCustom
                    variant={pagination.page === 1 ? "primary" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(1)}
                    className="h-8 w-8 p-0"
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
                  variant={pagination.page === page ? "primary" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </ButtonCustom>
              ))}

              {visiblePages.length > 0 && visiblePages[visiblePages.length - 1] < pagination.totalPages && (
                <>
                  {visiblePages[visiblePages.length - 1] < pagination.totalPages - 1 && (
                    <span className="text-gray-400">...</span>
                  )}
                  <ButtonCustom
                    variant={pagination.page === pagination.totalPages ? "primary" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pagination.totalPages)}
                    className="h-8 w-8 p-0"
                  >
                    {pagination.totalPages}
                  </ButtonCustom>
                </>
              )}

              <ButtonCustom
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="h-8 px-3"
              >
                Próxima
              </ButtonCustom>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
