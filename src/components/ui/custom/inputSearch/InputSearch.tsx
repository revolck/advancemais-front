"use client";

import * as React from "react";
import { Check, LoaderCircle, Mic, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useInputSearch, useSpeechRecognition } from "./hooks";
import type {
  InputSearchOption,
  InputSearchProps,
  InputSearchRecord,
  InputSearchSelection,
} from "./types";
import { selectionToArray } from "./utils";

function inputHeightClass(size: NonNullable<InputSearchProps["size"]>) {
  if (size === "sm") return "h-10";
  if (size === "lg") return "h-14";
  return "h-12";
}

function nextMultipleSelection<TItem>(
  selected: InputSearchOption<TItem>[],
  option: InputSearchOption<TItem>
) {
  const exists = selected.some((item) => item.id === option.id);
  return exists
    ? selected.filter((item) => item.id !== option.id)
    : [...selected, option];
}

export function InputSearch<TItem = InputSearchRecord>({
  id,
  name,
  label,
  placeholder = "Pesquisar...",
  helperText,
  error,
  disabled = false,
  required = false,
  fullWidth = true,
  size = "md",
  mode = "single",
  value,
  defaultValue = mode === "multiple" ? [] : null,
  onChange,
  onOptionSelect,
  query,
  defaultQuery,
  onQueryChange,
  apiProps,
  clearable = true,
  enableVoiceSearch = true,
  loadingText = "Buscando...",
  emptyText = "Nenhum resultado encontrado",
  searchHintText,
  maxResultsHeight = 288,
  className,
  ...props
}: InputSearchProps<TItem>) {
  const reactId = React.useId();
  const inputId = id ?? `input-search-${reactId}`;
  const listboxId = `${inputId}-results`;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isSelectionControlled = value !== undefined;
  const isQueryControlled = query !== undefined;
  const initialSelection = React.useMemo(
    () => selectionToArray(defaultValue),
    [defaultValue]
  );
  const [internalSelection, setInternalSelection] =
    React.useState<InputSearchSelection<TItem>>(defaultValue);
  const [internalQuery, setInternalQuery] = React.useState(
    defaultQuery ?? initialSelection[0]?.label ?? ""
  );
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const selectedValue = isSelectionControlled ? value ?? null : internalSelection;
  const selectedOptions = React.useMemo(
    () => selectionToArray(selectedValue),
    [selectedValue]
  );
  const currentQuery = isQueryControlled ? query ?? "" : internalQuery;
  const {
    options,
    isLoading,
    error: searchError,
    minLength,
  } = useInputSearch(apiProps, currentQuery, disabled);
  const canClear = clearable && !disabled && (currentQuery || selectedOptions.length > 0);

  const updateQuery = React.useCallback(
    (nextQuery: string) => {
      if (!isQueryControlled) setInternalQuery(nextQuery);
      onQueryChange?.(nextQuery);
    },
    [isQueryControlled, onQueryChange]
  );

  const speech = useSpeechRecognition(
    React.useCallback(
      (transcript: string) => {
        updateQuery(transcript);
        setIsOpen(true);
        inputRef.current?.focus();
      },
      [updateQuery]
    )
  );

  const showVoiceButton = enableVoiceSearch && speech.isSupported && !disabled;
  const showPanel = isOpen && !disabled;
  const queryIsSearchable = currentQuery.trim().length >= minLength;
  const hintText =
    searchHintText ?? `Digite pelo menos ${minLength} caracteres para pesquisar.`;
  const rightControlsCount =
    (canClear ? 1 : 0) + (isLoading ? 1 : 0) + (showVoiceButton ? 1 : 0);
  const rightPaddingClass =
    rightControlsCount >= 3 ? "pe-24" : rightControlsCount === 2 ? "pe-16" : "pe-9";

  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [options]);

  React.useEffect(() => {
    if (mode !== "single" || isQueryControlled || isOpen) return;
    const selectedOption = selectedOptions[0];
    if (selectedOption && selectedOption.label !== currentQuery) {
      setInternalQuery(selectedOption.label);
    }
  }, [currentQuery, isOpen, isQueryControlled, mode, selectedOptions]);

  const commitSelection = React.useCallback(
    (nextValue: InputSearchSelection<TItem>) => {
      if (!isSelectionControlled) setInternalSelection(nextValue);
      onChange?.(nextValue);
    },
    [isSelectionControlled, onChange]
  );

  const selectOption = React.useCallback(
    (option: InputSearchOption<TItem>) => {
      onOptionSelect?.(option);

      if (mode === "multiple") {
        const nextSelection = nextMultipleSelection(selectedOptions, option);
        commitSelection(nextSelection);
        updateQuery("");
        inputRef.current?.focus();
        return;
      }

      commitSelection(option);
      updateQuery(option.label);
      setIsOpen(false);
    },
    [commitSelection, mode, onOptionSelect, selectedOptions, updateQuery]
  );

  const clearValue = React.useCallback(() => {
    commitSelection(mode === "multiple" ? [] : null);
    updateQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  }, [commitSelection, mode, updateQuery]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (!showPanel && ["ArrowDown", "ArrowUp"].includes(event.key)) {
        setIsOpen(true);
        return;
      }

      if (!options.length) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightedIndex((index) => (index + 1) % options.length);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightedIndex(
          (index) => (index - 1 + options.length) % options.length
        );
      }

      if (event.key === "Enter" && showPanel) {
        event.preventDefault();
        selectOption(options[highlightedIndex] ?? options[0]);
      }
    },
    [highlightedIndex, options, selectOption, showPanel]
  );

  return (
    <div
      ref={rootRef}
      className={cn("relative space-y-2", fullWidth && "w-full", className)}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget;
        if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
          return;
        }
        setIsOpen(false);
      }}
      {...props}
    >
      {label && (
        <Label
          htmlFor={inputId}
          className={cn(
            "block text-sm font-medium",
            error && "text-destructive",
            required && "required"
          )}
        >
          {label}
        </Label>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          value={currentQuery}
          onChange={(event) => {
            updateQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-controls={listboxId}
          aria-expanded={showPanel}
          aria-autocomplete="list"
          className={cn(
            "peer w-full ps-3 text-foreground shadow-none",
            inputHeightClass(size),
            rightPaddingClass,
            error && "border-destructive",
            "focus-visible:border-ring/20 focus-visible:ring-ring/50 focus-visible:ring-[1px]"
          )}
        />

        <div className="absolute inset-y-0 end-0 flex items-center">
          {canClear && (
            <button
              type="button"
              className="flex h-full w-8 cursor-pointer items-center justify-center text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
              aria-label="Limpar pesquisa"
              onClick={clearValue}
            >
              <X size={15} strokeWidth={2} aria-hidden="true" />
            </button>
          )}

          {isLoading && (
            <div className="pointer-events-none flex h-full w-8 items-center justify-center text-muted-foreground/80 peer-disabled:opacity-50">
              <LoaderCircle
                className="animate-spin"
                size={16}
                strokeWidth={2}
                role="status"
                aria-label={loadingText}
              />
            </div>
          )}

          {showVoiceButton && (
            <button
              type="button"
              className={cn(
                "mr-1 flex h-full w-8 cursor-pointer items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70",
                speech.isListening && "text-[var(--primary-color)]"
              )}
              aria-label={
                speech.isListening ? "Parar captura de voz" : "Pesquisar por voz"
              }
              onClick={() => {
                if (speech.isListening) {
                  speech.stop();
                  return;
                }
                speech.start();
              }}
            >
              <Mic size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {mode === "multiple" && selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <span
              key={option.id}
              className="inline-flex max-w-full items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
            >
              <span className="truncate">{option.label}</span>
              <button
                type="button"
                className="shrink-0 rounded-sm hover:text-foreground"
                aria-label={`Remover ${option.label}`}
                disabled={disabled}
                onClick={() =>
                  commitSelection(
                    selectedOptions.filter((item) => item.id !== option.id)
                  )
                }
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {showPanel && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 top-full z-[120] mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-1"
          style={{ maxHeight: maxResultsHeight }}
        >
          <div className="max-h-[inherit] overflow-y-auto">
            {!queryIsSearchable && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {hintText}
              </div>
            )}

            {queryIsSearchable && searchError && (
              <div className="px-3 py-2 text-sm text-destructive">
                {searchError}
              </div>
            )}

            {queryIsSearchable &&
              !searchError &&
              isLoading &&
              options.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {loadingText}
                </div>
              )}

            {queryIsSearchable && !searchError && !isLoading && options.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {emptyText}
              </div>
            )}

            {queryIsSearchable && !searchError && options.length > 0 && (
              <div>
                {options.map((option, index) => {
                  const isSelected = selectedOptions.some(
                    (item) => item.id === option.id
                  );
                  const isHighlighted = highlightedIndex === index;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                        isHighlighted ? "bg-gray-50" : "bg-white",
                        "hover:bg-gray-50"
                      )}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => selectOption(option)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-medium leading-5 text-foreground">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="truncate text-[11px] leading-4 text-muted-foreground">
                            {option.description}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <Check
                          className="h-4 w-4 shrink-0 text-[var(--primary-color)]"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      {!error && helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

export default InputSearch;
