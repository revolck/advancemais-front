"use client";

import React from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Badge } from "@/components/ui/badge";
import type { EmpresaVagaCategoria, EmpresaVagaSubcategoria } from "@/api/empresas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SubcategoriasModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoria: EmpresaVagaCategoria | null;
}

export function SubcategoriasModal({
  isOpen,
  onOpenChange,
  categoria,
}: SubcategoriasModalProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  const subcategorias = categoria?.subcategorias || [];

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Subcategorias de "{categoria?.nome}"</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-4 p-1">
          {subcategorias.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500">
                Esta categoria ainda não possui subcategorias corporativas.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {subcategorias.map((subcategoria: EmpresaVagaSubcategoria) => (
                <div
                  key={subcategoria.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {subcategoria.nome}
                        </h4>
                        {subcategoria.codSubcategoria && (
                          <Badge variant="secondary" className="text-xs">
                            {subcategoria.codSubcategoria}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {subcategoria.descricao}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Criado em: {formatDate(subcategoria.criadoEm)}
                        </span>
                        {subcategoria.atualizadoEm &&
                          subcategoria.atualizadoEm !==
                            subcategoria.criadoEm && (
                            <span>
                              Atualizado em:{" "}
                              {formatDate(subcategoria.atualizadoEm)}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalBody>

        <ModalFooter className="px-1 py-2">
          <div className="flex w-full justify-end">
            <ButtonCustom variant="outline" onClick={handleClose} size="md">
              Fechar
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

