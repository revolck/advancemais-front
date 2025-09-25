export interface ListItem {
  id: string;
  title: string;
  description?: string;
  status?: boolean;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface TableColumn {
  key: string;
  label: string;
  className?: string;
  tooltip?: string;
  sortable?: boolean;
}

export interface ListManagerProps {
  initialItems: ListItem[];
  entityName: string;
  entityNamePlural: string;
  maxItems?: number;
  onCreateItem: (data: Omit<ListItem, "id" | "createdAt">) => Promise<ListItem>;
  onUpdateItem: (id: string, updates: Partial<ListItem>) => Promise<ListItem>;
  onDeleteItem: (id: string) => Promise<void>;
  onRefreshItems?: () => Promise<ListItem[]>;
  renderItem: (
    item: ListItem,
    onEdit: (item: ListItem) => void,
    onDelete: (id: string) => void,
    isDeleting?: boolean
  ) => React.ReactNode;
  renderCreateForm: (
    onSubmit: (data: Omit<ListItem, "id" | "createdAt">) => Promise<void>,
    onCancel: () => void,
    isLoading?: boolean
  ) => React.ReactNode;
  renderEditForm: (
    item: ListItem,
    onUpdate: (id: string, data: Partial<ListItem>) => Promise<void>,
    onCancel: () => void,
    isLoading?: boolean
  ) => React.ReactNode;
  className?: string;
  enableRefresh?: boolean;
  showEmptyState?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateAction?: React.ReactNode;
  // Textos customizáveis para modal
  modalCreateTitle?: string;
  modalEditTitle?: string;
  // Texto customizável para empty state
  emptyStateFirstItemText?: string;
  // Texto customizável para botão de criar
  createButtonText?: string;
  // Colunas customizáveis da tabela
  tableColumns?: TableColumn[];
  // Desabilitar toasts automáticos
  disableAutoToasts?: boolean;
  // Configurações de paginação
  enablePagination?: boolean;
  itemsPerPage?: number;
}

export interface ListManagerState {
  items: ListItem[];
  isLoading: boolean;
  error: string | null;
  currentView: "list" | "form";
  editingItem: ListItem | null;
}

export type ListView = "list" | "form";

export type ListAction =
  | { type: "SET_ITEMS"; payload: ListItem[] }
  | { type: "ADD_ITEM"; payload: ListItem }
  | { type: "UPDATE_ITEM"; payload: ListItem }
  | { type: "DELETE_ITEM"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_VIEW"; payload: ListView }
  | { type: "SET_EDITING_ITEM"; payload: ListItem | null }
  | { type: "RESET" };
