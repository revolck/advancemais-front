"use client";

import { useState } from "react";
import {
  AlertCircle,
  CreditCard,
  Loader2,
  Star,
  Trash2,
} from "lucide-react";

import type { CartaoEmpresa } from "@/api/empresas/cartoes/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState, toastCustom } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useCartoes,
  useDefinirCartaoPadrao,
  useRemoverCartao,
} from "@/hooks";
import { cn } from "@/lib/utils";

const formatCardExpiration = (month: number, year: number) =>
  `${String(month).padStart(2, "0")}/${year}`;

const getCardLabel = (card: CartaoEmpresa) =>
  `${card.bandeira || "Cartão"} final ${card.ultimos4Digitos}`;

export function RegisteredCardsList() {
  const {
    data: cards = [],
    isLoading,
    error,
  } = useCartoes();
  const setDefaultCard = useDefinirCartaoPadrao();
  const removeCard = useRemoverCartao();
  const [cardToRemove, setCardToRemove] = useState<CartaoEmpresa | null>(null);

  const handleSetDefault = async (card: CartaoEmpresa) => {
    try {
      await setDefaultCard.mutateAsync(card.id);
      toastCustom.success(`${getCardLabel(card)} definido como padrão.`);
    } catch (mutationError) {
      toastCustom.error(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível definir o cartão como padrão."
      );
    }
  };

  const handleRemove = async () => {
    if (!cardToRemove) return;

    try {
      await removeCard.mutateAsync(cardToRemove.id);
      toastCustom.success(`${getCardLabel(cardToRemove)} removido com sucesso.`);
      setCardToRemove(null);
    } catch (mutationError) {
      toastCustom.error(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível excluir o cartão."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <Skeleton className="h-11 w-full rounded-none" />
        <Skeleton className="mt-px h-20 w-full rounded-none" />
        <Skeleton className="mt-px h-20 w-full rounded-none" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar cartões cadastrados.
        </AlertDescription>
      </Alert>
    );
  }

  if (cards.length === 0) {
    return (
      <EmptyState
        illustration="subscription"
        title="Nenhum cartão cadastrado"
        description="Adicione um cartão para renovação automática do seu plano"
        size="sm"
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="hidden min-h-11 grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_88px_80px] items-center gap-3 border-b border-gray-200 bg-gray-50 px-4 text-xs font-medium text-gray-600 md:grid">
          <span>Cartão</span>
          <span>Nome no cartão</span>
          <span>Vencimento</span>
          <span className="text-right">Ações</span>
        </div>

        <div className="divide-y divide-gray-200">
          {cards.map((card) => {
            const label = getCardLabel(card);
            const isSettingDefault =
              setDefaultCard.isPending && setDefaultCard.variables === card.id;
            const cannotRemoveDefault = card.isPadrao && cards.length > 1;

            return (
              <div
                key={card.id}
                data-testid={`registered-card-${card.id}`}
                className={cn(
                  "grid gap-4 px-4 py-4 transition-colors hover:bg-gray-50/70",
                  "md:min-h-20 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_88px_80px] md:items-center md:gap-3"
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-blue-100 bg-blue-50 text-blue-700">
                    <CreditCard className="size-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="!mb-0 break-words !text-sm !font-semibold !leading-5 !text-gray-900">
                        {label}
                      </p>
                      {card.isPadrao && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                          <Star className="size-3 fill-current" aria-hidden="true" />
                          Padrão
                        </span>
                      )}
                    </div>
                    <p className="!mb-0 mt-1 !text-xs !text-gray-500 md:hidden">
                      {card.tipo === "debito" ? "Débito" : "Crédito"}
                    </p>
                  </div>
                </div>

                <div className="min-w-0">
                  <span className="mb-1 block text-[11px] font-medium uppercase text-gray-400 md:hidden">
                    Nome no cartão
                  </span>
                  <p className="!mb-0 break-words !text-sm !leading-5 !text-gray-700">
                    {card.nomeNoCartao || "Não informado"}
                  </p>
                </div>

                <div>
                  <span className="mb-1 block text-[11px] font-medium uppercase text-gray-400 md:hidden">
                    Vencimento
                  </span>
                  <p className="!mb-0 !text-sm !font-medium !text-gray-700">
                    {formatCardExpiration(
                      card.mesExpiracao,
                      card.anoExpiracao
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-1 border-t border-gray-100 pt-3 md:border-0 md:pt-0">
                  {!card.isPadrao && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                          aria-label={`Definir ${label} como padrão`}
                          disabled={setDefaultCard.isPending || removeCard.isPending}
                          onClick={() => handleSetDefault(card)}
                        >
                          {isSettingDefault ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Star className="size-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={6}>
                        Definir como padrão
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:bg-red-50 hover:text-red-700"
                          aria-label={`Excluir ${label}`}
                          disabled={
                            cannotRemoveDefault ||
                            setDefaultCard.isPending ||
                            removeCard.isPending
                          }
                          onClick={() => setCardToRemove(card)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={6}>
                      {cannotRemoveDefault
                        ? "Defina outro cartão como padrão antes de excluir"
                        : "Excluir cartão"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AlertDialog
        open={Boolean(cardToRemove)}
        onOpenChange={(open) => {
          if (!open && !removeCard.isPending) setCardToRemove(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cartão?</AlertDialogTitle>
            <AlertDialogDescription>
              {cardToRemove
                ? `${getCardLabel(cardToRemove)} será removido dos pagamentos do plano. Esta ação não pode ser desfeita.`
                : "O cartão será removido dos pagamentos do plano."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeCard.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleRemove();
              }}
              disabled={removeCard.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {removeCard.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir cartão"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
