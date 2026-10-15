"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** Palavras que não ajudam a reconhecer a empresa nas iniciais */
const IGNORAR = new Set([
  "LTDA",
  "ME",
  "EPP",
  "EIRELI",
  "SA",
  "S/A",
  "S.A.",
  "MEI",
  "DE",
  "DA",
  "DO",
  "DAS",
  "DOS",
  "E",
  "&",
  "-",
]);

/** Cores da marca e vizinhas, para cada empresa ter sempre a mesma cor */
const CORES = [
  "from-[#001A57] to-[#2B3F86]",
  "from-[#0B4FA8] to-[#2F74D0]",
  "from-[#1F8454] to-[#2FA56C]",
  "from-[#6D28D9] to-[#8B5CF6]",
  "from-[#B45309] to-[#D97706]",
  "from-[#BE123C] to-[#E11D48]",
  "from-[#0F766E] to-[#14B8A6]",
];

export function iniciaisDaEmpresa(nome?: string | null): string {
  const palavras = (nome ?? "")
    .toUpperCase()
    .split(/\s+/)
    .map((p) => p.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((p) => p && !IGNORAR.has(p));
  if (palavras.length === 0) return "";
  if (palavras.length === 1) return palavras[0].slice(0, 2);
  return `${palavras[0][0]}${palavras[1][0]}`;
}

function corDaEmpresa(nome: string): string {
  let hash = 0;
  for (const letra of nome) hash = (hash * 31 + letra.charCodeAt(0)) >>> 0;
  return CORES[hash % CORES.length];
}

interface EmpresaAvatarProps {
  nome?: string | null;
  logoUrl?: string | null;
  /** Vaga confidencial: nunca mostra logo nem iniciais */
  confidencial?: boolean;
  size?: number;
  className?: string;
}

/**
 * Avatar da empresa nas vagas: logo quando existe; vaga confidencial ganha a arte de
 * empresa sigilosa; empresa sem logo aparece com as iniciais numa cor fixa dela.
 */
export function EmpresaAvatar({
  nome,
  logoUrl,
  confidencial = false,
  size = 56,
  className,
}: EmpresaAvatarProps) {
  const [logoQuebrado, setLogoQuebrado] = React.useState(false);

  if (confidencial) {
    return (
      <Image
        src="/images/vaga-confidencial.svg"
        alt="Empresa confidencial"
        width={size}
        height={size}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  if (logoUrl && !logoQuebrado) {
    return (
      <Image
        src={logoUrl}
        alt={`Logo ${nome ?? "da empresa"}`}
        width={size}
        height={size}
        className={cn("h-full w-full object-cover", className)}
        onError={() => setLogoQuebrado(true)}
        unoptimized={logoUrl.startsWith("http")}
      />
    );
  }

  const iniciais = iniciaisDaEmpresa(nome);
  if (!iniciais) {
    return (
      <Image
        src="/images/company-placeholder.svg"
        alt="Empresa"
        width={size}
        height={size}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={nome ?? "Empresa"}
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br font-semibold tracking-wide text-white",
        corDaEmpresa(nome ?? ""),
        className,
      )}
      style={{ fontSize: Math.round(size * 0.34) }}
    >
      {iniciais}
    </div>
  );
}
