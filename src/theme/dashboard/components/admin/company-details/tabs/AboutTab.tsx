"use client";

import { EmptyState } from "@/components/ui/custom";
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

export function AboutTab({ company }: AboutTabProps) {
  const aboutDescription = company.descricao?.trim();
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
      value: formatSocialLink(company.instagram),
      icon: Instagram,
    },
    {
      label: "LinkedIn",
      value: formatSocialLink(company.linkedin),
      icon: Linkedin,
    },
    {
      label: "Localização",
      value: (() => {
        const street = company.logradouro?.trim();
        const city = company.cidade?.trim();
        const state = company.estado?.trim();
        const cep = company.cep?.trim();
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

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
      <section className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <h3>Sobre a empresa</h3>
        {aboutDescription ? (
          <p className="mt-4 whitespace-pre-line !leading-relaxed text-muted-foreground">
            {aboutDescription}
          </p>
        ) : (
          <EmptyState
            illustration="companyDetails"
            illustrationAlt="Ilustração de descrição vazia da empresa"
            title="Sem informações sobre a empresa"
            description="Ainda não registramos um texto descritivo para esta empresa. Atualize os dados para contar a história dela por aqui."
            maxContentWidth="md"
          />
        )}
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <h3>Informações gerais</h3>
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
