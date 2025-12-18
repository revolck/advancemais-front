"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import type { ReactNode } from "react";
import {
  Building2,
  FileText,
  MapPin,
  Phone,
  Clock,
  Mail,
  ExternalLink,
  Shield,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/**
 * Página de Política de Privacidade
 *
 * Apresenta a política completa de privacidade da plataforma
 */
export default function PoliticaPrivacidadePage() {
  // Configura o título da página
  usePageTitle("Política de Privacidade");

  const effectiveDate = "23/09/2025";
  const lastUpdated = "23/09/2025";

  const sections: Array<{
    title: string;
    content: ReactNode[];
  }> = [
    {
      title: "Quais dados coletamos",
      content: [
        "Conta e cadastro: para usar nossos serviços, coletamos nome ou razão social, CPF ou CNPJ, data de nascimento, e-mail, telefones, endereço, senha (criptografada) e seu perfil na plataforma (Empresa, Candidato, Aluno, Instrutor ou Profissional de Psicologia/Pedagógico).",
        "Dados acadêmicos e de cursos: para alunos e instrutores, coletamos informações sobre turmas, presença, notas e avaliações, certificados emitidos, além de interações em fóruns e suporte.",
        "Recrutamento e seleção: para candidatos e empresas, coletamos currículo, experiências profissionais, formações acadêmicas, dados de candidaturas, mensagens trocadas e agendamentos de entrevistas.",
        "Faturamento e contratação: quando você contrata planos ou assinaturas, coletamos informações sobre o plano escolhido, dados do meio de pagamento (apenas identificadores seguros), notas fiscais e informações de cobrança necessárias para o processo.",
        "Suporte e comunicação: registramos tickets de atendimento, conversas de suporte, suas preferências de comunicação e consentimentos fornecidos.",
        "Dados técnicos e cookies: coletamos seu endereço IP, data e hora de acesso, tipo de dispositivo e navegador, páginas visitadas, identificadores de sessão e cookies (essenciais, funcionais, analíticos e de publicidade). Você pode gerenciar suas preferências de cookies através do banner disponível no rodapé.",
        "Dados sensíveis: informações de saúde ou avaliações psicológicas/pedagógicas são coletadas apenas quando necessárias para a prestação de serviços por profissionais habilitados, com base legal adequada (como consentimento específico) e controles de segurança reforçados.",
      ],
    },
    {
      title: "Para que usamos seus dados",
      content: [
        "Execução de contrato: usamos seus dados para criar e manter sua conta, inscrevê-lo em cursos, emitir certificados, permitir candidaturas a vagas, facilitar o contato entre empresas e candidatos, e gerenciar assinaturas e planos contratados.",
        "Cumprimento de obrigações legais: utilizamos seus dados para emitir notas fiscais, manter registros de acesso conforme exigido pelo Marco Civil da Internet, e responder a solicitações de autoridades competentes.",
        "Interesses legítimos: com o objetivo de proteger você e melhorar nossos serviços, usamos dados para prevenir fraudes e incidentes de segurança, melhorar a usabilidade da plataforma, analisar métricas de navegação e desempenho, e enviar comunicações operacionais importantes. Você pode optar por não receber algumas dessas comunicações.",
        "Com seu consentimento: enviamos comunicações de marketing, utilizamos cookies não essenciais, tratamos dados sensíveis relacionados a serviços de psicologia ou pedagógicos quando necessário, e convidamos para participação em pesquisas. Você pode revogar seu consentimento a qualquer momento através dos canais indicados.",
        "Proteção do crédito e direitos: utilizamos dados mínimos necessários para processos de cobrança, defesa em processos judiciais e cumprimento de contratos firmados.",
      ],
    },
    {
      title: "Cookies, identificadores e analytics",
      content: [
        "Utilizamos cookies e tecnologias similares para garantir o funcionamento da sua conta, melhorar a segurança, gerar estatísticas de uso e personalizar sua experiência na plataforma. Você pode gerenciar suas preferências de cookies através do link disponível no rodapé da plataforma.",
        "Seguimos as boas práticas recomendadas pela Autoridade Nacional de Proteção de Dados (ANPD) para garantir transparência, permitir que você escolha quais cookies aceita, e manter registros claros de suas escolhas.",
      ],
    },
    {
      title: "Com quem compartilhamos dados",
      content: [
        "Operadores e parceiros: compartilhamos dados com provedores de serviços em nuvem, serviços de e-mail e entrega de mensagens, sistemas antifraude, ferramentas de análise, serviços de emissão fiscal e processadores de pagamento. Esses parceiros utilizam os dados exclusivamente para cumprir as finalidades que informamos aqui.",
        "Empresas e candidatos: quando você se candidata a uma vaga ou interage com uma empresa, compartilhamos seus dados de candidatura e currículo com a empresa responsável pela vaga.",
        "Autoridades públicas: podemos compartilhar dados quando houver requisição legal, ordem judicial ou quando necessário para proteger direitos da ADVANCE+ e de terceiros, sempre nos termos da legislação aplicável.",
        "Transferências internacionais: alguns de nossos provedores de serviços podem estar localizados fora do Brasil. Quando isso ocorrer, adotamos medidas de segurança contratuais e técnicas previstas na LGPD para proteger seus dados.",
      ],
    },
    {
      title: "Segurança da informação",
      content: [
        "Aplicamos medidas de segurança técnicas e administrativas para proteger seus dados: utilizamos criptografia para dados em trânsito, controles de acesso baseados em perfis de usuário, registro de eventos importantes, backups regulares e testes periódicos de segurança. Embora nenhuma plataforma seja 100% imune a riscos, recomendamos que você use senhas fortes e ative a autenticação de dois fatores sempre que disponível.",
      ],
    },
    {
      title: "Retenção e descarte",
      content: [
        "Conta e histórico: mantemos seus dados enquanto sua conta estiver ativa ou enquanto forem necessários para as finalidades informadas nesta Política.",
        "Registros de acesso: conforme exigido pelo Marco Civil da Internet, mantemos registros de acesso às aplicações por no mínimo 6 meses.",
        "Dados fiscais e contábeis: guardamos informações de faturamento e contábeis pelos prazos estabelecidos pela legislação fiscal e contábil aplicável.",
        "Processos seletivos: dados de candidaturas podem ser mantidos por um período compatível com o ciclo de recrutamento e obrigações legais, ou até que você revogue seu consentimento, quando aplicável.",
        "Dados sensíveis: informações sensíveis são conservadas apenas pelo tempo estritamente necessário para a prestação do serviço, com controles de segurança reforçados.",
      ],
    },
    {
      title: "Seus direitos",
      content: [
        "Você tem direito a solicitar, a qualquer momento: confirmação de que tratamos seus dados, acesso aos dados que temos sobre você, correção de dados incorretos ou desatualizados, anonimização de dados, portabilidade dos seus dados, informações sobre com quem compartilhamos seus dados, revogação de consentimentos fornecidos e eliminação dos seus dados, sempre nos termos da LGPD.",
        <>
          Para exercer qualquer um desses direitos, entre em contato com o
          Encarregado de Proteção de Dados (DPO) através do e-mail indicado
          abaixo ou utilize as páginas de{" "}
          <Link
            href="/ouvidoria"
            className="text-primary underline-offset-4 hover:underline"
          >
            Ouvidoria
          </Link>{" "}
          e{" "}
          <Link
            href="/faq"
            className="text-primary underline-offset-4 hover:underline"
          >
            FAQ
          </Link>
          .
        </>,
      ],
    },
    {
      title: "Crianças e adolescentes",
      content: [
        "Nossa plataforma é voltada ao público geral e recomendada para maiores de 18 anos. Quando oferecemos serviços educacionais para menores de idade, exigimos o consentimento do responsável legal e seguimos rigorosamente o Estatuto da Criança e do Adolescente (ECA) e a Lei Geral de Proteção de Dados (LGPD).",
      ],
    },
    {
      title: "Links de terceiros",
      content: [
        "Nossa plataforma pode conter links para sites externos. Não nos responsabilizamos pelas práticas de privacidade desses sites. Recomendamos que você leia as políticas de privacidade desses sites antes de fornecer qualquer informação pessoal.",
      ],
    },
    {
      title: "Atualizações desta Política",
      content: [
        "Podemos atualizar esta Política de Privacidade para refletir mudanças na legislação ou em nossas operações. Sempre publicaremos a versão atualizada nesta página. Quando houver mudanças relevantes, podemos notificar usuários cadastrados através dos canais de comunicação informados.",
      ],
    },
    {
      title: "Como entrar em contato",
      content: [
        "Encarregado de Proteção de Dados (DPO): contato@advancemais.com",
        <>
          Ouvidoria e FAQ:{" "}
          <Link
            href="/ouvidoria"
            className="text-primary underline-offset-4 hover:underline"
          >
            advancemais.com/ouvidoria
          </Link>{" "}
          ·{" "}
          <Link
            href="/faq"
            className="text-primary underline-offset-4 hover:underline"
          >
            advancemais.com/faq
          </Link>
        </>,
        "Telefones: (82) 3234-1397 | (82) 98882-5559",
        "Endereço: Av. Juca Sampaio, 2247 – sala 30, Condomínio Shopping Miramar, Feitosa, CEP 57.042-530, Maceió/AL.",
      ],
    },
    {
      title: "Nota jurídica",
      content: [
        "Este documento foi elaborado seguindo as diretrizes da Lei Geral de Proteção de Dados (LGPD) e as boas práticas recomendadas pela Autoridade Nacional de Proteção de Dados (ANPD), incluindo questões relacionadas a cookies e ao Encarregado de Proteção de Dados. Também consideramos as obrigações do Marco Civil da Internet para registros de acesso e transparência. Quando houver relação de consumo online, este documento convive com as obrigações do Código de Defesa do Consumidor (CDC) e do Decreto 7.962/2013. Recomendamos que empresas revisem este documento com assessoria jurídica para adequação às suas particularidades.",
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
          <p className="text-xs! text-muted-foreground!">
            Precisa falar com o DPO?
          </p>
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
                    Política de Privacidade
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-white/30 bg-white/10 text-white"
              >
                <Shield className="h-3 w-3" />
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
              <h1 className="text-white! mb-0!">
                Política de Privacidade Advance+
              </h1>
              <p className="leading-relaxed! text-white/75!">
                Conheça as práticas adotadas para coletar, usar e proteger os
                dados pessoais de empresas, candidatos e estudantes que utilizam
                nossa plataforma.
              </p>
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
                            {section.content
                              .filter((item) => {
                                if (typeof item === "string") {
                                  const trimmed = item.trim();
                                  return (
                                    ![
                                      "Advance+",
                                      "Planalto",
                                      "+1",
                                      "Serviços e Informações do Brasil",
                                    ].includes(trimmed) && trimmed.length > 0
                                  );
                                }
                                return true;
                              })
                              .map((paragraph, contentIndex) => (
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
