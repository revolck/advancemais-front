/**
 * Exemplos de uso do DeleteConfirmModal customizável
 *
 * Este arquivo demonstra como usar o modal de confirmação de exclusão
 * com conteúdo personalizado para diferentes tipos de itens.
 */

import React from "react";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";

// Exemplo 1: Modal simples para usuários
export function ExampleUserDeleteModal({
  user,
  onDelete,
  isOpen,
  onClose,
}: any) {
  const customUserContent = (user: any) => (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm font-medium text-yellow-800">
          ⚠️ Este usuário possui dados importantes no sistema
        </p>
        <ul className="text-xs text-gray-700 space-y-1 mt-2 ml-3">
          <li>• {user.totalOrders || 0} pedidos realizados</li>
          <li>• {user.totalSpent || 0} em compras</li>
          <li>• Última atividade: {user.lastActivity || "Nunca"}</li>
        </ul>
      </div>
      <p className="text-sm text-gray-600">
        Considere desativar o usuário ao invés de excluí-lo.
      </p>
    </div>
  );

  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      onOpenChange={onClose}
      item={user}
      itemName="o usuário"
      onConfirmDelete={onDelete}
      customDeleteContent={customUserContent}
      confirmButtonText="Sim, excluir usuário"
      title="Excluir Usuário"
    />
  );
}

// Exemplo 2: Modal para produtos com estoque
export function ExampleProductDeleteModal({
  product,
  onDelete,
  isOpen,
  onClose,
}: any) {
  const customProductContent = (product: any) => (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm font-medium text-red-800">
          🚨 Produto com estoque ativo!
        </p>
        <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-medium">Estoque atual:</span>
            <span className="ml-2 text-gray-700">
              {product.stock || 0} unidades
            </span>
          </div>
          <div>
            <span className="font-medium">Valor em estoque:</span>
            <span className="ml-2 text-gray-700">
              R$ {product.stockValue || "0,00"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          💡 Recomendação: Esgote o estoque antes de excluir o produto
        </p>
      </div>
    </div>
  );

  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      onOpenChange={onClose}
      item={product}
      itemName="o produto"
      onConfirmDelete={onDelete}
      customDeleteContent={customProductContent}
      confirmButtonText="Excluir mesmo assim"
      title="Excluir Produto"
    />
  );
}

// Exemplo 3: Modal para categorias (similar ao que implementamos)
export function ExampleCategoryDeleteModal({
  category,
  onDelete,
  isOpen,
  onClose,
}: any) {
  const customCategoryContent = (category: any) => {
    const subcategoriesCount = category.subcategories?.length || 0;
    const productsCount = category.products?.length || 0;

    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2">
            <div className="space-y-1">
              <p className="text-sm font-medium !text-red-800 !leading-normal">
                Esta ação é irreversível e pode impactar todo o sistema!
              </p>
              <ul className="text-xs text-gray-700 space-y-1 ml-3">
                {subcategoriesCount > 0 && (
                  <li>
                    • {subcategoriesCount} subcategoria
                    {subcategoriesCount > 1 ? "s" : ""} vinculada
                    {subcategoriesCount > 1 ? "s" : ""} a esta categoria serão
                    removidas
                  </li>
                )}
                {productsCount > 0 && (
                  <li>
                    • {productsCount} produto{productsCount > 1 ? "s" : ""}{" "}
                    associado{productsCount > 1 ? "s" : ""} a esta categoria
                    serão afetados
                  </li>
                )}
                <li>
                  • Todas as configurações e dados relacionados serão perdidos
                </li>
                <li>• A categoria será removida permanentemente do sistema</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="!text-base text-gray-600 !leading-normal !mb-0">
          Tem certeza absoluta que deseja continuar com esta exclusão?
        </p>
      </div>
    );
  };

  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      onOpenChange={onClose}
      item={category}
      itemName="a categoria"
      onConfirmDelete={onDelete}
      customDeleteContent={customCategoryContent}
      confirmButtonText="Sim, excluir categoria"
      title="Excluir Categoria"
    />
  );
}

// Exemplo 4: Modal padrão (sem customização)
export function ExampleDefaultDeleteModal({
  item,
  onDelete,
  isOpen,
  onClose,
}: any) {
  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      onOpenChange={onClose}
      item={item}
      itemName="o item"
      onConfirmDelete={onDelete}
      // Sem customDeleteContent - usa o conteúdo padrão
    />
  );
}

/**
 * COMO USAR:
 *
 * 1. Importe o DeleteConfirmModal:
 *    import { DeleteConfirmModal } from "@/components/ui/custom/list-manager/components/DeleteConfirmModal";
 *
 * 2. Crie uma função de conteúdo customizado (opcional):
 *    const customContent = (item: YourItemType) => (
 *      <div>Seu conteúdo personalizado aqui</div>
 *    );
 *
 * 3. Use o modal:
 *    <DeleteConfirmModal
 *      isOpen={showModal}
 *      onOpenChange={setShowModal}
 *      item={yourItem}
 *      itemName="o item"
 *      onConfirmDelete={handleDelete}
 *      customDeleteContent={customContent} // Opcional
 *      confirmButtonText="Sim, excluir" // Opcional
 *      title="Excluir Item" // Opcional
 *    />
 */
