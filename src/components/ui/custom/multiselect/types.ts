export interface MultiSelectOption {
  value: string;
  label: string;
  disable?: boolean;
  /** fixed option that can't be removed. */
  fixed?: boolean;
  /** Group the options by providing key. */
  [key: string]: string | boolean | undefined | any;
}

export interface MultiSelectGroupOption {
  [key: string]: MultiSelectOption[];
}

export interface MultiSelectRef {
  selectedValue: MultiSelectOption[];
  input: HTMLInputElement;
  focus: () => void;
  reset: () => void;
}

export interface MultiSelectProps {
  label?: string;
  required?: boolean;
  containerClassName?: string;
  fullWidth?: boolean;
  value?: MultiSelectOption[];
  defaultOptions?: MultiSelectOption[];
  /** manually controlled options */
  options?: MultiSelectOption[];
  placeholder?: string;
  /** Loading component. */
  loadingIndicator?: React.ReactNode;
  /** Empty component. */
  emptyIndicator?: React.ReactNode;
  /** Debounce time for async search. Only work with `onSearch`. */
  delay?: number;
  /** Trigger search on focus (only with onSearch or onSearchSync) */
  triggerSearchOnFocus?: boolean;
  /** async search */
  onSearch?: (value: string) => Promise<MultiSelectOption[]>;
  /** sync search */
  onSearchSync?: (value: string) => MultiSelectOption[];
  onChange?: (options: MultiSelectOption[]) => void;
  /** Limit the maximum number of selected options. */
  maxSelected?: number;
  /** When the number of selected options exceeds the limit. */
  onMaxSelected?: (maxLimit: number) => void;
  /** Hide the placeholder when there are options selected. */
  hidePlaceholderWhenSelected?: boolean;
  disabled?: boolean;
  /** Group the options base on provided key. */
  groupBy?: string;
  className?: string;
  badgeClassName?: string;
  /** Visual size to align with input sizes */
  size?: "sm" | "md" | "lg";
  /** Avoid cmdk first item auto-select (workaround). */
  selectFirstItem?: boolean;
  /** Allow user to create option when there is no option matched. */
  creatable?: boolean;
  /** Props of `Command` */
  commandProps?: React.ComponentPropsWithoutRef<any>;
  /** Props of `CommandInput` */
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<any>,
    "value" | "placeholder" | "disabled"
  >;
  /** hide the clear all button. */
  hideClearAllButton?: boolean;
  /** Show a selected counter badge on the right */
  showCountBadge?: boolean;
  /** Limit number of visible tags before collapsing */
  maxVisibleTags?: number;
}
