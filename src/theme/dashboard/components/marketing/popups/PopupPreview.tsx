"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  Facebook,
  GripVertical,
  Instagram,
  Linkedin,
  MessageCircle,
  Trash2,
  Twitter,
  Video,
  Youtube,
} from "lucide-react";

import {
  ButtonCustom,
  CouponCustom,
  InputCustom,
  RouletteCustom,
} from "@/components/ui/custom";
import { CheckboxCustom } from "@/components/ui/custom/checkbox";
import { sanitizeRichTextHtml } from "@/components/ui/custom/html-content";
import type {
  PopupBuilderAreaNode,
  PopupBuilderAtomicNode,
  PopupBuilderSocialPlatform,
  PopupContentConfig,
  PopupDesignConfig,
  PopupFormField,
  PopupPosition,
} from "@/api/websites/components/popups";
import { cn } from "@/lib/utils";
import {
  buildBuilderTreeFromPayload,
  getStructureAreaCount,
  getStructureAxis,
  normalizeCouponTone,
  normalizeCouponVariant,
} from "./popupBuilder";

interface PopupPreviewProps {
  content: PopupContentConfig;
  fields: PopupFormField[];
  design: PopupDesignConfig;
  viewport: "DESKTOP" | "MOBILE";
  position?: PopupPosition;
  interactive?: boolean;
  onSubmit?: (data: Record<string, string | boolean>) => void;
  onClose?: () => void;
  isSubmitting?: boolean;
  editable?: boolean;
  showDraftPlaceholders?: boolean;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  onMoveNode?: (nodeId: string, direction: "up" | "down") => void;
  onRemoveNode?: (nodeId: string) => void;
}

const positionClass: Record<PopupPosition, string> = {
  CENTRO: "items-center justify-center",
  ESQUERDA_SUPERIOR: "items-start justify-start",
  DIREITA_SUPERIOR: "items-start justify-end",
  ESQUERDA_INFERIOR: "items-end justify-start",
  DIREITA_INFERIOR: "items-end justify-end",
};

const POPUP_IMAGE_PLACEHOLDER_SRC = "/placeholders/popup-image-default.png";

const SOCIAL_ICON_COMPONENTS: Record<PopupBuilderSocialPlatform, typeof Facebook> = {
  FACEBOOK: Facebook,
  INSTAGRAM: Instagram,
  LINKEDIN: Linkedin,
  YOUTUBE: Youtube,
  WHATSAPP: MessageCircle,
  X: Twitter,
};

const SOCIAL_BRAND_COLORS: Record<PopupBuilderSocialPlatform, string> = {
  FACEBOOK: "#1877F2",
  INSTAGRAM: "#E4405F",
  LINKEDIN: "#0A66C2",
  YOUTUBE: "#FF0000",
  WHATSAPP: "#25D366",
  X: "#111827",
};

function resolveImageBackgroundPosition(
  position: PopupDesignConfig["imagePosition"],
) {
  switch (position) {
    case "TOPO":
      return "center top";
    case "ESQUERDA":
      return "left center";
    case "DIREITA":
      return "right center";
    case "BASE":
      return "center bottom";
    case "CENTRO":
    default:
      return "center center";
  }
}

function resolveImageBackgroundSize(
  disposition: PopupDesignConfig["imageDisposition"],
  viewport: "DESKTOP" | "MOBILE",
) {
  if (disposition === "ESTICAR") return "100% 100%";
  if (disposition === "PREENCHER") return "cover";
  if (disposition === "CENTRALIZAR") return "contain";
  return viewport === "MOBILE" ? "120px auto" : "160px auto";
}

function stripContainedImageClasses(className?: string | null) {
  if (!className) return undefined;

  return className
    .split(/\s+/)
    .filter(Boolean)
    .filter(
      (token) =>
        !token.includes("min-h-[") &&
        token !== "bg-top!" &&
        token !== "bg-bottom!" &&
        token !== "bg-center!" &&
        token !== "bg-left!" &&
        token !== "bg-right!",
    )
    .join(" ");
}

function normalizeVideoUrl(url?: string | null) {
  const value = url?.trim();
  if (!value) return null;

  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id
        ? `https://www.youtube.com/embed/${id}?rel=0&playsinline=1`
        : null;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id
          ? `https://www.youtube.com/embed/${id}?rel=0&playsinline=1`
          : null;
      }

      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/embed/")[1]?.split("/")[0];
        return id
          ? `https://www.youtube.com/embed/${id}?rel=0&playsinline=1`
          : null;
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/shorts/")[1]?.split("/")[0];
        return id
          ? `https://www.youtube.com/embed/${id}?rel=0&playsinline=1`
          : null;
      }
    }

    if (hostname === "youtube-nocookie.com") {
      return value;
    }
  } catch {
    return null;
  }

  return null;
}

function resolveSocialIconSize(size?: string | null) {
  if (size === "SM") {
    return { wrapper: 36, icon: 16 };
  }

  if (size === "LG") {
    return { wrapper: 52, icon: 22 };
  }

  return { wrapper: 44, icon: 18 };
}

function stripButtonColorClasses(
  className: string | null | undefined,
  options: { stripBackground?: boolean; stripText?: boolean },
) {
  if (!className) return className;

  const tokens = className.split(/\s+/).filter(Boolean);

  return tokens
    .filter((token) => {
      if (
        options.stripBackground &&
        /^(hover:|focus:|focus-visible:)?bg-/.test(token)
      ) {
        return false;
      }

      if (!options.stripText) return true;

      if (/^(hover:|focus:|focus-visible:)?text-\[#/i.test(token)) {
        return false;
      }

      if (
        /^(hover:|focus:|focus-visible:)?text-(white|black|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)(-|$)/.test(
          token,
        )
      ) {
        return false;
      }

      return true;
    })
    .join(" ");
}

function resolveSocialIconRadius(shape?: string | null) {
  if (shape === "SQUARE") return "14px";
  if (shape === "ROUNDED") return "18px";
  return "999px";
}

function resolveSocialAlignment(align?: string | null) {
  if (align === "LEFT") return "flex-start";
  if (align === "RIGHT") return "flex-end";
  return "center";
}

function applyPhoneMask(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isDarkHexColor(color?: string | null) {
  if (!color) return false;

  const normalized = color.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return false;

  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance < 0.55;
}

function formatTimerValue(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

function BuilderAreaDropZone({
  area,
  viewport,
  editable,
  selectedNodeId,
  onSelectNode,
  onMoveNode,
  onRemoveNode,
  renderAtomicNode,
}: {
  area: PopupBuilderAreaNode;
  viewport: "DESKTOP" | "MOBILE";
  editable: boolean;
  selectedNodeId: string | null;
  onSelectNode?: (nodeId: string) => void;
  onMoveNode?: (nodeId: string, direction: "up" | "down") => void;
  onRemoveNode?: (nodeId: string) => void;
  renderAtomicNode: (node: PopupBuilderAtomicNode) => ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: area.id });

  return (
    <div
      ref={setNodeRef}
      onClick={(event) => {
        event.stopPropagation();
        if (editable) {
          onSelectNode?.(area.id);
        }
      }}
      className={cn(
        "min-h-[180px] rounded-[24px] border border-dashed px-4 py-4 transition",
        editable
          ? selectedNodeId === area.id
            ? "border-[#93C5FD] bg-slate-50/70"
            : "border-slate-200 bg-white/85 hover:border-slate-300"
          : "border-transparent bg-transparent px-0 py-0",
        isOver && editable && "border-[#2563EB] bg-[#EFF6FF]",
        viewport === "MOBILE" && editable && "min-h-[140px]",
      )}
    >
      <SortableContext
        items={area.children.map((node) => node.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3.5">
          {area.children.length === 0 && editable ? (
            <div className="flex min-h-[96px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 text-center">
              <p className="mb-0! !text-xs text-slate-500">
                Arraste elementos para esta área.
              </p>
            </div>
          ) : null}

          {area.children.map((node, index) => (
            <SortablePreviewNode
              key={node.id}
              node={node}
              index={index}
              isSelected={selectedNodeId === node.id}
              isFirst={index === 0}
              isLast={index === area.children.length - 1}
              editable={editable}
              onSelectNode={onSelectNode}
              onMoveNode={onMoveNode}
              onRemoveNode={onRemoveNode}
            >
              {renderAtomicNode(node)}
            </SortablePreviewNode>
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function PopupPreview({
  content,
  fields,
  design,
  viewport,
  position = "CENTRO",
  interactive = false,
  onSubmit,
  onClose,
  isSubmitting = false,
  editable = false,
  showDraftPlaceholders = false,
  selectedNodeId = null,
  onSelectNode,
  onMoveNode,
  onRemoveNode,
}: PopupPreviewProps) {
  const builderRoot = useMemo(
    () =>
      buildBuilderTreeFromPayload({
        contentConfig: content as any,
        formFields: fields,
        designConfig: design,
      }),
    [content, design, fields],
  );
  const inputNodes = useMemo(
    () =>
      builderRoot.areas.flatMap((area) =>
        area.children.filter((node) => node.type === "INPUT"),
      ),
    [builderRoot],
  );
  const consentNodes = useMemo(
    () =>
      builderRoot.areas.flatMap((area) =>
        area.children.filter(
          (node) => node.type === "CONSENT" && node.consentCheckbox,
        ),
      ),
    [builderRoot],
  );
  const displayAreas = useMemo(
    () =>
      builderRoot.reverse
        ? [...builderRoot.areas].reverse()
        : builderRoot.areas,
    [builderRoot.areas, builderRoot.reverse],
  );
  const [fieldValues, setFieldValues] = useState<
    Record<string, string | boolean>
  >({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [timerValues, setTimerValues] = useState<Record<string, number>>({});
  const [isRouletteResultVisible, setIsRouletteResultVisible] = useState(false);

  useEffect(() => {
    setFieldValues((current) => {
      const nextValues: Record<string, string | boolean> = {};

      inputNodes.forEach((node) => {
        nextValues[node.id] = current[node.id] ?? "";
      });
      consentNodes.forEach((node) => {
        nextValues[node.id] = Boolean(current[node.id] ?? false);
      });

      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(nextValues);

      if (
        currentKeys.length === nextKeys.length &&
        nextKeys.every((key) => current[key] === nextValues[key])
      ) {
        return current;
      }

      return nextValues;
    });
  }, [consentNodes, inputNodes]);

  useEffect(() => {
    const timerNodes = displayAreas.flatMap((area) =>
      area.children.filter((node) => node.type === "TIMER"),
    );

    setTimerValues((current) => {
      const nextValues: Record<string, number> = {};

      timerNodes.forEach((node) => {
        nextValues[node.id] =
          current[node.id] ?? Math.max(1, node.timerDurationSeconds ?? 10);
      });

      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(nextValues);

      if (
        currentKeys.length === nextKeys.length &&
        nextKeys.every((key) => current[key] === nextValues[key])
      ) {
        return current;
      }

      return nextValues;
    });
  }, [displayAreas]);

  useEffect(() => {
    if (!interactive) return;

    const timerNodes = displayAreas.flatMap((area) =>
      area.children.filter((node) => node.type === "TIMER"),
    );

    if (timerNodes.length === 0) return;

    const interval = window.setInterval(() => {
      setTimerValues((current) => {
        const nextValues: Record<string, number> = {};
        let hasChanges = false;

        timerNodes.forEach((node) => {
          const currentValue =
            current[node.id] ?? Math.max(1, node.timerDurationSeconds ?? 10);
          const nextValue = Math.max(0, currentValue - 1);
          nextValues[node.id] = nextValue;
          if (nextValue !== currentValue) {
            hasChanges = true;
          }
        });

        if (!hasChanges) return current;
        return { ...current, ...nextValues };
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [displayAreas, interactive]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!interactive || !onSubmit) return;

    const nextErrors: Record<string, string> = {};

    inputNodes.forEach((node) => {
      if (!node.required) return;

      if (!String(fieldValues[node.id] ?? "").trim()) {
        nextErrors[node.id] = "Campo obrigatório.";
      }
    });

    consentNodes.forEach((node) => {
      if (!fieldValues[node.id]) {
        nextErrors[node.id] = "Confirme o aceite para continuar.";
      }
    });

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit(fieldValues);
  };

  const renderAtomicNode = (node: PopupBuilderAtomicNode) => {
    if (node.type === "TITLE") {
      const headingTag = node.headingLevel ?? "h2";
      const content = sanitizeRichTextHtml(node.content || "Novo título");

      return (
        <div
          className={cn(
            "text-center text-[var(--popup-text-color)] [&_*]:text-[var(--popup-text-color)] [&_a]:underline [&_a]:underline-offset-2 [&_a]:opacity-95",
            "[&_strong]:font-semibold [&_em]:italic [&_u]:underline",
            "[&_h1]:text-[2.8rem] [&_h1]:font-semibold [&_h1]:leading-[1.04] md:[&_h1]:text-[3.4rem]",
            "[&_h2]:text-[2.4rem] [&_h2]:font-semibold [&_h2]:leading-[1.06] md:[&_h2]:text-[3rem]",
            "[&_h3]:text-[2rem] [&_h3]:font-semibold [&_h3]:leading-[1.08] md:[&_h3]:text-[2.5rem]",
            "[&_h4]:text-[1.65rem] [&_h4]:font-semibold [&_h4]:leading-[1.12] md:[&_h4]:text-[2rem]",
            "[&_h5]:text-[1.35rem] [&_h5]:font-semibold [&_h5]:leading-[1.18] md:[&_h5]:text-[1.6rem]",
            "[&_h6]:text-[1.1rem] [&_h6]:font-semibold [&_h6]:leading-[1.24] md:[&_h6]:text-[1.2rem]",
            node.className,
          )}
          style={
            {
              "--popup-text-color": node.textColor ?? "#0F172A",
            } as CSSProperties
          }
          dangerouslySetInnerHTML={{
            __html: `<${headingTag}>${content}</${headingTag}>`,
          }}
        />
      );
    }

    if (node.type === "PARAGRAPH") {
      const content = sanitizeRichTextHtml(
        node.content || "Descreva a proposta do pop-up.",
      );

      return (
        <div
          className={cn(
            "text-center text-[15px] leading-7 text-[var(--popup-text-color)] [&_*]:text-[var(--popup-text-color)] [&_a]:underline [&_a]:underline-offset-2 [&_a]:opacity-95",
            "[&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_p]:mb-0 [&_div]:mb-0",
            node.className,
          )}
          style={
            {
              "--popup-text-color": node.textColor ?? "#64748B",
            } as CSSProperties
          }
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    if (node.type === "IMAGE") {
      if (viewport === "MOBILE" && !design.showImageOnMobile) {
        if (!editable) return null;
        return (
          <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
            <span className="!text-sm">Imagem oculta no mobile</span>
          </div>
        );
      }

      const imageSource = node.url?.trim() || POPUP_IMAGE_PLACEHOLDER_SRC;
      const hasCustomImage = Boolean(node.url?.trim());

      if (!hasCustomImage && !editable && !showDraftPlaceholders) {
        return null;
      }

      const containedImageClassName = stripContainedImageClasses(
        node.className,
      );

      if (design.imageDisposition === "CENTRALIZAR") {
        return (
          <div
            className={cn(
              "w-full overflow-hidden rounded-2xl border border-slate-200 bg-white",
              containedImageClassName,
            )}
          >
            <img
              src={imageSource}
              alt={node.alt || "Imagem do pop-up"}
              className="block h-auto w-full"
              style={{
                objectPosition: resolveImageBackgroundPosition(
                  design.imagePosition,
                ),
              }}
            />
          </div>
        );
      }

      return (
        <div
          role="img"
          aria-label={node.alt || "Imagem do pop-up"}
          className={cn(
            "w-full rounded-2xl border border-slate-200 bg-slate-50",
            viewport === "MOBILE" ? "min-h-[180px]" : "min-h-[220px]",
            node.className,
          )}
          style={{
            backgroundImage: `url("${imageSource}")`,
            backgroundPosition: resolveImageBackgroundPosition(
              design.imagePosition,
            ),
            backgroundRepeat:
              design.imageDisposition === "REPETIR" ? "repeat" : "no-repeat",
            backgroundSize: resolveImageBackgroundSize(
              design.imageDisposition,
              viewport,
            ),
            backgroundColor: hasCustomImage ? "#F8FAFC" : "#F1F5F9",
          }}
        />
      );
    }

    if (node.type === "VIDEO") {
      const embedUrl = normalizeVideoUrl(node.url);

      return embedUrl ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black">
          <iframe
            src={embedUrl}
            title="Vídeo do pop-up"
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
          <div className="flex flex-col items-center gap-2">
            <Video className="h-5 w-5" />
            <span className="!text-sm">Defina a URL do vídeo</span>
          </div>
        </div>
      );
    }

    if (node.type === "TIMER") {
      const displayValue = editable
        ? Math.max(1, node.timerDurationSeconds ?? 10)
        : (timerValues[node.id] ??
          Math.max(1, node.timerDurationSeconds ?? 10));

      return (
        <div className="rounded-[26px] border border-[#06286B]/10 bg-[linear-gradient(135deg,rgba(6,40,107,0.05),rgba(255,255,255,0.98))] px-5 py-4 text-center">
          <p className="mb-1! !text-[11px] font-semibold uppercase tracking-[0.22em] text-[#06286B]/70">
            {node.content || "Oferta expira em"}
          </p>
          <div className="flex items-center justify-center">
            <span className="font-mono text-[2rem] font-semibold leading-none tracking-[0.08em] text-[#06286B] md:text-[2.35rem]">
              {formatTimerValue(displayValue)}
            </span>
          </div>
        </div>
      );
    }

    if (node.type === "ROULETTE") {
      const rouletteItems = node.rouletteItems ?? [];

      return (
        <RouletteCustom
          items={rouletteItems}
          noPrizeTitle={node.rouletteNoPrizeTitle}
          noPrizeMessage={node.rouletteNoPrizeMessage}
          noPrizeButtonText={node.rouletteNoPrizeButtonText}
          noPrizeContactFields={node.rouletteNoPrizeContactFields}
          size={editable ? 340 : viewport === "MOBILE" ? 300 : 380}
          sessionKey={`popup-roulette:${node.id}`}
          sessionLimitEnabled={interactive && !editable}
          keepWheelVisibleAfterSpin={editable}
          onResultOpenChange={setIsRouletteResultVisible}
          onFlowClose={onClose}
          className="shadow-none"
        />
      );
    }

    if (node.type === "COUPON") {
      return (
        <CouponCustom
          caption={node.couponCaption}
          value={node.couponValue || "R$100,00"}
          code={node.couponCode || "ADVANCE100"}
          validity={node.couponValidity}
          variant={normalizeCouponVariant(node.couponVariant)}
          tone={normalizeCouponTone(node.couponTone, node.couponVariant)}
          className="shadow-none"
        />
      );
    }

    if (node.type === "SOCIAL_LINKS") {
      const links = (node.socialLinks ?? []).filter((link) =>
        editable ? true : Boolean(link.url?.trim()),
      );

      if (links.length === 0 && !editable && !showDraftPlaceholders) {
        return null;
      }

      const { wrapper, icon } = resolveSocialIconSize(node.socialIconSize);
      const widthPercent = Math.max(
        40,
        Math.min(100, Number(node.socialWidthPercent ?? 100)),
      );
      const gap = Math.max(0, Math.min(40, Number(node.socialGap ?? 12)));

      return (
        <div
          className="w-full"
          style={{
            display: "flex",
            justifyContent: resolveSocialAlignment(node.socialAlign),
          }}
        >
          <div
            className="flex flex-wrap items-center"
            style={{
              width: `${widthPercent}%`,
              maxWidth: "100%",
              gap: `${gap}px`,
              justifyContent: resolveSocialAlignment(node.socialAlign),
            }}
          >
            {links.map((link) => {
              const Icon = SOCIAL_ICON_COMPONENTS[link.platform];
              const brandColor = SOCIAL_BRAND_COLORS[link.platform];
              const theme = node.socialTheme ?? "COLOR";
              const backgroundColor =
                theme === "DARK" ? "#0F172A" : theme === "LIGHT" ? "#FFFFFF" : brandColor;
              const iconColor =
                theme === "LIGHT" ? brandColor : "#FFFFFF";
              const borderColor =
                theme === "LIGHT" ? "#CBD5E1" : "transparent";
              const content = (
                <span
                  className="inline-flex items-center justify-center transition"
                  style={{
                    width: `${wrapper}px`,
                    height: `${wrapper}px`,
                    borderRadius: resolveSocialIconRadius(node.socialIconShape),
                    backgroundColor,
                    color: iconColor,
                    border: `1px solid ${borderColor}`,
                  }}
                  title={link.url?.trim() || undefined}
                  aria-label={link.platform}
                >
                  <Icon style={{ width: `${icon}px`, height: `${icon}px` }} />
                </span>
              );

              if (!link.url?.trim() || editable) {
                return (
                  <div key={link.id} className="inline-flex">
                    {content}
                  </div>
                );
              }

              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex"
                  aria-label={`Abrir ${link.platform}`}
                >
                  {content}
                </a>
              );
            })}
          </div>
        </div>
      );
    }

    if (node.type === "INPUT") {
      return (
        <InputCustom
          type={
            node.inputKind === "EMAIL"
              ? "email"
              : node.inputKind === "PHONE"
                ? "tel"
                : "text"
          }
          value={String(fieldValues[node.id] ?? "")}
          required={Boolean(node.required)}
          placeholder={
            node.required
              ? `${node.placeholder || node.label || "Campo"} *`
              : node.placeholder || node.label || "Campo"
          }
          onChange={(event) => {
            const nextValue =
              node.inputKind === "PHONE"
                ? applyPhoneMask(event.target.value)
                : event.target.value;

            setFieldValues((current) => ({
              ...current,
              [node.id]: nextValue,
            }));

            setFieldErrors((current) => {
              if (!current[node.id]) return current;
              const next = { ...current };
              delete next[node.id];
              return next;
            });
          }}
          error={fieldErrors[node.id]}
          showInlineError
          className={cn(
            "[&_input]:h-13! [&_input]:rounded-2xl! [&_input]:border-slate-200/90! [&_input]:bg-white/96! [&_input]:px-4! [&_input]:text-[15px]! [&_input]:font-medium! [&_input]:text-slate-700! [&_input]:placeholder:text-slate-400!",
            node.className,
          )}
        />
      );
    }

    if (node.type === "BUTTON") {
      const buttonClassName = stripButtonColorClasses(node.className, {
        stripBackground: Boolean(node.buttonBackgroundColor),
        stripText: Boolean(node.textColor),
      });

      return (
        <ButtonCustom
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          loadingText="Enviando..."
          withAnimation={false}
          className={cn(
            "h-13! rounded-2xl! px-5! text-[15px]! font-semibold! shadow-none!",
            buttonClassName,
          )}
          style={
            {
              backgroundColor: node.buttonBackgroundColor ?? undefined,
              color: node.textColor ?? undefined,
            } as CSSProperties
          }
        >
          {node.content || "Cadastrar"}
        </ButtonCustom>
      );
    }

    if (node.type === "CONSENT") {
      if (node.consentCheckbox) {
        return (
          <div className="space-y-2">
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3",
                node.className,
              )}
            >
              <CheckboxCustom
                checked={Boolean(fieldValues[node.id])}
                onCheckedChange={(checked) => {
                  setFieldValues((current) => ({
                    ...current,
                    [node.id]: Boolean(checked),
                  }));

                  setFieldErrors((current) => {
                    if (!current[node.id]) return current;
                    const next = { ...current };
                    delete next[node.id];
                    return next;
                  });
                }}
                className="mt-0.5"
              />
              <span className="!text-[13px] leading-6 text-slate-500">
                {node.content || "Li e aceito os termos para continuar."}
              </span>
            </label>
            {fieldErrors[node.id] ? (
              <p className="mb-0! !text-xs text-red-500">
                {fieldErrors[node.id]}
              </p>
            ) : null}
          </div>
        );
      }

      return (
        <p
          className={cn(
            "text-center text-[13px] leading-6 text-slate-500",
            node.className,
          )}
        >
          {node.content || "Consentimento do formulário."}
        </p>
      );
    }

    return null;
  };

  const structureAxis = getStructureAxis(builderRoot.structure);
  const structureCount = getStructureAreaCount(builderRoot.structure);
  const hasDarkBackground = isDarkHexColor(design.backgroundColor);
  const areasClassName =
    viewport === "MOBILE"
      ? "grid grid-cols-1 gap-5"
      : structureAxis === "COLUMN"
        ? "grid grid-cols-1 gap-5"
        : structureCount === 2
          ? "grid grid-cols-2 gap-5"
          : structureCount === 3
            ? "grid grid-cols-3 gap-5"
            : structureCount >= 4
              ? "grid grid-cols-4 gap-4"
              : "grid grid-cols-1 gap-5";

  return (
    <div className={cn("flex h-full min-h-[520px]", positionClass[position])}>
      <div
        onClick={() => editable && onSelectNode?.(builderRoot.id)}
        className={cn(
          "relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-white p-5",
          viewport === "MOBILE" ? "w-[340px]" : "w-[780px]",
          hasDarkBackground &&
            "border-transparent shadow-[0_24px_64px_rgba(15,23,42,0.28)]",
          editable &&
            selectedNodeId === builderRoot.id &&
            "ring-1 ring-[#93C5FD]",
          isRouletteResultVisible &&
            !editable &&
            "pointer-events-none opacity-0 transition-opacity",
        )}
        style={{ backgroundColor: design.backgroundColor }}
      >
        {onClose ? (
          <ButtonCustom
            type="button"
            onClick={onClose}
            variant="ghost"
            size="icon"
            withAnimation={false}
            className={cn(
              "absolute right-3 top-3 z-10 h-8! w-8! rounded-full! p-0! shadow-none!",
              hasDarkBackground
                ? "bg-white/12! text-white! hover:bg-white/18!"
                : "bg-white/80! text-slate-500",
            )}
            aria-label="Fechar popup"
          >
            ×
          </ButtonCustom>
        ) : null}

        <form className={areasClassName} onSubmit={handleSubmit}>
          {displayAreas.map((area) => (
            <BuilderAreaDropZone
              key={area.id}
              area={area}
              viewport={viewport}
              editable={editable}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              onMoveNode={onMoveNode}
              onRemoveNode={onRemoveNode}
              renderAtomicNode={renderAtomicNode}
            />
          ))}
        </form>
      </div>
    </div>
  );
}

function SortablePreviewNode({
  node,
  index,
  isSelected,
  isFirst,
  isLast,
  editable,
  onSelectNode,
  onMoveNode,
  onRemoveNode,
  children,
}: {
  node: PopupBuilderAtomicNode;
  index: number;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  editable: boolean;
  onSelectNode?: (nodeId: string) => void;
  onMoveNode?: (nodeId: string, direction: "up" | "down") => void;
  onRemoveNode?: (nodeId: string) => void;
  children: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id, disabled: !editable });

  if (!editable) {
    return <div>{children}</div>;
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      role="button"
      tabIndex={0}
      onClick={(event) => {
        event.stopPropagation();
        onSelectNode?.(node.id);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onSelectNode?.(node.id);
        }
      }}
      className={cn(
        "group relative cursor-pointer rounded-2xl border border-transparent transition",
        isSelected && "border-dashed border-[#93C5FD]",
        !isSelected && "hover:border-dashed hover:border-[#93C5FD]",
        isDragging && "opacity-65",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute left-0 right-0 top-0 z-20 flex h-7 items-center justify-between bg-[#2563EB] px-2.5 text-white opacity-0 transition",
          "group-hover:pointer-events-auto group-hover:opacity-100",
          isSelected && "pointer-events-auto opacity-100",
        )}
      >
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(event) => event.stopPropagation()}
            className="pointer-events-auto flex h-4 w-4 cursor-grab items-center justify-center rounded-sm border border-white/10 bg-white/10 active:cursor-grabbing"
            aria-label="Arrastar elemento"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3 w-3 text-white/90" />
          </button>
          <span className="!text-[11px] font-medium leading-none">
            {index + 1}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={isFirst}
            onClick={(event) => {
              event.stopPropagation();
              onMoveNode?.(node.id, "up");
            }}
            className="pointer-events-auto flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Mover elemento para cima"
          >
            <ArrowUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={(event) => {
              event.stopPropagation();
              onMoveNode?.(node.id, "down");
            }}
            className="pointer-events-auto flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Mover elemento para baixo"
          >
            <ArrowDown className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRemoveNode?.(node.id);
            }}
            className="pointer-events-auto flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm text-white transition hover:bg-white/15"
            aria-label="Remover elemento"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="relative pt-7">{children}</div>
    </div>
  );
}
