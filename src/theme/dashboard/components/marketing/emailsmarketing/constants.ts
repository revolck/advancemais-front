import type {
  MarketingEmailBuilderConfig,
  MarketingEmailContentConfig,
  MarketingEmailStatus,
  MarketingEmailTargetConfig,
  MarketingEmailTemplate,
  MarketingEmailType,
} from "@/api/websites/components/emailsmarketing";
import type {
  CreatePopupPayload,
  PopupBuilderAreaNode,
  PopupBuilderAtomicNode,
  PopupBuilderSocialLink,
  PopupBuilderCouponTone,
  PopupBuilderCouponVariant,
  PopupBuilderRootNode,
  PopupBuilderStructure,
} from "@/api/websites/components/popups";
import { buildDefaultPopupPayload } from "@/theme/dashboard/components/marketing/popups/constants";

export const MARKETING_EMAIL_STATUS_LABEL: Record<
  MarketingEmailStatus,
  string
> = {
  PUBLICADO: "Publicado",
  RASCUNHO: "Rascunho",
};

export const MARKETING_EMAIL_TYPE_LABEL: Record<MarketingEmailType, string> = {
  CAMPANHA: "Campanha",
  NEWSLETTER: "Newsletter",
  COMUNICADO: "Comunicado",
};

export const MARKETING_EMAIL_TEMPLATES: MarketingEmailTemplate[] = [
  {
    slug: "blank",
    name: "Começar em branco",
    category: "ZERO",
    description: "Estrutura livre para montar seu e-mail do zero, no seu próprio ritmo.",
    imageUrl: null,
  },
  {
    slug: "boletim-oportunidades",
    name: "Boletim de oportunidades",
    category: "READY",
    description:
      "Newsletter para cursos, vagas, lançamentos e novidades recorrentes da plataforma.",
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "novidades-plataforma",
    name: "Novidades da plataforma",
    category: "READY",
    description:
      "Atualizações do produto, recursos novos, turmas abertas e destaques da semana.",
    imageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "convite-aula-aberta",
    name: "Convite para aula ao vivo",
    category: "READY",
    description:
      "Modelo para aula aberta, live, webinar ou apresentação rápida com vídeo.",
    imageUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "alerta-encerramento",
    name: "Últimas vagas da turma",
    category: "READY",
    description:
      "E-mail com urgência para fechamento de matrícula, prazo final ou poucas vagas.",
    imageUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "cadastro-com-desconto",
    name: "Captação com benefício",
    category: "READY",
    description:
      "Captação com incentivo imediato para liberar condição especial ou material de apoio.",
    imageUrl:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "boas-vindas-com-cupom",
    name: "Boas-vindas com cupom",
    category: "READY",
    description:
      "Primeiro contato para ativar um novo lead com cupom ou condição de entrada.",
    imageUrl:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "promo-black-friday",
    name: "Campanha promocional",
    category: "READY",
    description:
      "Modelo para campanha sazonal, oferta forte e foco total em clique e conversão.",
    imageUrl:
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1200&q=80",
  },
];

const MARKETING_EMAIL_TEMPLATE_BASE_SLUG: Record<string, string> = {
  "boletim-oportunidades": "newsletter-oportunidades",
  "novidades-plataforma": "newsletter-oportunidades",
  "convite-aula-aberta": "video-convite",
  "alerta-encerramento": "contador-de-urgencia",
  "cadastro-com-desconto": "inscricao-flash",
  "boas-vindas-com-cupom": "cupom-boas-vindas",
  "promo-black-friday": "guia-curriculo",
  blank: "blank",
  "newsletter-oportunidades": "newsletter-oportunidades",
  "captacao-webinar": "newsletter-oportunidades",
  "newsletter-evento": "video-convite",
  "newsletter-beneficios": "inscricao-flash",
};

function createArea(
  id: string,
  children: PopupBuilderAtomicNode[],
): PopupBuilderAreaNode {
  return {
    id,
    kind: "AREA",
    children,
  };
}

function createRoot(
  structure: PopupBuilderStructure,
  areas: PopupBuilderAreaNode[],
): PopupBuilderRootNode {
  return {
    id: "root_email_builder",
    kind: "ROOT",
    structure,
    areas,
  };
}

function createTitle(
  id: string,
  content: string,
  className?: string,
  textColor?: string,
): PopupBuilderAtomicNode {
  return {
    id,
    kind: "ATOMIC",
    type: "TITLE",
    content,
    className,
    textColor,
  };
}

function createParagraph(
  id: string,
  content: string,
  className?: string,
  textColor?: string,
): PopupBuilderAtomicNode {
  return {
    id,
    kind: "ATOMIC",
    type: "PARAGRAPH",
    content,
    className,
    textColor,
  };
}

function createImage(
  id: string,
  url: string,
  alt: string,
  className?: string,
): PopupBuilderAtomicNode {
  return {
    id,
    kind: "ATOMIC",
    type: "IMAGE",
    url,
    alt,
    className,
  };
}

function createButton(
  id: string,
  content: string,
  className?: string,
  buttonBackgroundColor?: string,
  textColor?: string,
): PopupBuilderAtomicNode {
  return {
    id,
    kind: "ATOMIC",
    type: "BUTTON",
    content,
    className,
    buttonBackgroundColor,
    textColor,
  };
}

function createCoupon(
  id: string,
  snapshot: {
    caption: string;
    value: string;
    code: string;
    validity: string;
  },
  variant: PopupBuilderCouponVariant = "ALPHA",
  tone: PopupBuilderCouponTone = "PRIMARY",
): PopupBuilderAtomicNode {
  return {
    id,
    kind: "ATOMIC",
    type: "COUPON",
    couponScope: null,
    couponId: null,
    couponCaption: snapshot.caption,
    couponValue: snapshot.value,
    couponCode: snapshot.code,
    couponValidity: snapshot.validity,
    couponVariant: variant,
    couponTone: tone,
  };
}

function createSocialLinks(
  id: string,
  links: PopupBuilderSocialLink[],
  className?: string,
): PopupBuilderAtomicNode {
  return {
    id,
    kind: "ATOMIC",
    type: "SOCIAL_LINKS",
    socialLinks: links,
    socialIconSize: "SM",
    socialIconShape: "CIRCLE",
    socialTheme: "COLOR",
    socialAlign: "CENTER",
    socialGap: 12,
    className,
  };
}

const EMAIL_SECTION_TITLE_CLASS =
  "text-center text-[2.1rem]! font-semibold! leading-[1.08]! tracking-0! text-balance!";
const EMAIL_BODY_CLASS =
  "mx-auto max-w-[38rem] text-center text-[16px]! leading-7! text-slate-600!";
const EMAIL_BUTTON_CLASS =
  "mt-2 h-12! rounded-2xl! border-0! shadow-none! px-6! text-[15px]! font-semibold!";
const EMAIL_IMAGE_CLASS =
  "mx-auto w-full rounded-2xl! overflow-hidden border border-slate-200/80!";
const EMAIL_CARD_IMAGE_CLASS =
  "mx-auto w-full rounded-2xl! overflow-hidden border border-slate-200/80! bg-slate-50!";

function buildEmailTemplatePopupPayload(templateSlug: string): CreatePopupPayload {
  const base = buildDefaultPopupPayload(
    resolveMarketingEmailBaseTemplateSlug(templateSlug),
  );

  const sharedDesign = {
    ...base.designConfig,
    backgroundColor: "#ffffff",
    layout: "SEM_PLANO_DE_FUNDO" as const,
    imageUrl: null,
    imageAlt: null,
  };

  const sharedBase = {
    ...base,
    templateSlug,
    designConfig: sharedDesign,
    formFields: [],
  };

  if (templateSlug === "boletim-oportunidades") {
    return {
      ...sharedBase,
      nome: "Boletim de oportunidades",
      contentConfig: {
        ...base.contentConfig,
        titulo: "Oportunidades da semana",
        subtitulo:
          "Uma curadoria objetiva com vagas, cursos e movimentos que merecem sua atenção.",
        botaoTexto: "Ver oportunidades",
        textoLegal: null,
        builderTree: createRoot("SINGLE", [
          createArea("area_main", [
            createImage(
              "hero_image",
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
              "Ilustração de oportunidades da semana",
              EMAIL_IMAGE_CLASS,
            ),
            createTitle(
              "hero_title",
              "Oportunidades da semana",
              EMAIL_SECTION_TITLE_CLASS,
              "#0F172A",
            ),
            createParagraph(
              "hero_body",
              "Uma curadoria objetiva com vagas, cursos e movimentos que merecem sua atenção.",
              EMAIL_BODY_CLASS,
              "#475569",
            ),
            createButton(
              "hero_button",
              "Ver oportunidades",
              EMAIL_BUTTON_CLASS,
              "#0F3FB8",
              "#FFFFFF",
            ),
            createTitle(
              "section_title",
              "Nesta edição",
              "mt-8 text-left text-[1.15rem]! font-semibold! leading-6!",
              "#0F172A",
            ),
            createParagraph(
              "section_body",
              "Seleção de novas turmas com inscrições abertas.\nDestaques de vagas com maior aderência.\nNovidades rápidas para acompanhar sem ruído.",
              "text-left text-[15px]! leading-7! text-slate-600!",
              "#475569",
            ),
            createSocialLinks(
              "social_footer",
              [
                { id: "instagram", platform: "INSTAGRAM", url: "https://instagram.com/advancemais" },
                { id: "linkedin", platform: "LINKEDIN", url: "https://linkedin.com" },
                { id: "youtube", platform: "YOUTUBE", url: "https://youtube.com" },
              ],
              "pt-2",
            ),
          ]),
        ]),
      },
    };
  }

  if (templateSlug === "novidades-plataforma") {
    return {
      ...sharedBase,
      nome: "Novidades da plataforma",
      contentConfig: {
        ...base.contentConfig,
        titulo: "O que mudou na plataforma",
        subtitulo:
          "Atualizações importantes para você aproveitar recursos novos, fluxos melhores e mais clareza no dia a dia.",
        botaoTexto: "Explorar novidades",
        textoLegal: null,
        builderTree: createRoot("ROW_2", [
          createArea("area_left", [
            createTitle(
              "hero_title",
              "O que mudou na plataforma",
              "text-left text-[2rem]! font-semibold! leading-[1.08]! tracking-0!",
              "#0F172A",
            ),
            createParagraph(
              "hero_body",
              "Atualizações importantes para você aproveitar recursos novos, fluxos melhores e mais clareza no dia a dia.",
              "text-left text-[16px]! leading-7! text-slate-600!",
              "#475569",
            ),
            createParagraph(
              "updates_body",
              "Novo fluxo de criação.\nOrganização mais clara de campanhas.\nMais consistência visual nas telas principais.",
              "rounded-2xl! border border-slate-200! bg-slate-50 px-5 py-4 text-left text-[15px]! leading-7!",
              "#334155",
            ),
            createButton(
              "hero_button",
              "Explorar novidades",
              "mt-2 h-12! w-fit! rounded-2xl! border-0! px-6! text-[15px]! font-semibold!",
              "#111827",
              "#FFFFFF",
            ),
          ]),
          createArea("area_right", [
            createImage(
              "hero_image",
              "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
              "Atualizações da plataforma",
              EMAIL_CARD_IMAGE_CLASS,
            ),
          ]),
        ]),
      },
    };
  }

  if (templateSlug === "convite-aula-aberta") {
    return {
      ...sharedBase,
      nome: "Convite para aula ao vivo",
      contentConfig: {
        ...base.contentConfig,
        titulo: "Você está convidado para a próxima aula ao vivo",
        subtitulo:
          "Reserve alguns minutos para conhecer a proposta, tirar dúvidas e entender o que faz sentido para o seu momento.",
        botaoTexto: "Confirmar presença",
        textoLegal: null,
        builderTree: createRoot("ROW_2", [
          createArea("area_left", [
            createImage(
              "hero_image",
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
              "Convite para aula ao vivo",
              EMAIL_IMAGE_CLASS,
            ),
          ]),
          createArea("area_right", [
            createTitle(
              "hero_title",
              "Você está convidado para a próxima aula ao vivo",
              "text-left text-[2rem]! font-semibold! leading-[1.08]! tracking-0!",
              "#0F172A",
            ),
            createParagraph(
              "hero_body",
              "Reserve alguns minutos para conhecer a proposta, tirar dúvidas e entender o que faz sentido para o seu momento.",
              "text-left text-[16px]! leading-7! text-slate-600!",
              "#475569",
            ),
            createParagraph(
              "details_body",
              "Formato direto.\nConteúdo prático.\nEspaço para perguntas ao final.",
              "rounded-2xl! border border-sky-100! bg-sky-50 px-5 py-4 text-left text-[15px]! leading-7!",
              "#0F4C81",
            ),
            createButton(
              "hero_button",
              "Confirmar presença",
              "mt-2 h-12! w-fit! rounded-2xl! border-0! px-6! text-[15px]! font-semibold!",
              "#0F3FB8",
              "#FFFFFF",
            ),
          ]),
        ]),
      },
    };
  }

  if (templateSlug === "alerta-encerramento") {
    return {
      ...sharedBase,
      nome: "Últimas vagas da turma",
      contentConfig: {
        ...base.contentConfig,
        titulo: "Últimas vagas disponíveis",
        subtitulo:
          "Se esta turma faz sentido para você, este é o momento para concluir. O prazo está no fim e a disponibilidade é limitada.",
        botaoTexto: "Garantir minha vaga",
        textoLegal: null,
        builderTree: createRoot("SINGLE", [
          createArea("area_main", [
            createTitle(
              "hero_title",
              "Últimas vagas disponíveis",
              "text-center text-[2.3rem]! font-semibold! leading-[1.05]! tracking-0! text-balance!",
              "#7F1D1D",
            ),
            createParagraph(
              "hero_body",
              "Se esta turma faz sentido para você, este é o momento para concluir. O prazo está no fim e a disponibilidade é limitada.",
              EMAIL_BODY_CLASS,
              "#57534E",
            ),
            createParagraph(
              "warning_body",
              "Após o encerramento, as condições atuais podem não permanecer disponíveis.",
              "rounded-2xl! border border-amber-200! bg-amber-50 px-5 py-4 text-center text-[15px]! leading-7!",
              "#92400E",
            ),
            createButton(
              "hero_button",
              "Garantir minha vaga",
              EMAIL_BUTTON_CLASS,
              "#B91C1C",
              "#FFFFFF",
            ),
          ]),
        ]),
      },
    };
  }

  if (templateSlug === "cadastro-com-desconto") {
    return {
      ...sharedBase,
      nome: "Captação com benefício",
      contentConfig: {
        ...base.contentConfig,
        titulo: "Seu benefício está liberado",
        subtitulo:
          "Preparamos uma condição especial para incentivar seu próximo passo com mais segurança e menos atrito.",
        botaoTexto: "Acessar condição especial",
        textoLegal: null,
        builderTree: createRoot("ROW_2", [
          createArea("area_left", [
            createImage(
              "hero_image",
              "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1400&q=80",
              "Benefício promocional",
              EMAIL_IMAGE_CLASS,
            ),
          ]),
          createArea("area_right", [
            createTitle(
              "hero_title",
              "Seu benefício está liberado",
              "text-left text-[2rem]! font-semibold! leading-[1.08]! tracking-0!",
              "#0F172A",
            ),
            createParagraph(
              "hero_body",
              "Preparamos uma condição especial para incentivar seu próximo passo com mais segurança e menos atrito.",
              "text-left text-[16px]! leading-7! text-slate-600!",
              "#475569",
            ),
            createCoupon(
              "coupon_primary",
              {
                caption: "Benefício liberado",
                value: "10% OFF",
                code: "ADVANCE10",
                validity: "Uso imediato",
              },
              "SIGMA",
              "LIGHT",
            ),
            createButton(
              "hero_button",
              "Acessar condição especial",
              "mt-2 h-12! w-fit! rounded-2xl! border-0! px-6! text-[15px]! font-semibold!",
              "#059669",
              "#FFFFFF",
            ),
          ]),
        ]),
      },
    };
  }

  if (templateSlug === "boas-vindas-com-cupom") {
    return {
      ...sharedBase,
      nome: "Boas-vindas com cupom",
      contentConfig: {
        ...base.contentConfig,
        titulo: "Bem-vindo à Advance+",
        subtitulo:
          "Para começar com contexto e benefício real, deixamos um cupom ativo para sua primeira decisão.",
        botaoTexto: "Usar cupom agora",
        textoLegal: null,
        builderTree: createRoot("ROW_2", [
          createArea("area_left", [
            createTitle(
              "hero_title",
              "Bem-vindo à Advance+",
              "text-left text-[2rem]! font-semibold! leading-[1.08]! tracking-0!",
              "#0F172A",
            ),
            createParagraph(
              "hero_body",
              "Para começar com contexto e benefício real, deixamos um cupom ativo para sua primeira decisão.",
              "text-left text-[16px]! leading-7! text-slate-600!",
              "#475569",
            ),
            createCoupon(
              "coupon_primary",
              {
                caption: "Cupom de boas-vindas",
                value: "10% OFF",
                code: "WELCOME10",
                validity: "Válido por tempo limitado",
              },
              "OMEGA",
              "PRIMARY",
            ),
            createButton(
              "hero_button",
              "Usar cupom agora",
              "mt-2 h-12! w-fit! rounded-2xl! border-0! px-6! text-[15px]! font-semibold!",
              "#0F3FB8",
              "#FFFFFF",
            ),
          ]),
          createArea("area_right", [
            createImage(
              "hero_image",
              "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1400&q=80",
              "Boas-vindas com cupom",
              EMAIL_CARD_IMAGE_CLASS,
            ),
          ]),
        ]),
      },
    };
  }

  if (templateSlug === "promo-black-friday") {
    return {
      ...sharedBase,
      nome: "Campanha promocional",
      contentConfig: {
        ...base.contentConfig,
        titulo: "Black Friday Advance+",
        subtitulo:
          "Uma campanha pensada para converter rápido: oferta clara, benefício forte e CTA direto.",
        botaoTexto: "Aproveitar oferta",
        textoLegal: null,
        builderTree: createRoot("SINGLE", [
          createArea("area_main", [
            createImage(
              "hero_image",
              "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1400&q=80",
              "Campanha promocional Black Friday",
              EMAIL_IMAGE_CLASS,
            ),
            createTitle(
              "hero_title",
              "Black Friday Advance+",
              "text-center text-[2.35rem]! font-semibold! leading-[1.02]! tracking-0! text-balance!",
              "#111827",
            ),
            createParagraph(
              "hero_body",
              "Uma campanha pensada para converter rápido: oferta clara, benefício forte e CTA direto.",
              EMAIL_BODY_CLASS,
              "#475569",
            ),
            createCoupon(
              "coupon_primary",
              {
                caption: "Condição especial",
                value: "40% OFF",
                code: "BLACK40",
                validity: "Enquanto durar a campanha",
              },
              "DELTA",
              "DARK",
            ),
            createButton(
              "hero_button",
              "Aproveitar oferta",
              EMAIL_BUTTON_CLASS,
              "#DC2626",
              "#FFFFFF",
            ),
            createSocialLinks(
              "social_footer",
              [
                { id: "instagram", platform: "INSTAGRAM", url: "https://instagram.com/advancemais" },
                { id: "facebook", platform: "FACEBOOK", url: "https://facebook.com" },
                { id: "linkedin", platform: "LINKEDIN", url: "https://linkedin.com" },
              ],
              "pt-2",
            ),
          ]),
        ]),
      },
    };
  }

  return {
    ...sharedBase,
    nome: "Começar em branco",
    contentConfig: {
      ...base.contentConfig,
      titulo: "Novo e-mail",
      subtitulo: "Monte o conteúdo da campanha do seu jeito.",
      botaoTexto: "Adicionar ação",
      textoLegal: null,
      builderTree: createRoot("SINGLE", [
        createArea("area_main", [
          createTitle(
            "hero_title",
            "Novo e-mail",
            EMAIL_SECTION_TITLE_CLASS,
            "#0F172A",
          ),
          createParagraph(
            "hero_body",
            "Monte o conteúdo da campanha do seu jeito.",
            EMAIL_BODY_CLASS,
            "#475569",
          ),
          createButton(
            "hero_button",
            "Adicionar ação",
            EMAIL_BUTTON_CLASS,
            "#0F3FB8",
            "#FFFFFF",
          ),
        ]),
      ]),
    },
  };
}

export function resolveMarketingEmailBaseTemplateSlug(
  templateSlug: string,
): string {
  return MARKETING_EMAIL_TEMPLATE_BASE_SLUG[templateSlug] ?? "newsletter-oportunidades";
}

export const MARKETING_EMAIL_EMPTY_SAVED_MODELS = {
  title: "Você ainda não tem modelos salvos",
  description:
    "Crie e salve um e-mail como modelo para vê-lo aqui. Comece do zero ou use um modelo pré-criado.",
};

export const DEFAULT_MARKETING_EMAIL_TARGET_CONFIG: MarketingEmailTargetConfig =
  {
    mode: "REGULAR",
    audienceType: "ALL_CONTACTS",
    contactIds: [],
    listIds: [],
  };

export function convertPopupPayloadToEmailBuilderConfig(
  popupPayload: CreatePopupPayload,
): MarketingEmailBuilderConfig {
  return {
    content: popupPayload.contentConfig,
    design: popupPayload.designConfig,
    fields: popupPayload.formFields,
  };
}

export function convertEmailBuilderConfigToPopupPayload(
  builder: MarketingEmailBuilderConfig,
  templateSlug: string,
): CreatePopupPayload {
  const base = buildDefaultPopupPayload(
    resolveMarketingEmailBaseTemplateSlug(templateSlug),
  );

  return {
    ...base,
    templateSlug,
    contentConfig: builder.content,
    designConfig: builder.design,
    formFields: builder.fields,
  };
}

export function buildDefaultMarketingEmailContentConfig(
  templateSlug = "blank",
): MarketingEmailContentConfig {
  const popupPayload = buildEmailTemplatePopupPayload(templateSlug);

  return {
    builder: convertPopupPayloadToEmailBuilderConfig(popupPayload),
    popupPayload,
  };
}
