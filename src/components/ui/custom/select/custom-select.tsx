"use client";

import React, { useId, useMemo, useState } from "react";
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
  if (props.mode !== "multiple") {
    const options = props.options as SelectOption[] | UserOption[];
    const value = props.value as string | null;
    const onChange = props.onChange as (v: string | null) => void;
    const searchableSingle = (props as any).searchable ?? true;

    // Searchable single: Popover + Command (better UX for long lists)
    if (
      searchableSingle &&
      props.mode !== "user" &&
      (options as SelectOption[]).length > 5
    ) {
      const current =
        (options as SelectOption[]).find((o) => o.value === value) || null;
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
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                className={cn(
                  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex min-w-0 items-center rounded-md border bg-transparent px-3 py-0 text-base shadow-none transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:ring-destructive/20 aria-invalid:border-destructive w-full text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] cursor-pointer",
                  size === "sm" && "h-10",
                  size === "md" && "h-12",
                  size === "lg" && "h-14",
                  error && "border-destructive"
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
                <CommandInput placeholder="Buscar..." className="h-10" />
                <CommandEmpty>
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Nenhuma opção encontrada
                  </div>
                </CommandEmpty>
                <CommandList className="max-h-72 overflow-y-auto pr-0 pb-1.5 scrollbar-thin scrollbar-thumb-gray-400/50 hover:scrollbar-thumb-gray-400/70 scrollbar-track-transparent">
                  <CommandGroup>
                    {(options as SelectOption[]).map((opt) => (
                      <CommandItem
                        key={opt.value}
                        value={opt.label}
                        disabled={opt.disabled}
                        onSelect={() => {
                          onChange(opt.value);
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
          value={value ?? undefined}
          onValueChange={(v) => onChange(v === "empty" ? null : v || null)}
          disabled={disabled}
        >
          <SelectTrigger
            id={id}
            size={size === "sm" ? "sm" : "default"}
            className={cn(
              // Alinha visualmente ao InputCustom (altura e tipografia)
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-none transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:ring-destructive/20 aria-invalid:border-destructive w-full text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus:border-[var(--primary-color)] cursor-pointer relative",
              // Força altura equivalente ao InputCustom usando o mesmo seletor de atributo do Radix
              size === "sm" && "data-[size=sm]:h-10",
              size === "md" && "data-[size=default]:h-12",
              size === "lg" && "data-[size=default]:h-14",
              error && "border-destructive aria-invalid:border-destructive"
            )}
            aria-required={props.required || undefined}
          >
            {props.mode === "user" ? (
              <UserTriggerValue
                value={value}
                options={options as UserOption[]}
                placeholder={placeholder}
              />
            ) : (
              <>
                {disabled && !value && placeholder ? (
                  <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <SelectValue placeholder={placeholder} />
                )}
              </>
            )}
          </SelectTrigger>
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
  const { options, value, onChange, searchable = true } = props;

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
            {searchable && options.length > 5 && (
              <CommandInput placeholder="Buscar..." className="h-10" />
            )}
            <CommandEmpty>
              <div className="py-6 text-center text-sm text-muted-foreground">
                Nenhuma opção encontrada
              </div>
            </CommandEmpty>
            {value.length > 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground border-b border-gray-200/80">
                {value.length} selecionado{value.length > 1 ? "s" : ""}
              </div>
            )}
            <CommandList className="max-h-72 overflow-y-auto pr-0 pb-1.5 scrollbar-thin scrollbar-thumb-gray-400/50 hover:scrollbar-thumb-gray-400/70 scrollbar-track-transparent">
              <CommandGroup>
                {options.map((opt) => {
                  const checked = value.includes(opt.value);
                  return (
                    <CommandItem
                      key={opt.value}
                      value={opt.label}
                      onSelect={() => {
                        const next = checked
                          ? value.filter((v) => v !== opt.value)
                          : [...value, opt.value];
                        onChange(next);
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
