"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Icon } from "@/components/ui/custom/Icons";
import { toastCustom } from "@/components/ui/custom/toast";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ModalCustom, {
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from "@/components/ui/custom/modal";

import type { ListManagerProps, ListItem, TableColumn } from "./types";
import { LIST_ANIMATIONS } from "./constants";
import { ListEmptyState } from "./components";
import { cn } from "@/lib/utils";

export function ListManager({
  initialItems = [],
  entityName,
  entityNamePlural,
  maxItems,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  renderItem,
  renderCreateForm,
  renderEditForm,
  className,
  showEmptyState = true,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateAction,
  modalCreateTitle,
  modalEditTitle,
  emptyStateFirstItemText,
  createButtonText,
  tableColumns,
  disableAutoToasts = false,
  enablePagination = false,
  itemsPerPage = 10,
}: ListManagerProps) {
  // Local state management
  const [items, setItems] = useState<ListItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"list" | "form">("list");
  const [editingItem, setEditingItem] = useState<ListItem | null>(null);
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination calculations
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = enablePagination
    ? items.slice(startIndex, endIndex)
    : items;

  // Reset to first page when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  // Update items when initialItems change
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Statistics
  const activeItems = items.filter((item) => item.status !== false).length;

  /**
   * Handle form submission (create or update)
   */
  const handleFormSubmit = useCallback(
    async (itemData: Omit<ListItem, "id" | "createdAt">) => {
      setIsLoading(true);
      setError(null);

      try {
        if (editingItem) {
          // Update existing item
          const updatedItem = await onUpdateItem(editingItem.id, itemData);
          setItems((prev) =>
            prev.map((item) =>
              item.id === editingItem.id ? updatedItem : item
            )
          );
          if (!disableAutoToasts) {
            toastCustom.success(`${entityName} atualizado com sucesso!`);
          }
        } else {
          // Create new item
          const newItem = await onCreateItem(itemData);
          setItems((prev) => [...prev, newItem]);
          if (!disableAutoToasts) {
            toastCustom.success(`${entityName} criado com sucesso!`);
          }
        }

        // Reset form state
        setCurrentView("list");
        setEditingItem(null);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro ao processar solicitação";
        setError(errorMessage);
        toastCustom.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [editingItem, onUpdateItem, onCreateItem, entityName, disableAutoToasts]
  );

  /**
   * Handle creating new item
   */
  const handleCreateNew = useCallback(() => {
    if (typeof maxItems === "number" && items.length >= maxItems) {
      toastCustom.error(
        `Limite de ${maxItems} ${entityNamePlural.toLowerCase()} atingido.`
      );
      return;
    }
    setEditingItem(null);
    setCurrentView("form");
  }, [maxItems, items.length, entityNamePlural]);

  /**
   * Handle back to list
   */
  const handleBackToList = useCallback(() => {
    setCurrentView("list");
    setEditingItem(null);
  }, []);

  /**
   * Handle delete item (com loading individual)
   */
  const handleDeleteItem = useCallback(
    async (id: string) => {
      setError(null);
      setDeletingItems((prev) => new Set(prev).add(id));

      try {
        await onDeleteItem(id);
        setItems((prev) => prev.filter((item) => item.id !== id));
        if (!disableAutoToasts) {
          toastCustom.success(`${entityName} excluído com sucesso!`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao excluir item";
        setError(errorMessage);
        toastCustom.error(errorMessage);
      } finally {
        setDeletingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    },
    [onDeleteItem, entityName, disableAutoToasts]
  );

  /**
   * Handle edit item
   */
  const handleEditItem = useCallback((item: ListItem) => {
    setEditingItem(item);
    setCurrentView("form");
  }, []);

  /**
   * Clear errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Função para renderizar cabeçalhos das colunas
  const renderTableHeaders = () => {
    if (!tableColumns || tableColumns.length === 0) {
      // Fallback para colunas padrão (compatibilidade com código existente)
      return (
        <>
          <TableHead className="min-w-[200px] max-w-[240px]">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Plano
            </span>
          </TableHead>
          <TableHead className="min-w-[140px] max-w-[180px]">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Valor
            </span>
          </TableHead>
          <TableHead className="min-w-[120px] max-w-[150px]">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Tipo
            </span>
          </TableHead>
          <TableHead className="min-w-[120px] max-w-[150px]">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Desconto
            </span>
          </TableHead>
          <TableHead className="min-w-[120px] max-w-[150px]">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Vagas
            </span>
          </TableHead>
          <TableHead className="min-w-[120px] max-w-[150px]">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Destaque
            </span>
          </TableHead>
          <TableHead className="min-w-[140px] max-w-[180px]">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">Qtd.</span>
                </TooltipTrigger>
                <TooltipContent sideOffset={8}>Quantidade</TooltipContent>
              </Tooltip>{" "}
              de Destaque
            </span>
          </TableHead>
          <TableHead className="text-right w-16"></TableHead>
        </>
      );
    }

    return (
      <>
        {tableColumns.map((column) => (
          <TableHead
            key={column.key}
            className={column.className || "min-w-[120px] max-w-[150px]"}
          >
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {column.tooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">{column.label}</span>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={8}>
                    {column.tooltip}
                  </TooltipContent>
                </Tooltip>
              ) : (
                column.label
              )}
            </span>
          </TableHead>
        ))}
        <TableHead className="text-right w-16"></TableHead>
      </>
    );
  };

  return (
    <div
      className={cn("w-full max-w-7xl mx-auto relative", className)}
      aria-busy={isLoading}
      aria-live="polite"
    >
      {/* Header */}
      <div className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Title Section */}
            <div>
              <motion.div
                {...LIST_ANIMATIONS.FADE_IN}
                className="flex items-center gap-2"
              >
                <h3>Gerenciador de {entityNamePlural.toLowerCase()}</h3>
                {typeof maxItems === "number" && items.length >= maxItems && (
                  <Badge
                    variant="secondary"
                    className="uppercase tracking-wide mb-4 ml-2"
                  >
                    <Icon name="CircleSlash2" /> Limite atingido
                  </Badge>
                )}
              </motion.div>
              <motion.p
                {...LIST_ANIMATIONS.FADE_IN}
                className="text-muted-foreground mt-[-16] text-lg"
              >
                O sistema está gerenciando{" "}
                <span className="font-semibold">
                  {activeItems} {entityNamePlural.toLowerCase()} ativos
                </span>
                .
              </motion.p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {(typeof maxItems !== "number" || items.length < maxItems) && (
              <ButtonCustom
                onClick={handleCreateNew}
                disabled={isLoading}
                className="h-11 px-6"
              >
                {isLoading ? (
                  <>
                    <Icon
                      name="Loader2"
                      className="h-5 w-5 mr-2 animate-spin"
                    />
                    Processando…
                  </>
                ) : (
                  <>
                    <Icon name="Plus" className="h-5 w-5 mr-2" />
                    {createButtonText || `Novo ${entityName}`}
                  </>
                )}
              </ButtonCustom>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div {...LIST_ANIMATIONS.SLIDE_IN} className="mt-4">
            <Alert variant="destructive" className="rounded-xl">
              <AlertDescription className="text-base">
                {error}
                <ButtonCustom
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="ml-4 h-auto p-1 text-sm underline hover:no-underline"
                >
                  Dispensar
                </ButtonCustom>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="p-0">
        <AnimatePresence mode="wait">
          <motion.div key="list" {...LIST_ANIMATIONS.FADE_IN} className="pt-4">
            {items.length === 0 && showEmptyState ? (
              <ListEmptyState
                entityName={entityName}
                entityNamePlural={entityNamePlural}
                maxItems={maxItems}
                emptyStateTitle={emptyStateTitle}
                emptyStateDescription={emptyStateDescription}
                emptyStateAction={emptyStateAction}
                emptyStateFirstItemText={emptyStateFirstItemText}
              />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100 bg-gray-50/50">
                      {renderTableHeaders()}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((item) => (
                      <TableRow
                        key={item.id}
                        className="border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        {renderItem(
                          item,
                          handleEditItem,
                          handleDeleteItem,
                          deletingItems.has(item.id)
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Pagination Controls */}
        {enablePagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-4 py-3">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Mostrando {startIndex + 1} a {Math.min(endIndex, items.length)}{" "}
                de {items.length} {entityNamePlural.toLowerCase()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ButtonCustom
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3"
              >
                Anterior
              </ButtonCustom>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <ButtonCustom
                      key={pageNumber}
                      variant={
                        currentPage === pageNumber ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      className="h-8 w-8 p-0"
                    >
                      {pageNumber}
                    </ButtonCustom>
                  );
                })}
              </div>
              <ButtonCustom
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="h-8 px-3"
              >
                Próxima
              </ButtonCustom>
            </div>
          </div>
        )}

        {/* Modal for create/edit */}
        <ModalCustom
          isOpen={currentView === "form"}
          onOpenChange={(open) => {
            if (!open) handleBackToList();
          }}
          isDismissable={!isLoading}
          scrollBehavior="inside"
          size="2xl"
          backdrop="blur"
          classNames={{
            base: "max-h-[95vh]",
            body: "overflow-hidden",
          }}
        >
          <ModalContentWrapper>
            <ModalHeader>
              <ModalTitle className="!text-xl md:text-lg font-semibold">
                {editingItem
                  ? modalEditTitle || `Editar ${entityName.toLowerCase()}`
                  : modalCreateTitle || `Criar ${entityName.toLowerCase()}`}
              </ModalTitle>
            </ModalHeader>
            <ModalBody className="pr-1">
              {editingItem
                ? renderEditForm(
                    editingItem,
                    async (id, data) => {
                      await handleFormSubmit(data);
                    },
                    handleBackToList,
                    isLoading
                  )
                : renderCreateForm(
                    async (data) => {
                      await handleFormSubmit(data);
                    },
                    handleBackToList,
                    isLoading
                  )}
            </ModalBody>
          </ModalContentWrapper>
        </ModalCustom>
      </div>

      {/* Global loading overlay to prevent interactions during API ops */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="list-manager-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="flex items-center gap-3 bg-muted/60 rounded-xl px-4 py-3 border border-border/50 shadow-sm">
              <Icon
                name="Loader2"
                className="h-5 w-5 animate-spin text-muted-foreground"
              />
              <span className="text-sm text-muted-foreground">
                Processando…
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Default export
export default ListManager;
