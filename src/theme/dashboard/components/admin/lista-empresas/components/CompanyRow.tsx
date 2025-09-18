import React from "react";
import { MapPin, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableRow, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import type { Partnership } from "../types";
import { TRIAL_PARTNERSHIP_TYPES } from "../constants";

interface CompanyRowProps {
  partnership: Partnership;
}

function formatCnpj(value?: string | null): string | null {
  if (!value) return null;

  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length === 0) return null;

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }
  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
      5,
      8
    )}/${digits.slice(8)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
    5,
    8
  )}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function formatCurrency(value?: string | null): string {
  if (!value) return "—";

  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    return value;
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parsed);
}

function formatDate(value?: string | null): string {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getPartnershipBadge(partnership: Partnership) {
  if (partnership.tipo === "parceiro" || partnership.empresa.parceira) {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
        Parceira
      </Badge>
    );
  }

  if (partnership.tipo && TRIAL_PARTNERSHIP_TYPES.includes(partnership.tipo)) {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200">
        Teste
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="text-xs">
      Mensal
    </Badge>
  );
}

export const CompanyRow: React.FC<CompanyRowProps> = ({ partnership }) => {
  const vagasTotal = partnership.plano.quantidadeVagas ?? 0;
  const vagasPublicadas =
    partnership.plano.vagasPublicadas ??
    partnership.raw?.vagas?.publicadas ??
    0;
  const percent =
    vagasTotal > 0
      ? Math.min(100, Math.round((vagasPublicadas / vagasTotal) * 100))
      : 0;
  const formattedCnpj = formatCnpj(partnership.empresa.cnpj);

  return (
    <TableRow className="border-gray-100 hover:bg-gray-50/50 transition-colors">
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={partnership.empresa.avatarUrl || undefined}
              alt={partnership.empresa.nome}
            />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-medium">
              {partnership.empresa.nome.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-bold text-gray-900 truncate">
                {partnership.empresa.nome}
              </div>
              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500">
                {partnership.empresa.codUsuario}
              </code>
            </div>
            {formattedCnpj && (
              <div className="text-xs text-gray-500 font-mono">
                {formattedCnpj}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium text-sm text-gray-900">
            {partnership.plano.nome}
          </div>
          <div className="text-xs text-gray-500">
            {formatCurrency(partnership.plano.valor)}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="h-3 w-3" />
          <span>
            {partnership.empresa.cidade || "—"}/
            {partnership.empresa.estado || "—"}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          className={
            partnership.empresa.ativo
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-red-100 text-red-800 border-red-200"
          }
        >
          {partnership.empresa.ativo ? "Ativa" : "Inativa"}
        </Badge>
      </TableCell>
      <TableCell>{getPartnershipBadge(partnership)}</TableCell>
      <TableCell>
        <div className="min-w-[120px]">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>
              {vagasPublicadas}/{vagasTotal}
            </span>
            <span>{percent}%</span>
          </div>
          <Progress value={percent} />
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-gray-600">
          {formatDate(partnership.empresa.criadoEm ?? undefined)}
        </span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="Ações da empresa"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem>Histórico</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
