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
}

export function UsuarioTable({
  usuarios,
  isLoading = false,
  pageSize = 10,
  sortDirection = "asc",
  onSortChange,
}: UsuarioTableProps) {
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
                <UsuarioRow key={usuario.id} usuario={usuario} />
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
