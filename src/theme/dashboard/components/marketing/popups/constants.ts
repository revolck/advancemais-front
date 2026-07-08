import type {
  CreatePopupPayload,
  PopupBuilderAreaNode,
  PopupBuilderAtomicNode,
  PopupBuilderCouponTone,
  PopupBuilderCouponVariant,
  PopupBuilderInputKind,
  PopupBuilderRootNode,
  PopupBuilderStructure,
  PopupContentBlockType,
  PopupDesignConfig,
  PopupFormField,
  PopupPageRules,
  PopupSubscriptionConfig,
  PopupContentConfig,
  PopupDevice,
  PopupFrequency,
  PopupLayout,
  PopupPosition,
  PopupScope,
  PopupSpecificPageKey,
  PopupTrigger,
  WebsiteStatus,
} from "@/api/websites/components/popups";
import { cn } from "@/lib/utils";
import { syncBuilderTreeToLegacy } from "./popupBuilder";

export const POPUP_STATUS_LABEL: Record<WebsiteStatus, string> = {
  PUBLICADO: "Publicado",
  RASCUNHO: "Rascunho",
};

export const POPUP_DEVICE_LABEL: Record<PopupDevice, string> = {
  AMBOS: "Ambos",
  MOBILE: "Mobile",
  DESKTOP: "Desktop",
};

export const POPUP_SCOPE_LABEL: Record<PopupScope, string> = {
  WEBSITE: "Apenas no site",
  DASHBOARD: "Apenas no painel",
  AMBOS: "Ambos",
};

export const POPUP_PAGE_RULE_LABEL: Record<PopupPageRules["mode"], string> = {
  ALL_PAGES: "Todas as páginas",
  HOME: "Página principal",
  COURSES: "Página de cursos",
  URL_CONTAINS: "Baseado na URL",
  HTML_SELECTOR: "Baseado em HTML",
  SPECIFIC_PAGE: "Página específica",
};

export const POPUP_SPECIFIC_PAGE_LABEL: Record<PopupSpecificPageKey, string> = {
  HOME: "Página inicial",
  ABOUT: "Sobre",
  COURSES: "Cursos",
  RECRUITMENT: "Recrutamento & seleção",
  TRAINING: "Treinamento In Company",
  JOBS: "Vagas",
  FAQ: "FAQ",
  PRIVACY: "Política de privacidade",
  TERMS: "Termos de uso",
};

export const POPUP_TRIGGER_LABEL: Record<PopupTrigger, string> = {
  IMEDIATAMENTE: "Imediatamente",
  ATRASO: "Atraso",
  INATIVIDADE: "Inatividade",
  SCROLL: "Scroll",
  SAIDA: "Saída",
  CLIQUE: "Clique",
  HOVER: "Hover",
};

export const POPUP_POSITION_LABEL: Record<PopupPosition, string> = {
  CENTRO: "Centro",
  ESQUERDA_SUPERIOR: "Esquerda superior",
  DIREITA_SUPERIOR: "Direita superior",
  ESQUERDA_INFERIOR: "Esquerda inferior",
  DIREITA_INFERIOR: "Direita inferior",
};

export const POPUP_FREQUENCY_LABEL: Record<PopupFrequency, string> = {
  SEM_LIMITE: "Sem limite",
  UMA_VEZ_POR_SESSAO: "Uma vez por sessão",
  UMA_VEZ_A_CADA_HORA: "Uma vez a cada hora",
  UMA_VEZ_A_CADA_6_HORAS: "Uma vez a cada 6 horas",
  UMA_VEZ_A_CADA_24_HORAS: "Uma vez a cada 24 horas",
};

export const POPUP_LAYOUT_LABEL: Record<PopupLayout, string> = {
  SEM_PLANO_DE_FUNDO: "Sem plano de fundo",
  PLANO_DE_FUNDO: "Plano de fundo",
  IMAGEM_ESQUERDA: "Imagem à esquerda",
  IMAGEM_DIREITA: "Imagem à direita",
  IMAGEM_TOPO: "Imagem no topo",
  IMAGEM_EMBAIXO: "Imagem embaixo",
  DUAS_COLUNAS: "Duas colunas",
};

export const DEFAULT_CONTENT_CONFIG: PopupContentConfig = {
  titulo: "Entre para nossa lista",
  subtitulo: "Receba novidades, cursos e oportunidades da Advance+.",
  botaoTexto: "Cadastrar",
  textoLegal: "Concordo em receber comunicações da Advance+.",
  blockOrder: [
    "TITLE",
    "DESCRIPTION",
    "IMAGE",
    "FIELDS",
    "BUTTON",
    "LEGAL_TEXT",
  ],
  columnAssignments: {
    IMAGE: "LEFT",
    TITLE: "RIGHT",
    DESCRIPTION: "RIGHT",
    FIELDS: "RIGHT",
    BUTTON: "RIGHT",
    LEGAL_TEXT: "RIGHT",
  },
};

export const POPUP_CONTENT_BLOCK_LABEL: Record<PopupContentBlockType, string> =
  {
    TITLE: "Titulo",
    DESCRIPTION: "Descricao",
    IMAGE: "Imagem",
    FIELDS: "Campos",
    BUTTON: "Botao",
    LEGAL_TEXT: "Texto legal",
  };

export const DEFAULT_FORM_FIELDS: PopupFormField[] = [
  {
    id: "email",
    type: "email",
    label: "Email",
    placeholder: "seuemail@exemplo.com",
    required: true,
    order: 0,
  },
  {
    id: "nome",
    type: "text",
    label: "Nome",
    placeholder: "Seu nome",
    required: false,
    order: 1,
  },
];

export const DEFAULT_DESIGN_CONFIG: PopupDesignConfig = {
  backgroundColor: "#ffffff",
  layout: "IMAGEM_ESQUERDA",
  imageUrl: "/images/marketing/popups/newsletter.svg",
  imageAlt: "Preview do popup",
  imageDisposition: "PREENCHER",
  imagePosition: "CENTRO",
  imageProportion: "50",
  showImageOnMobile: true,
};

export const DEFAULT_SUBSCRIPTION_CONFIG: PopupSubscriptionConfig = {
  email: "DESCADASTRADOS_E_DESCONHECIDOS",
  whatsapp: "QUALQUER_UM",
};

export const DEFAULT_PAGE_RULES: PopupPageRules = {
  mode: "ALL_PAGES",
  urlContains: "",
  htmlSelector: "",
  pageKey: null,
};

type PopupTemplateDefinition = {
  slug: string;
  name: string;
  goal: string;
  imageUrl: string | null;
  payload?: Partial<CreatePopupPayload>;
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
  reverse = false,
): PopupBuilderRootNode {
  return {
    id: "root_builder",
    kind: "ROOT",
    structure,
    reverse,
    areas,
  };
}

function mergeTemplateVisualFields(
  node: PopupBuilderAtomicNode,
  templateNode: PopupBuilderAtomicNode | undefined,
): PopupBuilderAtomicNode {
  if (!templateNode) return node;

  return {
    ...node,
    className: node.className ?? templateNode.className ?? null,
    textColor: node.textColor ?? templateNode.textColor ?? null,
    headingLevel: node.headingLevel ?? templateNode.headingLevel ?? null,
  };
}

function applyTemplateVisualFallbackToRoot(
  root: PopupBuilderRootNode,
  templateRoot: PopupBuilderRootNode,
): PopupBuilderRootNode {
  const templateNodesById = new Map(
    templateRoot.areas.flatMap((area) =>
      area.children.map((node) => [node.id, node] as const),
    ),
  );
  const templateNodesByType = new Map<
    PopupBuilderAtomicNode["type"],
    PopupBuilderAtomicNode[]
  >();

  for (const node of templateRoot.areas.flatMap((area) => area.children)) {
    const nodes = templateNodesByType.get(node.type) ?? [];
    nodes.push(node);
    templateNodesByType.set(node.type, nodes);
  }

  const typeUsage = new Map<PopupBuilderAtomicNode["type"], number>();

  return {
    ...root,
    areas: root.areas.map((area) => ({
      ...area,
      children: area.children.map((node) => {
        const templateNodeById = templateNodesById.get(node.id);
        if (templateNodeById) {
          return mergeTemplateVisualFields(node, templateNodeById);
        }

        const usageIndex = typeUsage.get(node.type) ?? 0;
        typeUsage.set(node.type, usageIndex + 1);
        const templateNodeByType = templateNodesByType.get(node.type)?.[
          usageIndex
        ];
        return mergeTemplateVisualFields(node, templateNodeByType);
      }),
    })),
  };
}

function createTitle(
  id: string,
  content: string,
  className?: string,
  textColor?: string,
): PopupBuilderAtomicNode {
  return { id, kind: "ATOMIC", type: "TITLE", content, className, textColor };
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
  url: string | null,
  alt: string,
  className?: string,
): PopupBuilderAtomicNode {
  return { id, kind: "ATOMIC", type: "IMAGE", url, alt, className };
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

function createConsent(
  id: string,
  content: string,
  consentCheckbox = false,
  className?: string,
): PopupBuilderAtomicNode {
  return {
    id,
    kind: "ATOMIC",
    type: "CONSENT",
    content,
    consentCheckbox,
    className,
  };
}

function createInput(
  id: string,
  inputKind: PopupBuilderInputKind,
  label: string,
  placeholder: string,
  required = false,
  className?: string,
): PopupBuilderAtomicNode {
  return {
    id,
    kind: "ATOMIC",
    type: "INPUT",
    inputKind,
    label,
    placeholder,
    required,
    className,
  };
}

function createVideo(id: string, url: string): PopupBuilderAtomicNode {
  return { id, kind: "ATOMIC", type: "VIDEO", url };
}

function createTimer(
  id: string,
  content: string,
  timerDurationSeconds: number,
): PopupBuilderAtomicNode {
  return {
    id,
    kind: "ATOMIC",
    type: "TIMER",
    content,
    timerDurationSeconds,
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

function createRoulette(id: string): PopupBuilderAtomicNode {
  return {
    id,
    kind: "ATOMIC",
    type: "ROULETTE",
    content: "Gire para tentar liberar seu benefício",
    rouletteScope: null,
    rouletteCouponIds: [],
    rouletteItems: [
      {
        id: "roulette_item_prize",
        label: "Prêmio",
        weight: 50,
        couponId: null,
        couponCode: null,
        color: "#1d4ed8",
      },
      {
        id: "roulette_item_retry",
        label: "Tente novamente",
        weight: 30,
        isNoPrize: true,
        color: "#0f766e",
      },
      {
        id: "roulette_item_bonus",
        label: "Bônus",
        weight: 20,
        couponId: null,
        couponCode: null,
        color: "#7c3aed",
      },
    ],
    rouletteNoPrizeTitle: "Quase lá!",
    rouletteNoPrizeMessage:
      "Não foi dessa vez. Se quiser, deixe seu contato para receber a próxima chance.",
    rouletteNoPrizeButtonText: "Receber próxima chance",
    rouletteNoPrizeContactFields: ["EMAIL", "NAME"],
  };
}

function createBuilderTemplate(
  slug: string,
  name: string,
  goal: string,
  imageUrl: string | null,
  payload: Partial<CreatePopupPayload>,
): PopupTemplateDefinition {
  return {
    slug,
    name,
    goal,
    imageUrl,
    payload,
  };
}

const marketingConsent =
  "Concordo em receber conteúdos, novidades e oportunidades da Advance+.";

export const POPUP_TEMPLATES: readonly PopupTemplateDefinition[] = [
  {
    slug: "blank",
    name: "Começar do zero",
    goal: "Canvas livre para montar do seu jeito",
    imageUrl: null,
    payload: {
      contentConfig: {
        ...DEFAULT_CONTENT_CONFIG,
        titulo: "Novo pop-up",
        subtitulo: "Personalize a mensagem para sua campanha.",
        builderTree: createRoot("SINGLE", [
          createArea("area_main", [
            createTitle("title_primary", "Novo pop-up"),
            createParagraph(
              "paragraph_primary",
              "Personalize a mensagem para sua campanha.",
            ),
            createButton("button_primary", "Cadastrar"),
          ]),
        ]),
      },
      designConfig: {
        ...DEFAULT_DESIGN_CONFIG,
        imageUrl: null,
        layout: "SEM_PLANO_DE_FUNDO" as PopupLayout,
      },
      formFields: [],
    },
  },
  createBuilderTemplate(
    "newsletter-oportunidades",
    "Newsletter de oportunidades",
    "Captação contínua para novidades e lançamentos",
    "/images/marketing/popups/oportunidades.png",
    {
      contentConfig: {
        ...DEFAULT_CONTENT_CONFIG,
        titulo: "Receba oportunidades personalizadas",
        subtitulo:
          "Cadastre seu e-mail para acompanhar vagas, cursos e novidades alinhadas ao seu perfil.",
        botaoTexto: "Acessar oportunidades",
        textoLegal:
          "Ao informar meus dados, concordo com a Política de Privacidade.",
        builderTree: createRoot("SINGLE", [
          createArea("area_main", [
            createTitle(
              "title_primary",
              "Receba oportunidades personalizadas",
              "mx-auto max-w-[11ch] text-[2.7rem]! leading-[1.04]! tracking-0! md:text-[3.2rem]!",
              "#FFFFFF",
            ),
            createParagraph(
              "paragraph_primary",
              "Cadastre seu e-mail para acompanhar vagas, cursos e novidades alinhadas ao seu perfil.",
              "mx-auto max-w-[34rem] text-[18px]! leading-8!",
              "#F8FAFC",
            ),
            createInput(
              "email_primary",
              "EMAIL",
              "Email corporativo",
              "Email corporativo",
              true,
              "[&_[data-slot=input]]:h-14! [&_[data-slot=input]]:rounded-full! [&_[data-slot=input]]:border-0! [&_[data-slot=input]]:border-transparent! [&_[data-slot=input]]:bg-white! [&_[data-slot=input]]:px-5! [&_[data-slot=input]]:text-[15px]! [&_[data-slot=input]]:font-medium! [&_[data-slot=input]]:text-slate-700! [&_[data-slot=input]]:placeholder:text-slate-500! [&_[data-slot=input]]:shadow-none! [&_[data-slot=input]]:outline-none! [&_[data-slot=input]]:ring-0! [&_[data-slot=input]]:focus-visible:ring-0! [&_[data-slot=input]]:focus-visible:border-transparent! [&_[data-slot=input]]:focus:border-transparent!",
            ),
            createConsent(
              "consent_primary",
              "Ao informar meus dados, concordo com a Política de Privacidade.",
              false,
              "text-left! text-white/88! text-[11px]! font-medium! leading-5!",
            ),
            createButton(
              "button_primary",
              "Acessar oportunidades",
              "h-14! rounded-full! border-0! border-transparent! outline-none! ring-0! focus-visible:ring-0! focus-visible:border-transparent! shadow-none! bg-[#2FD48F]! text-[17px]! font-semibold! text-white! hover:bg-[#28C683]!",
            ),
          ]),
        ]),
      },
      formFields: [
        {
          id: "email_primary",
          type: "email",
          label: "Email corporativo",
          placeholder: "Email corporativo",
          required: true,
          order: 0,
        },
      ],
      designConfig: {
        ...DEFAULT_DESIGN_CONFIG,
        backgroundColor: "#6937E8",
        imageUrl: null,
        imageAlt: null,
        layout: "SEM_PLANO_DE_FUNDO" as PopupLayout,
      },
    },
  ),
  createBuilderTemplate(
    "inscricao-flash",
    "Cadastre-se e ganhe 10% off",
    "Captação rápida com incentivo direto de desconto",
    "/images/marketing/popups/10off.png",
    {
      contentConfig: {
        ...DEFAULT_CONTENT_CONFIG,
        titulo: "Cadastre-se e ganhe 10% off",
        subtitulo:
          "Deixe seu nome e e-mail para liberar seu desconto e receber oportunidades da Advance+.",
        botaoTexto: "Quero meu desconto",
        textoLegal:
          "Oferta válida para novos cadastros, conforme disponibilidade.",
        builderTree: createRoot("ROW_2", [
          createArea("area_left", [
            createImage(
              "image_primary",
              "/images/marketing/popups/banner_pop.png",
              "Ilustração de desconto promocional",
            ),
          ]),
          createArea("area_right", [
            createTitle("title_primary", "Cadastre-se e ganhe 10% off"),
            createParagraph(
              "paragraph_primary",
              "Deixe seu nome e e-mail para liberar seu desconto e receber oportunidades da Advance+.",
            ),
            createInput("name_primary", "NAME", "Nome", "Seu nome", true),
            createInput(
              "email_primary",
              "EMAIL",
              "Email corporativo",
              "seuemail@exemplo.com",
              true,
            ),
            createButton("button_primary", "Quero meu desconto"),
            createConsent(
              "consent_primary",
              "Ao informar meus dados, concordo com a Política de Privacidade.",
            ),
          ]),
        ]),
      },
      designConfig: {
        ...DEFAULT_DESIGN_CONFIG,
        backgroundColor: "#ffffff",
        imageUrl: "/images/marketing/popups/banner_pop.png",
        imageDisposition: "CENTRALIZAR",
        imagePosition: "TOPO",
        layout: "IMAGEM_ESQUERDA" as PopupLayout,
      },
    },
  ),
  createBuilderTemplate(
    "guia-curriculo",
    "Promo black friday",
    "Campanha promocional com foco em conversão imediata",
    "/images/marketing/popups/blackbanner.png",
    {
      contentConfig: {
        ...DEFAULT_CONTENT_CONFIG,
        titulo: "",
        subtitulo: "",
        botaoTexto: "Aproveitar agora",
        textoLegal: null,
        blockOrder: ["IMAGE", "FIELDS", "BUTTON"],
        builderTree: createRoot("SINGLE", [
          createArea("area_main", [
            createImage(
              "image_primary",
              "/images/marketing/popups/black_friday.png",
              "Banner da promoção black friday",
            ),
            createInput(
              "name_primary",
              "NAME",
              "Nome",
              "Seu nome",
              true,
              "[&_[data-slot=input]]:h-13! [&_[data-slot=input]]:rounded-2xl! [&_[data-slot=input]]:border-slate-200/90! [&_[data-slot=input]]:bg-white! [&_[data-slot=input]]:px-4!",
            ),
            createInput(
              "email_primary",
              "EMAIL",
              "Email",
              "seuemail@exemplo.com",
              true,
              "[&_[data-slot=input]]:h-13! [&_[data-slot=input]]:rounded-2xl! [&_[data-slot=input]]:border-slate-200/90! [&_[data-slot=input]]:bg-white! [&_[data-slot=input]]:px-4!",
            ),
            createButton(
              "button_primary",
              "Aproveitar agora",
              "min-h-[3.6rem]! rounded-xl! border-0! shadow-none!",
              "#DC2626",
              "#FFFFFF",
            ),
          ]),
        ]),
      },
      formFields: [
        {
          id: "name_primary",
          type: "text",
          label: "Nome",
          placeholder: "Seu nome",
          required: true,
          order: 0,
        },
        {
          id: "email_primary",
          type: "email",
          label: "Email",
          placeholder: "seuemail@exemplo.com",
          required: true,
          order: 1,
        },
      ],
      designConfig: {
        ...DEFAULT_DESIGN_CONFIG,
        backgroundColor: "#ffffff",
        imageUrl: "/images/marketing/popups/black_friday.png",
        imageDisposition: "CENTRALIZAR",
        imagePosition: "TOPO",
        layout: "SEM_PLANO_DE_FUNDO" as PopupLayout,
      },
    },
  ),
  createBuilderTemplate(
    "cupom-boas-vindas",
    "Cupom de boas-vindas",
    "Captação com benefício imediato e visual de cupom",
    "/images/marketing/popups/boasvindas_capa.png",
    {
      contentConfig: {
        ...DEFAULT_CONTENT_CONFIG,
        titulo: "",
        subtitulo: "",
        botaoTexto: "Aproveitar agora",
        textoLegal: null,
        blockOrder: ["IMAGE", "FIELDS", "BUTTON"],
        builderTree: createRoot("SINGLE", [
          createArea("area_main", [
            createImage(
              "image_primary",
              "/images/marketing/popups/boasvindas.png",
              "Banner de boas-vindas com oferta de 10% off",
            ),
            createInput(
              "email_primary",
              "EMAIL",
              "Email",
              "seuemail@exemplo.com",
              true,
              "[&_[data-slot=input]]:h-13! [&_[data-slot=input]]:rounded-2xl! [&_[data-slot=input]]:border-slate-200/90! [&_[data-slot=input]]:bg-white! [&_[data-slot=input]]:px-4!",
            ),
            createButton(
              "button_primary",
              "Aproveitar agora",
              "min-h-[3.6rem]! rounded-xl! border-0! shadow-none!",
              "#DC2626",
              "#FFFFFF",
            ),
          ]),
        ]),
      },
      formFields: [
        {
          id: "email_primary",
          type: "email",
          label: "Email",
          placeholder: "seuemail@exemplo.com",
          required: true,
          order: 0,
        },
      ],
      designConfig: {
        ...DEFAULT_DESIGN_CONFIG,
        backgroundColor: "#ffffff",
        imageUrl: "/images/marketing/popups/boasvindas.png",
        imageDisposition: "CENTRALIZAR",
        imagePosition: "TOPO",
        layout: "SEM_PLANO_DE_FUNDO" as PopupLayout,
      },
    },
  ),
  createBuilderTemplate(
    "roleta-de-cupom",
    "Roleta de cupom",
    "Gamificação para captar lead e distribuir benefício",
    "/images/marketing/popups/roleta.png",
    {
      contentConfig: {
        ...DEFAULT_CONTENT_CONFIG,
        titulo: "",
        subtitulo: "",
        botaoTexto: "",
        textoLegal: null,
        blockOrder: [],
        builderTree: createRoot("SINGLE", [
          createArea("area_main", [
            {
              ...createRoulette("roulette_primary"),
              rouletteItems: [
                {
                  id: "roulette_item_10",
                  label: "10% off",
                  weight: 18.34,
                  couponId: null,
                  couponCode: null,
                  color: "#2563EB",
                },
                {
                  id: "roulette_item_20",
                  label: "20% off",
                  weight: 18.33,
                  couponId: null,
                  couponCode: null,
                  color: "#7C3AED",
                },
                {
                  id: "roulette_item_5",
                  label: "5% off",
                  weight: 18.33,
                  couponId: null,
                  couponCode: null,
                  color: "#F97316",
                },
                {
                  id: "roulette_item_50",
                  label: "50% off",
                  weight: 5,
                  couponId: null,
                  couponCode: null,
                  color: "#DC2626",
                },
                {
                  id: "roulette_item_retry",
                  label: "Tentar novamente",
                  weight: 40,
                  isNoPrize: true,
                  color: "#0F766E",
                },
              ],
              rouletteNoPrizeTitle: "Tente novamente",
              rouletteNoPrizeMessage:
                "Dessa vez não caiu um desconto. Você pode girar novamente quando a campanha permitir.",
              rouletteNoPrizeButtonText: "Receber próxima chance",
              rouletteNoPrizeContactFields: ["EMAIL"],
            },
          ]),
        ]),
      },
      designConfig: {
        ...DEFAULT_DESIGN_CONFIG,
        backgroundColor: "#ffffff",
        imageUrl: null,
        layout: "DUAS_COLUNAS" as PopupLayout,
      },
      formFields: [],
    },
  ),
  createBuilderTemplate(
    "contador-de-urgencia",
    "Contador de urgência",
    "Oferta com timer para acelerar resposta",
    "/images/marketing/popups/contador.png",
    {
      contentConfig: {
        ...DEFAULT_CONTENT_CONFIG,
        titulo: "Sua condição especial termina em instantes",
        subtitulo:
          "Receba o link da oferta antes que o tempo acabe.",
        botaoTexto: "Quero receber",
        textoLegal: marketingConsent,
        builderTree: createRoot("SINGLE", [
          createArea("area_main", [
            createTimer("timer_primary", "Oferta por tempo limitado", 900),
            createTitle(
              "title_primary",
              "Sua condição especial termina em instantes",
              "text-center! text-[2.2rem]! leading-[1.08]! tracking-0! md:text-[2.5rem]!",
            ),
            createParagraph(
              "paragraph_primary",
              "Receba o link da oferta antes que o tempo acabe.",
              "mx-auto! max-w-[34rem]! text-center! text-[1rem]! leading-7! text-slate-500!",
            ),
            createInput(
              "email_primary",
              "EMAIL",
              "Email",
              "seuemail@exemplo.com",
              true,
              "[&_[data-slot=input]]:h-13! [&_[data-slot=input]]:rounded-2xl! [&_[data-slot=input]]:border-slate-200/90! [&_[data-slot=input]]:bg-white! [&_[data-slot=input]]:px-4!",
            ),
            createButton(
              "button_primary",
              "Quero receber",
              "min-h-[3.6rem]! rounded-2xl! border-0! shadow-none!",
              "#06286B",
              "#FFFFFF",
            ),
            createConsent(
              "consent_primary",
              marketingConsent,
              false,
              "text-center! text-sm! leading-6! text-slate-500!",
            ),
          ]),
        ]),
      },
      designConfig: {
        ...DEFAULT_DESIGN_CONFIG,
        backgroundColor: "#ffffff",
        imageUrl: null,
        layout: "SEM_PLANO_DE_FUNDO" as PopupLayout,
      },
    },
  ),
  createBuilderTemplate(
    "video-convite",
    "Convite em vídeo",
    "Mensagem mais próxima com CTA e captura em duas colunas",
    "/images/marketing/popups/ConviteEmVideo.png",
    {
      contentConfig: {
        ...DEFAULT_CONTENT_CONFIG,
        titulo: "",
        subtitulo: "",
        botaoTexto: "Quero participar",
        textoLegal: null,
        blockOrder: ["FIELDS", "BUTTON"],
        builderTree: createRoot("SINGLE", [
          createArea("area_main", [
            createVideo(
              "video_primary",
              "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            ),
            createInput(
              "email_primary",
              "EMAIL",
              "Email",
              "seuemail@exemplo.com",
              true,
              "[&_[data-slot=input]]:h-13! [&_[data-slot=input]]:rounded-2xl! [&_[data-slot=input]]:border-slate-200/90! [&_[data-slot=input]]:bg-white! [&_[data-slot=input]]:px-4!",
            ),
            createButton(
              "button_primary",
              "Quero participar",
              "min-h-[3.6rem]! rounded-2xl! border-0! shadow-none!",
              "#06286B",
              "#FFFFFF",
            ),
          ]),
        ]),
      },
      designConfig: {
        ...DEFAULT_DESIGN_CONFIG,
        backgroundColor: "#ffffff",
        imageUrl: null,
        layout: "SEM_PLANO_DE_FUNDO" as PopupLayout,
      },
      formFields: [
        {
          id: "email",
          type: "email",
          label: "Email",
          placeholder: "seuemail@exemplo.com",
          required: true,
          order: 0,
        },
      ],
    },
  ),
] as const;

export function buildDefaultPopupPayload(
  templateSlug = "newsletter-oportunidades",
): CreatePopupPayload {
  const template =
    POPUP_TEMPLATES.find((item) => item.slug === templateSlug) ??
    POPUP_TEMPLATES[1];

  return syncBuilderTreeToLegacy({
    nome: template.name,
    templateSlug: template.slug,
    status: "RASCUNHO",
    dispositivo: "AMBOS",
    escopo: "WEBSITE",
    posicaoDesktop: "CENTRO",
    posicaoMobile: "CENTRO",
    gatilho: "ATRASO",
    atrasoSegundos: 5,
    inatividadeSegundos: null,
    scrollPercentual: null,
    seletorAlvo: null,
    triggerTarget: null,
    cronograma: "EXIBIR_AGORA",
    inicioEm: null,
    fimEm: null,
    frequencia: "UMA_VEZ_A_CADA_6_HORAS",
    tag: "From PopUp",
    redirectUrl: null,
    redirectNovaAba: false,
    prioridade: 0,
    contentConfig: {
      ...DEFAULT_CONTENT_CONFIG,
      ...(template.payload?.contentConfig ?? {}),
    },
    formFields: template.payload?.formFields ?? DEFAULT_FORM_FIELDS,
    designConfig: {
      ...DEFAULT_DESIGN_CONFIG,
      ...(template.payload?.designConfig ?? {}),
    },
    subscriptionConfig: DEFAULT_SUBSCRIPTION_CONFIG,
    pageRules: DEFAULT_PAGE_RULES,
    ...template.payload,
  });
}

export function hydratePopupTemplatePresentation<
  T extends {
    templateSlug?: string | null;
    contentConfig: PopupContentConfig;
    designConfig?: PopupDesignConfig;
  },
>(popup: T): T {
  const templateSlug = popup.templateSlug?.trim();
  if (!templateSlug) return popup;

  const template = POPUP_TEMPLATES.find((item) => item.slug === templateSlug);
  const templateRoot = template?.payload?.contentConfig?.builderTree;
  const currentRoot = popup.contentConfig.builderTree;

  if (!templateRoot || !currentRoot) return popup;

  let nextRoot = applyTemplateVisualFallbackToRoot(currentRoot, templateRoot);
  let nextDesignConfig = popup.designConfig;

  if (templateSlug === "inscricao-flash") {
    nextRoot = {
      ...nextRoot,
      areas: nextRoot.areas.map((area) => ({
        ...area,
        children: area.children.map((node) => {
          if (node.type !== "IMAGE") return node;

          const shouldReplaceImage =
            !node.url || node.url === "/images/marketing/popups/desconto.svg";

          if (!shouldReplaceImage) return node;

          return {
            ...node,
            url: "/images/marketing/popups/banner_pop.png",
            alt: "Ilustração de desconto promocional",
          };
        }),
      })),
    };

    if (nextDesignConfig) {
      nextDesignConfig = {
        ...nextDesignConfig,
        backgroundColor:
          !nextDesignConfig.backgroundColor ||
          nextDesignConfig.backgroundColor === "#f8fafc"
            ? "#ffffff"
            : nextDesignConfig.backgroundColor,
        imageUrl:
          !nextDesignConfig.imageUrl ||
          nextDesignConfig.imageUrl === "/images/marketing/popups/desconto.svg"
            ? "/images/marketing/popups/banner_pop.png"
            : nextDesignConfig.imageUrl,
        imageDisposition:
          !nextDesignConfig.imageDisposition ||
          nextDesignConfig.imageDisposition === "PREENCHER" ||
          nextDesignConfig.imageDisposition === "ESTICAR"
            ? "CENTRALIZAR"
            : nextDesignConfig.imageDisposition,
        imagePosition:
          !nextDesignConfig.imagePosition ||
          nextDesignConfig.imagePosition === "CENTRO"
            ? "TOPO"
            : nextDesignConfig.imagePosition,
      };
    }

  }

  if (templateSlug === "guia-curriculo") {
    nextRoot = templateRoot;

    if (nextDesignConfig) {
      nextDesignConfig = {
        ...nextDesignConfig,
        backgroundColor: "#ffffff",
        imageUrl: "/images/marketing/popups/black_friday.png",
        imageDisposition: "CENTRALIZAR",
        imagePosition: "TOPO",
        layout: "SEM_PLANO_DE_FUNDO",
      };
    }

    return {
      ...popup,
      contentConfig: {
        ...popup.contentConfig,
        titulo: "",
        subtitulo: "",
        botaoTexto: "Aproveitar agora",
        textoLegal: null,
        blockOrder: ["IMAGE", "FIELDS", "BUTTON"],
        builderTree: nextRoot,
      },
      formFields: [
        {
          id: "name_primary",
          type: "text",
          label: "Nome",
          placeholder: "Seu nome",
          required: true,
          order: 0,
        },
        {
          id: "email_primary",
          type: "email",
          label: "Email",
          placeholder: "seuemail@exemplo.com",
          required: true,
          order: 1,
        },
      ],
      ...(nextDesignConfig ? { designConfig: nextDesignConfig } : {}),
    };
  }

  if (templateSlug === "cupom-boas-vindas") {
    nextRoot = templateRoot;

    if (nextDesignConfig) {
      nextDesignConfig = {
        ...nextDesignConfig,
        backgroundColor: "#ffffff",
        imageUrl: "/images/marketing/popups/boasvindas.png",
        imageDisposition: "CENTRALIZAR",
        imagePosition: "TOPO",
        layout: "SEM_PLANO_DE_FUNDO",
      };
    }

    return {
      ...popup,
      contentConfig: {
        ...popup.contentConfig,
        titulo: "",
        subtitulo: "",
        botaoTexto: "Aproveitar agora",
        textoLegal: null,
        blockOrder: ["IMAGE", "FIELDS", "BUTTON"],
        builderTree: nextRoot,
      },
      formFields: [
        {
          id: "email_primary",
          type: "email",
          label: "Email",
          placeholder: "seuemail@exemplo.com",
          required: true,
          order: 0,
        },
      ],
      ...(nextDesignConfig ? { designConfig: nextDesignConfig } : {}),
    };
  }

  if (templateSlug === "roleta-de-cupom") {
    nextRoot = templateRoot;

    if (nextDesignConfig) {
      nextDesignConfig = {
        ...nextDesignConfig,
        backgroundColor: "#ffffff",
        imageUrl: null,
        layout: "SEM_PLANO_DE_FUNDO",
      };
    }

    return {
      ...popup,
      contentConfig: {
        ...popup.contentConfig,
        titulo: "",
        subtitulo: "",
        botaoTexto: "",
        textoLegal: null,
        blockOrder: [],
        builderTree: nextRoot,
      },
      formFields: [],
      ...(nextDesignConfig ? { designConfig: nextDesignConfig } : {}),
    };
  }

  if (templateSlug === "contador-de-urgencia") {
    nextRoot = templateRoot;

    if (nextDesignConfig) {
      nextDesignConfig = {
        ...nextDesignConfig,
        backgroundColor: "#ffffff",
        imageUrl: null,
        layout: "SEM_PLANO_DE_FUNDO",
      };
    }

    return {
      ...popup,
      contentConfig: {
        ...popup.contentConfig,
        titulo: "Sua condição especial termina em instantes",
        subtitulo: "Receba o link da oferta antes que o tempo acabe.",
        botaoTexto: "Quero receber",
        textoLegal: marketingConsent,
        builderTree: nextRoot,
      },
      ...(nextDesignConfig ? { designConfig: nextDesignConfig } : {}),
    };
  }

  if (templateSlug === "video-convite") {
    nextRoot = templateRoot;

    if (nextDesignConfig) {
      nextDesignConfig = {
        ...nextDesignConfig,
        backgroundColor: "#ffffff",
        imageUrl: null,
        layout: "SEM_PLANO_DE_FUNDO",
      };
    }

    return {
      ...popup,
      contentConfig: {
        ...popup.contentConfig,
        titulo: "",
        subtitulo: "",
        botaoTexto: "Quero participar",
        textoLegal: null,
        blockOrder: ["FIELDS", "BUTTON"],
        builderTree: nextRoot,
      },
      formFields: [
        {
          id: "email",
          type: "email",
          label: "Email",
          placeholder: "seuemail@exemplo.com",
          required: true,
          order: 0,
        },
      ],
      ...(nextDesignConfig ? { designConfig: nextDesignConfig } : {}),
    };
  }

  return {
    ...popup,
    contentConfig: {
      ...popup.contentConfig,
      builderTree: nextRoot,
    },
    ...(nextDesignConfig ? { designConfig: nextDesignConfig } : {}),
  };
}
