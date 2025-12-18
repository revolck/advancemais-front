"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { HelpCircle, ArrowUpRight } from "lucide-react";
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
 * Página de Perguntas Frequentes (FAQ)
 *
 * Apresenta respostas para as principais dúvidas dos usuários
 */
export default function FaqPage() {
  // Configura o título da página
  usePageTitle("Perguntas Frequentes");

  const lastUpdated = "23/09/2025";

  const sections: Array<{
    title: string;
    content: string[];
  }> = [
    {
      title: "Sobre a Plataforma",
      content: [
        "A Advance+ é uma plataforma integrada de educação, tecnologia e gestão que oferece soluções completas para empresas, candidatos e alunos.",
        "Nossa plataforma permite gerenciar cursos, processos seletivos, avaliações, certificados e muito mais em um único ambiente digital.",
        "Você pode acessar a plataforma utilizando suas credenciais de acesso.",
      ],
    },
    {
      title: "Cadastro e Conta",
      content: [
        "Para criar uma conta, acesse a página de registro e preencha os dados solicitados. Você precisará informar nome, CPF ou CNPJ, e-mail, telefone e criar uma senha segura.",
        "Cada CPF ou CNPJ pode ter apenas uma conta na plataforma. Se você já possui uma conta, utilize suas credenciais para acessar.",
        "Se você esqueceu sua senha, clique em 'Esqueci minha senha' na tela de login. Você receberá um e-mail com instruções para redefinir sua senha.",
        "Para alterar seus dados pessoais, acesse o menu de configurações da sua conta e edite as informações desejadas. Algumas alterações podem requerer verificação adicional.",
      ],
    },
    {
      title: "Cursos e Certificados",
      content: [
        "Para se inscrever em um curso, navegue até a página de cursos, escolha o curso desejado e clique em 'Inscrever-se'. Alguns cursos podem ter pré-requisitos ou serem pagos.",
        "Os certificados são emitidos automaticamente após a conclusão do curso e aprovação nas avaliações. Você pode baixar seu certificado na área do aluno em formato PDF.",
        "O tempo de conclusão varia conforme o curso. Alguns cursos são de curta duração (horas), enquanto outros podem levar semanas ou meses. Consulte a descrição de cada curso para mais detalhes.",
      ],
    },
    {
      title: "Processos Seletivos",
      content: [
        "Para se candidatar a uma vaga, acesse a área de recrutamento, encontre a vaga de seu interesse e clique em 'Candidatar-se'. Você precisará ter seu currículo atualizado na plataforma.",
        "Você pode acompanhar o status da sua candidatura na área 'Minhas Candidaturas'. Os status possíveis incluem: Em análise, Aprovado, Reprovado ou Em processo seletivo.",
        "Sim, você pode se candidatar a múltiplas vagas simultaneamente. Cada candidatura é independente e não afeta as outras.",
        "O tempo de resposta varia conforme a empresa e o processo seletivo. Geralmente, você receberá atualizações por e-mail ou notificações na plataforma.",
      ],
    },
    {
      title: "Pagamentos e Assinaturas",
      content: [
        "Aceitamos diversos métodos de pagamento, incluindo cartão de crédito, débito, PIX e boleto bancário. Todos os pagamentos são processados de forma segura.",
        "Sim, oferecemos diferentes planos e assinaturas com funcionalidades variadas. Você pode visualizar os planos disponíveis e escolher o que melhor atende suas necessidades.",
        "Você pode cancelar sua assinatura a qualquer momento através das configurações da conta. O cancelamento será efetivado no final do período já pago.",
        "Sim, você pode alterar seu plano a qualquer momento. A alteração será aplicada imediatamente, com ajuste proporcional na cobrança.",
      ],
    },
    {
      title: "Suporte e Atendimento",
      content: [
        "Você pode entrar em contato conosco através do formulário de contato, e-mail (contato@advancemais.com), telefone ou chat online disponível na plataforma.",
        "Nosso horário de atendimento é de segunda a sexta, das 08h às 20h, e aos sábados, das 09h às 13h.",
        "Sim, oferecemos suporte técnico para ajudar com problemas de acesso, uso da plataforma e outras questões técnicas.",
        "Você pode abrir um ticket de suporte através da área de ajuda da plataforma. Nossa equipe responderá o mais rápido possível.",
      ],
    },
    {
      title: "Privacidade e Segurança",
      content: [
        "Sim, levamos a segurança dos seus dados muito a sério. Utilizamos criptografia, controles de acesso e seguimos as melhores práticas de segurança da informação.",
        "Seus dados pessoais são tratados conforme nossa Política de Privacidade e a LGPD. Você pode acessar, corrigir ou solicitar a exclusão dos seus dados a qualquer momento.",
        "Você pode gerenciar suas preferências de cookies através do link disponível no rodapé da plataforma. Alguns cookies são essenciais para o funcionamento do site.",
        "Sim, você pode solicitar a exclusão da sua conta e dados pessoais. Entre em contato conosco através dos canais de atendimento para fazer essa solicitação.",
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
    [sections]
  );

  const [activeSection, setActiveSection] = useState<string>(
    tocItems.length > 0 ? tocItems[0].id : ""
  );
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250; // Offset para considerar header

      let currentSection = "";
      let minDistance = Infinity;

      tocItems.forEach((item) => {
        const element = sectionRefs.current[item.id];
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const distance = Math.abs(elementTop - scrollPosition);

          if (rect.top <= 250 && rect.bottom >= 50 && distance < minDistance) {
            minDistance = distance;
            currentSection = item.id;
          }
        }
      });

      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
      lastScrollY.current = window.scrollY;
      ticking.current = false;
    };

    const throttledHandleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(handleScroll);
        ticking.current = true;
      }
    };

    const timeoutId = setTimeout(() => {
      handleScroll();
    }, 300);

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    window.addEventListener("resize", throttledHandleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", throttledHandleScroll);
      window.removeEventListener("resize", throttledHandleScroll);
    };
  }, [activeSection, tocItems]);

  const handleTocClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    const element = sectionRefs.current[id];
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      window.history.pushState(null, "", `#${id}`);
      setActiveSection(id);
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
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-semibold transition-all duration-300 ${
                        isActive
                          ? "bg-[var(--primary-color)]! text-white! shadow-md"
                          : "bg-[#001a57]/10 text-[var(--primary-color)] group-hover:bg-[#001a57]/15"
                      }`}
                    >
                      {index + 1}
                    </span>
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
            Não encontrou sua resposta?
          </p>
          <a
            href="/contato"
            className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
          >
            Entre em contato
            <ArrowUpRight className="h-4 w-4 text-gray-500" />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden bg-gradient-to-br from-[#001a57] to-[#012a8c]">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-white/80 hover:text-white">
                    Início
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/40" />
              <BreadcrumbPage className="text-white">FAQ</BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge
              variant="secondary"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
              Perguntas Frequentes
            </Badge>
          </div>

          <h1 className="text-white! mb-0!">Perguntas Frequentes</h1>
          <p className="leading-relaxed! text-white/75!">
            Encontre respostas para as principais dúvidas sobre a plataforma
            Advance+
          </p>
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
                        ref={(el) => {
                          sectionRefs.current[id] = el;
                        }}
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
