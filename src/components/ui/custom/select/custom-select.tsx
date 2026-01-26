"use client";

import React, { useId, useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  ChevronDown as ChevronDownIcon,
  Check as CheckIcon,
  Info as InfoIcon,
  X as XIcon,
} from "lucide-react";
import { Checkbox } from "@/components/ui/radix-checkbox";
import type { SelectCustomProps, SelectOption, UserOption } from "./types";

const Square = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <span
    data-square
    className={cn(
      "flex size-5 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground",
      className
    )}
    aria-hidden="true"
  >
    {children}
  </span>
);

function initialsOf(label: string): string {
  const [first] = label.trim();
  return (first || "?").toUpperCase();
}

function UserTriggerValue({
  value,
  options,
  placeholder,
}: {
  value: string | null;
  options: UserOption[];
  placeholder?: string;
}) {
  const current = options.find((o) => o.value === value);
  if (!current)
    return (
      <span className="text-muted-foreground">
        {placeholder || "Selecionar"}
      </span>
    );
  return (
    <span className="flex items-center gap-2">
      <Square className={cn(current.colorClass)}>
        {initialsOf(current.label)}
      </Square>
      <span className="truncate">{current.label}</span>
    </span>
  );
}

export function SelectCustom(props: SelectCustomProps) {
  const {
    label,
    placeholder = "Selecionar",
    helperText,
    error,
    disabled,
    clearable = false,
    size = "md",
    fullWidth = true,
    className,
  } = props;

  const id = useId();
  const [open, setOpen] = useState(false);
  const container = cn("space-y-2", fullWidth && "w-full", className);

  const selectedLabels = useMemo(() => {
    if (props.mode !== "multiple") return [] as string[];
    const opts = props.options as SelectOption[];
    const val = props.value as string[];
    return opts.filter((o) => val.includes(o.value)).map((o) => o.label);
  }, [props.mode, props.options, props.value]);

  // Single and User modes share
  const options = props.mode !== "multiple" ? (props.options as SelectOption[] | UserOption[]) : null;
  const value =
    props.mode !== "multiple" ? ((props.value ?? null) as string | null) : null;
  const onChange = props.mode !== "multiple" ? (props.onChange as (v: string | null) => void) : null;
  const hasValue =
    props.mode !== "multiple" &&
    value !== null &&
    value !== undefined &&
    value !== "";
  const canClear = clearable && !disabled && hasValue;
  const searchableSingle = props.mode !== "multiple" ? ((props as any).searchable ?? true) : false;
  const selectValue = props.mode !== "multiple" ? value ?? "" : "";
  const handleCommandWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.currentTarget) return;
    const { deltaY, deltaX } = event;
    if (Math.abs(deltaY) <= Math.abs(deltaX)) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.scrollTop += deltaY;
  };
  
  // Hooks movidos para fora do condicional para evitar erro de hooks condicionais
  // Usa useMemo para recalcular quando value ou options mudam (apenas para searchable single)
  const current = useMemo(() => {
    if (
      !searchableSingle ||
      props.mode === "multiple" ||
      props.mode === "user" ||
      !options ||
      (options as SelectOption[]).length <= 5 ||
      value === null ||
      value === undefined
    ) {
      return null;
    }
    return (options as SelectOption[]).find((o) => o.value === value) || null;
  }, [searchableSingle, props.mode, options, value]);
  
  // Fecha o popover quando o valor é limpo (null) - apenas para searchable single
  useEffect(() => {
    if (
      searchableSingle &&
      props.mode !== "multiple" &&
      props.mode !== "user" &&
      options &&
      (options as SelectOption[]).length > 5 &&
      (value === null || value === undefined)
    ) {
      setOpen(false);
    }
  }, [searchableSingle, props.mode, options, value]);

  if (props.mode !== "multiple") {
    if (
      searchableSingle &&
      props.mode !== "user" &&
      options &&
      (options as SelectOption[]).length > 5
    ) {
      
      return (
        <div className={container}>
          {label && (
            <Label
              htmlFor={id}
              className={cn(
                "text-sm font-medium",
                error && "text-destructive",
                props.required && "required"
              )}
            >
              {label}
            </Label>
          )}
          <Popover open={open} onOpenChange={setOpen}>
            <div className="relative">
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={disabled}
                  className={cn(
                    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex min-w-0 items-center rounded-md border bg-transparent px-3 py-0 text-base shadow-none transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:ring-destructive/20 aria-invalid:border-destructive w-full text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] cursor-pointer relative",
                    size === "sm" && "h-10",
                    size === "md" && "h-12",
                    size === "lg" && "h-14",
                    error && "border-destructive",
                    canClear ? "pr-20" : "pr-10"
                  )}
                >
                  <span
                    className={cn(
                      "truncate text-left flex-1",
                      !current && "text-muted-foreground"
                    )}
                  >
                    {current?.label || placeholder}
                  </span>
                </button>
              </PopoverTrigger>

              <ChevronDownIcon
                className={cn(
                  "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 opacity-50 transition-transform duration-200",
                  open && "rotate-180"
                )}
              />

              {canClear && (
                <button
                  type="button"
                  className="absolute right-10 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 z-10 cursor-pointer"
                  aria-label="Limpar seleção"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange?.(null);
                    setOpen(false);
                  }}
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            <PopoverContent
              className={cn(
                "z-[120] w-[--radix-popover-trigger-width] min-w-[--radix-popover-trigger-width] rounded-md border border-gray-200 bg-white p-0 shadow-none box-border"
              )}
              style={{
                width: "var(--radix-popover-trigger-width)",
                minWidth: "var(--radix-popover-trigger-width)",
                maxWidth: "none",
              }}
            >
              <Command className="bg-white text-foreground [&_[cmdk-group]]:gap-1 [&_[cmdk-item]]:rounded-md [&_[data-slot=command-input-wrapper]]:border-gray-500/10">
                <CommandInput placeholder="Buscar..." className="h-10" />
                <CommandEmpty>
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Nenhuma opção encontrada
                  </div>
                </CommandEmpty>
                <CommandList
                  onWheel={handleCommandWheel}
                  className="max-h-72 overflow-y-auto pr-0 pb-1.5 scrollbar-thin scrollbar-thumb-gray-400/50 hover:scrollbar-thumb-gray-400/70 scrollbar-track-transparent"
                >
                  <CommandGroup>
                    {(options as SelectOption[]).map((opt) => (
                      <CommandItem
                        key={opt.value || "__select_empty__"}
                        value={opt.value || "__select_empty__"}
                        keywords={[opt.label]}
                        disabled={opt.disabled}
                        onSelect={() => {
                          if (onChange) {
                          onChange(opt.value);
                          }
                          setOpen(false);
                        }}
                        className={cn(
                          "group cursor-pointer pl-3 pr-3 py-2.5 text-sm transition-colors",
                          "hover:bg-[var(--primary-color)]/6",
                          value === opt.value &&
                            "bg-[var(--primary-color)]/8 font-medium text-foreground"
                        )}
                      >
                        <span className="truncate flex-1">{opt.label}</span>
                        {value === opt.value && (
                          <CheckIcon className="ml-2 size-4 text-[var(--primary-color)]" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {error ? (
            <p className="text-[11px] leading-4 text-destructive/90">{error}</p>
          ) : helperText ? (
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-gray-500/10 bg-muted/40 px-2 py-1 text-[11px] leading-4 text-muted-foreground/85">
              <InfoIcon className="size-3.5 opacity-70" />
              <span className="truncate">{helperText}</span>
            </span>
          ) : null}
        </div>
      );
    }

    return (
      <div className={container}>
        {label && (
          <Label
            htmlFor={id}
            className={cn(
              "text-sm font-medium",
              error && "text-destructive",
              props.required && "required"
            )}
          >
            {label}
          </Label>
        )}
        <Select
          value={selectValue}
          onValueChange={(v) => {
            if (onChange) {
              onChange(v === "empty" ? null : v || null);
            }
          }}
          disabled={disabled}
        >
          <div className="relative">
            <SelectTrigger
              id={id}
              size={size === "sm" ? "sm" : "default"}
              className={cn(
                // Alinha visualmente ao InputCustom (altura e tipografia)
                "peer file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-none transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:ring-destructive/20 aria-invalid:border-destructive w-full text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus:border-[var(--primary-color)] cursor-pointer relative [&>svg]:hidden",
                // Força altura equivalente ao InputCustom usando o mesmo seletor de atributo do Radix
                size === "sm" && "data-[size=sm]:h-10",
                size === "md" && "data-[size=default]:h-12",
                size === "lg" && "data-[size=default]:h-14",
                error && "border-destructive aria-invalid:border-destructive",
                canClear ? "pr-20" : "pr-10"
              )}
              aria-required={props.required || undefined}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {props.mode === "user" ? (
                  <UserTriggerValue
                    value={value}
                    options={options as UserOption[]}
                    placeholder={placeholder}
                  />
                ) : disabled && !value && placeholder ? (
                  <span className="text-muted-foreground">{placeholder}</span>
                ) : value ? (
                  <SelectValue placeholder={placeholder} />
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </div>
            </SelectTrigger>

            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 opacity-50 transition-transform duration-200 peer-data-[state=open]:rotate-180" />

            {canClear && (
              <button
                type="button"
                className="absolute right-10 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 z-10 cursor-pointer"
                aria-label="Limpar seleção"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange?.(null);
                }}
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <SelectContent
            className={cn(
              "z-[120] w-[--radix-select-trigger-width] max-h-80 rounded-md border border-gray-200 bg-white",
              "[&_[data-slot=select-scroll-up-button]]:hidden [&_[data-slot=select-scroll-down-button]]:hidden",
              "[&_[data-slot=select-item]]:cursor-pointer [&_[data-slot=select-item]]:pl-3 [&_[data-slot=select-item]]:pr-3 [&_[data-slot=select-item]]:py-2.5 [&_[data-slot=select-item]]:rounded-md",
              "[&_[data-slot=select-item][data-state=checked]]:bg-[var(--primary-color)]/8 [&_[data-slot=select-item][data-state=checked]]:font-medium [&_[data-slot=select-item][data-state=checked]]:text-foreground"
            )}
          >
            {props.mode === "user" ? (
              <SelectGroup>
                <SelectLabel className="ps-2">Usuários</SelectLabel>
                {(options as UserOption[]).map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="cursor-pointer"
                  >
                    <Square className={cn(opt.colorClass)}>
                      {initialsOf(opt.label)}
                    </Square>
                    <span className="truncate">{opt.label}</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            ) : (
              <SelectGroup>
                {(options as SelectOption[]).map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value || "empty"}
                    disabled={opt.disabled}
                    className="cursor-pointer"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
        {error ? (
          <p className="text-[11px] leading-4 text-destructive/90">{error}</p>
        ) : helperText ? (
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-gray-500/10 bg-muted/40 px-2 py-1 text-[11px] leading-4 text-muted-foreground/85">
            <InfoIcon className="size-3.5 opacity-70" />
            <span className="truncate">{helperText}</span>
          </span>
        ) : null}
      </div>
    );
  }

  // Multiple mode using Popover + Command
  const multipleOptions = props.options as SelectOption[];
  const multipleValue = props.value as string[];
  const multipleOnChange = props.onChange as (v: string[]) => void;
  const searchable = (props as any).searchable ?? true;

  return (
    <div className={container}>
      {label && (
        <Label
          className={cn(
            "text-sm font-medium",
            error && "text-destructive",
            props.required && "required"
          )}
        >
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-none transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:ring-destructive/20 aria-invalid:border-destructive w-full text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus:border-blue-400 focus:ring-1 focus:ring-blue-300 cursor-pointer",
              size === "sm" && "h-10",
              size === "md" && "h-12",
              size === "lg" && "h-14",
              error && "border-destructive"
            )}
            data-invalid={error ? "true" : undefined}
          >
            <span className="truncate text-left">
              {selectedLabels.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : selectedLabels.length <= 2 ? (
                selectedLabels.join(", ")
              ) : (
                `${selectedLabels.length} selecionados`
              )}
            </span>
            <ChevronDownIcon
              className={cn(
                "size-4 opacity-50 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "z-[120] w-[--radix-popover-trigger-width] min-w-[--radix-popover-trigger-width] rounded-md border border-gray-200 bg-white p-0 shadow-none box-border"
          )}
          style={{
            width: "var(--radix-popover-trigger-width)",
            minWidth: "var(--radix-popover-trigger-width)",
            maxWidth: "none",
          }}
        >
          <Command className="bg-white text-foreground [&_[cmdk-group]]:gap-1 [&_[cmdk-item]]:rounded-md [&_[data-slot=command-input-wrapper]]:border-gray-500/10">
            {searchable && multipleOptions.length > 5 && (
              <CommandInput placeholder="Buscar..." className="h-10" />
            )}
            <CommandEmpty>
              <div className="py-6 text-center text-sm text-muted-foreground">
                Nenhuma opção encontrada
              </div>
            </CommandEmpty>
            {multipleValue.length > 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground border-b border-gray-200/80">
                {multipleValue.length} selecionado{multipleValue.length > 1 ? "s" : ""}
              </div>
            )}
            <CommandList
              onWheel={handleCommandWheel}
              className="max-h-72 overflow-y-auto pr-0 pb-1.5 scrollbar-thin scrollbar-thumb-gray-400/50 hover:scrollbar-thumb-gray-400/70 scrollbar-track-transparent"
            >
              <CommandGroup>
                {multipleOptions.map((opt) => {
                  const checked = multipleValue.includes(opt.value);
                  return (
                    <CommandItem
                      key={opt.value || "__select_empty__"}
                      value={opt.value || "__select_empty__"}
                      keywords={[opt.label]}
                      onSelect={() => {
                        const next = checked
                          ? multipleValue.filter((v) => v !== opt.value)
                          : [...multipleValue, opt.value];
                        multipleOnChange(next);
                      }}
                      className={cn(
                        "group cursor-pointer pl-3 pr-3 py-2.5 text-sm transition-colors",
                        "hover:bg-[var(--primary-color)]/6",
                        checked &&
                          "bg-[var(--primary-color)]/8 font-medium text-foreground"
                      )}
                    >
                      <span className="pointer-events-none">
                        <Checkbox
                          checked={checked}
                          className="size-4 data-[state=checked]:bg-[var(--primary-color)]"
                        />
                      </span>
                      <span className="truncate">{opt.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error ? (
        <p className="text-[11px] leading-4 text-destructive/90">{error}</p>
      ) : helperText ? (
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-gray-500/10 bg-muted/40 px-2 py-1 text-[11px] leading-4 text-muted-foreground/85">
          <InfoIcon className="size-3.5 opacity-70" />
          <span className="truncate">{helperText}</span>
        </span>
      ) : null}
    </div>
  );
}

export default SelectCustom;
