"use client";

import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import type { AboutTabProps } from "../types";
import { normalizeCep } from "@/lib/cep";
import {
  CalendarDays,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { formatDate } from "../utils";
import {
  formatEmailLink,
  formatPhoneLink,
  formatSocialLink,
} from "../utils/formatters";

export function AboutTab({ company, isLoading = false }: AboutTabProps) {
  const aboutDescription = (
    company.descricao ?? company.informacoes?.descricao
  )?.trim();
  const aboutSidebar: Array<{
    label: string;
    value: React.ReactNode | null;
    icon: LucideIcon;
  }> = [
    { label: "Código da empresa", value: company.codUsuario ?? "—", icon: Tag },
    {
      label: "Criada em",
      value: formatDate(company.criadoEm),
      icon: CalendarDays,
    },
    {
      label: "Telefone",
      value: formatPhoneLink(company.telefone, { companyName: company.nome }),
      icon: Phone,
    },
    { label: "E-mail", value: formatEmailLink(company.email), icon: Mail },
    {
      label: "Instagram",
      value: formatSocialLink(company.socialLinks?.instagram),
      icon: Instagram,
    },
    {
      label: "LinkedIn",
      value: formatSocialLink(company.socialLinks?.linkedin),
      icon: Linkedin,
    },
    {
      label: "Localização",
      value: (() => {
        const street = company.enderecos?.[0]?.logradouro?.trim();
        const city = company.enderecos?.[0]?.cidade?.trim();
        const state = company.enderecos?.[0]?.estado?.trim();
        const cep = company.enderecos?.[0]?.cep?.trim();
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
  ];

  // Se está carregando, mostrar skeleton
  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
        {/* Skeleton da seção principal */}
        <section className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </section>

        {/* Skeleton da sidebar */}
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
            illustrationAlt="Ilustração de descrição vazia da empresa"
            title="Descrição não adicionada."
            description="Até o momento, esta empresa não disponibilizou informações institucionais em seu perfil."
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
                    <dd className="text-xs text-gray-500">
                      {info.value ?? "—"}
                    </dd>
                  </div>
                </div>
              ))}
          </dl>
        </div>
      </aside>
    </div>
  );
}
