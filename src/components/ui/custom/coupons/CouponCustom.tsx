"use client";

import { useState } from "react";
import { Check, Copy, TicketPercent } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CouponCustomProps {
  caption?: string | null;
  value: string;
  code: string;
  validity?: string | null;
  variant?: "ALPHA" | "OMEGA" | "SIGMA" | "DELTA";
  tone?: "PRIMARY" | "SECONDARY" | "LIGHT" | "DARK";
  className?: string;
  onAction?: (code: string) => void;
}

export function CouponCustom({
  caption,
  value,
  code,
  validity,
  variant = "ALPHA",
  tone = "PRIMARY",
  className,
  onAction,
}: CouponCustomProps) {
  const [copied, setCopied] = useState(false);
  const toneStyles =
    tone === "SECONDARY"
      ? {
          container:
            "border-[var(--secondary-color)] bg-[var(--secondary-color)] text-white",
          notch: "border-[var(--secondary-color)] bg-white/95",
          divider: "border-white/20",
          iconWrap: "bg-white/12 text-white",
          caption: "!text-white opacity-95",
          title: "!text-white",
          validity: "!text-white opacity-85",
          copy: "border-white/20 bg-white/10 text-white hover:bg-white/14",
          panel: "bg-white/8",
          dot: "bg-white/70",
        }
      : tone === "LIGHT"
        ? {
            container: "border-slate-200 bg-white text-slate-950",
            notch: "border-slate-200 bg-slate-50",
            divider: "border-slate-200",
            iconWrap: "bg-[var(--primary-color)]/8 text-[var(--primary-color)]",
            caption: "text-slate-500",
            title: "text-slate-950",
            validity: "text-slate-500",
            copy: "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100",
            panel: "bg-slate-50/80",
            dot: "bg-[var(--primary-color)]/30",
          }
        : tone === "DARK"
          ? {
              container: "border-slate-950 bg-slate-950 text-white",
              notch: "border-slate-950 bg-slate-100",
              divider: "border-white/15",
              iconWrap: "bg-white/10 text-white",
              caption: "text-white/65",
              title: "text-white",
              validity: "text-white/60",
              copy: "border-white/15 bg-white/8 text-white hover:bg-white/12",
              panel: "bg-white/6",
              dot: "bg-white/60",
            }
          : {
              container:
                "border-[var(--primary-color)] bg-[var(--primary-color)] text-white",
              notch: "border-[var(--primary-color)] bg-white/95",
              divider: "border-white/20",
              iconWrap: "bg-white/12 text-white",
              caption: "!text-white opacity-95",
              title: "!text-white",
              validity: "!text-white opacity-85",
              copy: "border-white/20 bg-white/10 text-white hover:bg-white/14",
              panel: "bg-white/8",
              dot: "bg-white/70",
            };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      onAction?.(code);
    } catch {
      onAction?.(code);
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden border",
        toneStyles.container,
        variant === "SIGMA"
          ? "rounded-[20px]"
          : variant === "DELTA"
            ? "rounded-[24px]"
            : "rounded-[28px]",
        className,
      )}
    >
      {variant === "ALPHA" ? (
        <>
          <span
            className={cn(
              "absolute left-0 top-1/2 h-10 w-5 -translate-x-1/2 -translate-y-1/2 rounded-r-full border",
              toneStyles.notch,
            )}
          />
          <span
            className={cn(
              "absolute right-0 top-1/2 h-10 w-5 translate-x-1/2 -translate-y-1/2 rounded-l-full border",
              toneStyles.notch,
            )}
          />

          <div className="grid grid-cols-[88px_minmax(0,1fr)] items-stretch">
            <div
              className={cn(
                "flex items-center justify-center border-r border-dashed",
                toneStyles.divider,
              )}
            >
              <span
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl",
                  toneStyles.iconWrap,
                )}
              >
                <TicketPercent className="h-6 w-6" />
              </span>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div className="space-y-1.5">
                {caption ? (
                  <p
                    className={cn(
                      "mb-0! text-[11px]! font-semibold! uppercase tracking-[0.16em]",
                      toneStyles.caption,
                    )}
                  >
                    {caption}
                  </p>
                ) : null}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3
                      className={cn(
                        "mb-0! text-2xl! font-semibold! tracking-[-0.04em]",
                        toneStyles.title,
                      )}
                    >
                      {value}
                    </h3>
                    {validity ? (
                      <p
                        className={cn(
                          "mb-0! mt-1! text-xs! leading-5",
                          toneStyles.validity,
                        )}
                      >
                        {validity}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 transition",
                      toneStyles.copy,
                    )}
                    aria-label={`Copiar cupom ${code}`}
                  >
                    <span className="text-sm! font-semibold">{code}</span>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {variant === "OMEGA" ? (
        <div className="space-y-3 p-4">
          <div className="space-y-1 text-center">
            {caption ? (
              <p
                className={cn(
                  "mb-0! text-[10px]! font-semibold uppercase tracking-[0.16em]",
                  toneStyles.caption,
                )}
              >
                {caption}
              </p>
            ) : null}
            <h3
              className={cn(
                "mb-0! text-[40px]! leading-none font-semibold tracking-[-0.06em]",
                toneStyles.title,
              )}
            >
              {value}
            </h3>
            {validity ? (
              <p
                className={cn(
                  "mb-0! text-[11px]! leading-5",
                  toneStyles.validity,
                )}
              >
                {validity}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "flex w-full cursor-pointer items-center rounded-full border px-2 py-2 transition",
              tone === "LIGHT"
                ? "border-slate-200 bg-slate-100 hover:bg-slate-200"
                : "border-white/20 bg-white/10 hover:bg-white/14",
            )}
            aria-label={`Copiar cupom ${code}`}
          >
            <span
              className={cn(
                "grid min-w-0 flex-1 grid-cols-[1fr_auto_1fr] items-center rounded-full bg-white px-4 py-2.5 text-slate-950",
              )}
            >
              <span />
              <span className="text-center text-[13px]! font-semibold tracking-[0.08em]">
                {code}
              </span>
              <span className="text-right text-[11px]! font-semibold uppercase tracking-[0.14em] text-[var(--primary-color)]">
                {copied ? "Copiado" : "Copiar"}
              </span>
            </span>
          </button>
        </div>
      ) : null}

      {variant === "SIGMA" ? (
        <div className="p-5">
          <div className="space-y-5 text-center">
            <div className="space-y-1 text-center">
              <div className="flex items-center justify-center gap-2">
                <TicketPercent className="h-4 w-4" />
                <p
                  className={cn(
                    "mb-0! text-[11px]! font-semibold tracking-[0.12em] uppercase",
                    toneStyles.caption,
                  )}
                >
                  {caption || "Cupom gerado"}
                </p>
              </div>
              <h3
                className={cn(
                  "mb-0! text-[40px]! leading-none font-semibold tracking-[-0.07em]",
                  toneStyles.title,
                )}
              >
                {value}
              </h3>
              {validity ? (
                <p
                  className={cn(
                    "mb-0! text-[12px]! leading-5",
                    toneStyles.validity,
                  )}
                >
                  {validity}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "mx-auto flex min-h-[92px] w-full max-w-[260px] cursor-pointer flex-col items-center justify-center rounded-[18px] border-2 border-dashed px-5 py-5 transition",
                tone === "LIGHT"
                  ? "border-[var(--primary-color)]/25 bg-[var(--primary-color)]/[0.03] hover:bg-[var(--primary-color)]/[0.06]"
                  : "border-white/45 bg-white/8 hover:bg-white/12",
              )}
              aria-label={`Copiar cupom ${code}`}
            >
              <span
                className={cn(
                  "mb-0 text-[20px]! font-semibold uppercase tracking-[0.18em]",
                  toneStyles.title,
                )}
              >
                {code}
              </span>
              <span
                className={cn(
                  "text-[8px]! font-medium uppercase opacity-50!",
                  toneStyles.caption,
                )}
              >
                {copied ? "Copiado" : "Toque para copiar"}
              </span>
            </button>
          </div>
        </div>
      ) : null}

      {variant === "DELTA" ? (
        <div className="relative space-y-4 px-5 py-6">
          <span
            className={cn(
              "absolute left-0 top-1/2 h-9 w-4 -translate-x-1/2 -translate-y-1/2 rounded-r-full border",
              toneStyles.notch,
            )}
          />
          <span
            className={cn(
              "absolute right-0 top-1/2 h-9 w-4 translate-x-1/2 -translate-y-1/2 rounded-l-full border",
              toneStyles.notch,
            )}
          />

          <div className="space-y-1 text-center">
            <p
              className={cn(
                "mb-0! text-[12px]! font-semibold uppercase tracking-[0.18em]",
                toneStyles.caption,
              )}
            >
              {caption || "Seu cupom"}
            </p>
            <h3
              className={cn(
                "mb-0! text-[40px]! leading-none font-semibold tracking-[-0.07em]",
                toneStyles.title,
              )}
            >
              {value}
            </h3>
          </div>

          <div
            className={cn(
              "mx-auto h-px w-full max-w-[240px] border-t border-dashed",
              toneStyles.divider,
            )}
          />

          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "mx-auto flex min-h-[54px] w-full max-w-[240px] cursor-pointer items-center justify-center gap-2 rounded-full border px-5 py-3 transition",
              toneStyles.copy,
            )}
            aria-label={`Copiar cupom ${code}`}
          >
            <span className="text-base! font-semibold tracking-[0.08em]">
              {code}
            </span>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>

          {validity ? (
            <p
              className={cn(
                "mb-0! text-center text-[12px]! leading-5",
                toneStyles.validity,
              )}
            >
              {validity}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
