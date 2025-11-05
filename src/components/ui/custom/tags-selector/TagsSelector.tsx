"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/radix-checkbox";

export type TagItem = { id: string; label: string };

export interface TagsSelectorProps {
  options: TagItem[];
  value: string[]; // array de IDs selecionados
  onChange: (ids: string[]) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function TagsSelector({
  options,
  value,
  onChange,
  className,
  placeholder = "Selecionar",
  disabled = false,
}: TagsSelectorProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = options.filter((t) => value.includes(t.id));
  const available = options.filter((t) => !value.includes(t.id));

  const remove = (id: string) => {
    if (disabled) return;
    onChange(value.filter((v) => v !== id));
  };
  const add = (id: string) => {
    if (disabled) return;
    onChange([...value, id]);
  };
  const toggle = (id: string) => {
    if (disabled) return;
    if (value.includes(id)) {
      remove(id);
    } else {
      add(id);
    }
  };

  const [open, setOpen] = useState(false);
  const [contentW, setContentW] = useState<number | undefined>(undefined);

  useEffect(() => {
    // tenta manter o scroll à direita quando adiciona chips
    const el = triggerRef.current;
    if (!el) return;
    const scrollers = el.querySelectorAll("[data-chips]");
    const last = scrollers.item(scrollers.length - 1) as HTMLElement | null;
    last?.scrollTo?.({ left: last.scrollWidth, behavior: "smooth" });
  }, [value]);

  useEffect(() => {
    if (open && triggerRef.current) {
      setContentW(triggerRef.current.offsetWidth);
    }
  }, [open]);

  return (
    <div className={cn("w-full", className)}>
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (disabled) return;
          setOpen(next);
        }}
      >
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            type="button"
            className={cn(
              "border-input flex w-full min-h-12 items-center justify-between rounded-md border bg-transparent px-2 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              disabled && "cursor-not-allowed opacity-60"
            )}
            disabled={disabled}
          >
            <div
              data-chips
              className="flex flex-wrap items-center gap-1.5 text-foreground text-sm flex-1 min-h-8"
            >
              {selected.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selected.map((tag) => (
                  <motion.span
                    key={tag.id}
                    layoutId={`tag-${tag.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-color)] px-2.5 py-1 text-white shadow-sm"
                  >
                    <motion.span
                      layoutId={`tag-${tag.id}-label`}
                      className="text-white text-[13px]"
                    >
                      {tag.label}
                    </motion.span>
                    <span
                      role="button"
                      tabIndex={0}
                      className="rounded-full p-0.5 text-white/80 hover:text-white cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (disabled) return;
                        remove(tag.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (disabled) return;
                          e.stopPropagation();
                          remove(tag.id);
                        }
                      }}
                      aria-label={`Remover ${tag.label}`}
                    >
                      <X className="size-3" />
                    </span>
                  </motion.span>
                ))
              )}
            </div>
            <ChevronsUpDownIcon className="size-4 opacity-60 ml-2" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 border-gray-500/20"
          style={{ width: contentW }}
        >
          <div className="max-h-64 overflow-y-auto px-1 py-1 [scrollbar-width:thin] scrollbar-thin scrollbar-thumb-gray-300/80">
            {options.map((opt) => {
              const checked = value.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 rounded-lg text-left cursor-pointer",
                    checked
                      ? "bg-primary/5 ring-1 ring-primary/30"
                      : "hover:bg-muted/40 ring-1 ring-transparent"
                  )}
                  onClick={() => toggle(opt.id)}
                  role="checkbox"
                  aria-checked={checked}
                  tabIndex={disabled ? -1 : 0}
                  onKeyDown={(e) => {
                    if (disabled) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(opt.id);
                    }
                  }}
                >
                  <span>
                    <Checkbox
                      checked={checked}
                      className="size-4 rounded-[6px]"
                    />
                  </span>
                  <span className="text-sm text-foreground">{opt.label}</span>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default TagsSelector;
