"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import PlanosEmpresarialForm from "./PlanosEmpresarialForm";
import {
  listPlanosEmpresariais,
  type PlanoEmpresarialBackendResponse,
} from "@/api/empresas";
import { toastCustom } from "@/components/ui/custom";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Pencil, Plus } from "lucide-react";

const formatCurrency = (value?: string | number | null) => {
  if (value === null || value === undefined) return "—";
  const numericValue = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numericValue)) return String(value);
  return numericValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
};

const formatPercentage = (value?: number | null) => {
  if (value === null || value === undefined) return "—";
  return `${value}%`;
};

export default function PlanosEmpresariaisSection() {
  const [plans, setPlans] = useState<PlanoEmpresarialBackendResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] =
    useState<PlanoEmpresarialBackendResponse | null>(null);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listPlanosEmpresariais();
      setPlans(data);
    } catch (err) {
      const status = (err as any)?.status;
      switch (status) {
        case 401:
          toastCustom.error("Sessão expirada. Faça login novamente");
          break;
        case 403:
          toastCustom.error("Você não tem permissão para acessar este conteúdo");
          break;
        case 500:
          toastCustom.error("Erro do servidor ao carregar os planos cadastrados");
          break;
        default:
          toastCustom.error("Erro ao carregar os planos empresariais");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleOpenCreate = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: PlanoEmpresarialBackendResponse) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleFormSuccess = (saved: PlanoEmpresarialBackendResponse) => {
    setPlans((prev) => {
      const exists = prev.some((plan) => plan.id === saved.id);
      if (exists) {
        return prev.map((plan) => (plan.id === saved.id ? saved : plan));
      }
      return [...prev, saved];
    });
  };

  const handleDeletePlan = (id: string) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== id));
  };

  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (
      LucideIcons as Record<string, unknown>
    )[iconName] as LucideIcon | undefined;
    if (!IconComponent) return null;
    return <IconComponent className="h-5 w-5 text-muted-foreground" />;
  };

  const maxPlansReached = plans.length >= 4;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Planos cadastrados
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie até quatro planos empresariais com regras de vagas
          </p>
        </div>
        <Button onClick={handleOpenCreate} disabled={maxPlansReached}>
          <Plus className="h-4 w-4" />
          Cadastrar novo plano
        </Button>
      </div>
      {maxPlansReached && (
        <p className="text-xs text-muted-foreground">
          Limite máximo de quatro planos cadastrados. Exclua um plano para
          criar outro.
        </p>
      )}

      <div className="rounded-2xl border border-border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ícone e nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor mensal</TableHead>
              <TableHead>Desconto</TableHead>
              <TableHead>Quantidade de vagas</TableHead>
              <TableHead>Vagas em destaque</TableHead>
              <TableHead>Quantidade de vagas em destaque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={8}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum plano empresarial cadastrado até o momento.
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {renderIcon(plan.icon)}
                      <span className="font-medium text-foreground">
                        {plan.nome || "Plano sem título"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[320px] text-sm text-muted-foreground">
                    <span className="line-clamp-2">{plan.descricao}</span>
                  </TableCell>
                  <TableCell>{formatCurrency(plan.valor)}</TableCell>
                  <TableCell>{formatPercentage(plan.desconto)}</TableCell>
                  <TableCell>{plan.quantidadeVagas ?? "—"}</TableCell>
                  <TableCell>{plan.vagaEmDestaque ? "Sim" : "Não"}</TableCell>
                  <TableCell>
                    {plan.vagaEmDestaque && plan.quantidadeVagasDestaque
                      ? plan.quantidadeVagasDestaque
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(plan)}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableCaption>
            Você pode cadastrar no máximo quatro planos empresariais.
          </TableCaption>
        </Table>
      </div>

      <ModalCustom
        isOpen={isModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
        scrollBehavior="inside"
        size="2xl"
        backdrop="blur"
        classNames={{ base: "max-h-[85vh]" }}
      >
        <ModalContentWrapper>
          <ModalHeader>
            <ModalTitle className="text-lg font-semibold">
              {selectedPlan ? "Editar plano empresarial" : "Cadastrar novo plano"}
            </ModalTitle>
          </ModalHeader>
          <ModalBody className="max-h-[70vh] overflow-y-auto pr-1">
            <PlanosEmpresarialForm
              plan={selectedPlan}
              onSuccess={handleFormSuccess}
              onDelete={handleDeletePlan}
              onClose={handleCloseModal}
              maxPlansReached={maxPlansReached}
            />
          </ModalBody>
        </ModalContentWrapper>
      </ModalCustom>
    </div>
  );
}
