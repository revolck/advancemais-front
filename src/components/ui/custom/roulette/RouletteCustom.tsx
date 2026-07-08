"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Gift } from "lucide-react";
import { createPortal } from "react-dom";

import { ButtonCustom } from "@/components/ui/custom/button";
import { InputCustom } from "@/components/ui/custom/input";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { cn } from "@/lib/utils";

export interface RouletteCouponItem {
  id: string;
  label: string;
  weight?: number;
  couponId?: string | null;
  couponCode?: string | null;
  couponValue?: string | null;
  couponValidity?: string | null;
  caption?: string | null;
  color?: string;
  textColor?: string;
  isNoPrize?: boolean;
  noPrizeMessage?: string | null;
  noPrizeContactFields?: Array<"NAME" | "EMAIL" | "PHONE">;
}

export interface RouletteCustomProps {
  items: RouletteCouponItem[];
  className?: string;
  spinLabel?: string;
  spinningLabel?: string;
  emptyPrizeLabel?: string;
  noPrizeTitle?: string | null;
  noPrizeMessage?: string | null;
  noPrizeButtonText?: string | null;
  noPrizeContactFields?: Array<"NAME" | "EMAIL" | "PHONE">;
  resultTitle?: string;
  resultSubtitle?: string;
  selectedItemId?: string | null;
  size?: number;
  sessionKey?: string;
  sessionLimitEnabled?: boolean;
  keepWheelVisibleAfterSpin?: boolean;
  onSpinEnd?: (item: RouletteCouponItem) => void;
  onCopyCoupon?: (code: string) => void;
  onResultOpenChange?: (isOpen: boolean) => void;
  onFlowClose?: () => void;
}

const DEFAULT_COLORS = [
  "#3f297e",
  "#1d61ac",
  "#169ed8",
  "#209b6c",
  "#f7a416",
  "#e6471d",
];

const CONFETTI_COLORS = [
  "#2563EB",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

const PLACEHOLDER_ITEMS: RouletteCouponItem[] = [
  {
    id: "placeholder_1",
    label: "Prêmio",
    color: "#1d61ac",
    textColor: "#FFFFFF",
    weight: 25,
  },
  {
    id: "placeholder_2",
    label: "Cupom",
    color: "#ff4343",
    textColor: "#FFFFFF",
    weight: 25,
  },
  {
    id: "placeholder_3",
    label: "Chance",
    color: "#0f766e",
    textColor: "#FFFFFF",
    weight: 25,
  },
  {
    id: "placeholder_4",
    label: "Gire",
    color: "#f7a416",
    textColor: "#FFFFFF",
    weight: 25,
  },
];

type WheelSegment = {
  item: RouletteCouponItem;
  startAngle: number;
  endAngle: number;
  centerAngle: number;
  spanAngle: number;
};

type ConfettiPiece = {
  id: number;
  color: string;
  size: number;
  heightFactor: number;
  initialX: number;
  initialY: number;
  targetX: number;
  targetY: number;
  rotation: number;
  delay: number;
};

function normalizeWeight(weight?: number) {
  if (!Number.isFinite(weight)) return 10;
  return Math.max(1, Number(weight));
}

function formatResultCode(item: RouletteCouponItem) {
  return item.couponCode?.trim() || item.label;
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function buildArcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function pickWeightedItem(items: RouletteCouponItem[]) {
  const total = items.reduce(
    (sum, item) => sum + normalizeWeight(item.weight),
    0,
  );
  let cursor = Math.random() * total;

  for (const item of items) {
    cursor -= normalizeWeight(item.weight);
    if (cursor <= 0) return item;
  }

  return items[items.length - 1];
}

function PrizeConfetti({ isActive }: { isActive: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isActive) {
      setPieces([]);
      return;
    }

    const nextPieces: ConfettiPiece[] = [];
    const count = 96;

    for (let index = 0; index < count; index += 1) {
      nextPieces.push({
        id: index,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 8,
        heightFactor: Math.random() > 0.5 ? 0.52 : 1.35,
        initialX: Math.random() * 100,
        initialY: -8 - Math.random() * 18,
        targetX: Math.max(0, Math.min(100, Math.random() * 100)),
        targetY: 100 + Math.random() * 24,
        rotation: Math.random() * 720 - 360,
        delay: Math.random() * 0.85,
      });
    }

    setPieces(nextPieces);

    const timeout = window.setTimeout(() => {
      setPieces([]);
    }, 5200);

    return () => window.clearTimeout(timeout);
  }, [isActive, mounted]);

  if (!mounted || !pieces.length) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute rounded-[2px]"
          style={{
            width: piece.size,
            height: piece.size * piece.heightFactor,
            backgroundColor: piece.color,
            left: `${piece.initialX}%`,
            top: `${piece.initialY}%`,
          }}
          initial={{ scale: 0.8, rotate: 0, opacity: 1 }}
          animate={{
            x: `${(piece.targetX - piece.initialX) * 1}vw`,
            y: `${piece.targetY - piece.initialY}vh`,
            scale: [0.8, 1, 1, 0.9],
            rotate: piece.rotation,
            opacity: [1, 1, 0.95, 0],
          }}
          transition={{
            duration: 4.2,
            delay: piece.delay,
            ease: [0.16, 0.84, 0.24, 1],
          }}
        />
      ))}
    </div>,
    document.body,
  );
}

export function RouletteCustom({
  items,
  className,
  spinLabel = "Girar",
  spinningLabel = "Girando...",
  emptyPrizeLabel = "Sem cupom desta vez",
  noPrizeTitle,
  noPrizeMessage,
  noPrizeButtonText,
  noPrizeContactFields,
  resultTitle = "Parabéns!",
  resultSubtitle = "Seu benefício já está liberado.\nCopie o código e aplique no checkout.",
  selectedItemId,
  size = 340,
  sessionKey,
  sessionLimitEnabled = true,
  keepWheelVisibleAfterSpin = false,
  onSpinEnd,
  onCopyCoupon,
  onResultOpenChange,
  onFlowClose,
}: RouletteCustomProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<RouletteCouponItem | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasSessionAttempt, setHasSessionAttempt] = useState(false);
  const [isWheelVisible, setIsWheelVisible] = useState(true);
  const [showPrizeConfetti, setShowPrizeConfetti] = useState(false);
  const [noPrizeContactValues, setNoPrizeContactValues] = useState<
    Record<string, string>
  >({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(size);

  const normalizedItems = useMemo(
    () =>
      items.map((item, index) => ({
        ...item,
        weight: normalizeWeight(item.weight),
        color: item.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length],
        textColor: item.textColor ?? "#FFFFFF",
      })),
    [items],
  );

  const visualItems = useMemo(() => {
    if (normalizedItems.length > 0) return normalizedItems;

    return PLACEHOLDER_ITEMS.map((item) => ({
      ...item,
      weight: normalizeWeight(item.weight),
    }));
  }, [normalizedItems]);

  const segments = useMemo<WheelSegment[]>(() => {
    const totalWeight = visualItems.reduce(
      (sum, item) => sum + normalizeWeight(item.weight),
      0,
    );
    let currentAngle = 0;

    return visualItems.map((item) => {
      const span = (normalizeWeight(item.weight) / totalWeight) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + span;
      currentAngle = endAngle;

      return {
        item,
        startAngle,
        endAngle,
        centerAngle: startAngle + span / 2,
        spanAngle: span,
      };
    });
  }, [visualItems]);

  useEffect(() => {
    if (!sessionKey || !sessionLimitEnabled) {
      setHasSessionAttempt(false);
      setIsWheelVisible(true);
      return;
    }

    const alreadyPlayed = window.sessionStorage.getItem(sessionKey) === "used";
    setHasSessionAttempt(alreadyPlayed);
    setIsWheelVisible(!alreadyPlayed);
  }, [sessionKey, sessionLimitEnabled]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    onResultOpenChange?.(isResultOpen);
  }, [isResultOpen, onResultOpenChange]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const syncWidth = () => {
      const nextWidth = element.getBoundingClientRect().width;
      if (nextWidth > 0) {
        setContainerWidth(nextWidth);
      }
    };

    syncWidth();

    const observer = new ResizeObserver(syncWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, [size]);

  useEffect(() => {
    if (!isResultOpen || !result || result.isNoPrize) {
      setShowPrizeConfetti(false);
      return;
    }

    setShowPrizeConfetti(true);
    const timeout = window.setTimeout(() => setShowPrizeConfetti(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [isResultOpen, result]);

  const handleCopy = async () => {
    if (!result) return;

    const code = formatResultCode(result);

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopyCoupon?.(code);
    } catch {
      onCopyCoupon?.(code);
    }
  };

  const handleSpin = () => {
    if (isSpinning || normalizedItems.length === 0) return;
    if (sessionLimitEnabled && hasSessionAttempt) return;

    const selectedItem =
      selectedItemId != null
        ? (normalizedItems.find((item) => item.id === selectedItemId) ??
          normalizedItems[0])
        : pickWeightedItem(normalizedItems);

    const selectedSegment =
      segments.find((segment) => segment.item.id === selectedItem.id) ??
      segments[0];
    const targetRotation = 360 - selectedSegment.centerAngle;
    const turns = 6 + Math.floor(Math.random() * 3);
    const finalRotation = rotation + turns * 360 + targetRotation;

    setCopied(false);
    setIsSpinning(true);
    setIsResultOpen(false);
    setNoPrizeContactValues({});
    setRotation(finalRotation);

    window.setTimeout(() => {
      setIsSpinning(false);
      setResult(selectedItem);
      setIsWheelVisible(keepWheelVisibleAfterSpin);
      if (sessionKey && sessionLimitEnabled) {
        window.sessionStorage.setItem(sessionKey, "used");
        setHasSessionAttempt(true);
      }
      setIsResultOpen(true);
      onSpinEnd?.(selectedItem);
    }, 4700);
  };

  const wheelSize = Math.min(size, Math.max(220, containerWidth - 32));
  const outerRadius = 48;
  const labelRadius = 32;
  const noPrizeFields = result?.isNoPrize ? (noPrizeContactFields ?? []) : [];

  return (
    <>
      {isWheelVisible ? (
        <div
          ref={containerRef}
          className={cn(
            "w-full rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.45)]",
            className,
          )}
        >
          <div className="flex justify-center">
            <div
              className="relative"
              style={{ width: wheelSize, height: wheelSize }}
            >
              <div className="absolute inset-0 rounded-full border-[3px] border-slate-700 bg-white shadow-[inset_0_0_0_6px_white,inset_0_0_0_8px_rgba(15,23,42,0.16),0_16px_34px_-20px_rgba(15,23,42,0.6)]" />

              <div className="absolute left-1/2 top-[8px] z-30 h-0 w-0 -translate-x-1/2 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-slate-800 drop-shadow-[0_4px_0_rgba(0,0,0,0.18)]" />

              <div
                className="absolute inset-[12px] rounded-full"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning
                    ? "transform 4.7s cubic-bezier(0,0.4,0.4,1.025)"
                    : "none",
                }}
              >
                <svg
                  viewBox="0 0 100 100"
                  className="h-full w-full"
                  aria-hidden="true"
                >
                  <circle cx="50" cy="50" r="49" fill="#fff" />

                  {segments.map((segment) => {
                    const labelPoint = polarToCartesian(
                      50,
                      50,
                      labelRadius,
                      segment.centerAngle,
                    );

                    return (
                      <g key={segment.item.id}>
                        {segment.spanAngle >= 359.9 ? (
                          <circle
                            cx="50"
                            cy="50"
                            r={outerRadius}
                            fill={segment.item.color}
                            stroke="#2f4559"
                            strokeWidth="0.55"
                          />
                        ) : (
                          <path
                            d={buildArcPath(
                              50,
                              50,
                              outerRadius,
                              segment.startAngle,
                              segment.endAngle,
                            )}
                            fill={segment.item.color}
                            stroke="#2f4559"
                            strokeWidth="0.55"
                          />
                        )}
                        <text
                          x={labelPoint.x}
                          y={labelPoint.y}
                          fill={segment.item.textColor}
                          fontSize="4.4"
                          fontWeight="800"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${segment.centerAngle}, ${labelPoint.x}, ${labelPoint.y})`}
                          style={{
                            paintOrder: "stroke",
                            stroke: "rgba(0,0,0,0.12)",
                            strokeWidth: "0.2",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {segment.item.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="absolute left-1/2 top-1/2 z-30 flex h-[74px] w-[74px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_6px_0_rgba(0,0,0,0.22),0_12px_24px_-18px_rgba(15,23,42,0.85)]">
                <div className="h-[58px] w-[58px] rounded-full border-[3px] border-slate-600 bg-slate-700" />
              </div>
            </div>
          </div>

          <ButtonCustom
            type="button"
            variant="primary"
            fullWidth
            size="lg"
            withAnimation={!isSpinning}
            disabled={
              isSpinning ||
              normalizedItems.length === 0 ||
              (sessionLimitEnabled && hasSessionAttempt)
            }
            onClick={handleSpin}
            className="mt-4 h-12! rounded-xl! text-sm! font-semibold!"
          >
            {sessionLimitEnabled && hasSessionAttempt
              ? "Você já participou"
              : normalizedItems.length === 0
                ? "Configure os prêmios"
                : isSpinning
                  ? spinningLabel
                  : spinLabel}
          </ButtonCustom>
        </div>
      ) : null}

      {result && !result.isNoPrize ? (
        <PrizeConfetti isActive={showPrizeConfetti && isResultOpen} />
      ) : null}

      <ModalCustom
        isOpen={isResultOpen}
        onClose={() => {
          setIsResultOpen(false);
          onFlowClose?.();
        }}
        size="lg"
        backdrop="blur"
      >
        <ModalContentWrapper className="gap-0">
          <ModalHeader>
            <ModalTitle className="text-center !text-[2rem] font-semibold tracking-[-0.05em] text-slate-950">
              {result?.isNoPrize
                ? noPrizeTitle?.trim() || "Quase lá!"
                : resultTitle}
            </ModalTitle>
          </ModalHeader>

          <ModalBody className="space-y-5 px-6 pb-6 pt-1">
            <div className="space-y-1 text-center">
              <p className="mb-0! whitespace-pre-line !text-base text-slate-700">
                {result?.isNoPrize
                  ? noPrizeMessage?.trim() || emptyPrizeLabel
                  : resultSubtitle}
              </p>
            </div>

            {result?.isNoPrize ? (
              <div className="mx-auto max-w-[420px] space-y-4">
                {noPrizeFields.length > 0 ? (
                  <div className="rounded-[24px] bg-slate-50 px-4 py-4 sm:px-5">
                    <div className="space-y-3">
                      {noPrizeFields.includes("NAME") ? (
                        <InputCustom
                          label="Nome"
                          value={noPrizeContactValues.name ?? ""}
                          onChange={(event) =>
                            setNoPrizeContactValues((current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                          placeholder="Seu nome"
                          className="[&_input]:border-slate-200 [&_input]:bg-white"
                        />
                      ) : null}
                      {noPrizeFields.includes("EMAIL") ? (
                        <InputCustom
                          type="email"
                          label="Email"
                          value={noPrizeContactValues.email ?? ""}
                          onChange={(event) =>
                            setNoPrizeContactValues((current) => ({
                              ...current,
                              email: event.target.value,
                            }))
                          }
                          placeholder="seuemail@exemplo.com"
                          className="[&_input]:border-slate-200 [&_input]:bg-white"
                        />
                      ) : null}
                      {noPrizeFields.includes("PHONE") ? (
                        <InputCustom
                          type="tel"
                          label="Telefone"
                          value={noPrizeContactValues.phone ?? ""}
                          onChange={(event) =>
                            setNoPrizeContactValues((current) => ({
                              ...current,
                              phone: event.target.value,
                            }))
                          }
                          placeholder="(00) 00000-0000"
                          className="[&_input]:border-slate-200 [&_input]:bg-white"
                        />
                      ) : null}
                      <ButtonCustom
                        type="button"
                        variant="primary"
                        fullWidth
                        className="mt-1 h-11! rounded-xl! text-sm! font-semibold!"
                        onClick={() => setIsResultOpen(false)}
                      >
                        {noPrizeButtonText?.trim() || "Enviar contato"}
                      </ButtonCustom>
                    </div>
                  </div>
                ) : (
                  <div className="h-1" />
                )}
              </div>
            ) : result ? (
              <div className="mx-auto max-w-[420px]">
                <div className="p-2 sm:p-2">
                  <div className="space-y-1 text-center">
                    {result.couponValidity ? (
                      <p className="mb-0! !text-sm text-slate-500">
                        {result.couponValidity}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-0! rounded-lg border border-slate-200 bg-slate-50/70 p-2">
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 flex-1 px-3 py-2">
                        <p className="mb-0! !text-[9px] font-medium uppercase tracking-[0.16em] text-slate-400">
                          Código
                        </p>
                        <p className="mb-0! truncate text-xl! font-semibold tracking-[-0.03em] text-slate-950 sm:text-2xl!">
                          {formatResultCode(result)}
                        </p>
                      </div>

                      <ButtonCustom
                        type="button"
                        variant="primary"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copiar
                          </>
                        )}
                      </ButtonCustom>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-7 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-color)] text-white">
                  <Gift className="h-6 w-6" />
                </div>
                <p className="mb-0! !text-sm leading-6 text-slate-600">
                  Nenhum prêmio foi definido para esta roleta.
                </p>
              </div>
            )}
          </ModalBody>
        </ModalContentWrapper>
      </ModalCustom>
    </>
  );
}
