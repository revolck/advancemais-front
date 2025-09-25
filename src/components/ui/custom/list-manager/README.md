# ListManager - Modal de Delete Customizável

Este documento explica como usar o `DeleteConfirmModal` genérico e customizável em diferentes telas da aplicação.

## ✅ Implementações Atuais

### 1. Categorias de Curso

**Arquivo:** `src/app/dashboard/config/dashboard/cursos/categorias/components/CategoriaRow.tsx`

**Características:**

- Alertas sobre subcategorias vinculadas
- Impacto em cursos associados
- Contagem dinâmica de subcategorias
- Botão: "Sim, excluir categoria"

### 2. Planos Empresariais

**Arquivo:** `src/app/dashboard/config/dashboard/planos-empresarial/planos/components/PlanoRow.tsx`

**Características:**

- Alertas sobre empresas com assinatura ativa
- Impacto em configurações relacionadas
- Botão: "Sim, excluir plano"
- Título: "Excluir Plano Empresarial"

## 🚀 Como Implementar em Novas Telas

### Passo 1: Importar o Modal

```tsx
import { DeleteConfirmModal } from "@/components/ui/custom/list-manager/components/DeleteConfirmModal";
```

### Passo 2: Criar Conteúdo Customizado (Opcional)

```tsx
const customDeleteContent = (item: YourItemType) => (
  <div className="space-y-4">
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-sm font-medium text-red-800">
        Alertas específicos para este tipo de item
      </p>
      <ul className="text-xs text-gray-700 space-y-1 mt-2 ml-3">
        <li>• Impacto específico 1</li>
        <li>• Impacto específico 2</li>
        <li>• Impacto específico 3</li>
      </ul>
    </div>
  </div>
);
```

### Passo 3: Usar o Modal

```tsx
<DeleteConfirmModal<YourItemType>
  isOpen={showModal}
  onOpenChange={setShowModal}
  item={yourItem}
  itemName="o item"
  onConfirmDelete={handleDelete}
  customDeleteContent={customDeleteContent} // Opcional
  confirmButtonText="Sim, excluir item" // Opcional
  title="Excluir Item" // Opcional
/>
```

## 🎨 Exemplos de Customização

### Usuários

```tsx
const customUserContent = (user: User) => (
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
```

### Produtos

```tsx
const customProductContent = (product: Product) => (
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
```

### Subcategorias

```tsx
const customSubcategoryContent = (subcategory: Subcategory) => {
  const coursesCount = subcategory.courses?.length || 0;

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-2">
          <div className="space-y-1">
            <p className="text-sm font-medium !text-red-800 !leading-normal">
              Esta ação é irreversível e pode impactar todo o sistema!
            </p>
            <ul className="text-xs text-gray-700 space-y-1 ml-3">
              {coursesCount > 0 && (
                <li>
                  • {coursesCount} curso{coursesCount > 1 ? "s" : ""} associado
                  {coursesCount > 1 ? "s" : ""} a esta subcategoria serão afetados
                </li>
              )}
              <li>
                • Todas as configurações e dados relacionados serão perdidos
              </li>
              <li>• A subcategoria será removida permanentemente do sistema</li>
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
```

## 🔧 Props do DeleteConfirmModal

| Prop                   | Tipo                           | Obrigatório | Descrição                              |
| ---------------------- | ------------------------------ | ----------- | -------------------------------------- |
| `isOpen`               | `boolean`                      | ✅          | Estado de abertura do modal            |
| `onOpenChange`         | `(open: boolean) => void`      | ✅          | Callback para mudança de estado        |
| `item`                 | `T \| null`                    | ✅          | Item a ser excluído                    |
| `itemName`             | `string`                       | ✅          | Nome do tipo de item (ex: "o usuário") |
| `onConfirmDelete`      | `(item: T) => void`            | ✅          | Callback de confirmação                |
| `isDeleting`           | `boolean`                      | ❌          | Estado de loading                      |
| `customDeleteContent`  | `(item: T) => React.ReactNode` | ❌          | Conteúdo customizado                   |
| `defaultDeleteContent` | `(item: T) => React.ReactNode` | ❌          | Conteúdo padrão customizado            |
| `confirmButtonText`    | `string`                       | ❌          | Texto do botão de confirmação          |
| `title`                | `string`                       | ❌          | Título do modal                        |
| `description`          | `string`                       | ❌          | Descrição customizada                  |

## 🎯 Vantagens

- **Reutilização**: Um modal para todas as telas
- **Flexibilidade**: Conteúdo personalizado por contexto
- **Consistência**: Design uniforme em toda aplicação
- **TypeScript**: Tipagem forte e segura
- **Manutenção**: Código centralizado e fácil de manter

## 📝 Notas Importantes

1. **Detecção Automática de Nome**: O modal detecta automaticamente propriedades como `nome`, `name` ou `title` para exibir o nome do item.

2. **Conteúdo Padrão**: Se nenhum conteúdo customizado for fornecido, o modal usa um conteúdo padrão genérico.

3. **Estados de Loading**: O modal gerencia automaticamente estados de loading e desabilita botões durante operações.

4. **Acessibilidade**: O modal inclui todas as práticas de acessibilidade necessárias.
