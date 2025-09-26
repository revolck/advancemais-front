"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Ban,
  ChevronDown,
  ChevronLeft,
  CreditCard,
  KeyRound,
  UserCog,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminCompanyDetail } from "@/api/empresas/admin/types";
import { formatCnpj } from "../utils";
import { getInitials } from "../utils/formatters";

interface HeaderInfoProps {
  company: AdminCompanyDetail;
  onEditCompany: () => void;
  onEditAddress: () => void;
  onBanCompany: () => void;
  onUnbanCompany: () => void;
  onEditSubscription: () => void;
  onResetPassword: () => void;
}

export function HeaderInfo({
  company,
  onEditCompany,
  onEditAddress,
  onBanCompany,
  onUnbanCompany,
  onEditSubscription,
  onResetPassword,
}: HeaderInfoProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const isCompanyActive = company.status === "ATIVO" || company.ativa;
  const formattedCnpj = formatCnpj(company.cnpj);
  const cnpjLabel =
    formattedCnpj !== "—" ? formattedCnpj : "CNPJ não informado";

  // Verificar se a empresa tem um plano (qualquer tipo de plano)
  const hasPlan = Boolean(
    company.plano &&
      (company.plano.nome ||
        company.plano.valor ||
        company.plano.modo ||
        company.plano.inicio ||
        company.plano.fim)
  );
  const subscriptionActionText = hasPlan
    ? "Editar assinatura"
    : "Adicionar assinatura";

  // Verificar se a empresa está banida ou bloqueada
  const isCompanyBanned = company.banida || company.banimentoAtivo;
  const isCompanyBlocked = company.bloqueada || company.bloqueioAtivo;
  const isCompanyRestricted = isCompanyBanned || isCompanyBlocked;
  const banActionText = isCompanyRestricted
    ? "Desbloquear empresa"
    : "Bloquear empresa";

  const statusColor = company.banimentoAtivo
    ? "bg-amber-500"
    : isCompanyBlocked
    ? "bg-red-500"
    : isCompanyActive
    ? "bg-emerald-500"
    : "bg-rose-500";
  const statusLabel = company.banimentoAtivo
    ? "Empresa banida"
    : isCompanyBlocked
    ? "Empresa bloqueada"
    : isCompanyActive
    ? "Empresa ativa"
    : "Empresa inativa";

  const badges: React.ReactNode[] = [];
  if (company.parceira) {
    badges.push(
      <Badge
        key="parceira"
        className="inline-flex items-center gap-1 rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700"
      >
        Parceira
      </Badge>
    );
  }
  if (company.banimentoAtivo) {
    badges.push(
      <Badge
        key="banida"
        className="inline-flex items-center gap-1 rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700"
      >
        Banida
      </Badge>
    );
  }
  if (isCompanyBlocked && !company.banimentoAtivo) {
    badges.push(
      <Badge
        key="bloqueada"
        className="inline-flex items-center gap-1 rounded-full border border-red-200/70 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700"
      >
        Bloqueada
      </Badge>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white">
      <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="h-20 w-20 shrink-0 text-base">
              <AvatarImage
                src={company.avatarUrl || undefined}
                alt={company.nome}
              />
              <AvatarFallback className="bg-primary/10 text-primary/80 text-base font-semibold">
                {getInitials(company.nome)}
              </AvatarFallback>
            </Avatar>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "absolute bottom-1 right-1 inline-flex size-4 items-center justify-center rounded-full border-2 border-white cursor-pointer",
                    statusColor
                  )}
                  aria-label={statusLabel}
                >
                  <span className="sr-only">{statusLabel}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>{statusLabel}</TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold !mb-0">{company.nome}</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 font-mono">
              <span>CNPJ: {cnpjLabel}</span>
            </div>
            {badges.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {badges.map((b) => b)}
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          <DropdownMenu open={isActionsOpen} onOpenChange={setIsActionsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                aria-expanded={isActionsOpen}
                className="flex items-center gap-2 rounded-full bg-[var(--primary-color)] px-6 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-color)]/90"
              >
                Ações
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isActionsOpen ? "rotate-180" : "rotate-0"
                  )}
                  aria-hidden="true"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onSelect={onEditCompany}
                className="cursor-pointer"
              >
                <UserCog className="h-4 w-4 text-gray-500" />
                <span>Editar empresa</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={onEditAddress}
                className="cursor-pointer"
              >
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>Editar endereço</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={onEditSubscription}
                className="cursor-pointer"
              >
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span>{subscriptionActionText}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={isCompanyRestricted ? onUnbanCompany : onBanCompany}
                className="cursor-pointer"
              >
                <Ban className="h-4 w-4 text-gray-500" />
                <span>{banActionText}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={onResetPassword}
                className="cursor-pointer"
              >
                <KeyRound className="h-4 w-4 text-gray-500" />
                <span>Resetar senha</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-none px-5 py-2 text-sm font-medium hover:bg-gray-200 bg-gray-100/70 hover:text-accent-foreground transition-all duration-200"
          >
            <Link href="/empresas" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
