"use client";

import * as React from "react";
import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { X, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import type {
  MultiSelectGroupOption as GroupOption,
  MultiSelectOption as Option,
  MultiSelectProps,
  MultiSelectRef,
} from "./types";

function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function transToGroupOption(options: Option[], groupBy?: string): GroupOption {
  if (options.length === 0) return {};
  if (!groupBy) return { "": options };
  const groupOption: GroupOption = {};
  options.forEach((option) => {
    const key = (option[groupBy] as string) || "";
    if (!groupOption[key]) groupOption[key] = [];
    groupOption[key].push(option);
  });
  return groupOption;
}

function removePickedOption(groupOption: GroupOption, picked: Option[]) {
  const clone: GroupOption = {};
  for (const [key, value] of Object.entries(groupOption)) {
    clone[key] = value.filter(
      (val) => !picked.find((p) => p.value === val.value)
    );
  }
  return clone;
}

function isOptionsExist(groupOption: GroupOption, targetOption: Option[]) {
  for (const [, value] of Object.entries(groupOption)) {
    if (
      value.some((option) => targetOption.find((p) => p.value === option.value))
    ) {
      return true;
    }
  }
  return false;
}

// Workaround to ensure Empty renders correctly with cmdk filtering
const ListEmpty = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.Empty>
>(({ className, ...props }, forwardedRef) => {
  const render = useCommandState((state) => state.filtered.count === 0);
  if (!render) return null;
  return (
    <div
      ref={forwardedRef}
      className={cn("px-2 py-4 text-center text-sm", className)}
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  );
});
ListEmpty.displayName = "ListEmpty";

const MultiSelectCustom = React.forwardRef<MultiSelectRef, MultiSelectProps>(
  (
    {
      label,
      required,
      containerClassName,
      fullWidth = true,
      value,
      onChange,
      placeholder,
      defaultOptions: arrayDefaultOptions = [],
      options: arrayOptions,
      delay,
      onSearch,
      onSearchSync,
      loadingIndicator,
      emptyIndicator,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      hidePlaceholderWhenSelected = true,
      disabled,
      groupBy,
      className,
      badgeClassName,
      size = "md",
      selectFirstItem = true,
      creatable = false,
      triggerSearchOnFocus = false,
      commandProps,
      inputProps,
      hideClearAllButton = false,
      showCountBadge = true,
      maxVisibleTags = 3,
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [onScrollbar, setOnScrollbar] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const [selected, setSelected] = React.useState<Option[]>(value || []);
    const [options, setOptions] = React.useState<GroupOption>(
      transToGroupOption(arrayDefaultOptions, groupBy)
    );
    const [inputValue, setInputValue] = React.useState("");
    const debouncedSearchTerm = useDebounce(inputValue, delay || 500);

    React.useImperativeHandle(
      ref,
      () => ({
        selectedValue: [...selected],
        input: inputRef.current as HTMLInputElement,
        focus: () => inputRef?.current?.focus(),
        reset: () => setSelected([]),
      }),
      [selected]
    );

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        inputRef.current.blur();
      }
    };

    const handleUnselect = React.useCallback(
      (option: Option) => {
        const newOptions = selected.filter((s) => s.value !== option.value);
        setSelected(newOptions);
        onChange?.(newOptions);
      },
      [onChange, selected]
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current;
        if (input) {
          if (e.key === "Delete" || e.key === "Backspace") {
            if (input.value === "" && selected.length > 0) {
              const lastSelectOption = selected[selected.length - 1];
              if (lastSelectOption && !lastSelectOption.fixed) {
                handleUnselect(lastSelectOption);
              }
            }
          }
          if (e.key === "Escape") {
            input.blur();
          }
        }
      },
      [handleUnselect, selected]
    );

    React.useEffect(() => {
      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchend", handleClickOutside);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchend", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchend", handleClickOutside);
      };
    }, [open]);

    React.useEffect(() => {
      if (value) setSelected(value);
    }, [value]);

    React.useEffect(() => {
      if (!arrayOptions || onSearch) return;
      const newOption = transToGroupOption(arrayOptions || [], groupBy);
      if (JSON.stringify(newOption) !== JSON.stringify(options)) {
        setOptions(newOption);
      }
    }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, options]);

    React.useEffect(() => {
      const doSearchSync = () => {
        const res = onSearchSync?.(debouncedSearchTerm);
        setOptions(transToGroupOption(res || [], groupBy));
      };
      const exec = async () => {
        if (!onSearchSync || !open) return;
        if (triggerSearchOnFocus) doSearchSync();
        if (debouncedSearchTerm) doSearchSync();
      };
      void exec();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus]);

    React.useEffect(() => {
      const doSearch = async () => {
        setIsLoading(true);
        const res = await onSearch?.(debouncedSearchTerm);
        setOptions(transToGroupOption(res || [], groupBy));
        setIsLoading(false);
      };
      const exec = async () => {
        if (!onSearch || !open) return;
        if (triggerSearchOnFocus) await doSearch();
        if (debouncedSearchTerm) await doSearch();
      };
      void exec();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus]);

    const CreatableItem = () => {
      if (selected.length >= maxSelected) return undefined;
      if (!creatable) return undefined;
      if (
        isOptionsExist(options, [{ value: inputValue, label: inputValue }]) ||
        selected.find((s) => s.value === inputValue)
      ) {
        return undefined;
      }

      const Item = (
        <CommandItem
          value={inputValue}
          className="cursor-pointe mx-1 mb-1"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onSelect={(value: string) => {
            if (selected.length >= maxSelected) {
              onMaxSelected?.(selected.length);
              return;
            }
            setInputValue("");
            const newOptions = [...selected, { value, label: value }];
            setSelected(newOptions);
            onChange?.(newOptions);
          }}
        >
          {`Criar "${inputValue}"`}
        </CommandItem>
      );

      if (!onSearch && inputValue.length > 0) return Item;
      if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) return Item;
      return undefined;
    };

    const EmptyItem = React.useCallback(() => {
      if (!emptyIndicator) return undefined;
      if (onSearch && !creatable && Object.keys(options).length === 0) {
        return (
          <CommandItem value="-" disabled>
            {emptyIndicator}
          </CommandItem>
        );
      }
      return <ListEmpty>{emptyIndicator}</ListEmpty>;
    }, [creatable, emptyIndicator, onSearch, options]);

    const selectables = React.useMemo<GroupOption>(
      () => removePickedOption(options, selected),
      [options, selected]
    );

    const commandFilter = React.useCallback(() => {
      if ((commandProps as any)?.filter) return (commandProps as any).filter;
      if (creatable) {
        return (value: string, search: string) =>
          value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;
      }
      return undefined as unknown as never;
    }, [creatable, commandProps]);

    // size tokens aligned with InputCustom / SelectTrigger
    const sizeTokens = React.useMemo(() => {
      return size === "sm"
        ? { container: "h-10 px-3", chip: "h-6 text-[11px]", clear: "size-8" }
        : size === "lg"
        ? { container: "h-14 px-3", chip: "h-8 text-sm", clear: "size-10" }
        : { container: "h-12 px-3", chip: "h-7 text-xs", clear: "size-9" };
    }, [size]);

    const visibleSelected = React.useMemo(
      () => selected.slice(0, Math.max(0, maxVisibleTags)),
      [selected, maxVisibleTags]
    );
    const hasOverflow = selected.length > visibleSelected.length;
    const reachedMax = selected.length >= maxSelected;

    const containerClasses = cn(
      "group relative space-y-2",
      {
        "w-full": fullWidth,
        "min-w-[200px]": !fullWidth && size === "sm",
        "min-w-[250px]": !fullWidth && size === "md",
        "min-w-[300px]": !fullWidth && size === "lg",
      },
      containerClassName
    );

    return (
      <div className={containerClasses}>
        {label && (
          <Label
            className={cn(
              "flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-sm font-medium",
              required && "required"
            )}
          >
            {label}
          </Label>
        )}
        <Command
          ref={dropdownRef as unknown as React.Ref<HTMLDivElement>}
          {...(commandProps as any)}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            handleKeyDown(e);
            (commandProps as any)?.onKeyDown?.(e);
          }}
          className={cn(
            "h-auto overflow-visible bg-transparent",
            (commandProps as any)?.className
          )}
          shouldFilter={
            (commandProps as any)?.shouldFilter !== undefined
              ? (commandProps as any).shouldFilter
              : !onSearch
          }
          filter={commandFilter() as any}
        >
          <div
            className={cn(
              "relative w-full rounded-md border border-input text-sm transition-[color,box-shadow] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
              "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] outline-none",
              sizeTokens.container,
              {
                "cursor-text": !disabled,
              },
              !hideClearAllButton && "pr-[4.5rem]",
              className
            )}
            onClick={() => {
              if (disabled) return;
              inputRef?.current?.focus();
            }}
          >
            <div className="flex h-full flex-wrap items-center gap-1">
              {visibleSelected.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "animate-fadeIn relative inline-flex cursor-default items-center border border-input bg-transparent pr-6 pl-2 text-foreground/90 transition-colors leading-none",
                    "hover:bg-accent",
                    "rounded-md",
                    sizeTokens.chip,
                    badgeClassName
                  )}
                  data-fixed={option.fixed}
                  data-disabled={disabled || undefined}
                >
                  {option.label}
                  <button
                    className={cn(
                      "absolute right-1 top-1/2 -translate-y-1/2",
                      "flex items-center justify-center rounded-full border border-transparent p-0 text-muted-foreground/80 outline-0 transition-colors cursor-pointer",
                      "hover:text-foreground focus-visible:outline focus-visible:outline-ring/70",
                      size === "sm"
                        ? "w-4 h-4"
                        : size === "lg"
                        ? "w-5 h-5"
                        : "w-4 h-4"
                    )}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUnselect(option);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleUnselect(option)}
                    aria-label="Remove"
                  >
                    <X
                      width={12}
                      height={12}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              ))}
              {hasOverflow && (
                <div
                  className={cn(
                    "inline-flex items-center rounded-md border border-input bg-transparent px-2 text-foreground/60",
                    sizeTokens.chip
                  )}
                >
                  …
                </div>
              )}
              <CommandPrimitive.Input
                {...(inputProps as any)}
                ref={inputRef}
                value={inputValue}
                disabled={disabled}
                onValueChange={(value) => {
                  setInputValue(value);
                  (inputProps as any)?.onValueChange?.(value);
                }}
                onBlur={(event) => {
                  if (!onScrollbar) setOpen(false);
                  (inputProps as any)?.onBlur?.(event);
                }}
                onFocus={(event) => {
                  setOpen(true);
                  if (triggerSearchOnFocus) onSearch?.(debouncedSearchTerm);
                  (inputProps as any)?.onFocus?.(event);
                }}
                placeholder={
                  selected.length === 0
                    ? ""
                    : hidePlaceholderWhenSelected && selected.length !== 0
                    ? ""
                    : (placeholder as string | undefined)
                }
                className={cn(
                  "flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
                  {
                    "w-full": hidePlaceholderWhenSelected,
                    "ml-1": selected.length !== 0,
                  },
                  (inputProps as any)?.className
                )}
              />
            </div>
            {selected.length === 0 && !inputValue && placeholder && (
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {String(placeholder)}
              </span>
            )}
            {/* Right controls: count badge, clear, chevron */}
            <div className="absolute inset-y-0 right-2 flex items-center gap-0">
              {showCountBadge && selected.length > 0 && (
                <span
                  className={cn(
                    "min-w-6 h-6 px-2 inline-flex items-center justify-center rounded-md text-xs font-semibold mr-1",
                    reachedMax
                      ? "bg-[var(--secondary-color)] text-white"
                      : "bg-muted text-foreground/80",
                    size === "sm" && "min-w-5 h-5 text-[11px]",
                    size === "lg" && "min-w-7 h-7 text-sm"
                  )}
                >
                  {selected.length}
                </span>
              )}
              {!hideClearAllButton && selected.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(selected.filter((s) => s.fixed));
                        onChange?.(selected.filter((s) => s.fixed));
                      }}
                      className={cn(
                        "flex items-center justify-center rounded-md border border-transparent text-foreground/90 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring/70 cursor-pointer",
                        size === "sm"
                          ? "w-5 h-5"
                          : size === "lg"
                          ? "w-7 h-7"
                          : "w-6 h-6"
                      )}
                      aria-label="Limpar todos"
                    >
                      <X
                        width={10}
                        height={10}
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>Limpar tudo</TooltipContent>
                </Tooltip>
              )}
              <button
                type="button"
                aria-label={open ? "Fechar" : "Abrir"}
                onClick={() => {
                  if (disabled) return;
                  setOpen((v) => !v);
                  if (!open) inputRef?.current?.focus();
                }}
                className={cn(
                  "flex items-center justify-center rounded-md text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring/70 cursor-pointer",
                  size === "sm"
                    ? "w-5 h-5"
                    : size === "lg"
                    ? "w-7 h-7"
                    : "w-6 h-6"
                )}
              >
                <ChevronDown
                  className={cn(
                    "transition-transform duration-200",
                    open && "rotate-180"
                  )}
                  width={16}
                  height={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
          <div className="relative">
            <div
              className={cn(
                "absolute top-2 z-10 w-[--radix-popover-trigger-width] min-w-full overflow-hidden rounded-lg border border-input",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                !open && "hidden"
              )}
              data-state={open ? "open" : "closed"}
            >
              {open && (
                <CommandList
                  className="bg-popover text-popover-foreground shadow-lg shadow-black/5 outline-none"
                  onMouseLeave={() => setOnScrollbar(false)}
                  onMouseEnter={() => setOnScrollbar(true)}
                  onMouseUp={() => inputRef?.current?.focus()}
                >
                  {isLoading ? (
                    <>{loadingIndicator}</>
                  ) : (
                    <>
                      {!selectFirstItem && (
                        <CommandItem value="-" className="hidden" />
                      )}
                      {(() => {
                        const creatableNode = CreatableItem();
                        const groups = Object.entries(selectables);
                        const totalCount = groups.reduce(
                          (acc, [, arr]) => acc + arr.length,
                          0
                        );
                        const hasAny = totalCount > 0;

                        if (!hasAny) {
                          // Prefer custom emptyIndicator if provided; otherwise show a friendly default
                          if (!creatableNode) {
                            const text = debouncedSearchTerm
                              ? "Nenhum resultado encontrado"
                              : "Nenhuma opção disponível";
                            return (
                              <div className="px-4 py-5 md:px-5 md:py-6 text-center text-sm text-muted-foreground select-none">
                                {emptyIndicator ?? text}
                              </div>
                            );
                          }
                          // Only creatable available
                          return <>{creatableNode}</>;
                        }

                        // If reached the max, show only the informative message
                        if (reachedMax) {
                          return (
                            <div className="px-4 py-5 md:px-5 md:py-6 text-center text-sm text-muted-foreground select-none">
                              Limite de {maxSelected} selecionadas. Remova uma
                              para adicionar outra.
                            </div>
                          );
                        }

                        return (
                          <>
                            {EmptyItem()}
                            {creatableNode}
                            {groups.map(([key, dropdowns]) => (
                              <CommandGroup
                                key={key}
                                heading={key}
                                className="h-full overflow-auto"
                              >
                                <>
                                  {dropdowns.map((option) => {
                                    const checked = !!selected.find(
                                      (s) => s.value === option.value
                                    );
                                    return (
                                      <CommandItem
                                        key={option.value}
                                        value={option.value}
                                        disabled={option.disable}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                        }}
                                        onSelect={() => {
                                          if (
                                            selected.length >= maxSelected &&
                                            !checked
                                          ) {
                                            onMaxSelected?.(selected.length);
                                            return;
                                          }
                                          setInputValue("");
                                          if (checked) {
                                            const newOptions = selected.filter(
                                              (s) => s.value !== option.value
                                            );
                                            setSelected(newOptions);
                                            onChange?.(newOptions);
                                          } else {
                                            const newOptions = [
                                              ...selected,
                                              option,
                                            ];
                                            setSelected(newOptions);
                                            onChange?.(newOptions);
                                          }
                                        }}
                                        className={cn(
                                          "cursor-pointer",
                                          option.disable &&
                                            "cursor-not-allowed opacity-50"
                                        )}
                                      >
                                        <span
                                          aria-hidden
                                          className={cn(
                                            "mr-2 inline-flex h-4 w-4 items-center justify-center rounded-sm border",
                                            checked
                                              ? "bg-[var(--secondary-color)] border-transparent"
                                              : "bg-transparent border-input"
                                          )}
                                        >
                                          {checked && (
                                            <svg
                                              viewBox="0 0 20 20"
                                              className="h-3 w-3 text-white"
                                            >
                                              <path
                                                d="M7.629 13.233L4.4 10.004l1.2-1.2 2.029 2.029L14.4 4.062l1.2 1.2-7.971 7.971z"
                                                fill="currentColor"
                                              />
                                            </svg>
                                          )}
                                        </span>
                                        {option.label}
                                      </CommandItem>
                                    );
                                  })}
                                </>
                              </CommandGroup>
                            ))}
                          </>
                        );
                      })()}
                    </>
                  )}
                </CommandList>
              )}
            </div>
          </div>
        </Command>
      </div>
    );
  }
);

MultiSelectCustom.displayName = "MultiSelectCustom";

export { MultiSelectCustom };
export default MultiSelectCustom;
