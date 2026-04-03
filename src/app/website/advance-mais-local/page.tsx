import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Globe,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Video,
} from "lucide-react";
import {
  advanceMaisLocalSite,
  appCapabilities,
  googleUseCases,
  trustHighlights,
} from "./content";

export const metadata: Metadata = {
  title: "AdvanceMais Local | Aplicação oficial",
  description:
    "Página pública do AdvanceMais Local com finalidade do app, uso do Google OAuth e política de privacidade.",
  alternates: {
    canonical: advanceMaisLocalSite.canonicalUrl,
  },
  openGraph: {
    title: "AdvanceMais Local",
    description:
      "Aplicação oficial da Advance+ para recrutamento, entrevistas, cursos e agendas operacionais.",
    url: advanceMaisLocalSite.canonicalUrl,
    siteName: advanceMaisLocalSite.name,
    type: "website",
    locale: "pt_BR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const capabilityIcons = [Globe, CalendarDays, Video] as const;
const googleIcons = [LockKeyhole, CalendarDays, Video, ShieldCheck] as const;

export default function AdvanceMaisLocalPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: advanceMaisLocalSite.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: advanceMaisLocalSite.canonicalUrl,
    description: `${advanceMaisLocalSite.heroDescription} ${advanceMaisLocalSite.purpose}`,
    publisher: {
      "@type": "Organization",
      name: advanceMaisLocalSite.companyName,
      url: "https://advancemais.com",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
    },
  };

  return (
    <div className="bg-[#f5f1e8] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="relative overflow-hidden bg-[#0f2d2a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,212,115,0.28),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(66,153,225,0.24),_transparent_30%)]" />

        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center px-6 py-20 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.28em] text-amber-200/90">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold">
              Aplicação pública
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold">
              Google OAuth
            </span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_360px] lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.32em] text-emerald-100/70">
                {advanceMaisLocalSite.companyName}
              </p>
              <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">
                {advanceMaisLocalSite.name}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/[0.82] sm:text-xl">
                {advanceMaisLocalSite.heroDescription}
              </p>
              <p className="mt-4 max-w-3xl text-base leading-7 text-white/[0.72] sm:text-lg">
                {advanceMaisLocalSite.purpose}
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href={advanceMaisLocalSite.dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#ffd473] px-6 py-3 text-sm font-semibold text-[#10201f] transition-transform hover:-translate-y-0.5"
                >
                  Acessar plataforma
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <Link
                  href={advanceMaisLocalSite.privacyPath}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.16]"
                >
                  Política de privacidade
                  <ShieldCheck className="h-4 w-4" />
                </Link>
                <a
                  href={`mailto:${advanceMaisLocalSite.supportEmail}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Contato institucional
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/[0.12] bg-white/10 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                Informações públicas
              </p>
              <dl className="mt-6 space-y-5 text-sm">
                <div>
                  <dt className="text-white/55">Nome exibido no OAuth</dt>
                  <dd className="mt-1 text-base font-semibold text-white">
                    {advanceMaisLocalSite.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-white/55">Página inicial do app</dt>
                  <dd className="mt-1 break-all text-base font-semibold text-white">
                    {advanceMaisLocalSite.canonicalUrl}
                  </dd>
                </div>
                <div>
                  <dt className="text-white/55">Política de privacidade</dt>
                  <dd className="mt-1 break-all text-base font-semibold text-white">
                    {advanceMaisLocalSite.privacyUrl}
                  </dd>
                </div>
                <div>
                  <dt className="text-white/55">Suporte e LGPD</dt>
                  <dd className="mt-1 text-base font-semibold text-white">
                    {advanceMaisLocalSite.supportEmail}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {appCapabilities.map((item, index) => {
            const Icon = capabilityIcons[index];

            return (
              <article
                key={item.title}
                className="rounded-[28px] border border-[#d9cfbf] bg-white p-7 shadow-[0_18px_60px_rgba(15,45,42,0.08)]"
              >
                <div className="inline-flex rounded-2xl bg-[#0f2d2a] p-3 text-[#ffd473]">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-[#10201f]">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-[#fffaf1]">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[0.9fr_minmax(0,1.1fr)] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#0f2d2a]">
              Finalidade do app
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#10201f]">
              O que o Google precisa enxergar nesta página
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              {advanceMaisLocalSite.googleSummary}
            </p>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Esta página existe para identificar publicamente o aplicativo,
              deixar clara sua finalidade e oferecer acesso direto à política
              de privacidade e aos canais oficiais da Advance+.
            </p>
          </div>

          <div className="grid gap-4">
            {googleUseCases.map((item, index) => {
              const Icon = googleIcons[index];

              return (
                <article
                  key={item.title}
                  className="rounded-[24px] border border-[#ddd2bf] bg-white p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-[#10201f] p-3 text-[#ffd473]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#10201f]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="rounded-[32px] bg-[#10201f] p-8 text-white shadow-[0_24px_70px_rgba(16,32,31,0.22)]">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ffd473]">
              Links públicos e conformidade
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {trustHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-5"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#ffd473]" />
                    <p className="text-sm leading-7 text-white/[0.82]">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[32px] border border-[#d8ccb7] bg-white p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#0f2d2a]">
              Acesso público
            </p>
            <div className="mt-6 space-y-5 text-sm">
              <div>
                <p className="font-semibold text-[#10201f]">Rota pública</p>
                <a
                  href={advanceMaisLocalSite.routeUrl}
                  className="mt-1 inline-flex break-all text-slate-600 underline decoration-[#d4a73f]/60 underline-offset-4"
                >
                  {advanceMaisLocalSite.routeUrl}
                </a>
              </div>
              <div>
                <p className="font-semibold text-[#10201f]">Subdomínio sugerido</p>
                <a
                  href={advanceMaisLocalSite.canonicalUrl}
                  className="mt-1 inline-flex break-all text-slate-600 underline decoration-[#d4a73f]/60 underline-offset-4"
                >
                  {advanceMaisLocalSite.canonicalUrl}
                </a>
              </div>
              <div>
                <p className="font-semibold text-[#10201f]">
                  Política de privacidade
                </p>
                <Link
                  href={advanceMaisLocalSite.privacyPath}
                  className="mt-1 inline-flex break-all text-slate-600 underline decoration-[#d4a73f]/60 underline-offset-4"
                >
                  {advanceMaisLocalSite.privacyPath}
                </Link>
              </div>
              <div className="rounded-2xl bg-[#f7f1e5] p-4 text-slate-700">
                <p className="font-medium text-[#10201f]">Contato</p>
                <p className="mt-2">{advanceMaisLocalSite.supportEmail}</p>
                <p>{advanceMaisLocalSite.contactPhone}</p>
                <p>{advanceMaisLocalSite.whatsappPhone}</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
