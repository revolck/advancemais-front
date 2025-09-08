"use client";

import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { FooterLogo } from "./FooterLogo";
import { SocialLinks } from "./SocialLinks";
import { FooterSection } from "./FooterSection";
import { ContactInfo } from "./ContactInfo";
import { FooterBottom } from "./FooterBottom";
import { FOOTER_CONFIG } from "@/config/FooterNavigation";
import type { InformacoesGeraisBackendResponse } from "@/api/websites/components";
import type { HorarioItem } from "@/api/websites/components/informacoes-gerais/types";
import { listInformacoesGerais } from "@/api/websites/components";

export const Footer: React.FC = () => {
  const isMobile = useIsMobile();
  const [info, setInfo] = React.useState<InformacoesGeraisBackendResponse | null>(
    null,
  );
  const [address, setAddress] = React.useState<string>(
    FOOTER_CONFIG.contact.address,
  );
  const [phones, setPhones] = React.useState<string[]>(FOOTER_CONFIG.contact.phones);
  const [hours, setHours] = React.useState<string>(FOOTER_CONFIG.contact.hours);
  const [socials, setSocials] = React.useState<
    Partial<Record<"facebook" | "linkedin" | "instagram" | "youtube", string>>
  >({});
  const [email, setEmail] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listInformacoesGerais();
        const first = Array.isArray(data) && data.length > 0 ? data[0] : null;
        if (!mounted || !first) return;
        setInfo(first);

        const composedAddress = [
          first.endereco,
          first.cep ? `CEP ${first.cep}` : "",
          [first.cidade, first.estado].filter(Boolean).join("/"),
        ]
          .filter(Boolean)
          .join(" ")
          .trim();
        setAddress(composedAddress || FOOTER_CONFIG.contact.address);

        const phoneList = [first.telefone1, first.telefone2, first.whatsapp]
          .filter(Boolean)
          .map((p) => String(p));
        if (phoneList.length) setPhones(phoneList);

        // Horários: prioriza array `horarios`, senão usa `horarioDeFuncionamento`
        let hoursStr = first.horarios && first.horarios.length
          ? formatHorarios(first.horarios)
          : first.horarioDeFuncionamento || "";
        hoursStr = hoursStr || FOOTER_CONFIG.contact.hours;
        setHours(hoursStr);

        setEmail(first.email || undefined);

        setSocials({
          facebook: first.facebook || "",
          linkedin: first.linkedin || "",
          instagram: first.instagram || "",
          youtube: first.youtube || "",
        });
      } catch (e) {
        // Mantém fallbacks do FOOTER_CONFIG silenciosamente
        console.warn("Falha ao carregar informações gerais para o footer", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function formatHorarios(horarios: HorarioItem[]): string {
    // Ordem e labels em PT-BR
    const order = [
      "segunda",
      "terca",
      "quarta",
      "quinta",
      "sexta",
      "sabado",
      "domingo",
    ] as const;
    const dayLabel: Record<(typeof order)[number], string> = {
      segunda: "Segunda",
      terca: "Terça",
      quarta: "Quarta",
      quinta: "Quinta",
      sexta: "Sexta",
      sabado: "Sáb",
      domingo: "Dom",
    } as const;

    type Item = HorarioItem & { idx: number; key: string };
    const normalized = horarios
      .map((h) => ({
        ...h,
        diaDaSemana: (h.diaDaSemana || "").toLowerCase(),
      }))
      .filter((h) => order.includes(h.diaDaSemana as any))
      .map((h) => ({
        ...h,
        idx: order.indexOf(h.diaDaSemana as any),
        key: `${h.horarioInicio}-${h.horarioFim}`,
      })) as Item[];

    // Ordena por dia da semana
    normalized.sort((a, b) => a.idx - b.idx);

    if (normalized.length === 0) return "";

    // Agrupa por blocos contíguos com mesmo horário
    const groups: { start: Item; end: Item; key: string }[] = [];
    let current: { start: Item; end: Item; key: string } | null = null;
    for (const item of normalized) {
      if (!current) {
        current = { start: item, end: item, key: item.key };
        continue;
      }
      const isContiguous = item.idx === current.end.idx + 1;
      const sameTime = item.key === current.key;
      if (isContiguous && sameTime) {
        current.end = item;
      } else {
        groups.push(current);
        current = { start: item, end: item, key: item.key };
      }
    }
    if (current) groups.push(current);

    const toDayRange = (s: Item, e: Item) => {
      if (s.idx === e.idx) return dayLabel[order[s.idx]];
      return `${dayLabel[order[s.idx]]} a ${dayLabel[order[e.idx]]}`;
    };

    const fmtTime = (time: string) => {
      const [hRaw = "00", mRaw = "00"] = time.split(":");
      const h = String(hRaw).padStart(2, "0");
      const m = String(mRaw).padStart(2, "0");
      return m === "00" ? `${h}h` : `${h}h${m}`;
    };

    const toTime = (g: { key: string }) => {
      const [inicio, fim] = g.key.split("-");
      return `das ${fmtTime(inicio)} às ${fmtTime(fim)}`;
    };

    // Monta frase com separador " e "
    const parts = groups.map((g) => `${toDayRange(g.start, g.end)}, ${toTime(g)}`);
    return parts.join(" e ");
  }

  return (
    <footer className="bg-[#001a57] text-white">
      <div className="container mx-auto py-16 px-4">
        {isMobile ? (
          <div className="space-y-8">
            {/* Logo e Redes Sociais */}
            <div className="flex flex-col items-center">
              <FooterLogo />
              <SocialLinks socials={socials} />
            </div>

            {/* Seções de Links - Alinhadas à esquerda */}
            <div className="grid grid-cols-1 gap-8">
              {FOOTER_CONFIG.sections.map((section, index) => (
                <FooterSection
                  key={index}
                  section={section}
                  isMobile={isMobile}
                />
              ))}

              {/* Informações de Contato - Alinhadas à esquerda */}
              <div>
                <ContactInfo
                  contact={{ address, phones, hours, email }}
                  isMobile={isMobile}
                />
              </div>
            </div>
          </div>
        ) : (
          // Versão Desktop
          <div className="space-y-8">
            <div className="flex flex-wrap lg:flex-nowrap justify-between gap-8">
              {/* Logo e Redes Sociais */}
              <div className="flex-1 lg:basis-[30%]">
                <FooterLogo />
                <SocialLinks socials={socials} />
              </div>

              {/* Seções de Navegação */}
              {FOOTER_CONFIG.sections.map((section, index) => (
                <div key={index} className="flex-1 lg:basis-[17.5%]">
                  <FooterSection section={section} isMobile={isMobile} />
                </div>
              ))}

              {/* Informações de Contato */}
              <div className="flex-1 lg:basis-[17.5%]">
                <ContactInfo contact={{ address, phones, hours, email }} isMobile={isMobile} />
              </div>
            </div>
          </div>
        )}

        {/* Footer Inferior */}
        <FooterBottom
          legal={FOOTER_CONFIG.legal}
          copyright={FOOTER_CONFIG.copyright}
          address={address}
        />
      </div>
    </footer>
  );
};
