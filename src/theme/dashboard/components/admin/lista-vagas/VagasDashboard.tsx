"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { ButtonCustom, EmptyState, FilterBar } from "@/components/ui/custom";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";

// Importar os componentes específicos de cada role
import { VagasRow as EmpresaVagasRow } from "@/app/dashboard/vagas/empresa/VagasRow";
import { VagasRow as AdminVagasRow } from "@/app/dashboard/vagas/admin/VagasRow";
import { VagasRow as RecrutadorVagasRow } from "@/app/dashboard/vagas/recrutador/VagasRow";
import { VagasRow as PsicologoVagasRow } from "@/app/dashboard/vagas/psicologo/VagasRow";

const VAGAS_DASHBOARD_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50],
};

export function VagasDashboard({
  className,
  fetchFromApi = true,
  itemsPerPage: itemsPerPageProp,
  pageSize: pageSizeProp,
  onDataLoaded,
  onError,
}: {
  className?: string;
  fetchFromApi?: boolean;
  itemsPerPage?: number;
  pageSize?: number;
  onDataLoaded?: (data: any[], response?: any) => void;
  onError?: (message: string) => void;
}) {
  const userRole = useUserRole();
  const defaultPageSize =
    pageSizeProp ?? itemsPerPageProp ?? VAGAS_DASHBOARD_CONFIG.defaultPageSize;

  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const searchTermRef = useRef(searchTerm);
  const pageSizeRef = useRef(pageSize);

  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  useEffect(() => {
    pageSizeRef.current = pageSize;
  }, [pageSize]);

  const renderRoleComponent = () => {
    switch (userRole) {
      case UserRole.EMPRESA:
        return <EmpresaVagasRow />;
      case UserRole.ADMIN:
        return <AdminVagasRow />;
      case UserRole.RECRUTADOR:
        return <RecrutadorVagasRow />;
      case UserRole.PSICOLOGO:
        return <PsicologoVagasRow />;
      default:
        return <div>Role não encontrada</div>;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vagas</h1>
      </div>

      <div className="space-y-4">{renderRoleComponent()}</div>
    </div>
  );
}
