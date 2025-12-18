"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  Building2,
  FileText,
  MapPin,
  Phone,
  Clock,
  Mail,
  ExternalLink,
  Scale,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { CardTitle } from "@/components/ui/card";
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
 * Página de Termos de Uso
 *
 * Apresenta os termos completos de uso da plataforma
 */
export default function TermosUsoPage() {
  // Configura o título da página
  usePageTitle("Termos de Uso");

  const effectiveDate = "23/09/2025";
  const lastUpdated = "23/09/2025";

  const sections: Array<{
    title: string;
    content: string[];
  }> = [
    {
      title: "Público e Definições",
      content: [
        "Empresa: pessoa jurídica que publica vagas, contrata planos e utiliza serviços corporativos na plataforma.",
        "Candidato(a): pessoa física que cadastra currículo e se candidata a vagas de emprego.",
        "Aluno(a): pessoa física inscrita em cursos e treinamentos oferecidos na plataforma.",
        "Instrutor(a): profissional responsável por criar conteúdo, aplicar avaliações e ministrar cursos.",
        "Profissional de Psicologia/Pedagógico: presta serviços de avaliação e orientação educacional ou psicológica na plataforma.",
        "Usuário(a): qualquer pessoa que acesse ou utilize a plataforma.",
      ],
    },
    {
      title: "Elegibilidade e Cadastro",
      content: [
        "Idade mínima: recomendamos o uso para maiores de 18 anos. Menores de idade precisam de consentimento do responsável legal e devem respeitar o Estatuto da Criança e do Adolescente (ECA).",
        "Dados verdadeiros: você se compromete a fornecer informações verdadeiras, completas e atualizadas em seu cadastro.",
        "Segurança da conta: mantenha seu login e senha em sigilo. Todas as atividades realizadas na sua conta são de sua responsabilidade.",
        "Perfis e permissões: as funcionalidades disponíveis variam conforme seu perfil na plataforma (Empresa, Candidato, Aluno, Instrutor ou Profissional de Psicologia/Pedagógico).",
      ],
    },
    {
      title: "Planos, Assinaturas e Pagamentos",
      content: [
        "Planos e benefícios: algumas funcionalidades exigem contratação de planos pagos. Valores e condições são informados antes da compra.",
        "Cobrança e impostos: podem ser aplicadas taxas do meio de pagamento escolhido e impostos conforme a legislação. Comprovantes ficam disponíveis na sua conta.",
        "Renovação e cancelamento: a renovação pode ser automática quando indicado. Cancelamentos seguem nossa política comercial e o Código de Defesa do Consumidor (CDC), quando aplicável.",
        "Direito de arrependimento: contratações realizadas à distância podem ter direito de arrependimento conforme o CDC e Decreto 7.962/2013, quando aplicável.",
      ],
    },
    {
      title: "Cursos, Certificados e Comunidade",
      content: [
        "Conteúdo educacional: inclui aulas gravadas ou ao vivo, materiais complementares, avaliações e fóruns de discussão. A disponibilidade varia conforme o curso ou turma.",
        "Certificados: são emitidos quando você atende aos requisitos divulgados na página do curso, como carga horária mínima, nota mínima e presença necessária.",
        "Propriedade intelectual: todo o material é protegido por direitos autorais. É proibida a reprodução ou distribuição não autorizada.",
        "Conduta esperada: são proibidas práticas como plágio, vazamento de avaliações, assédio, tentativa de burlar acessos ou qualquer ato ilícito.",
      ],
    },
    {
      title: "Vagas e Recrutamento",
      content: [
        "Publicação de vagas: empresas devem publicar apenas vagas verdadeiras, legais e não discriminatórias.",
        "Processo seletivo: a plataforma não garante contratações, nem a idoneidade ou veracidade dos dados de terceiros. As decisões de contratação são de responsabilidade da empresa.",
        "Compartilhamento de dados: ao se candidatar a uma vaga, você autoriza o compartilhamento de seus dados com a empresa responsável pela vaga.",
        "Comunicação: a comunicação pode ocorrer pela plataforma ou por outros meios informados pela empresa. Use com respeito e proteja dados pessoais.",
      ],
    },
    {
      title: "Serviços de Psicologia e Pedagógicos",
      content: [
        "Escopo dos serviços: oferecemos serviços de avaliação e orientação prestados por profissionais cadastrados. A relação contratual é diretamente entre o profissional e você.",
        "Limitações importantes: estes serviços não substituem diagnósticos ou terapias exigidos por lei. Em caso de urgência, procure serviços de saúde adequados.",
      ],
    },
    {
      title: "Privacidade, LGPD e Cookies",
      content: [
        "Conformidade legal: tratamos seus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD), Marco Civil da Internet e normas de consumo. Para mais detalhes, consulte nossa Política de Privacidade.",
        "Bases legais: utilizamos seus dados com base em execução de contrato (sua inscrição), obrigação legal (fiscal e contábil), legítimo interesse (segurança e prevenção a fraudes) e consentimento, quando necessário.",
        "Seus direitos: você pode solicitar confirmação de tratamento, acesso, correção, portabilidade, anonimização, revogação de consentimento e eliminação dos seus dados, nos termos da LGPD.",
        "Registros de acesso: mantemos registros de acesso pelo prazo mínimo exigido pelo Marco Civil da Internet.",
        "Cookies: utilizamos cookies para garantir o funcionamento da plataforma, análises e personalização. Você pode gerenciar suas preferências no banner de cookies ou nas configurações do navegador.",
        "Encarregado de Dados (DPO): para questões sobre proteção de dados, entre em contato através da Ouvidoria, FAQ ou telefones oficiais enquanto o DPO não for divulgado.",
      ],
    },
    {
      title: "Conteúdos Publicados e Moderação",
      content: [
        "Sua responsabilidade: você é responsável por todo o conteúdo que publicar na plataforma, incluindo textos, imagens, vídeos, avaliações e mensagens.",
        "Licença de uso: ao publicar conteúdo público, você concede uma licença não exclusiva e gratuita para que possamos hospedar e exibir esse conteúdo na plataforma.",
        "Remoção e suspensão: conteúdos ou contas podem ser removidos ou suspensos em caso de violação destes Termos, leis aplicáveis ou direitos de terceiros.",
      ],
    },
    {
      title: "Propriedade Intelectual",
      content: [
        "Direitos da plataforma: marcas, logotipos, layouts, software e bases de dados pertencem à empresa controladora ou são licenciados por ela.",
        "Proibições: é proibido copiar, adaptar, decompilar, fazer engenharia reversa, explorar comercialmente ou remover avisos de direitos autorais da plataforma.",
        "Denúncias: se identificar violações de propriedade intelectual, reporte através dos canais de suporte ou e-mail jurídico.",
      ],
    },
    {
      title: "Disponibilidade, Suporte e Atualizações",
      content: [
        "Disponibilidade: fazemos o possível para manter a plataforma funcionando, mas não garantimos que estará disponível 100% do tempo, sem interrupções.",
        "Suporte: oferecemos suporte através da Ouvidoria, FAQ e telefones oficiais nos horários informados.",
        "Atualizações: funcionalidades, planos e políticas podem ser alterados. Quando houver mudanças relevantes, comunicaremos através da plataforma.",
      ],
    },
    {
      title: "Uso Aceitável",
      content: [
        "É proibido: violar leis; acessar áreas ou dados de outros usuários sem autorização; interferir no funcionamento da plataforma (injeção de código, scraping abusivo, ataques DDoS); usar a plataforma para fins comerciais não autorizados; criar contas falsas; compartilhar credenciais de acesso; usar robôs ou bots não autorizados; tentar burlar sistemas de pagamento ou assinaturas.",
      ],
    },
    {
      title: "Isenções e Limitações de Responsabilidade",
      content: [
        "Conteúdos de terceiros: vagas, currículos e avaliações publicados por outros usuários são de responsabilidade de quem os publicou. Não nos responsabilizamos por essas informações.",
        "Contratação e resultados: não participamos de decisões de contratação e não garantimos resultados acadêmicos ou profissionais para usuários.",
        "Riscos da internet: reconhecemos que existem riscos inerentes ao uso da internet, como interrupções e ataques. Recomendamos que você adote medidas de segurança, como senhas fortes e uso de antivírus.",
        "Limite de responsabilidade: nossa responsabilidade está limitada ao valor pago à plataforma nos 12 meses anteriores ao evento, na extensão permitida por lei, sem prejuízo dos direitos do consumidor.",
      ],
    },
    {
      title: "Links Externos",
      content: [
        "Não nos responsabilizamos por conteúdos ou políticas de sites de terceiros. Recomendamos que você leia os termos e políticas de privacidade desses sites antes de utilizá-los.",
      ],
    },
    {
      title: "Comunicações",
      content: [
        "Você autoriza o envio de comunicações operacionais, transacionais e de marketing por e-mail, notificações push, telefone, WhatsApp, SMS ou dentro da plataforma. Você pode cancelar o recebimento de comunicações de marketing a qualquer momento.",
      ],
    },
    {
      title: "Encerramento de Conta",
      content: [
        "Você pode solicitar o encerramento da sua conta a qualquer momento. Manteremos apenas os registros mínimos exigidos por lei (como logs e registros fiscais), conforme a LGPD e o Marco Civil da Internet.",
      ],
    },
    {
      title: "E-commerce",
      content: [
        "Quando houver venda à distância, exibiremos todas as informações essenciais conforme o Código de Defesa do Consumidor (CDC) e o Decreto 7.962/2013, incluindo identificação do fornecedor, características do produto/serviço, preço total, despesas adicionais, condições de pagamento e prazo, e informações de atendimento.",
      ],
    },
    {
      title: "Alterações dos Termos",
      content: [
        "Podemos alterar estes Termos a qualquer momento. Quando houver mudanças relevantes, comunicaremos através da plataforma. O uso continuado da plataforma após a vigência das alterações indica sua concordância com os novos termos.",
      ],
    },
    {
      title: "Lei Aplicável e Foro",
      content: [
        "Estes Termos são regidos pelas leis da República Federativa do Brasil, incluindo a LGPD, Marco Civil da Internet e CDC, quando aplicáveis. Fica eleito o foro da Comarca de Maceió/AL para dirimir questões relacionadas a estes Termos, salvo disposição legal específica em contrário.",
      ],
    },
    {
      title: "Contato",
      content: [
        "Ouvidoria e FAQ: acesse as páginas dedicadas na plataforma.",
        "Telefones: (82) 3234-1397 | (82) 98882-5559",
        "Endereço: Av. Juca Sampaio, 2247 – sala 30, Condomínio Shopping Miramar, Feitosa, CEP 57.042-530, Maceió/AL.",
        "E-mail: contato@advancemais.com",
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
                    Termos de Uso
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-white/30 bg-white/10 text-white"
              >
                <Scale className="h-3 w-3" />
                Legal
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
              <h1 className="text-white! mb-0!">Termos de Uso Advance+</h1>
              <p className="leading-relaxed! text-white/75!">
                Conheça as regras e condições que regem o uso da nossa
                plataforma, incluindo direitos, responsabilidades e obrigações
                de empresas, candidatos e estudantes.
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

                {/* Aviso Legal */}
                <div className="rounded-2xl bg-gradient-to-br from-white via-gray-50/50 to-white p-8">
                  <div className="mb-6 pb-6 border-b border-gray-200/50">
                    <CardTitle className="text-base! font-semibold! text-foreground! mb-0!">
                      Aviso Legal
                    </CardTitle>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm! leading-relaxed! text-muted-foreground! mb-0!">
                      Este documento reflete legislação brasileira vigente e
                      boas práticas, mas não substitui assessoria jurídica.
                      Recomenda-se revisão por advogado(a) para adequação às
                      particularidades do seu negócio.
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
