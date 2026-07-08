import type {
  ListRecipientListsParams,
  RecipientListListItem,
  RecipientListMembershipMode,
  RecipientListPagination,
  RecipientListStatus,
} from "@/api/websites/components/recipientlists";
import type { DateRange } from "@/components/ui/custom/date-picker";

export interface RecipientListsDashboardFilters
  extends ListRecipientListsParams {
  page: number;
  pageSize: number;
}

export interface RecipientListsFilterState {
  pendingSearch: string;
  selectedStatus: string | null;
  selectedMembershipMode: string | null;
  selectedUpdatedAt: DateRange;
}

export interface RecipientListsDashboardDataReturn {
  lists: RecipientListListItem[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  pagination?: RecipientListPagination;
  visiblePages: number[];
  filters: RecipientListsDashboardFilters;
  pendingSearch: string;
  selectedStatus: string | null;
  selectedMembershipMode: string | null;
  selectedUpdatedAt: DateRange;
  listToDelete: RecipientListListItem | null;
  deletingId?: string;
  recalculatingId?: string;
  showEmptyState: boolean;
  updateFilters: (next: Partial<ListRecipientListsParams>) => void;
  setPendingSearch: (value: string) => void;
  handleFilterChange: (
    key: string,
    value: string | string[] | DateRange | Date | null,
  ) => void;
  handlePageChange: (page: number) => void;
  handleOpenDelete: (id: string) => void;
  handleDeleteOpenChange: (open: boolean) => void;
  handleConfirmDelete: (item: RecipientListListItem) => void;
  handleRecalculate: (id: string) => void;
  handleEdit: (id: string) => void;
}

export type RecipientListDashboardScalarFilter =
  | RecipientListStatus
  | RecipientListMembershipMode
  | null;
