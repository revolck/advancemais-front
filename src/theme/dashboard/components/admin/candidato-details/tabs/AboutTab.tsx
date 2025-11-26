"use client";

import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import type { AboutTabProps } from "../types";
import { normalizeCep } from "@/lib/cep";
import {
  CalendarDays,
  Clock,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { formatDate, formatDateTime, formatCpf } from "../utils/formatters";

export function AboutTab({ candidato, isLoading = false }: AboutTabProps) {
  const aboutDescription = candidato.descricao?.trim();

  const formatEmailLink = (value?: string | null) => {
    const email = value?.trim();
    if (!email) return "—";
    return (
      <a href={`mailto:${email}`} className="text-primary hover:underline">
        {email}
      </a>
    );
  };

  const formatPhoneLink = (value?: string | null) => {
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
    const href = `https://wa.me/55${digits}?text=${encodeURIComponent(
      `Olá! Acessei seu perfil no sistema da Advance+. Tudo bem? Podemos conversar por aqui?`
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
  };

  const formatSocialLink = (value?: string | null) => {
    if (!value) return null;
    const href = value.startsWith("http") ? value : `https://${value.replace(/^@/, "")}`;
    return (
      <a
        href={href}
        className="text-primary hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {value}
      </a>
    );
  };

  const aboutSidebar: Array<{
    label: string;
    value: React.ReactNode | null;
    icon: LucideIcon;
  }> = [
    { label: "Código do candidato", value: candidato.codUsuario ?? "—", icon: Tag },
    { label: "Criado em", value: formatDateTime(candidato.criadoEm), icon: CalendarDays },
    { label: "CPF", value: formatCpf(candidato.cpf), icon: Tag },
    { label: "Telefone", value: formatPhoneLink(candidato.telefone), icon: Phone },
    { label: "E-mail", value: formatEmailLink(candidato.email), icon: Mail },
    { label: "Instagram", value: formatSocialLink(candidato.socialLinks?.instagram), icon: Instagram },
    { label: "LinkedIn", value: formatSocialLink(candidato.socialLinks?.linkedin), icon: Linkedin },
    {
      label: "Localização",
      value: (() => {
        const street = candidato.enderecos?.[0]?.logradouro?.trim();
        const city = candidato.enderecos?.[0]?.cidade?.trim() || candidato.cidade?.trim();
        const state = candidato.enderecos?.[0]?.estado?.trim() || candidato.estado?.trim();
        const cep = candidato.enderecos?.[0]?.cep?.trim();
        const cepDisplay = cep ? `CEP ${normalizeCep(cep)}` : null;
        const cityState = [city, state].filter(Boolean).join("/");
        const parts = [cepDisplay, cityState].filter(Boolean).join(" ");
        if (street && parts) return `${street}, ${parts}`;
        if (street) return street;
        if (parts) return parts;
        return null;
      })(),
      icon: MapPin,
    },
    { label: "Atualizado em", value: formatDateTime(candidato.atualizadoEm), icon: Clock },
    { label: "Último login", value: formatDateTime(candidato.ultimoLogin), icon: Clock },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
        <section className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </section>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
            <div className="space-y-4">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex flex-1 flex-col space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
      <section className="rounded-2xl border border-gray-200/60 bg-white p-6">
        {aboutDescription ? (
          <p className="mt-4 whitespace-pre-line !leading-relaxed text-muted-foreground">
            {aboutDescription}
          </p>
        ) : (
          <EmptyState
            illustration="companyDetails"
            illustrationAlt="Ilustração de descrição vazia do candidato"
            title="Descrição não adicionada."
            description="Até o momento, este candidato não preencheu uma descrição em seu perfil."
            maxContentWidth="md"
          />
        )}
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <dl className="mt-4 space-y-4 text-sm">
            {aboutSidebar
              .filter((info) => info.value !== null)
              .map((info) => (
                <div key={info.label} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <info.icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="flex flex-1 flex-col">
                    <dt className="text-xs font-medium uppercase text-gray-600">
                      {info.label}
                    </dt>
                    <dd className="text-xs text-gray-500">{info.value ?? "—"}</dd>
                  </div>
                </div>
              ))}
          </dl>
        </div>
      </aside>
    </div>
  );
}
