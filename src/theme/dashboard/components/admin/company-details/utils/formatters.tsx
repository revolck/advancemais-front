"use client";

import Link from "next/link";

export function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

export function formatSocialLink(value?: string | null) {
  if (!value) return null;
  const href = value.startsWith("http") ? value : `https://${value.replace(/^@/, "")}`;
  return (
    <Link
      href={href}
      className="text-primary hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {value}
    </Link>
  );
}

export function formatPhoneLink(
  value?: string | null,
  opts?: { companyName?: string; messageOverride?: string }
) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return "—";

  let display = digits;
  if (digits.length === 11) {
    display = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 10) {
    display = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  } else if (digits.length > 6) {
    display = `(${digits.slice(0, 2)}) ${digits.slice(2, digits.length - 4)}-${digits.slice(-4)}`;
  }

  const msgDefault =
    opts?.messageOverride ??
    `Olá! Faço parte do time da Advance+ e gostaria de falar com o gestor da empresa${
      opts?.companyName ? ` ${opts.companyName}` : ""
    }. É você?`;
  const waNumber = digits.length <= 11 ? `55${digits}` : digits;
  const href = `https://wa.me/${waNumber}?text=${encodeURIComponent(msgDefault)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
      title="Enviar mensagem pelo WhatsApp"
    >
      {display}
    </a>
  );
}

export function formatEmailLink(value?: string | null) {
  const email = value?.trim();
  if (!email) return "—";
  return (
    <a href={`mailto:${email}`} className="text-primary hover:underline">
      {email}
    </a>
  );
}

export const paymentStatusBadgeBaseClasses =
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden [a&]:hover:bg-primary/90 text-[10px] uppercase tracking-wide";

