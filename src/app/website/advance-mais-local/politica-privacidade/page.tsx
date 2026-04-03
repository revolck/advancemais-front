import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { advanceMaisLocalSite, policySections } from "../content";

export const metadata: Metadata = {
  title: "Política de Privacidade | AdvanceMais Local",
  description:
    "Política de privacidade pública da aplicação AdvanceMais Local.",
  alternates: {
    canonical: advanceMaisLocalSite.privacyUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AdvanceMaisLocalPrivacyPage() {
  return (
    <div className="bg-[#f6f2e9] text-slate-900">
      <section className="border-b border-[#dfd5c7] bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
          <Link
            href={advanceMaisLocalSite.routePath}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para {advanceMaisLocalSite.name}
          </Link>

          <div className="mt-8 rounded-[32px] bg-[#10201f] p-8 text-white shadow-[0_24px_70px_rgba(16,32,31,0.18)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#ffd473]">
              <ShieldCheck className="h-4 w-4" />
              Política pública
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
              Política de Privacidade do {advanceMaisLocalSite.name}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/[0.78] sm:text-lg">
              Esta política descreve como o {advanceMaisLocalSite.name} trata
              dados pessoais e dados operacionais da plataforma, inclusive
              quando o usuário autoriza integrações com serviços do Google para
              agenda institucional.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-white/[0.72]">
              <span>Atualizada em {advanceMaisLocalSite.updatedAt}</span>
              <span>Contato: {advanceMaisLocalSite.supportEmail}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-14 lg:px-8">
        <div className="grid gap-6">
          {policySections.map((section) => (
            <article
              key={section.title}
              className="rounded-[28px] border border-[#ddd3c4] bg-white p-7 shadow-[0_14px_44px_rgba(16,32,31,0.06)]"
            >
              <h2 className="text-2xl font-semibold tracking-tight text-[#10201f]">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700 sm:text-base">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[28px] border border-[#d8ccb7] bg-[#fffaf1] p-7">
          <h2 className="text-2xl font-semibold tracking-tight text-[#10201f]">
            Contato para privacidade e suporte
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-700 sm:text-base">
            Em caso de dúvidas sobre esta política, solicitações LGPD ou
            necessidades de suporte relacionadas ao {advanceMaisLocalSite.name},
            utilize os canais abaixo.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href={`mailto:${advanceMaisLocalSite.dpoEmail}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#10201f] px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              <Mail className="h-4 w-4" />
              {advanceMaisLocalSite.dpoEmail}
            </a>
            <a
              href="https://advancemais.com/ouvidoria"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#10201f]/15 px-5 py-3 text-sm font-semibold text-[#10201f] transition-colors hover:bg-white"
            >
              Ouvidoria pública
            </a>
          </div>

          <div className="mt-6 text-sm leading-7 text-slate-600">
            <p>{advanceMaisLocalSite.address}</p>
            <p>{advanceMaisLocalSite.contactPhone}</p>
            <p>{advanceMaisLocalSite.whatsappPhone}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
