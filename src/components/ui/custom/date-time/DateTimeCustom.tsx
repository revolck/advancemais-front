"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { InputCustom } from "@/components/ui/custom";
import type { DateTimeCustomProps } from "./types";

function clampTime(value: string): string {
  const m = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return value;
  let h = Math.min(23, Math.max(0, parseInt(m[1]!, 10)));
  let mm = Math.min(59, Math.max(0, parseInt(m[2]!, 10)));
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function toMinutes(v: string): number | null {
  const m = v.match(/^(\d{2}):(\d{2})$/);
  if (!m) return null;
  return parseInt(m[1]!, 10) * 60 + parseInt(m[2]!, 10);
}

function addMinutes(v: string, step: number): string {
  const mins = toMinutes(clampTime(v));
  if (mins === null) return v;
  let total = mins + step;
  if (total < 0) total = 0;
  if (total > 23 * 60 + 59) total = 23 * 60 + 59;
  const h = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function DateTimeCustom(props: DateTimeCustomProps) {
  const {
    label,
    helperText,
    error,
    required,
    disabled,
    size = "md",
    className,
  } = props as any;

  const container = cn("space-y-2", className);

  const renderHelper = () => {
    if (error) {
      return (
        <p className="text-[11px] leading-4 text-destructive/90">{error}</p>
      );
    }
    if (helperText) {
      return (
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-gray-500/10 bg-muted/40 px-2 py-1 text-[11px] leading-4 text-muted-foreground/85">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            className="opacity-70"
          >
            <path fill="currentColor" d="M11 7h2v2h-2zM11 11h2v6h-2z" />
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18a8 8 0 1 1 0-16a8 8 0 0 1 0 16"
            />
          </svg>
          <span className="truncate">{helperText}</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className={container}>
      {label && (
        <Label className={cn("text-sm font-medium", required && "required")}>
          {label}
        </Label>
      )}

      {/* Time single */}
      {(!props.mode || props.mode === "time") && (
        <InputCustom
          label={label || ""}
          placeholder="00:00"
          mask="time"
          size={size}
          disabled={disabled}
          value={(props as any).value}
          onChange={(e) => (props as any).onChange(clampTime(e.target.value))}
          required={required}
          onKeyDown={(e) => {
            const step = (props as any).stepMinutes ?? 15;
            if (e.key === "ArrowUp") {
              e.preventDefault();
              (props as any).onChange(
                addMinutes((props as any).value || "00:00", step)
              );
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              (props as any).onChange(
                addMinutes((props as any).value || "00:00", -step)
              );
            }
          }}
        />
      )}

      {/* Date single */}
      {props.mode === "date" && (
        <InputCustom
          label=""
          type="date"
          size={size}
          disabled={disabled}
          value={(props as any).value}
          onChange={(e) => (props as any).onChange(e.target.value)}
        />
      )}

      {/* Time range */}
      {props.mode === "time-range" && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0">De</span>
            <div className="w-24 sm:w-28">
              <InputCustom
                label=""
                placeholder="00:00"
                mask="time"
                size={size}
                disabled={disabled}
                value={(props as any).value?.from ?? ""}
                onChange={(e) =>
                  (props as any).onChange({
                    from: clampTime(e.target.value),
                    to: (props as any).value?.to ?? "",
                  })
                }
                onKeyDown={(e) => {
                  const step = (props as any).stepMinutes ?? 15;
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault();
                    const curr = (props as any).value?.from || "00:00";
                    const next = addMinutes(
                      curr,
                      e.key === "ArrowUp" ? step : -step
                    );
                    (props as any).onChange({
                      from: next,
                      to: (props as any).value?.to || "",
                    });
                  }
                }}
              />
            </div>
          </div>
          <span className="text-xs text-muted-foreground">às</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0">Até</span>
            <div className="w-24 sm:w-28">
              <InputCustom
                label=""
                placeholder="00:00"
                mask="time"
                size={size}
                disabled={disabled || !(props as any).value?.from}
                value={(props as any).value?.to ?? ""}
                onChange={(e) =>
                  (props as any).onChange({
                    from: (props as any).value?.from ?? "",
                    to: clampTime(e.target.value),
                  })
                }
                onKeyDown={(e) => {
                  const step = (props as any).stepMinutes ?? 15;
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault();
                    const curr = (props as any).value?.to || "00:00";
                    const next = addMinutes(
                      curr,
                      e.key === "ArrowUp" ? step : -step
                    );
                    (props as any).onChange({
                      to: next,
                      from: (props as any).value?.from || "",
                    });
                  }
                }}
              />
            </div>
          </div>
          {(() => {
            const fromM = toMinutes((props as any).value?.from || "");
            const toM = toMinutes((props as any).value?.to || "");
            const invalid = fromM !== null && toM !== null && toM <= fromM;
            return invalid ? (
              <span className="w-full mt-1 inline-flex items-center gap-1.5 rounded-full border border-red-500/15 bg-red-500/5 px-2 py-1 text-[11px] leading-4 text-red-600">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  className="opacity-80"
                >
                  <path
                    fill="currentColor"
                    d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2m1 15h-2v-2h2zm0-4h-2V7h2z"
                  />
                </svg>
                O término precisa ser posterior ao início.
              </span>
            ) : null;
          })()}
        </div>
      )}

      {/* Date range */}
      {props.mode === "date-range" && (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <InputCustom
              label=""
              type="date"
              size={size}
              disabled={disabled}
              value={(props as any).value?.from ?? ""}
              onChange={(e) =>
                (props as any).onChange({
                  from: e.target.value,
                  to: (props as any).value?.to ?? "",
                })
              }
              rightIcon="Calendar"
              className="[&>input]:pr-12 [&>input::-webkit-calendar-picker-indicator]:hidden [&>input::-moz-calendar-picker-indicator]:hidden [&>input::-ms-calendar-picker-indicator]:hidden"
            />
          </div>

          <div className="flex-1">
            <InputCustom
              label=""
              type="date"
              size={size}
              disabled={disabled}
              value={(props as any).value?.to ?? ""}
              onChange={(e) =>
                (props as any).onChange({
                  from: (props as any).value?.from ?? "",
                  to: e.target.value,
                })
              }
              rightIcon="Calendar"
              className="[&>input]:pr-12 [&>input::-webkit-calendar-picker-indicator]:hidden [&>input::-moz-calendar-picker-indicator]:hidden [&>input::-ms-calendar-picker-indicator]:hidden"
            />
          </div>
        </div>
      )}

      {renderHelper()}
    </div>
  );
}

export default DateTimeCustom;
