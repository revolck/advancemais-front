"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCookieConsent } from "@/components/cookies/CookieConsentProvider";
import {
  Building2,
  FileText,
  MapPin,
  Phone,
  Clock,
  Mail,
  ExternalLink,
  Cookie,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ButtonCustom } from "@/components/ui/custom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/**
 * Página de Preferências de Cookies
 *
 * Apresenta informações sobre cookies e como gerenciá-los
 */
export default function CookiesPage() {
  // Configura o título da página
  usePageTitle("Preferências de Cookies");

  const { openPreferences } = useCookieConsent();

  const effectiveDate = "23/09/2025";
  const lastUpdated = "23/09/2025";

  const sections: Array<{
    title: string;
    content: string[];
  }> = [
    {
      title: "O que são cookies",
      content: [
        "Cookies são pequenos arquivos de texto armazenados no seu dispositivo (computador, tablet ou smartphone) quando você visita um site. Eles permitem que o site reconheça seu dispositivo e armazene algumas informações sobre suas preferências ou ações passadas.",
        "Os cookies são amplamente utilizados para tornar os sites mais eficientes e proporcionar informações aos proprietários do site. Eles podem ser 'persistentes' (permanecem no seu dispositivo por um período determinado) ou 'sessão' (são excluídos quando você fecha o navegador).",
      ],
    },
    {
      title: "Como utilizamos cookies",
      content: [
        "Utilizamos cookies para garantir o funcionamento adequado da plataforma, melhorar sua experiência de navegação, personalizar conteúdo, analisar como você utiliza nossos serviços e, quando aplicável, exibir anúncios relevantes.",
        "Alguns cookies são essenciais para o funcionamento da plataforma e não podem ser desativados. Outros cookies podem ser gerenciados através das configurações do seu navegador ou através das preferências que oferecemos nesta página.",
      ],
    },
    {
      title: "Tipos de cookies que utilizamos",
      content: [
        "Cookies essenciais: são necessários para o funcionamento básico da plataforma. Permitem que você navegue pelo site e use recursos essenciais, como acessar áreas seguras, fazer login e manter sua sessão ativa. Estes cookies não podem ser desativados.",
        "Cookies funcionais: lembram suas escolhas e preferências (como idioma, região ou tamanho da fonte) para proporcionar uma experiência mais personalizada. Estes cookies também podem ser usados para lembrar alterações que você fez no texto, tamanho e outras partes das páginas que você pode personalizar.",
        "Cookies analíticos: nos ajudam a entender como os visitantes interagem com a plataforma, coletando e relatando informações anonimamente. Isso nos permite melhorar o funcionamento do site e a experiência do usuário.",
        "Cookies de publicidade: são usados para exibir anúncios que são mais relevantes para você e seus interesses. Eles também são usados para limitar o número de vezes que você vê um anúncio, bem como ajudar a medir a eficácia de campanhas publicitárias.",
      ],
    },
    {
      title: "Cookies de terceiros",
      content: [
        "Alguns cookies são colocados por serviços de terceiros que aparecem em nossas páginas. Por exemplo, podemos usar serviços de análise como Google Analytics para nos ajudar a entender como os visitantes usam nosso site. Esses serviços podem definir seus próprios cookies em seu dispositivo.",
        "Também podemos usar serviços de publicidade de terceiros para exibir anúncios relevantes. Esses serviços podem usar cookies para rastrear suas atividades online em diferentes sites para construir um perfil de seus interesses.",
        "A Advance+ não tem controle sobre as práticas de tratamento de dados realizadas por terceiros, sendo estes responsáveis pelo cumprimento da legislação aplicável. Não temos controle sobre os cookies definidos por terceiros. Recomendamos que você verifique os sites de terceiros para obter mais informações sobre seus cookies e como gerenciá-los.",
      ],
    },
    {
      title: "Como gerenciar cookies",
      content: [
        "Configurações do navegador: a maioria dos navegadores permite que você controle cookies através de suas configurações. Você pode configurar seu navegador para recusar cookies ou para alertá-lo quando um cookie está sendo enviado. No entanto, se você desativar cookies, algumas partes da plataforma podem não funcionar corretamente.",
        "Preferências na plataforma: oferecemos ferramentas para gerenciar suas preferências de cookies diretamente na plataforma. Você pode acessar essas configurações através do banner de cookies ou através do link disponível no rodapé.",
        "Exclusão de cookies: você pode excluir cookies que já estão no seu dispositivo a qualquer momento através das configurações do seu navegador. Lembre-se de que, se você excluir cookies, pode precisar ajustar suas preferências novamente.",
      ],
    },
    {
      title: "Cookies e dados pessoais",
      content: [
        "Alguns cookies podem coletar informações que são consideradas dados pessoais sob a Lei Geral de Proteção de Dados (LGPD). Quando isso ocorre, tratamos essas informações de acordo com nossa Política de Privacidade.",
        "Cookies essenciais são utilizados com base no legítimo interesse da plataforma (art. 7º, IX, da LGPD), por serem necessários ao funcionamento e segurança do serviço. Cookies funcionais, analíticos e de publicidade são utilizados mediante consentimento do titular, quando exigido pela legislação.",
        "Você tem o direito de acessar, corrigir, excluir ou portar dados pessoais coletados através de cookies, nos termos da LGPD. Para exercer esses direitos, entre em contato conosco através dos canais indicados.",
      ],
    },
    {
      title: "Atualizações desta política",
      content: [
        "Podemos atualizar esta política de cookies periodicamente para refletir mudanças em nossas práticas ou por outras razões operacionais, legais ou regulamentares. Sempre publicaremos a versão atualizada nesta página.",
        "Recomendamos que você revise esta política regularmente para se manter informado sobre como utilizamos cookies. A data da última atualização está indicada no topo desta página.",
      ],
    },
    {
      title: "Mais informações",
      content: [
        "Para obter mais informações sobre como tratamos seus dados pessoais, consulte nossa Política de Privacidade.",
        "Se você tiver dúvidas sobre nossa utilização de cookies ou sobre esta política, entre em contato conosco através dos canais indicados abaixo.",
      ],
    },
  ];

  const makeSectionId = (title: string) =>
    title
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const tocItems = useMemo(
    () =>
      sections.map((section) => ({
        id: makeSectionId(section.title),
        title: section.title,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Estado para controlar qual seção está ativa
  const [activeSection, setActiveSection] = useState<string>(
    tocItems.length > 0 ? tocItems[0].id : ""
  );

  // Ref para armazenar os IDs das seções
  const sectionIdsRef = useRef<string[]>(tocItems.map((item) => item.id));

  // Atualizar ref quando tocItems mudar
  useEffect(() => {
    sectionIdsRef.current = tocItems.map((item) => item.id);
  }, [tocItems]);

  // Hook para detectar seção ativa no scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset para considerar header

      // Encontrar a seção mais próxima do topo da viewport
      let currentSection = "";
      let minDistance = Infinity;

      sectionIdsRef.current.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const distance = Math.abs(elementTop - scrollPosition);

          // Se o elemento está visível na viewport
          if (rect.top <= 250 && rect.bottom >= 50) {
            if (distance < minDistance) {
              minDistance = distance;
              currentSection = id;
            }
          }
        }
      });

      // Se encontrou uma seção, atualiza
      if (currentSection) {
        setActiveSection((prev) => {
          if (prev !== currentSection) {
            return currentSection;
          }
          return prev;
        });
      }
    };

    // Executar no mount
    const timeoutId = setTimeout(() => {
      handleScroll();
    }, 300);

    // Throttle para melhor performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    window.addEventListener("resize", throttledHandleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", throttledHandleScroll);
      window.removeEventListener("resize", throttledHandleScroll);
    };
     
  }, []);

  // Função para scroll suave
  const handleTocClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Offset para o header fixo
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Atualizar URL sem recarregar
      window.history.pushState(null, "", `#${id}`);
    }
  };

  const TableOfContents = () => (
    <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-white">
      <div className="border-b border-gray-200/50 p-6 pb-4">
        <CardTitle className="text-base! font-semibold! text-foreground! mb-0!">
          Sumário de Conteúdo
        </CardTitle>
      </div>
      <div className="p-6 pt-4 space-y-4">
        <nav aria-label="Sumário">
          <ul className="space-y-2">
            {tocItems.map((item, index) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleTocClick(e, item.id)}
                    className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 ${
                      isActive
                        ? "bg-[#001a57]/8 text-foreground! shadow-sm scale-[1.02]"
                        : "text-muted-foreground hover:bg-[#001a57]/5 hover:text-foreground"
                    }`}
                  >
                    {/* Número com animação elegante */}
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-semibold transition-all duration-300 ${
                        isActive
                          ? "bg-[var(--primary-color)]! text-white! shadow-md"
                          : "bg-[#001a57]/10 text-[var(--primary-color)] group-hover:bg-[#001a57]/15"
                      }`}
                    >
                      {index + 1}
                    </span>

                    {/* Texto com animação */}
                    <span
                      className={`flex-1 leading-snug transition-all duration-300 ${
                        isActive ? "font-semibold! text-foreground!" : ""
                      }`}
                    >
                      {item.title}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs! text-muted-foreground!">Precisa de ajuda?</p>
          <a
            href="mailto:contato@advancemais.com"
            className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
          >
            contato@advancemais.com
            <ArrowUpRight className="h-4 w-4 text-gray-500" />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden bg-gradient-to-br from-[#001a57] to-[#012a8c]">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-32 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="max-w-4xl space-y-6">
            <Breadcrumb>
              <BreadcrumbList className="text-white/60">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="hover:text-white">
                      Início
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/40" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">
                    Preferências de Cookies
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-white/30 bg-white/10 text-white"
              >
                <Cookie className="h-3 w-3" />
                LGPD
              </Badge>
              <Badge
                variant="outline"
                className="border-white/30 bg-white/10 text-white"
              >
                Vigência: {effectiveDate}
              </Badge>
              <Badge
                variant="outline"
                className="border-white/30 bg-white/10 text-white"
              >
                Atualização: {lastUpdated}
              </Badge>
            </div>

            <div className="space-y-3">
              <h1 className="text-white! mb-0!">Preferências de Cookies</h1>
              <p className="leading-relaxed! text-white/75!">
                Entenda como utilizamos cookies em nossa plataforma e como você
                pode gerenciar suas preferências para controlar quais cookies
                são armazenados no seu dispositivo.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <ButtonCustom
                variant="outline"
                size="sm"
                withAnimation={false}
                onClick={openPreferences}
                className="border-white/30 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              >
                Gerenciar preferências
              </ButtonCustom>
            </div>
          </div>
        </div>
      </header>

      <main className="relative -mt-10 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-6 ring-1 ring-gray-100">
            <div className="mb-8 lg:hidden">
              <TableOfContents />
            </div>

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-8">
                <div className="space-y-8">
                  {sections.map((section, index) => {
                    const id = makeSectionId(section.title);
                    return (
                      <section
                        key={section.title}
                        id={id}
                        className="scroll-mt-32"
                      >
                        <div className="rounded-2xl bg-gradient-to-br from-white via-gray-50/50 to-white p-8 transition-all hover:from-gray-50 hover:via-white hover:to-gray-50/30">
                          <div className="mb-6 pb-6 border-b border-gray-200/50">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#001a57]/10 text-sm! font-semibold! text-[var(--primary-color)]! transition-colors">
                                {index + 1}
                              </span>
                              <CardTitle className="text-base! font-semibold! text-foreground! mb-0!">
                                {section.title}
                              </CardTitle>
                            </div>
                          </div>
                          <div className="space-y-4">
                            {section.content.map((paragraph, contentIndex) => (
                              <p
                                key={`${section.title}-${contentIndex}`}
                                className="text-sm! leading-relaxed! text-muted-foreground! mb-0!"
                              >
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>
                      </section>
                    );
                  })}
                </div>

                {/* Link para Política de Privacidade */}
                <div className="rounded-2xl bg-gradient-to-br from-white via-gray-50/50 to-white p-8">
                  <div className="mb-6 pb-6 border-b border-gray-200/50">
                    <CardTitle className="text-base! font-semibold! text-foreground! mb-0!">
                      Política de Privacidade
                    </CardTitle>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm! leading-relaxed! text-muted-foreground! mb-0!">
                      Para obter informações mais detalhadas sobre como tratamos
                      seus dados pessoais, incluindo informações coletadas
                      através de cookies, consulte nossa{" "}
                      <Link
                        href="/politica-privacidade"
                        className="text-[var(--primary-color)]! underline-offset-4 hover:underline"
                      >
                        Política de Privacidade
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>

              <aside className="hidden lg:block lg:pl-6">
                <div className="lg:sticky lg:top-28">
                  <TableOfContents />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
