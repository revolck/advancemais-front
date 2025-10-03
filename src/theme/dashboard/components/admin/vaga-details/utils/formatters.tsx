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
  const href = value.startsWith("http")
    ? value
    : `https://${value.replace(/^@/, "")}`;
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
    display = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(
      7
    )}`;
  } else if (digits.length === 10) {
    display = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(
      6
    )}`;
  } else if (digits.length > 6) {
    display = `(${digits.slice(0, 2)}) ${digits.slice(
      2,
      digits.length - 4
    )}-${digits.slice(-4)}`;
  }

  const msgDefault =
    opts?.messageOverride ??
    `Olá! Faço parte do time da Advance+ e gostaria de falar sobre a vaga${
      opts?.companyName ? ` da empresa ${opts.companyName}` : ""
    }.`;
  const waNumber = digits.length <= 11 ? `55${digits}` : digits;
  const href = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    msgDefault
  )}`;

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

export function formatLocation(localizacao?: {
  cidade?: string;
  estado?: string;
  logradouro?: string;
  cep?: string;
}) {
  if (!localizacao) return "—";

  const { cidade, estado, logradouro, cep } = localizacao;
  const cityState = [cidade, estado].filter(Boolean).join("/");
  const cepDisplay = cep ? `CEP ${cep}` : null;
  const parts = [cepDisplay, cityState].filter(Boolean).join(" ");

  if (logradouro && parts) return `${logradouro}, ${parts}`;
  if (logradouro) return logradouro;
  if (parts) return parts;
  return "—";
}
