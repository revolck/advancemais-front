"use client";

import type {
  CreatePopupPayload,
  PopupBuilderAreaNode,
  PopupBuilderAtomicNode,
  PopupBuilderAtomicType,
  PopupBuilderCouponTone,
  PopupBuilderCouponVariant,
  PopupBuilderInputKind,
  PopupBuilderRootNode,
  PopupBuilderSocialLink,
  PopupBuilderStructure,
  PopupContentBlockType,
  PopupContentConfig,
  PopupDesignConfig,
  PopupFormField,
} from "@/api/websites/components/popups";

type PopupBuilderAxis = "ROW" | "COLUMN";

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function createStableId(prefix: string, suffix: string) {
  return `${prefix}_${suffix}`;
}

function normalizeContentConfig(
  value?: Partial<PopupContentConfig> | null,
): PopupContentConfig {
  return {
    titulo: "",
    subtitulo: "",
    botaoTexto: "",
    textoLegal: null,
    blockOrder: [],
    columnAssignments: {},
    builderTree: null,
    ...(value ?? {}),
  };
}

function normalizeDesignConfig(
  value?: Partial<PopupDesignConfig> | null,
): PopupDesignConfig {
  return {
    backgroundColor: "#ffffff",
    layout: "SEM_PLANO_DE_FUNDO",
    imageUrl: null,
    imageAlt: null,
    imageDisposition: "CENTRALIZAR",
    imagePosition: "CENTRO",
    imageProportion: "50",
    showImageOnMobile: true,
    ...(value ?? {}),
  };
}

function normalizeFormFields(value?: PopupFormField[] | null): PopupFormField[] {
  return Array.isArray(value) ? value : [];
}

function getInputDefaults(kind: PopupBuilderInputKind) {
  if (kind === "EMAIL") {
    return {
      label: "Email",
      placeholder: "seuemail@exemplo.com",
      required: true,
    };
  }

  if (kind === "PHONE") {
    return {
      label: "Telefone",
      placeholder: "(00) 00000-0000",
      required: false,
    };
  }

  return {
    label: "Nome",
    placeholder: "Seu nome",
    required: false,
  };
}

function stripHtmlToText(value?: string | null) {
  if (!value) return "";

  if (typeof window !== "undefined") {
    const doc = new DOMParser().parseFromString(value, "text/html");
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  }

  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function getDefaultSocialLinks(): PopupBuilderSocialLink[] {
  return [
    { id: createId("social_facebook"), platform: "FACEBOOK", url: null },
    { id: createId("social_instagram"), platform: "INSTAGRAM", url: null },
    { id: createId("social_whatsapp"), platform: "WHATSAPP", url: null },
    { id: createId("social_linkedin"), platform: "LINKEDIN", url: null },
    { id: createId("social_youtube"), platform: "YOUTUBE", url: null },
  ];
}

export function normalizeCouponVariant(value?: string | null): PopupBuilderCouponVariant {
  if (value === "OMEGA" || value === "SIGMA" || value === "DELTA") {
    return value;
  }

  return "ALPHA";
}

export function normalizeCouponTone(
  tone?: string | null,
  legacyVariant?: string | null,
): PopupBuilderCouponTone {
  if (
    tone === "PRIMARY" ||
    tone === "SECONDARY" ||
    tone === "LIGHT" ||
    tone === "DARK"
  ) {
    return tone;
  }

  if (legacyVariant === "SECONDARY") return "SECONDARY";
  if (legacyVariant === "PRIMARY") return "PRIMARY";
  return "PRIMARY";
}

function getCouponDefaults(tone: PopupBuilderCouponTone = "PRIMARY") {
  return {
    caption: "Oferta exclusiva",
    value: tone === "SECONDARY" ? "20% OFF" : "R$100,00",
    code: tone === "SECONDARY" ? "ADVANCE20" : "ADVANCE100",
    validity: "Válido até 30/06/2026",
  };
}

export function createAtomicNode(
  type: PopupBuilderAtomicType,
): PopupBuilderAtomicNode {
  if (type === "TITLE") {
    return {
      id: createId("title"),
      kind: "ATOMIC",
      type,
      content: "Novo título",
      headingLevel: "h2",
      textColor: "#0F172A",
    };
  }

  if (type === "PARAGRAPH") {
    return {
      id: createId("paragraph"),
      kind: "ATOMIC",
      type,
      content: "Descreva a proposta do pop-up.",
      textColor: "#64748B",
    };
  }

  if (type === "IMAGE") {
    return {
      id: createId("image"),
      kind: "ATOMIC",
      type,
      url: null,
      alt: "Imagem do pop-up",
    };
  }

  if (type === "BUTTON") {
    return {
      id: createId("button"),
      kind: "ATOMIC",
      type,
      content: "Cadastrar",
      textColor: "#FFFFFF",
      buttonBackgroundColor: "#06286B",
    };
  }

  if (type === "CONSENT") {
    return {
      id: createId("consent"),
      kind: "ATOMIC",
      type,
      content: "Concordo em receber comunicações da Advance+.",
      consentCheckbox: false,
    };
  }

  if (type === "VIDEO") {
    return {
      id: createId("video"),
      kind: "ATOMIC",
      type,
      url: null,
    };
  }

  if (type === "TIMER") {
    return {
      id: createId("timer"),
      kind: "ATOMIC",
      type,
      content: "Oferta expira em",
      timerDurationSeconds: 10,
    };
  }

  if (type === "ROULETTE") {
    return {
      id: createId("roulette"),
      kind: "ATOMIC",
      type,
      content: "Gire e descubra seu prêmio",
      rouletteScope: null,
      rouletteCouponIds: [],
      rouletteItems: [],
      rouletteNoPrizeTitle: "Quase lá!",
      rouletteNoPrizeMessage:
        "Ops... não foi dessa vez. Se quiser, deixe seu contato para receber a próxima oportunidade.",
      rouletteNoPrizeButtonText: "Enviar contato",
      rouletteNoPrizeContactFields: [],
    };
  }

  if (type === "COUPON") {
    const defaults = getCouponDefaults();
    return {
      id: createId("coupon"),
      kind: "ATOMIC",
      type,
      couponScope: null,
      couponId: null,
      couponCaption: defaults.caption,
      couponValue: defaults.value,
      couponCode: defaults.code,
      couponValidity: defaults.validity,
      couponVariant: "ALPHA",
      couponTone: "PRIMARY",
    };
  }

  if (type === "SOCIAL_LINKS") {
    return {
      id: createId("social_links"),
      kind: "ATOMIC",
      type,
      socialLinks: getDefaultSocialLinks(),
      socialIconSize: "MD",
      socialIconShape: "CIRCLE",
      socialTheme: "COLOR",
      socialGap: 12,
      socialAlign: "CENTER",
      socialWidthPercent: 100,
    };
  }

  const defaults = getInputDefaults("NAME");
  return {
    id: createId("input"),
    kind: "ATOMIC",
    type: "INPUT",
    inputKind: "NAME",
    label: defaults.label,
    placeholder: defaults.placeholder,
    required: defaults.required,
  };
}

function createArea(children: PopupBuilderAtomicNode[] = []): PopupBuilderAreaNode {
  return {
    id: createId("area"),
    kind: "AREA",
    children,
  };
}

export function getStructureAxis(structure: PopupBuilderStructure): PopupBuilderAxis {
  if (structure.startsWith("COLUMN")) return "COLUMN";
  return "ROW";
}

export function getStructureAreaCount(structure: PopupBuilderStructure) {
  if (structure === "SINGLE") return 1;
  if (structure === "ROW_2" || structure === "COLUMN_2") return 2;
  return 3;
}

export function buildStructureFromAxisAndCount(
  axis: PopupBuilderAxis,
  count: number,
): PopupBuilderStructure {
  if (axis === "COLUMN") {
    if (count <= 1) return "SINGLE";
    return count >= 3 ? "COLUMN_3" : "COLUMN_2";
  }

  if (count <= 1) return "SINGLE";
  if (count === 2) return "ROW_2";
  return "ROW_3";
}

export function createBuilderRoot(
  structure: PopupBuilderStructure = "SINGLE",
  areas?: PopupBuilderAreaNode[],
): PopupBuilderRootNode {
  if (areas?.length) {
    return {
      id: createId("root"),
      kind: "ROOT",
      structure,
      reverse: false,
      areas,
    };
  }

  return {
    id: createId("root"),
    kind: "ROOT",
    structure,
    reverse: false,
    areas:
      structure === "SINGLE"
        ? [createArea()]
        : [createArea(), createArea()],
  };
}

export function normalizeBuilderRoot(
  root: PopupBuilderRootNode | null | undefined,
): PopupBuilderRootNode {
  if (!root) return createBuilderRoot();

  const areaCount = getStructureAreaCount(root.structure);
  const areas = [...root.areas];

  if (areas.length === 0) {
    areas.push(createArea());
  }

  while (areas.length < areaCount) {
    areas.push(createArea());
  }

  if (areaCount === 1 && areas.length > 1) {
    const [first, ...rest] = areas;
    first.children = [...first.children, ...rest.flatMap((area) => area.children)];
    return {
      ...root,
      reverse: false,
      areas: [first],
    };
  }

  return {
    ...root,
    reverse: root.reverse ?? false,
    areas: areas.slice(0, areaCount),
  };
}

function mapFieldToInputNode(field: PopupFormField): PopupBuilderAtomicNode {
  const inputKind: PopupBuilderInputKind =
    field.type === "email"
      ? "EMAIL"
      : field.type === "tel" || field.type === "whatsapp"
        ? "PHONE"
        : "NAME";

  return {
    id: field.id || createId("input"),
    kind: "ATOMIC",
    type: "INPUT",
    inputKind,
    label: field.label,
    placeholder: field.placeholder ?? getInputDefaults(inputKind).placeholder,
    required: field.required,
  };
}

export function buildBuilderTreeFromPayload(
  payload: Pick<CreatePopupPayload, "contentConfig" | "formFields" | "designConfig">,
): PopupBuilderRootNode {
  const contentConfig = normalizeContentConfig(payload.contentConfig);
  const designConfig = normalizeDesignConfig(payload.designConfig);
  const formFields = normalizeFormFields(payload.formFields);

  if (contentConfig.builderTree) {
    return normalizeBuilderRoot(contentConfig.builderTree);
  }

  const children: PopupBuilderAtomicNode[] = [];

  if (contentConfig.titulo?.trim()) {
    children.push({
      id: createStableId("title", "primary"),
      kind: "ATOMIC",
      type: "TITLE",
      content: contentConfig.titulo,
    });
  }

  if (contentConfig.subtitulo?.trim()) {
    children.push({
      id: createStableId("paragraph", "primary"),
      kind: "ATOMIC",
      type: "PARAGRAPH",
      content: contentConfig.subtitulo,
    });
  }

  formFields
    .slice()
    .sort((a, b) => a.order - b.order)
    .forEach((field) => {
      children.push(mapFieldToInputNode(field));
    });

  if (contentConfig.botaoTexto?.trim()) {
    children.push({
      id: createStableId("button", "primary"),
      kind: "ATOMIC",
      type: "BUTTON",
      content: contentConfig.botaoTexto,
    });
  }

  if (contentConfig.textoLegal?.trim()) {
    children.push({
      id: createStableId("consent", "primary"),
      kind: "ATOMIC",
      type: "CONSENT",
      content: contentConfig.textoLegal,
    });
  }

  const imageNode = designConfig.imageUrl
    ? {
        id: createStableId("image", "primary"),
        kind: "ATOMIC" as const,
        type: "IMAGE" as const,
        url: designConfig.imageUrl,
        alt: designConfig.imageAlt ?? "Imagem do pop-up",
      }
    : null;

  if (
    designConfig.layout === "IMAGEM_ESQUERDA" ||
    designConfig.layout === "IMAGEM_DIREITA"
  ) {
    const leftArea = createArea(
      designConfig.layout === "IMAGEM_ESQUERDA" && imageNode
        ? [imageNode]
        : [],
    );
    leftArea.id = createStableId("area", "left");
    const rightArea = createArea(
      designConfig.layout === "IMAGEM_DIREITA" && imageNode
        ? [imageNode]
        : children,
    );
    rightArea.id = createStableId("area", "right");

    if (designConfig.layout === "IMAGEM_ESQUERDA") {
      rightArea.children = children;
    } else if (imageNode) {
      leftArea.children = children;
    }

    const root = createBuilderRoot("ROW_2", [leftArea, rightArea]);
    root.id = createStableId("root", "builder");
    root.reverse = designConfig.layout === "IMAGEM_DIREITA";
    return root;
  }

  if (imageNode) {
    children.unshift(imageNode);
  }

  const area = createArea(children);
  area.id = createStableId("area", "main");
  const root = createBuilderRoot("SINGLE", [area]);
  root.id = createStableId("root", "builder");
  return root;
}

export function updateBuilderRoot(
  payload: CreatePopupPayload,
  root: PopupBuilderRootNode,
): CreatePopupPayload {
  return {
    ...payload,
    contentConfig: {
      ...payload.contentConfig,
      builderTree: normalizeBuilderRoot(root),
    },
  };
}

export function setBuilderStructure(
  root: PopupBuilderRootNode,
  structure: PopupBuilderStructure,
): PopupBuilderRootNode {
  const normalized = normalizeBuilderRoot(root);
  const areaCount = getStructureAreaCount(structure);

  if (areaCount === 1) {
    const mergedChildren = normalized.areas.flatMap((area) => area.children);
    return {
      ...normalized,
      structure,
      reverse: false,
      areas: [createArea(mergedChildren)],
    };
  }

  const nextAreas = [...normalized.areas];
  while (nextAreas.length < areaCount) {
    nextAreas.push(createArea());
  }

  return {
    ...normalized,
    structure,
    reverse: normalized.reverse ?? false,
    areas: nextAreas.slice(0, areaCount),
  };
}

export function findAreaForNode(root: PopupBuilderRootNode, nodeId: string) {
  return root.areas.find(
    (area) => area.id === nodeId || area.children.some((node) => node.id === nodeId),
  );
}

export function findAtomicNode(root: PopupBuilderRootNode, nodeId: string) {
  for (const area of root.areas) {
    const node = area.children.find((child) => child.id === nodeId);
    if (node) return node;
  }
  return null;
}

export function addNodeToArea(
  root: PopupBuilderRootNode,
  areaId: string,
  node: PopupBuilderAtomicNode,
  index?: number,
): PopupBuilderRootNode {
  return {
    ...root,
    areas: root.areas.map((area) => {
      if (area.id !== areaId) return area;
      const nextChildren = [...area.children];
      const insertAt =
        typeof index === "number"
          ? Math.max(0, Math.min(index, nextChildren.length))
          : nextChildren.length;
      nextChildren.splice(insertAt, 0, node);
      return {
        ...area,
        children: nextChildren,
      };
    }),
  };
}

export function moveNodeBetweenAreas(
  root: PopupBuilderRootNode,
  nodeId: string,
  targetAreaId: string,
  targetIndex?: number,
): PopupBuilderRootNode {
  const sourceArea = findAreaForNode(root, nodeId);
  if (!sourceArea) return root;

  const movingNode = sourceArea.children.find((node) => node.id === nodeId);
  if (!movingNode) return root;

  let nextRoot: PopupBuilderRootNode = {
    ...root,
    areas: root.areas.map((area) =>
      area.id === sourceArea.id
        ? {
            ...area,
            children: area.children.filter((node) => node.id !== nodeId),
          }
        : area,
    ),
  };

  nextRoot = addNodeToArea(nextRoot, targetAreaId, movingNode, targetIndex);
  return nextRoot;
}

export function removeNodeFromBuilder(
  root: PopupBuilderRootNode,
  nodeId: string,
): PopupBuilderRootNode {
  return {
    ...root,
    areas: root.areas.map((area) => ({
      ...area,
      children: area.children.filter((node) => node.id !== nodeId),
    })),
  };
}

export function updateAtomicNode(
  root: PopupBuilderRootNode,
  nodeId: string,
  patch: Partial<PopupBuilderAtomicNode>,
): PopupBuilderRootNode {
  return {
    ...root,
    areas: root.areas.map((area) => ({
      ...area,
      children: area.children.map((node) =>
        node.id === nodeId ? { ...node, ...patch } : node,
      ),
    })),
  };
}

export function resolvePreferredAreaId(
  root: PopupBuilderRootNode,
  selectedNodeId: string | null,
) {
  if (selectedNodeId) {
    const area = findAreaForNode(root, selectedNodeId);
    if (area) return area.id;
  }

  return root.areas[0]?.id ?? null;
}

function inputKindToLegacyFieldType(kind: PopupBuilderInputKind): PopupFormField["type"] {
  if (kind === "EMAIL") return "email";
  if (kind === "PHONE") return "tel";
  return "text";
}

export function flattenAtomicNodes(root: PopupBuilderRootNode) {
  return root.areas.flatMap((area) => area.children);
}

export function syncBuilderTreeToLegacy(payload: CreatePopupPayload): CreatePopupPayload {
  const contentConfig = normalizeContentConfig(payload.contentConfig);
  const designConfig = normalizeDesignConfig(payload.designConfig);
  const root = buildBuilderTreeFromPayload(payload);
  const nodes = flattenAtomicNodes(root);

  const titleNode = nodes.find((node) => node.type === "TITLE");
  const paragraphNode = nodes.find((node) => node.type === "PARAGRAPH");
  const buttonNode = nodes.find((node) => node.type === "BUTTON");
  const consentNode = nodes.find((node) => node.type === "CONSENT");
  const imageNode = nodes.find((node) => node.type === "IMAGE");
  const inputNodes = nodes.filter((node) => node.type === "INPUT");

  const formFields: PopupFormField[] = inputNodes.map((node, index) => ({
    id: node.id,
    type: inputKindToLegacyFieldType(node.inputKind ?? "NAME"),
    label: node.label?.trim() || getInputDefaults(node.inputKind ?? "NAME").label,
    placeholder:
      node.placeholder?.trim() ||
      getInputDefaults(node.inputKind ?? "NAME").placeholder,
    required: Boolean(node.required),
    order: index,
  }));

  const blockOrder: PopupContentBlockType[] = [];

  if (titleNode) blockOrder.push("TITLE");
  if (paragraphNode) blockOrder.push("DESCRIPTION");
  if (imageNode) blockOrder.push("IMAGE");
  if (formFields.length > 0) blockOrder.push("FIELDS");
  if (buttonNode) blockOrder.push("BUTTON");
  if (consentNode) blockOrder.push("LEGAL_TEXT");

  return {
    ...payload,
    contentConfig: {
      ...contentConfig,
      builderTree: root,
      titulo: stripHtmlToText(titleNode?.content) || contentConfig.titulo,
      subtitulo:
        stripHtmlToText(paragraphNode?.content) || contentConfig.subtitulo,
      botaoTexto: buttonNode?.content?.trim() || contentConfig.botaoTexto,
      textoLegal:
        consentNode?.content?.trim() || contentConfig.textoLegal || null,
      blockOrder,
    },
    formFields,
    designConfig: {
      ...designConfig,
      imageUrl: imageNode?.url || designConfig.imageUrl || null,
      imageAlt: imageNode?.alt || designConfig.imageAlt || null,
    },
  };
}

export function getBuilderAreaLabel(index: number) {
  return index === 0 ? "Área 1" : "Área 2";
}
