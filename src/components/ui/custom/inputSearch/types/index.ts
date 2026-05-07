import type * as React from "react";

export type InputSearchMode = "single" | "multiple";

export type InputSearchApiField = "cnpj" | "cpf" | "name" | "email" | "cod";

export type InputSearchSize = "sm" | "md" | "lg";

export type InputSearchRecord = Record<string, unknown>;

export interface InputSearchRequest {
  query: string;
  page: number;
  limit: number;
  fields: InputSearchApiField[];
  signal?: AbortSignal;
}

export interface InputSearchOption<TItem = InputSearchRecord> {
  id: string;
  label: string;
  description?: string;
  metadata?: Partial<Record<InputSearchApiField, string>> &
    Record<string, unknown>;
  raw?: TItem;
}

export interface InputSearchResponse<TItem = InputSearchRecord> {
  items?: TItem[];
  data?: TItem[];
  results?: TItem[];
  options?: Array<TItem | InputSearchOption<TItem>>;
  usuarios?: TItem[];
  empresas?: TItem[];
  alunos?: TItem[];
  instrutores?: TItem[];
  candidatos?: TItem[];
  pagination?: {
    total?: number;
    page?: number;
    pages?: number;
    totalPages?: number;
    limit?: number;
    pageSize?: number;
  };
  total?: number;
}

export type InputSearchFetcher<TItem = InputSearchRecord> = (
  request: InputSearchRequest
) => Promise<InputSearchResponse<TItem> | TItem[] | InputSearchOption<TItem>[]>;

export interface InputSearchApiProps<TItem = InputSearchRecord> {
  fetcher: InputSearchFetcher<TItem>;
  fields?: InputSearchApiField[];
  debounceMs?: number;
  minLength?: number;
  limit?: number;
  mapItem?: (item: TItem) => InputSearchOption<TItem>;
}

export type InputSearchSelection<TItem = InputSearchRecord> =
  | InputSearchOption<TItem>
  | InputSearchOption<TItem>[]
  | null;

export interface InputSearchProps<TItem = InputSearchRecord>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  id?: string;
  name?: string;
  label?: React.ReactNode;
  placeholder?: string;
  helperText?: React.ReactNode;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  size?: InputSearchSize;
  mode?: InputSearchMode;
  value?: InputSearchSelection<TItem>;
  defaultValue?: InputSearchSelection<TItem>;
  onChange?: (value: InputSearchSelection<TItem>) => void;
  onOptionSelect?: (option: InputSearchOption<TItem>) => void;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  apiProps: InputSearchApiProps<TItem>;
  clearable?: boolean;
  enableVoiceSearch?: boolean;
  loadingText?: string;
  emptyText?: string;
  searchHintText?: string;
  maxResultsHeight?: number;
}
