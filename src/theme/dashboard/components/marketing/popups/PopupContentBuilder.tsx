"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  ArrowDown,
  ArrowUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlertTriangle,
  BadgePlus,
  ChevronDown,
  ChevronUp,
  CirclePlay,
  Clock3,
  Disc3,
  Facebook,
  GripVertical,
  ImageIcon,
  Instagram,
  LayoutPanelTop,
  Linkedin,
  Minus,
  MousePointerSquareDashed,
  Plus,
  Rows3,
  Share2,
  SquareSplitVertical,
  TicketPercent,
  TextCursorInput,
  Trash2,
  Twitter,
  Type,
  Youtube,
} from "lucide-react";

import type {
  CreatePopupPayload,
  PopupBuilderAtomicNode,
  PopupBuilderCouponScope,
  PopupBuilderRouletteItem,
  PopupBuilderAtomicType,
  PopupBuilderInputKind,
  PopupBuilderSocialAlign,
  PopupBuilderSocialIconShape,
  PopupBuilderSocialIconSize,
  PopupBuilderSocialLink,
  PopupBuilderSocialPlatform,
  PopupBuilderSocialTheme,
  PopupBuilderStructure,
} from "@/api/websites/components/popups";
import { getCupom, listCupons } from "@/api/cupons";
import type { CupomDesconto } from "@/api/cupons/types";
import {
  ButtonCustom,
  InputCustom,
  SelectCustom,
} from "@/components/ui/custom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckboxCustom } from "@/components/ui/custom/checkbox";
import {
  RichTextarea,
  SimpleTextarea,
} from "@/components/ui/custom/text-area/components";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  buildBuilderTreeFromPayload,
  buildStructureFromAxisAndCount,
  createAtomicNode,
  getBuilderAreaLabel,
  normalizeCouponTone,
  normalizeCouponVariant,
  getStructureAreaCount,
  getStructureAxis,
  normalizeBuilderRoot,
  removeNodeFromBuilder,
  resolvePreferredAreaId,
  setBuilderStructure,
  syncBuilderTreeToLegacy,
  updateAtomicNode,
  updateBuilderRoot,
} from "./popupBuilder";

const POPUP_IMAGE_PLACEHOLDER_SRC = "/placeholders/popup-image-default.png";

const STRUCTURE_OPTIONS: Array<{
  value: "ROW" | "COLUMN";
  label: string;
  icon: typeof Rows3;
}> = [
  { value: "ROW", label: "Coluna", icon: SquareSplitVertical },
  { value: "COLUMN", label: "Linha", icon: Rows3 },
];

const ATOMIC_LIBRARY: Array<{
  type: PopupBuilderAtomicType;
  label: string;
  icon: typeof Type;
}> = [
  { type: "TITLE", label: "Título", icon: Type },
  { type: "PARAGRAPH", label: "Parágrafo", icon: AlignLeft },
  { type: "IMAGE", label: "Imagem", icon: ImageIcon },
  { type: "BUTTON", label: "Botão", icon: MousePointerSquareDashed },
  { type: "CONSENT", label: "Consentimento", icon: LayoutPanelTop },
  { type: "INPUT", label: "Input", icon: TextCursorInput },
  { type: "VIDEO", label: "Vídeo", icon: CirclePlay },
  { type: "TIMER", label: "Timer", icon: Clock3 },
  { type: "ROULETTE", label: "Roleta", icon: Disc3 },
  { type: "COUPON", label: "Cupom", icon: TicketPercent },
  { type: "SOCIAL_LINKS", label: "Redes sociais", icon: Share2 },
];

const SOCIAL_PLATFORM_OPTIONS: Array<{
  value: PopupBuilderSocialPlatform;
  label: string;
}> = [
  { value: "FACEBOOK", label: "Facebook" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "X", label: "X" },
];

const SOCIAL_ICON_SIZE_OPTIONS: Array<{
  value: PopupBuilderSocialIconSize;
  label: string;
}> = [
  { value: "SM", label: "Pequena" },
  { value: "MD", label: "Média" },
  { value: "LG", label: "Grande" },
];

const SOCIAL_ICON_SHAPE_OPTIONS: Array<{
  value: PopupBuilderSocialIconShape;
  label: string;
}> = [
  { value: "CIRCLE", label: "Redondo" },
  { value: "ROUNDED", label: "Arredondado" },
  { value: "SQUARE", label: "Quadrado" },
];

const SOCIAL_THEME_OPTIONS: Array<{
  value: PopupBuilderSocialTheme;
  label: string;
}> = [
  { value: "COLOR", label: "Colorido" },
  { value: "DARK", label: "Escuro" },
  { value: "LIGHT", label: "Claro" },
];

const SOCIAL_ALIGN_OPTIONS: Array<{
  value: PopupBuilderSocialAlign;
  label: string;
  icon: typeof AlignLeft;
}> = [
  { value: "LEFT", label: "Esquerda", icon: AlignLeft },
  { value: "CENTER", label: "Centro", icon: AlignCenter },
  { value: "RIGHT", label: "Direita", icon: AlignRight },
];

const TITLE_HEADING_OPTIONS = [
  { value: "h1", label: "H1" },
  { value: "h2", label: "H2" },
  { value: "h3", label: "H3" },
  { value: "h4", label: "H4" },
  { value: "h5", label: "H5" },
  { value: "h6", label: "H6" },
] as const;

const TEXT_COLOR_SWATCHS = [
  "#0F172A",
  "#334155",
  "#64748B",
  "#FFFFFF",
  "#2563EB",
  "#7C3AED",
  "#DC2626",
  "#059669",
] as const;

const BUTTON_BACKGROUND_SWATCHS = [
  "#06286B",
  "#0F172A",
  "#DC2626",
  "#2563EB",
  "#7C3AED",
  "#059669",
  "#F97316",
  "#FFFFFF",
] as const;

function getSocialPlatformLabel(platform: PopupBuilderSocialPlatform) {
  return (
    SOCIAL_PLATFORM_OPTIONS.find((option) => option.value === platform)
      ?.label ?? "Rede social"
  );
}

function getNextSocialPlatform(
  currentLinks: PopupBuilderSocialLink[],
): PopupBuilderSocialPlatform {
  const usedPlatforms = new Set(currentLinks.map((link) => link.platform));
  return (
    SOCIAL_PLATFORM_OPTIONS.find((option) => !usedPlatforms.has(option.value))
      ?.value ?? "FACEBOOK"
  );
}

export function AtomicDragPreview({ type }: { type: PopupBuilderAtomicType }) {
  const item = ATOMIC_LIBRARY.find((entry) => entry.type === type);
  if (!item) return null;

  const Icon = item.icon;

  return (
    <div className="flex min-h-[80px] w-[118px] flex-col items-center justify-between rounded-xl border border-[#06286B]/15 bg-white px-2.5 py-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#06286B]/12 bg-[#06286B]/6 text-[#06286B]">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mb-0! mt-2! text-center !text-xs font-medium text-slate-900">
        {item.label}
      </p>
    </div>
  );
}

function StructureCard({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: typeof Rows3;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[92px] cursor-pointer flex-col items-center justify-between rounded-xl border px-3 py-3 transition",
        active
          ? "border-[#06286B] bg-slate-50"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl border transition",
          active
            ? "border-[#06286B]/15 bg-[#06286B]/6 text-[#06286B]"
            : "border-slate-200 bg-slate-50 text-slate-500",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="mb-0! mt-2! text-center !text-xs font-medium text-slate-900">
        {label}
      </p>
    </button>
  );
}

function AtomicPaletteCard({
  type,
  label,
  icon: Icon,
  onClick,
}: {
  type: PopupBuilderAtomicType;
  label: string;
  icon: typeof Type;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${type}`,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      className={cn(
        "group flex min-h-[80px] cursor-grab flex-col items-center justify-between rounded-xl border border-slate-200 bg-white px-2.5 py-3 transition hover:border-slate-300 hover:bg-slate-50 active:cursor-grabbing",
        isDragging && "opacity-65",
      )}
      {...attributes}
      {...listeners}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition group-hover:border-slate-300 group-hover:text-slate-700">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mb-0! mt-2! text-center !text-xs font-medium text-slate-900">
        {label}
      </p>
    </button>
  );
}

function InspectorAccordionSection({
  value,
  title,
  children,
}: {
  value: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      className="overflow-hidden rounded-[10px] border border-slate-200 bg-white transition-colors data-[state=open]:border-slate-300 data-[state=open]:bg-slate-50/30"
    >
      <AccordionTrigger className="min-h-[30px]! cursor-pointer items-center mt-1! mb-0! px-4 py-3 pb-0! hover:no-underline [&>svg]:size-4 [&>svg]:translate-y-0 [&>svg]:text-slate-400">
        <div className="flex items-center text-left">
          <h3 className="mb-0! text-xs! leading-none font-semibold tracking-[-0.01em] text-slate-950">
            {title}
          </h3>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-3 pt-0 mt-0! mb-0!">
        <div className="w-full space-y-3 rounded-2xl px-2 py-2">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

function couponMatchesScope(
  cupom: CupomDesconto,
  scope: PopupBuilderCouponScope,
) {
  if (cupom.aplicarEm === "TODA_PLATAFORMA") return true;
  if (scope === "COURSES") return cupom.aplicarEm === "APENAS_CURSOS";
  return cupom.aplicarEm === "APENAS_ASSINATURA";
}

function formatCouponValue(cupom: CupomDesconto) {
  if (
    cupom.tipoDesconto === "PORCENTAGEM" &&
    typeof cupom.valorPercentual === "number"
  ) {
    return `${cupom.valorPercentual}% OFF`;
  }

  if (typeof cupom.valorFixo === "number") {
    return cupom.valorFixo.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return "Oferta ativa";
}

function formatCouponValidity(cupom: CupomDesconto) {
  if (!cupom.periodoFim) return "Cupom ativo";

  const date = new Date(cupom.periodoFim);
  if (Number.isNaN(date.getTime())) return "Cupom ativo";

  return `Válido até ${date.toLocaleDateString("pt-BR")}`;
}

function normalizeRoulettePercentages(
  items: PopupBuilderRouletteItem[],
): PopupBuilderRouletteItem[] {
  if (items.length === 0) return items;
  if (items.length === 1) {
    return items.map((item) => ({ ...item, weight: 100 }));
  }

  const rawWeights = items.map((item) =>
    Math.min(100, Math.max(0, Math.round(Number(item.weight ?? 0)))),
  );
  const total = rawWeights.reduce((sum, weight) => sum + weight, 0);

  if (total <= 0) {
    const equalWeight = Math.floor(100 / items.length);
    let remaining = 100 - equalWeight * items.length;

    return items.map((item, index) => ({
      ...item,
      weight: equalWeight + (remaining-- > 0 ? 1 : 0),
    }));
  }

  const exactWeights = rawWeights.map((weight) => (weight / total) * 100);
  const flooredWeights = exactWeights.map((weight) => Math.floor(weight));
  let remaining = 100 - flooredWeights.reduce((sum, weight) => sum + weight, 0);

  const fractionalOrder = exactWeights
    .map((weight, index) => ({
      index,
      fraction: weight - Math.floor(weight),
    }))
    .sort((a, b) => b.fraction - a.fraction);

  const nextWeights = [...flooredWeights];
  let orderCursor = 0;

  while (remaining > 0) {
    const current = fractionalOrder[orderCursor % fractionalOrder.length];
    nextWeights[current.index] += 1;
    remaining -= 1;
    orderCursor += 1;
  }

  return items.map((item, index) => ({
    ...item,
    weight: nextWeights[index],
  }));
}

function rebalanceRoulettePercentagesForItem(
  items: PopupBuilderRouletteItem[],
  targetItemId: string,
  targetWeight: number,
): PopupBuilderRouletteItem[] {
  if (items.length === 0) return items;
  if (items.length === 1) {
    return items.map((item) => ({ ...item, weight: 100 }));
  }

  const targetIndex = items.findIndex((item) => item.id === targetItemId);
  if (targetIndex === -1) {
    return normalizeRoulettePercentages(items);
  }

  const otherIndexes = items
    .map((_, index) => index)
    .filter((index) => index !== targetIndex);
  const minimumPerOtherItem = otherIndexes.length > 0 ? 1 : 0;
  const reservedForOthers = minimumPerOtherItem * otherIndexes.length;
  const safeTargetWeight = Math.max(
    0,
    Math.min(100 - reservedForOthers, Math.round(targetWeight)),
  );
  const remainingWeight = 100 - safeTargetWeight;
  const otherWeights = otherIndexes.map((index) =>
    Math.max(0, Math.min(100, Math.round(Number(items[index].weight ?? 0)))),
  );
  const totalOtherWeight = otherWeights.reduce(
    (sum, weight) => sum + weight,
    0,
  );

  let redistributedWeights: number[];

  if (totalOtherWeight <= 0) {
    const distributableWeight = remainingWeight - reservedForOthers;
    const equalWeight = Math.floor(distributableWeight / otherIndexes.length);
    let remaining = distributableWeight - equalWeight * otherIndexes.length;

    redistributedWeights = otherWeights.map(
      () => minimumPerOtherItem + equalWeight + (remaining-- > 0 ? 1 : 0),
    );
  } else {
    const distributableWeight = remainingWeight - reservedForOthers;
    const exactWeights = otherWeights.map(
      (weight) => (weight / totalOtherWeight) * distributableWeight,
    );
    const flooredWeights = exactWeights.map((weight) => Math.floor(weight));
    let remaining =
      distributableWeight -
      flooredWeights.reduce((sum, weight) => sum + weight, 0);

    const fractionalOrder = exactWeights
      .map((weight, index) => ({
        index,
        fraction: weight - Math.floor(weight),
      }))
      .sort((a, b) => b.fraction - a.fraction);

    redistributedWeights = [...flooredWeights];
    let orderCursor = 0;

    while (remaining > 0) {
      const current = fractionalOrder[orderCursor % fractionalOrder.length];
      redistributedWeights[current.index] += 1;
      remaining -= 1;
      orderCursor += 1;
    }

    redistributedWeights = redistributedWeights.map(
      (weight) => weight + minimumPerOtherItem,
    );
  }

  return items.map((item, index) => {
    if (index === targetIndex) {
      return { ...item, weight: safeTargetWeight };
    }

    const otherIndex = otherIndexes.findIndex(
      (currentIndex) => currentIndex === index,
    );
    return {
      ...item,
      weight: redistributedWeights[otherIndex] ?? 0,
    };
  });
}

interface PopupContentBuilderProps {
  value: CreatePopupPayload;
  onChange: (next: CreatePopupPayload) => void;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  hiddenAtomicTypes?: PopupBuilderAtomicType[];
}

export function PopupContentBuilder({
  value,
  onChange,
  selectedNodeId,
  onSelectNode,
  hiddenAtomicTypes = [],
}: PopupContentBuilderProps) {
  const builderRoot = useMemo(
    () => normalizeBuilderRoot(buildBuilderTreeFromPayload(value)),
    [value],
  );
  const visibleAtomicLibrary = useMemo(
    () =>
      ATOMIC_LIBRARY.filter((item) => !hiddenAtomicTypes.includes(item.type)),
    [hiddenAtomicTypes],
  );
  const structureAxis = getStructureAxis(builderRoot.structure);

  const applyStructure = (axis: "ROW" | "COLUMN") => {
    const nextStructure = buildStructureFromAxisAndCount(
      axis,
      axis === "ROW"
        ? Math.max(getStructureAreaCount(builderRoot.structure), 1)
        : 2,
    );
    const nextRoot = setBuilderStructure(builderRoot, nextStructure);
    onChange(syncBuilderTreeToLegacy(updateBuilderRoot(value, nextRoot)));
    onSelectNode(nextRoot.id);
  };

  const addAtomicElement = (type: PopupBuilderAtomicType) => {
    const targetAreaId = resolvePreferredAreaId(builderRoot, selectedNodeId);
    if (!targetAreaId) return;

    const nextRoot = {
      ...builderRoot,
      areas: builderRoot.areas.map((area) =>
        area.id === targetAreaId
          ? { ...area, children: [...area.children, createAtomicNode(type)] }
          : area,
      ),
    };

    const nextPayload = syncBuilderTreeToLegacy(
      updateBuilderRoot(value, nextRoot),
    );
    onChange(nextPayload);
    onSelectNode(
      nextRoot.areas.find((area) => area.id === targetAreaId)?.children.at(-1)
        ?.id ?? targetAreaId,
    );
  };

  return (
    <div className="space-y-5">
      <section className="space-y-2.5">
        <div className="space-y-0.5">
          <h3 className="mb-0! !text-sm font-semibold text-slate-950">
            Estrutura
          </h3>
          <p className="mb-0! !text-[11px] leading-4 text-slate-500">
            Escolha como o bloco principal organiza as áreas internas.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {STRUCTURE_OPTIONS.map((item) => (
            <StructureCard
              key={item.value}
              label={item.label}
              icon={item.icon}
              active={structureAxis === item.value}
              onClick={() => applyStructure(item.value)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-2.5">
        <div className="space-y-0.5">
          <h3 className="mb-0! !text-sm font-semibold text-slate-950">
            Elementos
          </h3>
          <p className="mb-0! !text-[11px] leading-4 text-slate-500">
            Arraste para uma área do canvas ou clique para inserir no bloco
            ativo.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {visibleAtomicLibrary.map((item) => (
            <AtomicPaletteCard
              key={item.type}
              type={item.type}
              label={item.label}
              icon={item.icon}
              onClick={() => addAtomicElement(item.type)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

interface PopupBlockInspectorProps {
  value: CreatePopupPayload;
  onChange: (next: CreatePopupPayload) => void;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onUploadImage?: (
    nodeId: string,
    file: File,
    currentUrl?: string | null,
    currentAlt?: string | null,
  ) => Promise<void>;
  isUploadingImage?: boolean;
  flush?: boolean;
}

export function PopupBlockInspector({
  value,
  onChange,
  selectedNodeId,
  onSelectNode,
  onUploadImage,
  isUploadingImage = false,
  flush = false,
}: PopupBlockInspectorProps) {
  const [availableCoupons, setAvailableCoupons] = useState<CupomDesconto[]>([]);
  const [legacyCoupon, setLegacyCoupon] = useState<CupomDesconto | null>(null);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [couponLoadError, setCouponLoadError] = useState<string | null>(null);
  const [expandedRouletteItemId, setExpandedRouletteItemId] = useState<
    string | null
  >(null);
  const [rouletteWeightDrafts, setRouletteWeightDrafts] = useState<
    Record<string, string>
  >({});
  const builderRoot = useMemo(
    () => normalizeBuilderRoot(buildBuilderTreeFromPayload(value)),
    [value],
  );

  const selectedArea =
    builderRoot.areas.find((area) => area.id === selectedNodeId) ?? null;
  const selectedAtomic =
    builderRoot.areas
      .flatMap((area) => area.children)
      .find((node) => node.id === selectedNodeId) ?? null;
  const isRootSelected = !selectedNodeId || selectedNodeId === builderRoot.id;
  const couponScope =
    selectedAtomic?.type === "COUPON"
      ? (selectedAtomic.couponScope ?? null)
      : null;
  const rouletteScope =
    selectedAtomic?.type === "ROULETTE"
      ? (selectedAtomic.rouletteScope ?? null)
      : null;
  const selectedCoupon =
    selectedAtomic?.type === "COUPON" && selectedAtomic.couponId
      ? (availableCoupons.find(
          (cupom) => cupom.id === selectedAtomic.couponId,
        ) ??
        (legacyCoupon?.id === selectedAtomic.couponId ? legacyCoupon : null))
      : null;
  const hasLegacyCouponReference =
    selectedAtomic?.type === "COUPON" &&
    Boolean(selectedAtomic.couponId) &&
    !availableCoupons.some((cupom) => cupom.id === selectedAtomic.couponId);
  const rouletteItems =
    selectedAtomic?.type === "ROULETTE"
      ? (selectedAtomic.rouletteItems ?? [])
      : [];
  const hasNoPrizeRouletteItem = rouletteItems.some((item) => item.isNoPrize);
  const rouletteTotalWeight = rouletteItems.reduce(
    (sum, item) => sum + Math.max(0, Number(item.weight ?? 0)),
    0,
  );
  const rouletteSuggestedColors = [
    "#1D4ED8",
    "#0F766E",
    "#7C2D12",
    "#4338CA",
    "#9F1239",
    "#14532D",
    "#1E3A8A",
    "#3F3F46",
  ];

  const updateRouletteItems = (items: PopupBuilderRouletteItem[]) => {
    const normalizedItems = normalizeRoulettePercentages(items);
    updateAtomic({
      rouletteItems: normalizedItems,
      rouletteCouponIds: normalizedItems
        .filter((item) => !item.isNoPrize && item.couponId)
        .map((item) => item.couponId as string),
    });
  };

  const getNextRouletteSegmentColor = () => {
    const currentItems =
      selectedAtomic?.type === "ROULETTE"
        ? (selectedAtomic.rouletteItems ?? [])
        : [];

    const firstUnusedColor = rouletteSuggestedColors.find(
      (color) => !currentItems.some((item) => item.color === color),
    );

    if (firstUnusedColor) return firstUnusedColor;

    return rouletteSuggestedColors[
      currentItems.length % rouletteSuggestedColors.length
    ];
  };

  const addRoulettePrizeItem = () => {
    if (selectedAtomic?.type !== "ROULETTE") return;

    const nextItem: PopupBuilderRouletteItem = {
      id: `roulette_prize_${Math.random().toString(36).slice(2, 10)}`,
      label: "Prêmio",
      weight: 1,
      couponId: null,
      couponCode: null,
      couponValue: null,
      couponValidity: null,
      caption: "Cupom premiado",
      isNoPrize: false,
      color: getNextRouletteSegmentColor(),
      textColor: "#FFFFFF",
    };

    updateRouletteItems([...(selectedAtomic.rouletteItems ?? []), nextItem]);
    setExpandedRouletteItemId(nextItem.id);
  };

  const moveRouletteItem = (itemId: string, direction: "up" | "down") => {
    if (selectedAtomic?.type !== "ROULETTE") return;

    const currentItems = [...(selectedAtomic.rouletteItems ?? [])];
    const index = currentItems.findIndex((item) => item.id === itemId);
    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentItems.length) return;

    const [movedItem] = currentItems.splice(index, 1);
    currentItems.splice(targetIndex, 0, movedItem);
    updateRouletteItems(currentItems);
  };

  useEffect(() => {
    if (selectedAtomic?.type !== "ROULETTE") {
      setExpandedRouletteItemId(null);
      setRouletteWeightDrafts({});
      return;
    }
  }, [expandedRouletteItemId, selectedAtomic]);

  useEffect(() => {
    if (selectedAtomic?.type !== "ROULETTE") return;

    setRouletteWeightDrafts((current) => {
      const validIds = new Set(
        (selectedAtomic.rouletteItems ?? []).map((item) => item.id),
      );
      const next = Object.fromEntries(
        Object.entries(current).filter(([itemId]) => validIds.has(itemId)),
      );
      return Object.keys(next).length === Object.keys(current).length
        ? current
        : next;
    });

    if (
      expandedRouletteItemId &&
      !(selectedAtomic.rouletteItems ?? []).some(
        (item) => item.id === expandedRouletteItemId,
      )
    ) {
      setExpandedRouletteItemId(null);
    }
  }, [expandedRouletteItemId, selectedAtomic]);

  const commitRoot = (nextRoot: ReturnType<typeof normalizeBuilderRoot>) => {
    onChange(syncBuilderTreeToLegacy(updateBuilderRoot(value, nextRoot)));
  };

  const updateAtomic = (patch: Partial<PopupBuilderAtomicNode>) => {
    if (!selectedAtomic) return;
    commitRoot(updateAtomicNode(builderRoot, selectedAtomic.id, patch));
  };

  const updateSocialLinks = (links: PopupBuilderSocialLink[]) => {
    if (selectedAtomic?.type !== "SOCIAL_LINKS") return;
    updateAtomic({ socialLinks: links });
  };

  const addSocialLink = () => {
    if (selectedAtomic?.type !== "SOCIAL_LINKS") return;

    const currentLinks = selectedAtomic.socialLinks ?? [];
    updateSocialLinks([
      ...currentLinks,
      {
        id: `social_link_${Math.random().toString(36).slice(2, 10)}`,
        platform: getNextSocialPlatform(currentLinks),
        url: null,
      },
    ]);
  };

  const moveSocialLink = (linkId: string, direction: "up" | "down") => {
    if (selectedAtomic?.type !== "SOCIAL_LINKS") return;

    const currentLinks = [...(selectedAtomic.socialLinks ?? [])];
    const index = currentLinks.findIndex((link) => link.id === linkId);
    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentLinks.length) return;

    const [movedLink] = currentLinks.splice(index, 1);
    currentLinks.splice(targetIndex, 0, movedLink);
    updateSocialLinks(currentLinks);
  };

  const updateDesignConfig = (
    patch: Partial<CreatePopupPayload["designConfig"]>,
  ) => {
    onChange({
      ...value,
      designConfig: {
        ...value.designConfig,
        ...patch,
      },
    });
  };

  const removeSelectedAtomic = () => {
    if (!selectedAtomic) return;
    commitRoot(removeNodeFromBuilder(builderRoot, selectedAtomic.id));
    onSelectNode(builderRoot.id);
  };

  useEffect(() => {
    let isMounted = true;

    const activeScope =
      selectedAtomic?.type === "COUPON"
        ? couponScope
        : selectedAtomic?.type === "ROULETTE"
          ? rouletteScope
          : null;

    if (
      (selectedAtomic?.type !== "COUPON" &&
        selectedAtomic?.type !== "ROULETTE") ||
      !activeScope
    ) {
      setAvailableCoupons([]);
      setLegacyCoupon(null);
      setCouponLoadError(null);
      setIsLoadingCoupons(false);
      return;
    }

    const loadCoupons = async () => {
      try {
        setIsLoadingCoupons(true);
        setCouponLoadError(null);

        const response = await listCupons({
          status: "PUBLICADO",
          apenasAtivos: true,
        });

        if (!isMounted) return;

        if (!Array.isArray(response)) {
          throw new Error(
            response.message || "Não foi possível carregar cupons",
          );
        }

        const filtered = response.filter((cupom) =>
          couponMatchesScope(cupom, activeScope),
        );

        setAvailableCoupons(filtered);

        if (
          selectedAtomic.type === "COUPON" &&
          selectedAtomic.couponId &&
          !filtered.some((cupom) => cupom.id === selectedAtomic.couponId)
        ) {
          const detail = await getCupom(selectedAtomic.couponId);
          if (!isMounted) return;

          if (!Array.isArray(detail) && "id" in detail) {
            setLegacyCoupon(detail);
          } else {
            setLegacyCoupon(null);
          }
        } else {
          setLegacyCoupon(null);
        }
      } catch (error) {
        if (!isMounted) return;
        setAvailableCoupons([]);
        setLegacyCoupon(null);
        setCouponLoadError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar cupons ativos.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingCoupons(false);
        }
      }
    };

    void loadCoupons();

    return () => {
      isMounted = false;
    };
  }, [
    couponScope,
    rouletteScope,
    selectedAtomic?.couponId,
    selectedAtomic?.type,
  ]);

  if (isRootSelected) {
    const structureAxis = getStructureAxis(builderRoot.structure);
    const structureCount = getStructureAreaCount(builderRoot.structure);

    return (
      <div
        className={cn(
          "flex h-full min-h-[540px] flex-col bg-white",
          flush
            ? "border-l border-slate-200"
            : "rounded-2xl border border-slate-200",
        )}
      >
        <div className="space-y-3 px-4 py-4">
          <InputCustom
            label="Cor de fundo"
            type="color"
            value={value.designConfig.backgroundColor}
            className="[&_input]:cursor-pointer"
            onChange={(event) =>
              updateDesignConfig({ backgroundColor: event.target.value })
            }
          />

          <SelectCustom
            label={
              structureAxis === "ROW"
                ? "Quantidade de colunas"
                : "Quantidade de linhas"
            }
            value={String(structureCount)}
            options={
              structureAxis === "ROW"
                ? [
                    { value: "1", label: "1 coluna" },
                    { value: "2", label: "2 colunas" },
                    { value: "3", label: "3 colunas" },
                  ]
                : [
                    { value: "1", label: "1 linha" },
                    { value: "2", label: "2 linhas" },
                    { value: "3", label: "3 linhas" },
                  ]
            }
            searchable={false}
            clearable={false}
            onChange={(value) => {
              const nextCount = Number(
                value || (structureAxis === "ROW" ? 1 : 2),
              );
              commitRoot(
                setBuilderStructure(
                  builderRoot,
                  buildStructureFromAxisAndCount(structureAxis, nextCount),
                ),
              );
            }}
          />

          {structureCount > 1 ? (
            <label className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5">
              <span className="!text-sm font-medium text-slate-900">
                {structureAxis === "ROW"
                  ? "Inverter colunas"
                  : "Inverter linhas"}
              </span>
              <Switch
                checked={Boolean(builderRoot.reverse)}
                onCheckedChange={(checked) =>
                  commitRoot({
                    ...builderRoot,
                    reverse: checked,
                  })
                }
              />
            </label>
          ) : null}
        </div>
      </div>
    );
  }

  if (selectedArea) {
    return (
      <div
        className={cn(
          "flex h-full min-h-[540px] flex-col bg-white",
          flush
            ? "border-l border-slate-200"
            : "rounded-2xl border border-slate-200",
        )}
      >
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="mb-0! !text-sm font-semibold text-slate-950">
            Área de conteúdo
          </h3>
          <p className="mb-0! !text-[11px] leading-4 text-slate-500">
            Arraste elementos para esta área ou clique em um elemento para
            editar.
          </p>
        </div>
        <div className="px-4 py-4">
          <p className="mb-0! !text-sm text-slate-600">
            Esta área possui <strong>{selectedArea.children.length}</strong>{" "}
            elemento(s).
          </p>
        </div>
      </div>
    );
  }

  if (!selectedAtomic) {
    return (
      <div
        className={cn(
          "flex h-full min-h-[540px] items-center justify-center bg-white px-5 py-6",
          flush
            ? "border-l border-slate-200"
            : "rounded-2xl border border-slate-200",
        )}
      >
        <p className="mb-0! max-w-[220px] text-center !text-[11px] leading-5 text-slate-500">
          Selecione o bloco principal, uma área ou um elemento do canvas.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-[540px] flex-col bg-white",
        flush
          ? "border-l border-slate-200"
          : "rounded-2xl border border-slate-200",
      )}
    >
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="mb-0! !text-sm font-semibold text-slate-950">
            {ATOMIC_LIBRARY.find((item) => item.type === selectedAtomic.type)
              ?.label ?? "Elemento"}
          </h3>
          <ButtonCustom
            variant="secondary"
            size="sm"
            onClick={removeSelectedAtomic}
          >
            Remover
          </ButtonCustom>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {selectedAtomic.type === "TITLE" ||
        selectedAtomic.type === "PARAGRAPH" ? (
          <>
            <RichTextarea
              label={
                selectedAtomic.type === "TITLE"
                  ? "Conteúdo do título"
                  : "Conteúdo do parágrafo"
              }
              value={selectedAtomic.content ?? ""}
              onHtmlChange={(html) => updateAtomic({ content: html })}
              placeholder={
                selectedAtomic.type === "TITLE"
                  ? "Digite o título"
                  : "Digite o parágrafo"
              }
              maxLength={selectedAtomic.type === "TITLE" ? 140 : 500}
              showCharCount
              showHeadingSelect={false}
              minEditorHeight={160}
              maxEditorHeight={320}
            />

            {selectedAtomic.type === "TITLE" ? (
              <SelectCustom
                label="Tamanho do título"
                value={selectedAtomic.headingLevel ?? "h2"}
                searchable={false}
                clearable={false}
                options={TITLE_HEADING_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                onChange={(headingLevel) =>
                  headingLevel &&
                  updateAtomic({
                    headingLevel: headingLevel as NonNullable<
                      PopupBuilderAtomicNode["headingLevel"]
                    >,
                  })
                }
              />
            ) : null}

            <div className="space-y-2">
              <div className="!text-sm font-medium text-slate-700">
                Cor do texto
              </div>
              <div className="flex flex-wrap gap-2">
                {TEXT_COLOR_SWATCHS.map((color) => {
                  const isSelected =
                    (selectedAtomic.textColor ?? "") === color ||
                    (!selectedAtomic.textColor &&
                      selectedAtomic.type === "TITLE" &&
                      color === "#0F172A") ||
                    (!selectedAtomic.textColor &&
                      selectedAtomic.type === "PARAGRAPH" &&
                      color === "#64748B");

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => updateAtomic({ textColor: color })}
                      className={cn(
                        "h-8 w-8 cursor-pointer rounded-full border-2 transition",
                        isSelected
                          ? "border-[#06286B] ring-2 ring-[#DBEAFE]"
                          : "border-white ring-1 ring-slate-200",
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Selecionar cor ${color}`}
                    />
                  );
                })}
              </div>
              <InputCustom
                label="Cor personalizada"
                type="color"
                value={
                  selectedAtomic.textColor ??
                  (selectedAtomic.type === "TITLE" ? "#0F172A" : "#64748B")
                }
                className="[&_input]:h-11! [&_input]:cursor-pointer!"
                onChange={(event) =>
                  updateAtomic({ textColor: event.target.value })
                }
              />
            </div>
          </>
        ) : null}

        {selectedAtomic.type === "CONSENT" ||
        selectedAtomic.type === "TIMER" ? (
          <>
            <SimpleTextarea
              label={selectedAtomic.type === "TIMER" ? "Mensagem" : "Conteúdo"}
              value={selectedAtomic.content ?? ""}
              onChange={(event) =>
                updateAtomic({ content: event.target.value })
              }
              maxLength={500}
              showCharCount
            />
            {selectedAtomic.type === "TIMER" ? (
              <InputCustom
                label="Tempo em segundos"
                type="number"
                min={1}
                value={String(selectedAtomic.timerDurationSeconds ?? 10)}
                onChange={(event) =>
                  updateAtomic({
                    timerDurationSeconds: Math.max(
                      1,
                      Number(event.target.value || 1),
                    ),
                  })
                }
                helperText="Ex.: 10 para mostrar 00:00:10."
              />
            ) : null}
            {selectedAtomic.type === "CONSENT" ? (
              <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3 !text-sm text-slate-700">
                Exigir aceite com checkbox
                <Switch
                  checked={Boolean(selectedAtomic.consentCheckbox)}
                  onCheckedChange={(consentCheckbox) =>
                    updateAtomic({ consentCheckbox })
                  }
                />
              </label>
            ) : null}
          </>
        ) : null}

        {selectedAtomic.type === "BUTTON" ? (
          <>
            <InputCustom
              label="Texto do botão"
              value={selectedAtomic.content ?? ""}
              onChange={(event) => updateAtomic({ content: event.target.value })}
              maxLength={60}
            />

            <div className="space-y-2">
              <div className="!text-sm font-medium text-slate-700">
                Cor de fundo
              </div>
              <div className="flex flex-wrap gap-2">
                {BUTTON_BACKGROUND_SWATCHS.map((color) => {
                  const isActive =
                    (selectedAtomic.buttonBackgroundColor ?? "") === color ||
                    (!selectedAtomic.buttonBackgroundColor && color === "#06286B");

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        updateAtomic({ buttonBackgroundColor: color })
                      }
                      className={cn(
                        "h-10 w-10 rounded-full border-2 transition",
                        isActive
                          ? "border-[#06286B] ring-2 ring-[#BFDBFE]"
                          : "border-slate-200",
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Selecionar cor de fundo ${color}`}
                    />
                  );
                })}
              </div>
              <InputCustom
                label="Cor de fundo personalizada"
                type="color"
                value={selectedAtomic.buttonBackgroundColor ?? "#06286B"}
                className="[&_input]:h-11! [&_input]:cursor-pointer!"
                onChange={(event) =>
                  updateAtomic({ buttonBackgroundColor: event.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <div className="!text-sm font-medium text-slate-700">
                Cor do texto
              </div>
              <div className="flex flex-wrap gap-2">
                {TEXT_COLOR_SWATCHS.map((color) => {
                  const isActive =
                    (selectedAtomic.textColor ?? "") === color ||
                    (!selectedAtomic.textColor && color === "#FFFFFF");

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => updateAtomic({ textColor: color })}
                      className={cn(
                        "h-10 w-10 rounded-full border-2 transition",
                        isActive
                          ? "border-[#06286B] ring-2 ring-[#BFDBFE]"
                          : "border-slate-200",
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Selecionar cor do texto ${color}`}
                    />
                  );
                })}
              </div>
              <InputCustom
                label="Cor do texto personalizada"
                type="color"
                value={selectedAtomic.textColor ?? "#FFFFFF"}
                className="[&_input]:h-11! [&_input]:cursor-pointer!"
                onChange={(event) =>
                  updateAtomic({ textColor: event.target.value })
                }
              />
            </div>
          </>
        ) : null}

        {selectedAtomic.type === "IMAGE" ? (
          <>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedAtomic.url?.trim() || POPUP_IMAGE_PLACEHOLDER_SRC}
                alt={selectedAtomic.alt ?? "Imagem do pop-up"}
                className="h-40 w-full object-cover"
              />
            </div>
            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 !text-sm font-medium text-slate-700 transition hover:border-[#06286B] hover:text-[#06286B]">
              {isUploadingImage ? "Enviando imagem..." : "Fazer upload"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={!onUploadImage || isUploadingImage}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file || !selectedAtomic || !onUploadImage) return;
                  await onUploadImage(
                    selectedAtomic.id,
                    file,
                    selectedAtomic.url,
                    selectedAtomic.alt,
                  );
                }}
              />
            </label>
            <InputCustom
              label="Alt da imagem"
              value={selectedAtomic.alt ?? ""}
              onChange={(event) => updateAtomic({ alt: event.target.value })}
              placeholder="Descrição da imagem"
            />
            <SelectCustom
              label="Disposição da imagem"
              options={[
                { value: "PREENCHER", label: "Preencher o espaço" },
                { value: "ESTICAR", label: "Preencher largura e altura" },
                { value: "REPETIR", label: "Repetir" },
                { value: "CENTRALIZAR", label: "Centralizar" },
              ]}
              value={value.designConfig.imageDisposition}
              onChange={(imageDisposition) =>
                imageDisposition &&
                updateDesignConfig({
                  imageDisposition: imageDisposition as never,
                })
              }
            />
            <SelectCustom
              label="Posição do fundo"
              options={[
                { value: "CENTRO", label: "Centro" },
                { value: "TOPO", label: "Topo" },
                { value: "ESQUERDA", label: "Esquerda" },
                { value: "DIREITA", label: "Direita" },
                { value: "BASE", label: "Base" },
              ]}
              value={value.designConfig.imagePosition}
              onChange={(imagePosition) =>
                imagePosition &&
                updateDesignConfig({ imagePosition: imagePosition as never })
              }
            />
            <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3 !text-sm text-slate-700">
              Exibir imagem em dispositivos móveis
              <Switch
                checked={value.designConfig.showImageOnMobile}
                onCheckedChange={(showImageOnMobile) =>
                  updateDesignConfig({ showImageOnMobile })
                }
              />
            </label>
          </>
        ) : null}

        {selectedAtomic.type === "VIDEO" ? (
          <InputCustom
            label="URL do vídeo"
            value={selectedAtomic.url ?? ""}
            onChange={(event) => updateAtomic({ url: event.target.value })}
            placeholder="https://youtube.com/..."
          />
        ) : null}

        {selectedAtomic.type === "COUPON" ? (
          <>
            <SelectCustom
              label="Tipo de cupom"
              value={couponScope}
              required
              searchable={false}
              clearable={false}
              placeholder="Selecione o tipo"
              options={[
                { value: "SUBSCRIPTIONS", label: "Assinaturas" },
                { value: "COURSES", label: "Cursos" },
              ]}
              onChange={(value) =>
                updateAtomic({
                  couponScope: (value ??
                    null) as PopupBuilderCouponScope | null,
                  couponId: null,
                  couponCaption: "Oferta exclusiva",
                  couponValue: "",
                  couponCode: "",
                  couponValidity: "",
                })
              }
            />
            <SelectCustom
              label="Cupom ativo"
              required
              value={selectedAtomic.couponId ?? null}
              searchable
              clearable={false}
              disabled={
                !couponScope ||
                isLoadingCoupons ||
                availableCoupons.length === 0
              }
              placeholder={
                !couponScope
                  ? "Selecione o tipo de cupom"
                  : isLoadingCoupons
                    ? "Carregando cupons..."
                    : availableCoupons.length === 0
                      ? "Nenhum cupom ativo disponível"
                      : "Selecione um cupom"
              }
              options={availableCoupons.map((cupom) => ({
                value: cupom.id,
                label: `${cupom.codigo} • ${formatCouponValue(cupom)}`,
              }))}
              onChange={(value) => {
                const nextCoupon = availableCoupons.find(
                  (cupom) => cupom.id === value,
                );

                if (!nextCoupon) return;

                updateAtomic({
                  couponId: nextCoupon.id,
                  couponScope,
                  couponCaption: "Oferta exclusiva",
                  couponValue: formatCouponValue(nextCoupon),
                  couponCode: nextCoupon.codigo,
                  couponValidity: formatCouponValidity(nextCoupon),
                });
              }}
            />
            {couponLoadError ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="mb-0! !text-xs text-amber-700">
                  {couponLoadError}
                </p>
              </div>
            ) : null}
            {hasLegacyCouponReference ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="mb-0! !text-xs text-amber-700">
                  Este popup referencia um cupom que está inativo ou não foi
                  encontrado na lista atual. Ao salvar novamente, selecione
                  outro cupom ativo.
                </p>
              </div>
            ) : null}
            {selectedCoupon ? (
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                <p className="mb-1! !text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Cupom selecionado
                </p>
                <p className="mb-0.5! !text-sm font-semibold text-slate-900">
                  {selectedCoupon.codigo}
                </p>
                <p className="mb-0! !text-xs text-slate-500">
                  {formatCouponValue(selectedCoupon)} ·{" "}
                  {formatCouponValidity(selectedCoupon)}
                </p>
              </div>
            ) : null}
            <SelectCustom
              label="Design do cupom"
              value={normalizeCouponVariant(selectedAtomic.couponVariant)}
              searchable={false}
              clearable={false}
              options={[
                { value: "ALPHA", label: "Alpha" },
                { value: "OMEGA", label: "Omega" },
                { value: "SIGMA", label: "Sigma" },
                { value: "DELTA", label: "Delta" },
              ]}
              onChange={(value) =>
                updateAtomic({
                  couponVariant: (value ?? "ALPHA") as
                    | "ALPHA"
                    | "OMEGA"
                    | "SIGMA"
                    | "DELTA",
                })
              }
            />
            <SelectCustom
              label="Cor do cupom"
              value={normalizeCouponTone(
                selectedAtomic.couponTone,
                selectedAtomic.couponVariant,
              )}
              searchable={false}
              clearable={false}
              options={[
                { value: "PRIMARY", label: "Azul primário" },
                { value: "SECONDARY", label: "Vermelho secundário" },
                { value: "LIGHT", label: "Branco com borda" },
                { value: "DARK", label: "Escuro" },
              ]}
              onChange={(value) =>
                updateAtomic({
                  couponTone: (value ?? "PRIMARY") as
                    | "PRIMARY"
                    | "SECONDARY"
                    | "LIGHT"
                    | "DARK",
                })
              }
            />
          </>
        ) : null}

        {selectedAtomic.type === "ROULETTE" ? (
          <>
            <Accordion
              type="multiple"
              defaultValue={
                hasNoPrizeRouletteItem
                  ? ["roulette-segments", "roulette-no-prize"]
                  : ["roulette-segments"]
              }
              className="space-y-2"
            >
              <InspectorAccordionSection
                value="roulette-segments"
                title="Segmentos da roleta"
              >
                {couponLoadError ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                    <p className="mb-0! !text-xs text-amber-700">
                      {couponLoadError}
                    </p>
                  </div>
                ) : null}
                {(selectedAtomic.rouletteItems?.length ?? 0) === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm">
                      <Disc3 className="h-6 w-6" />
                    </div>
                    <p className="mb-0! !text-xs leading-5 text-slate-500">
                      Adicione o primeiro prêmio da roleta para configurar
                      cupons, chances e cores.
                    </p>
                  </div>
                ) : null}
                {selectedAtomic.rouletteItems &&
                selectedAtomic.rouletteItems.length > 0 ? (
                  <div className="space-y-3">
                    {(selectedAtomic.rouletteItems.some(
                      (item) => !item.isNoPrize && !item.couponId,
                    ) ||
                      selectedAtomic.rouletteItems.some(
                        (item) =>
                          !item.isNoPrize &&
                          !availableCoupons.some(
                            (cupom) => cupom.id === item.couponId,
                          ),
                      )) && (
                      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                        <p className="mb-0! !text-xs leading-5 text-amber-700">
                          Alguns segmentos de prêmio não têm cupom válido
                          atribuído.
                        </p>
                      </div>
                    )}

                    {selectedAtomic.rouletteItems.map((item) => {
                      const isExpanded = expandedRouletteItemId === item.id;
                      const itemIndex = (
                        selectedAtomic.rouletteItems ?? []
                      ).findIndex((entry) => entry.id === item.id);
                      const hasMultipleItems =
                        (selectedAtomic.rouletteItems?.length ?? 0) > 1;
                      const canMoveUp = hasMultipleItems && itemIndex > 0;
                      const canMoveDown =
                        hasMultipleItems &&
                        itemIndex <
                          (selectedAtomic.rouletteItems?.length ?? 0) - 1;
                      const chancePercent =
                        rouletteTotalWeight > 0
                          ? (
                              (Math.max(0, Number(item.weight ?? 0)) /
                                rouletteTotalWeight) *
                              100
                            ).toFixed(1)
                          : "0.0";
                      const displayedWeightDraft =
                        rouletteWeightDrafts[item.id] ??
                        String(
                          Math.max(0, Math.min(100, Number(item.weight ?? 0))),
                        );

                      return (
                        <div
                          key={item.id}
                          className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                        >
                          <div className="flex items-center justify-between gap-3 px-3 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className="h-4 w-4 shrink-0 rounded-md border border-slate-200"
                                style={{
                                  backgroundColor: item.color ?? "#1D4ED8",
                                }}
                              />
                              <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 !text-xs font-semibold text-slate-700">
                                {chancePercent}%
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {canMoveUp ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    moveRouletteItem(item.id, "up")
                                  }
                                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                  aria-label="Mover prêmio para cima"
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </button>
                              ) : null}
                              {canMoveDown ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    moveRouletteItem(item.id, "down")
                                  }
                                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                  aria-label="Mover prêmio para baixo"
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </button>
                              ) : null}
                              <button
                                type="button"
                                onClick={() =>
                                  updateRouletteItems(
                                    (selectedAtomic.rouletteItems ?? []).filter(
                                      (entry) => entry.id !== item.id,
                                    ),
                                  )
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Remover segmento"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedRouletteItemId((current) =>
                                    current === item.id ? null : item.id,
                                  )
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Expandir segmento"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {isExpanded ? (
                            <div className="grid grid-cols-1 gap-3 border-t border-slate-200 px-3 py-3">
                              <SelectCustom
                                label="Esse segmento libera prêmio?"
                                value={item.isNoPrize ? "NO_PRIZE" : "COUPON"}
                                searchable={false}
                                clearable={false}
                                options={[
                                  {
                                    value: "COUPON",
                                    label: "Sim, libera um cupom",
                                  },
                                  {
                                    value: "NO_PRIZE",
                                    label: "Não, mostrar sem prêmio",
                                  },
                                ]}
                                onChange={(value) =>
                                  updateRouletteItems(
                                    (selectedAtomic.rouletteItems ?? []).map(
                                      (entry) =>
                                        entry.id === item.id
                                          ? value === "NO_PRIZE"
                                            ? {
                                                ...entry,
                                                isNoPrize: true,
                                                label:
                                                  entry.label.trim() &&
                                                  entry.label.trim() !==
                                                    "Prêmio"
                                                    ? entry.label
                                                    : "Tente novamente",
                                                couponId: null,
                                                couponCode: null,
                                                couponValue: null,
                                                couponValidity: null,
                                                caption: null,
                                                color: entry.color ?? "#14B8A6",
                                              }
                                            : {
                                                ...entry,
                                                isNoPrize: false,
                                                label:
                                                  entry.label.trim() ===
                                                  "Tente novamente"
                                                    ? "Prêmio"
                                                    : entry.label,
                                              }
                                          : entry,
                                    ),
                                  )
                                }
                              />
                              <InputCustom
                                label={
                                  item.isNoPrize
                                    ? "Mensagem do segmento"
                                    : "Nome do prêmio"
                                }
                                value={item.label}
                                onChange={(event) =>
                                  updateRouletteItems(
                                    (selectedAtomic.rouletteItems ?? []).map(
                                      (entry) =>
                                        entry.id === item.id
                                          ? {
                                              ...entry,
                                              label: event.target.value,
                                            }
                                          : entry,
                                    ),
                                  )
                                }
                              />
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="!text-sm font-medium text-slate-900">
                                      Chance em porcentagem
                                    </span>
                                    <span className="!text-sm font-semibold text-slate-700">
                                      {chancePercent}%
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] overflow-hidden rounded-xl border border-slate-200">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setRouletteWeightDrafts((current) => {
                                          const next = { ...current };
                                          delete next[item.id];
                                          return next;
                                        });
                                        updateRouletteItems(
                                          rebalanceRoulettePercentagesForItem(
                                            selectedAtomic.rouletteItems ?? [],
                                            item.id,
                                            Math.max(
                                              0,
                                              Math.min(
                                                100,
                                                Number(item.weight ?? 0) - 1,
                                              ),
                                            ),
                                          ),
                                        );
                                      }}
                                      className="flex h-11 cursor-pointer items-center justify-center border-r border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
                                    >
                                      <Minus className="h-4 w-4" />
                                    </button>
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      step={1}
                                      value={displayedWeightDraft}
                                      onChange={(event) =>
                                        setRouletteWeightDrafts((current) => ({
                                          ...current,
                                          [item.id]: event.target.value,
                                        }))
                                      }
                                      onBlur={() => {
                                        const draftValue =
                                          rouletteWeightDrafts[item.id];
                                        if (draftValue == null) return;

                                        const nextWeight = Math.max(
                                          0,
                                          Math.min(
                                            100,
                                            Number(draftValue || 0),
                                          ),
                                        );

                                        setRouletteWeightDrafts((current) => {
                                          const next = { ...current };
                                          delete next[item.id];
                                          return next;
                                        });

                                        updateRouletteItems(
                                          rebalanceRoulettePercentagesForItem(
                                            selectedAtomic.rouletteItems ?? [],
                                            item.id,
                                            nextWeight,
                                          ),
                                        );
                                      }}
                                      onKeyDown={(event) => {
                                        if (event.key !== "Enter") return;
                                        event.currentTarget.blur();
                                      }}
                                      className="h-11 w-full border-0 bg-white px-3 text-center !text-base font-semibold text-slate-950 outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setRouletteWeightDrafts((current) => {
                                          const next = { ...current };
                                          delete next[item.id];
                                          return next;
                                        });
                                        updateRouletteItems(
                                          rebalanceRoulettePercentagesForItem(
                                            selectedAtomic.rouletteItems ?? [],
                                            item.id,
                                            Math.max(
                                              0,
                                              Math.min(
                                                100,
                                                Number(item.weight ?? 0) + 1,
                                              ),
                                            ),
                                          ),
                                        );
                                      }}
                                      className="flex h-11 cursor-pointer items-center justify-center border-l border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <label className="block space-y-2">
                                <span className="block !text-sm font-medium text-slate-900">
                                  Cor da fatia
                                </span>
                                <input
                                  type="color"
                                  value={item.color ?? "#1D4ED8"}
                                  onChange={(event) =>
                                    updateRouletteItems(
                                      (selectedAtomic.rouletteItems ?? []).map(
                                        (entry) =>
                                          entry.id === item.id
                                            ? {
                                                ...entry,
                                                color: event.target.value,
                                              }
                                            : entry,
                                      ),
                                    )
                                  }
                                  className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
                                />
                              </label>
                              {!item.isNoPrize ? (
                                <>
                                  <SelectCustom
                                    label="Tipo de cupom"
                                    value={rouletteScope}
                                    required
                                    searchable={false}
                                    clearable={false}
                                    placeholder="Selecione o tipo"
                                    options={[
                                      {
                                        value: "SUBSCRIPTIONS",
                                        label: "Assinaturas",
                                      },
                                      { value: "COURSES", label: "Cursos" },
                                    ]}
                                    onChange={(value) =>
                                      updateAtomic({
                                        rouletteScope: (value ??
                                          null) as PopupBuilderCouponScope | null,
                                        rouletteCouponIds: [],
                                        rouletteItems: (
                                          selectedAtomic.rouletteItems ?? []
                                        ).map((entry) =>
                                          entry.isNoPrize
                                            ? entry
                                            : {
                                                ...entry,
                                                couponId: null,
                                                couponCode: null,
                                                couponValue: null,
                                                couponValidity: null,
                                              },
                                        ),
                                      })
                                    }
                                  />
                                  <SelectCustom
                                    label="Cupom ativo"
                                    value={item.couponId ?? null}
                                    required
                                    searchable
                                    clearable={false}
                                    disabled={
                                      !rouletteScope ||
                                      isLoadingCoupons ||
                                      availableCoupons.length === 0
                                    }
                                    placeholder={
                                      !rouletteScope
                                        ? "Selecione o tipo de cupom"
                                        : isLoadingCoupons
                                          ? "Carregando cupons..."
                                          : availableCoupons.length === 0
                                            ? "Nenhum cupom ativo disponível"
                                            : "Selecione o cupom"
                                    }
                                    options={availableCoupons.map((cupom) => ({
                                      value: cupom.id,
                                      label: `${cupom.codigo} • ${formatCouponValue(cupom)}`,
                                    }))}
                                    onChange={(value) => {
                                      const cupom = availableCoupons.find(
                                        (entry) => entry.id === value,
                                      );
                                      if (!cupom) return;

                                      updateRouletteItems(
                                        (
                                          selectedAtomic.rouletteItems ?? []
                                        ).map((entry) =>
                                          entry.id === item.id
                                            ? {
                                                ...entry,
                                                label:
                                                  entry.label === "Prêmio" ||
                                                  !entry.label.trim()
                                                    ? cupom.codigo
                                                    : entry.label,
                                                couponId: cupom.id,
                                                couponCode: cupom.codigo,
                                                couponValue:
                                                  formatCouponValue(cupom),
                                                couponValidity:
                                                  formatCouponValidity(cupom),
                                                caption: "Cupom premiado",
                                              }
                                            : entry,
                                        ),
                                      );
                                    }}
                                  />
                                </>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                <div className="pt-1">
                  <ButtonCustom
                    type="button"
                    variant="primary"
                    fullWidth
                    onClick={addRoulettePrizeItem}
                    className="h-11! rounded-xl! text-sm! font-semibold!"
                  >
                    Adicionar segmento
                  </ButtonCustom>
                </div>
              </InspectorAccordionSection>

              {hasNoPrizeRouletteItem ? (
                <InspectorAccordionSection
                  value="roulette-no-prize"
                  title="Quando o usuário não ganhar"
                >
                  <div className="space-y-4">
                    <InputCustom
                      label="Título da modal"
                      className="[&_input]:bg-white"
                      value={selectedAtomic.rouletteNoPrizeTitle ?? "Quase lá!"}
                      onChange={(event) =>
                        updateAtomic({
                          rouletteNoPrizeTitle: event.target.value,
                        })
                      }
                      placeholder="Quase lá!"
                    />
                    <InputCustom
                      label="Mensagem exibida"
                      className="[&_input]:bg-white"
                      required
                      value={
                        selectedAtomic.rouletteNoPrizeMessage ??
                        "Ops... não foi dessa vez. Se quiser, deixe seu contato para receber a próxima oportunidade."
                      }
                      onChange={(event) =>
                        updateAtomic({
                          rouletteNoPrizeMessage: event.target.value,
                        })
                      }
                      placeholder="Ops... não foi dessa vez. Se quiser, deixe seu contato..."
                    />
                    <InputCustom
                      label="Texto do botão"
                      className="[&_input]:bg-white"
                      value={
                        selectedAtomic.rouletteNoPrizeButtonText ??
                        "Enviar contato"
                      }
                      onChange={(event) =>
                        updateAtomic({
                          rouletteNoPrizeButtonText: event.target.value,
                        })
                      }
                      placeholder="Enviar contato"
                    />
                    <div className="space-y-2">
                      <p className="mb-0! !text-sm font-medium text-slate-900">
                        Capturar contato após não ganhar
                      </p>
                      <div className="space-y-2">
                        {[
                          {
                            key: "NAME",
                            label: "Nome",
                            hint: "Mostrar campo para nome completo.",
                          },
                          {
                            key: "EMAIL",
                            label: "Email",
                            hint: "Capturar email para novas campanhas.",
                          },
                          {
                            key: "PHONE",
                            label: "Telefone",
                            hint: "Pedir telefone para contato rápido.",
                          },
                        ].map((field) => {
                          const currentFields =
                            selectedAtomic.rouletteNoPrizeContactFields ?? [];
                          const checked = currentFields.includes(
                            field.key as PopupBuilderInputKind,
                          );

                          return (
                            <label
                              key={field.key}
                              className={cn(
                                "flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-3 transition",
                                checked
                                  ? "border-[#06286B] bg-slate-50"
                                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                              )}
                            >
                              <span className="pt-0.5">
                                <CheckboxCustom
                                  checked={checked}
                                  onCheckedChange={(
                                    nextChecked: boolean | "indeterminate",
                                  ) =>
                                    updateAtomic({
                                      rouletteNoPrizeContactFields:
                                        nextChecked === true
                                          ? [
                                              ...Array.from(
                                                new Set([
                                                  ...(selectedAtomic.rouletteNoPrizeContactFields ??
                                                    []),
                                                  field.key as PopupBuilderInputKind,
                                                ]),
                                              ),
                                            ]
                                          : (
                                              selectedAtomic.rouletteNoPrizeContactFields ??
                                              []
                                            ).filter(
                                              (currentField) =>
                                                currentField !== field.key,
                                            ),
                                    })
                                  }
                                />
                              </span>
                              <span className="flex-1 space-y-0.5">
                                <span className="block !text-sm font-medium text-slate-900">
                                  {field.label}
                                </span>
                                <span className="block !text-xs leading-5 text-slate-500">
                                  {field.hint}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </InspectorAccordionSection>
              ) : null}
            </Accordion>
          </>
        ) : null}

        {selectedAtomic.type === "SOCIAL_LINKS" ? (
          <div className="space-y-4">
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="mb-0! !text-sm font-semibold text-slate-950">
                    Redes sociais
                  </h4>
                </div>
                <ButtonCustom
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addSocialLink}
                  className="gap-2"
                >
                  <BadgePlus className="h-4 w-4" />
                  Adicionar ícone
                </ButtonCustom>
              </div>

              <div className="space-y-3">
                {(selectedAtomic.socialLinks ?? []).map(
                  (link, index, items) => (
                    <div
                      key={link.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-slate-400">
                            <GripVertical className="h-4 w-4" />
                            <span className="!text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                              {getSocialPlatformLabel(link.platform)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveSocialLink(link.id, "up")}
                              disabled={index === 0}
                              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`Mover ${getSocialPlatformLabel(link.platform)} para cima`}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSocialLink(link.id, "down")}
                              disabled={index === items.length - 1}
                              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`Mover ${getSocialPlatformLabel(link.platform)} para baixo`}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateSocialLinks(
                                  (selectedAtomic.socialLinks ?? []).filter(
                                    (entry) => entry.id !== link.id,
                                  ),
                                )
                              }
                              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                              aria-label={`Remover ${getSocialPlatformLabel(link.platform)}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid min-w-0 grid-cols-1 gap-3">
                          <SelectCustom
                            label="Rede"
                            value={link.platform}
                            searchable={false}
                            clearable={false}
                            options={SOCIAL_PLATFORM_OPTIONS}
                            onChange={(value) =>
                              updateSocialLinks(
                                (selectedAtomic.socialLinks ?? []).map(
                                  (entry) =>
                                    entry.id === link.id
                                      ? {
                                          ...entry,
                                          platform: (value ??
                                            "FACEBOOK") as PopupBuilderSocialPlatform,
                                        }
                                      : entry,
                                ),
                              )
                            }
                          />
                          <InputCustom
                            label="URL"
                            value={link.url ?? ""}
                            placeholder="https://"
                            className="[&_input]:w-full"
                            onChange={(event) =>
                              updateSocialLinks(
                                (selectedAtomic.socialLinks ?? []).map(
                                  (entry) =>
                                    entry.id === link.id
                                      ? { ...entry, url: event.target.value }
                                      : entry,
                                ),
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <SelectCustom
                label="Tamanho"
                value={selectedAtomic.socialIconSize ?? "MD"}
                searchable={false}
                clearable={false}
                options={SOCIAL_ICON_SIZE_OPTIONS}
                onChange={(value) =>
                  updateAtomic({
                    socialIconSize: (value ??
                      "MD") as PopupBuilderSocialIconSize,
                  })
                }
              />
              <SelectCustom
                label="Forma"
                value={selectedAtomic.socialIconShape ?? "CIRCLE"}
                searchable={false}
                clearable={false}
                options={SOCIAL_ICON_SHAPE_OPTIONS}
                onChange={(value) =>
                  updateAtomic({
                    socialIconShape: (value ??
                      "CIRCLE") as PopupBuilderSocialIconShape,
                  })
                }
              />
              <SelectCustom
                label="Tema"
                value={selectedAtomic.socialTheme ?? "COLOR"}
                searchable={false}
                clearable={false}
                options={SOCIAL_THEME_OPTIONS}
                onChange={(value) =>
                  updateAtomic({
                    socialTheme: (value ?? "COLOR") as PopupBuilderSocialTheme,
                  })
                }
              />
              <SelectCustom
                label="Alinhamento"
                value={selectedAtomic.socialAlign ?? "CENTER"}
                searchable={false}
                clearable={false}
                options={SOCIAL_ALIGN_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                onChange={(value) =>
                  updateAtomic({
                    socialAlign: (value ?? "CENTER") as PopupBuilderSocialAlign,
                  })
                }
              />
            </div>
          </div>
        ) : null}

        {selectedAtomic.type === "INPUT" ? (
          <>
            <SelectCustom
              label="Tipo do input"
              value={selectedAtomic.inputKind ?? "NAME"}
              options={[
                { value: "NAME", label: "Nome" },
                { value: "EMAIL", label: "Email" },
                { value: "PHONE", label: "Telefone" },
              ]}
              searchable={false}
              clearable={false}
              onChange={(value) => {
                const nextKind = (value ?? "NAME") as PopupBuilderInputKind;
                const defaults =
                  nextKind === "EMAIL"
                    ? {
                        label: "Email",
                        placeholder: "seuemail@exemplo.com",
                        required: true,
                      }
                    : nextKind === "PHONE"
                      ? {
                          label: "Telefone",
                          placeholder: "(00) 00000-0000",
                          required: false,
                        }
                      : {
                          label: "Nome",
                          placeholder: "Seu nome",
                          required: false,
                        };

                updateAtomic({
                  inputKind: nextKind,
                  label: defaults.label,
                  placeholder: defaults.placeholder,
                  required: defaults.required,
                });
              }}
            />
            <InputCustom
              label="Label"
              value={selectedAtomic.label ?? ""}
              onChange={(event) => updateAtomic({ label: event.target.value })}
            />
            <InputCustom
              label="Placeholder"
              value={selectedAtomic.placeholder ?? ""}
              onChange={(event) =>
                updateAtomic({ placeholder: event.target.value })
              }
            />
            <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3 !text-sm text-slate-700">
              Obrigatório
              <Switch
                checked={Boolean(selectedAtomic.required)}
                onCheckedChange={(required) => updateAtomic({ required })}
              />
            </label>
          </>
        ) : null}
      </div>
    </div>
  );
}
