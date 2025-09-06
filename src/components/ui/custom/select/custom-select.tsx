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
import { ChevronsUpDownIcon, Info as InfoIcon } from "lucide-react";
import { CheckboxCustom } from "@/components/ui/custom/checkbox";
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
  // Always declare hooks at top level to avoid conditional hook order issues
  const [open, setOpen] = useState(false);
  const container = cn("space-y-2", fullWidth && "w-full", className);

  // Single and User modes share the Radix Select base
  if (props.mode !== "multiple") {
    const options = props.options as SelectOption[] | UserOption[];
    const value = props.value as string | null;
    const onChange = props.onChange as (v: string | null) => void;

    return (
      <div className={container}>
        {label && (
          <Label
            htmlFor={id}
            className={cn(
              "text-sm font-medium",
              error && "text-destructive",
              props.required && "required",
            )}
          >
            {label}
          </Label>
        )}
        <Select
          value={value ?? undefined}
          onValueChange={(v) => onChange(v || null)}
          disabled={disabled}
        >
          <SelectTrigger
            id={id}
            size={size === "sm" ? "sm" : "default"}
            className={cn(
              // Alinha visualmente ao InputCustom (altura e tipografia)
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:ring-destructive/20 aria-invalid:border-destructive w-full text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus:border-[var(--primary-color)]",
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
              <SelectValue placeholder={placeholder} />
            )}
          </SelectTrigger>
          <SelectContent className="w-[--radix-select-trigger-width] max-h-80 rounded-md shadow-lg [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-slot=select-scroll-down-button]]:hidden">
            {props.mode === "user" ? (
              <SelectGroup>
                <SelectLabel className="ps-2">Usuários</SelectLabel>
                {(options as UserOption[]).map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
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
                    value={opt.value}
                    disabled={opt.disabled}
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

  const selectedLabels = useMemo(
    () => options.filter((o) => value.includes(o.value)).map((o) => o.label),
    [options, value]
  );

  return (
    <div className={container}>
      {label && (
        <Label
          className={cn(
            "text-sm font-medium",
            error && "text-destructive",
            props.required && "required",
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
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:ring-destructive/20 aria-invalid:border-destructive w-full text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus:border-blue-400 focus:ring-1 focus:ring-blue-300",
              size === "sm" && "h-10",
              size === "md" && "h-12",
              size === "lg" && "h-14",
              error && "border-destructive"
            )}
            aria-invalid={!!error}
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
            <ChevronsUpDownIcon className="size-4 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[--radix-popover-trigger-width] border-gray-500/20">
          <Command>
            {searchable && <CommandInput placeholder="Buscar..." />}
            <CommandEmpty>Nenhuma opção encontrada</CommandEmpty>
            <CommandList className="max-h-80 overflow-y-auto pr-2 pb-3 scrollbar-thin scrollbar-thumb-gray-400/60 hover:scrollbar-thumb-gray-400/80 scrollbar-track-transparent">
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
                    >
                      <CheckboxCustom
                        checked={checked}
                        onCheckedChange={() => {}}
                        aria-hidden
                        className="pointer-events-none"
                      />
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
