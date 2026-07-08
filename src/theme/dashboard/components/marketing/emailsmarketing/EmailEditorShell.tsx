"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  Check,
  Circle,
  Eye,
  Loader2,
  Monitor,
  Send,
  Smartphone,
} from "lucide-react";

import {
  createMarketingEmail,
  getMarketingEmailById,
  getMarketingEmailRecipientOptions,
  updateMarketingEmail,
} from "@/api/websites/components/emailsmarketing";
import type {
  CreateMarketingEmailPayload,
  MarketingEmailDetail,
  MarketingEmailSenderConfig,
  MarketingEmailSettingsConfig,
  MarketingEmailTargetConfig,
} from "@/api/websites/components/emailsmarketing";
import type { CreatePopupPayload } from "@/api/websites/components/popups";
import {
  BuildMarketing,
  ButtonCustom,
  DatePickerCustom,
  InputCustom,
  MultiSelectCustom,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  SelectCustom,
  SimpleTextarea,
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
  TimeInputCustom,
  toastCustom,
} from "@/components/ui/custom";
import { AvatarCustom } from "@/components/ui/custom/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { cn } from "@/lib/utils";
import {
  AtomicDragPreview,
  PopupBlockInspector,
  PopupContentBuilder,
} from "@/theme/dashboard/components/marketing/popups/PopupContentBuilder";
import { PopupPreview } from "@/theme/dashboard/components/marketing/popups/PopupPreview";
import { PopupSettingsPanelContent } from "@/theme/dashboard/components/marketing/popups/PopupSettingsSidebar";
import {
  addNodeToArea,
  buildBuilderTreeFromPayload,
  createAtomicNode,
  findAreaForNode,
  moveNodeBetweenAreas,
  removeNodeFromBuilder,
  resolvePreferredAreaId,
  syncBuilderTreeToLegacy,
  updateBuilderRoot,
} from "@/theme/dashboard/components/marketing/popups/popupBuilder";
import {
  buildDefaultMarketingEmailContentConfig,
  convertEmailBuilderConfigToPopupPayload,
  convertPopupPayloadToEmailBuilderConfig,
  DEFAULT_MARKETING_EMAIL_TARGET_CONFIG,
  MARKETING_EMAIL_STATUS_LABEL,
} from "./constants";

type ActiveSidebar = "BASE" | "BLOCKS";
type EmailEditorStep = "configuracao" | "criacao" | "validacao" | "envio";

interface EmailEditorShellProps {
  emailId?: string;
  templateSlug?: string;
}

interface EmailEditorDraftStorage {
  version?: number;
  nome: string;
  assunto: string;
  previewText: string;
  templateSlug: string;
  builderPayload: CreatePopupPayload;
  senderConfig: MarketingEmailSenderConfig | null;
  targetConfig: MarketingEmailTargetConfig;
  settingsConfig: MarketingEmailSettingsConfig;
  updatedAt: string;
}

const DRAFT_TTL_MS = 20 * 60 * 1000;
const EMAIL_EDITOR_DRAFT_VERSION = 2;
const EMAIL_PREVIEW_TEXT_MAX_LENGTH = 140;

const EMAIL_EDITOR_STEPS: Array<{
  id: EmailEditorStep;
  label: string;
  shortLabel: string;
}> = [
  {
    id: "configuracao",
    label: "Configuração",
    shortLabel: "Configuração",
  },
  {
    id: "criacao",
    label: "Criação",
    shortLabel: "Criação",
  },
  {
    id: "validacao",
    label: "Validação",
    shortLabel: "Validação",
  },
  {
    id: "envio",
    label: "Envio",
    shortLabel: "Envio",
  },
];

interface SubjectDraft {
  subject: string;
  previewText: string;
}

const AUDIENCE_OPTIONS = [
  { value: "ALL_CONTACTS", label: "Todos os contatos" },
  { value: "LISTS", label: "Listas salvas" },
  { value: "MANUAL_CONTACTS", label: "Contatos individuais" },
] as const;

const DEFAULT_SETTINGS: MarketingEmailSettingsConfig = {
  language: "pt-BR",
  replyToEmail: null,
  trackOpens: true,
  trackClicks: true,
  googleAnalyticsCampaign: null,
  notes: null,
  deliveryMode: "NOW",
  scheduledAt: null,
};

const MIN_SEND_DATE = new Date();
MIN_SEND_DATE.setHours(0, 0, 0, 0);

function parseStoredDate(value?: string | null) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function parseScheduledDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatScheduledTime(value?: string | null) {
  const date = parseScheduledDate(value);
  if (!date) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function createDefaultScheduledAt() {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  return date.toISOString();
}

function normalizePickerDate(date: Date | null | undefined) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
}

function combineDateAndTime(date: Date | null, time: string) {
  const normalizedDate = normalizePickerDate(date);
  if (!normalizedDate) return null;

  const [hoursRaw, minutesRaw] = time.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;

  const next = new Date(
    normalizedDate.getFullYear(),
    normalizedDate.getMonth(),
    normalizedDate.getDate(),
    hours,
    minutes,
    0,
    0,
  );
  return next.toISOString();
}

function getBuilderPayloadFromDetail(
  email: MarketingEmailDetail,
  fallbackTemplate: string,
) {
  const popupPayload = email.contentConfig
    ?.popupPayload as CreatePopupPayload | null;
  if (popupPayload) return syncBuilderTreeToLegacy(popupPayload);

  const builder = email.contentConfig?.builder;
  if (builder) {
    return syncBuilderTreeToLegacy(
      convertEmailBuilderConfigToPopupPayload(
        builder,
        email.templateSlug ?? fallbackTemplate,
      ),
    );
  }

  return convertEmailBuilderConfigToPopupPayload(
    buildDefaultMarketingEmailContentConfig(
      email.templateSlug ?? fallbackTemplate,
    ).builder!,
    email.templateSlug ?? fallbackTemplate,
  );
}

function normalizeTargetConfig(
  value?: Partial<MarketingEmailTargetConfig> | null,
): MarketingEmailTargetConfig {
  return {
    ...DEFAULT_MARKETING_EMAIL_TARGET_CONFIG,
    ...value,
    contactIds: Array.isArray(value?.contactIds) ? value.contactIds : [],
    listIds: Array.isArray(value?.listIds) ? value.listIds : [],
  };
}

function normalizeSettingsConfig(
  value?: MarketingEmailSettingsConfig | null,
): MarketingEmailSettingsConfig {
  return {
    ...DEFAULT_SETTINGS,
    ...(value ?? {}),
    deliveryMode: value?.deliveryMode === "SCHEDULED" ? "SCHEDULED" : "NOW",
    scheduledAt:
      value?.deliveryMode === "SCHEDULED" ? value?.scheduledAt ?? null : null,
  };
}

function parseEditorStep(value?: string | null): EmailEditorStep {
  if (
    value === "criacao" ||
    value === "validacao" ||
    value === "envio"
  ) {
    return value;
  }
  return "configuracao";
}

function EmailEditorFlowHeader({
  currentStep,
  onStepChange,
}: {
  currentStep: EmailEditorStep;
  onStepChange: (step: EmailEditorStep) => void;
}) {
  const currentIndex = EMAIL_EDITOR_STEPS.findIndex(
    (step) => step.id === currentStep,
  );
  const currentStepNumber = currentIndex + 1;

  return (
    <section className="rounded-3xl border border-slate-200 bg-gray-50 p-4">
      <Stepper
        value={currentStepNumber}
        onValueChange={() => {}}
        variant="minimal"
        indicators={{
          completed: <Check className="h-3 w-3 text-white" />,
        }}
      >
        <StepperNav className="items-center gap-2 md:gap-3">
          {EMAIL_EDITOR_STEPS.map((step, index, arr) => (
            <StepperItem
              key={step.id}
              step={index + 1}
              isLast={index === arr.length - 1}
              disabled={index > currentIndex}
              className={`flex-1 ${
                index + 1 <= currentStepNumber ? "opacity-100" : "opacity-60"
              }`}
            >
              <StepperTrigger
                disabled={index > currentIndex}
                onClick={() => onStepChange(step.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md text-left",
                  index > currentIndex
                    ? "cursor-not-allowed"
                    : "cursor-pointer",
                )}
              >
                <StepperIndicator>
                  {index + 1 < currentStepNumber ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </StepperIndicator>
                <div className="flex flex-col max-w-[280px] md:max-w-[320px]">
                  <StepperTitle className="!mb-0">
                    {step.shortLabel}
                  </StepperTitle>
                  <StepperDescription className="!mt-0">
                    {index === 0
                      ? "Remetente, destinatários e assunto"
                      : index === 1
                        ? "Monte o conteúdo do e-mail"
                        : index === 2
                          ? "Revise o conteúdo final"
                          : "Defina o envio"}
                  </StepperDescription>
                </div>
              </StepperTrigger>
              <StepperSeparator hidden={index === arr.length - 1} />
            </StepperItem>
          ))}
        </StepperNav>
      </Stepper>
    </section>
  );
}

function CampaignStepCard({
  title,
  description,
  completed,
  summary,
  cta,
  onClick,
}: {
  title: string;
  description: string;
  completed: boolean;
  summary: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 last:border-b-0 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px]",
            completed
              ? "border-emerald-200 bg-emerald-500 text-white"
              : "border-slate-200 bg-slate-100 text-slate-400",
          )}
        >
          {completed ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Circle className="h-3 w-3 fill-current" />
          )}
        </span>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="mb-0! text-sm! font-semibold tracking-[-0.01em] text-slate-950">
              {title}
            </h3>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                completed
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-500",
              )}
            >
              {completed ? "Pronto" : "Pendente"}
            </span>
          </div>
          <p className="mb-0! text-sm! leading-5 text-slate-500">
            {description}
          </p>
          <p className="mb-0! text-xs! text-slate-700">{summary}</p>
        </div>
      </div>

      <ButtonCustom
        type="button"
        variant="outline"
        size="sm"
        onClick={onClick}
        className="shrink-0 rounded-xl border-slate-200 text-sm!"
      >
        {cta}
      </ButtonCustom>
    </div>
  );
}

function ValidationSectionCard({
  title,
  summary,
  details,
  onEdit,
  flush = false,
}: {
  title: string;
  summary: string;
  details?: string;
  onEdit?: () => void;
  flush?: boolean;
}) {
  return (
    <section
      className={cn(
        flush
          ? "flex flex-col gap-3 border-b border-slate-200 py-4 last:border-b-0 last:pb-0 first:pt-0"
          : "rounded-[24px] border border-slate-200 bg-white p-5",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h3 className="mb-0! text-xs! font-semibold uppercase tracking-[0.08em] text-slate-500">
            {title}
          </h3>
          <p className="mb-0! text-sm! font-medium text-slate-900">{summary}</p>
          {details ? (
            <p className="mb-0! text-sm! leading-5 text-slate-500">{details}</p>
          ) : null}
        </div>
        {onEdit ? (
          <ButtonCustom
            type="button"
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="shrink-0 rounded-xl border-slate-200"
          >
            Editar
          </ButtonCustom>
        ) : null}
      </div>
    </section>
  );
}

function ModalSectionHint({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <h3 className="mb-0! text-sm! font-semibold text-slate-950">{title}</h3>
      <p className="mb-0! text-sm! leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function EmailEditorLoadingSkeleton({
  step,
}: {
  step: EmailEditorStep;
}) {
  return (
    <div className="space-y-6 pb-32 md:pb-36">
      <section className="rounded-3xl border border-slate-200 bg-gray-50 p-4">
        <div className="grid gap-4 md:grid-cols-4">
          {EMAIL_EDITOR_STEPS.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {step === "configuracao" ? (
        <>
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-6">
            <div className="max-w-[720px] space-y-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 last:border-b-0 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <Skeleton className="mt-0.5 h-6 w-6 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-10 w-44 rounded-xl" />
              </div>
            ))}
          </section>
        </>
      ) : null}

      {step === "criacao" ? (
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-3">
                <Skeleton className="h-9 w-24 rounded-xl" />
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>
          <div className="grid min-h-[calc(100dvh-24rem)] gap-0 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
            <div className="border-b border-slate-200 p-4 xl:border-b-0 xl:border-r">
              <Skeleton className="h-full min-h-[480px] w-full rounded-2xl" />
            </div>
            <div className="border-b border-slate-200 bg-slate-100/70 p-4 xl:border-b-0 xl:border-r">
              <Skeleton className="mx-auto h-[520px] max-w-[760px] rounded-[28px]" />
            </div>
            <div className="p-4">
              <Skeleton className="h-full min-h-[480px] w-full rounded-2xl" />
            </div>
          </div>
        </section>
      ) : null}

      {step === "validacao" || step === "envio" ? (
        <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <section className="rounded-[24px] border border-slate-200 bg-white p-5">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-52" />
                    </div>
                    <Skeleton className="h-9 w-16 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white p-5">
            <Skeleton className="mb-4 h-9 w-48 rounded-xl" />
            <Skeleton className="h-[520px] w-full rounded-[24px]" />
          </section>
        </section>
      ) : null}

      <section className="sticky bottom-1 z-20">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 md:px-6">
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Skeleton className="h-11 w-40 rounded-xl" />
            <Skeleton className="h-11 w-52 rounded-xl" />
          </div>
        </div>
      </section>
    </div>
  );
}

export function EmailEditorShell({
  emailId,
  templateSlug = "blank",
}: EmailEditorShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReadOnly = searchParams?.get("mode") === "view";
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const initialBuilderPayload = useMemo(() => {
    return (
      buildDefaultMarketingEmailContentConfig(templateSlug).popupPayload ??
      convertEmailBuilderConfigToPopupPayload(
        buildDefaultMarketingEmailContentConfig(templateSlug).builder!,
        templateSlug,
      )
    );
  }, [templateSlug]);

  const [nome, setNome] = useState("Nova campanha de e-mail");
  const [assunto, setAssunto] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [builderPayload, setBuilderPayload] = useState<CreatePopupPayload>(
    initialBuilderPayload,
  );
  const [senderConfig, setSenderConfig] =
    useState<MarketingEmailSenderConfig | null>(null);
  const [senderDraft, setSenderDraft] =
    useState<MarketingEmailSenderConfig | null>(null);
  const [subjectDraft, setSubjectDraft] = useState<SubjectDraft | null>(null);
  const [targetConfig, setTargetConfig] = useState<MarketingEmailTargetConfig>(
    DEFAULT_MARKETING_EMAIL_TARGET_CONFIG,
  );
  const [settingsConfig, setSettingsConfig] =
    useState<MarketingEmailSettingsConfig>(DEFAULT_SETTINGS);
  const [activeSidebar, setActiveSidebar] = useState<ActiveSidebar>("BASE");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<"DESKTOP" | "MOBILE">("DESKTOP");
  const [zoom, setZoom] = useState("100");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSenderOpen, setIsSenderOpen] = useState(false);
  const [isRecipientsOpen, setIsRecipientsOpen] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);

  const draftStorageKey = useMemo(
    () =>
      emailId
        ? `marketing-email-editor:v${EMAIL_EDITOR_DRAFT_VERSION}:${emailId}`
        : `marketing-email-editor:v${EMAIL_EDITOR_DRAFT_VERSION}:new:${templateSlug}`,
    [emailId, templateSlug],
  );

  const currentStep = useMemo(
    () => parseEditorStep(searchParams?.get("step")),
    [searchParams],
  );

  const detailQuery = useQuery({
    queryKey: emailId
      ? queryKeys.marketingEmails.detail(emailId)
      : ["marketing-email-new"],
    queryFn: () => getMarketingEmailById(emailId as string),
    enabled: Boolean(emailId),
    refetchOnWindowFocus: false,
  });

  const recipientOptionsQuery = useQuery({
    queryKey: ["marketing-email-recipient-options"],
    queryFn: getMarketingEmailRecipientOptions,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const applyDefaultTemplateState = () => {
      setNome(initialBuilderPayload.nome || "Nova campanha de e-mail");
      setAssunto("");
      setPreviewText("");
      setBuilderPayload(initialBuilderPayload);
      setSenderConfig(null);
      setTargetConfig(DEFAULT_MARKETING_EMAIL_TARGET_CONFIG);
      setSettingsConfig(DEFAULT_SETTINGS);
    };

    try {
      const rawDraft = window.localStorage.getItem(draftStorageKey);
      if (!rawDraft) {
        if (!emailId) applyDefaultTemplateState();
        setIsDraftHydrated(true);
        return;
      }

      const parsedDraft = JSON.parse(rawDraft) as EmailEditorDraftStorage;
      const hasValidVersion =
        parsedDraft.version === EMAIL_EDITOR_DRAFT_VERSION;
      const isExpired =
        Date.now() - parseStoredDate(parsedDraft.updatedAt) > DRAFT_TTL_MS;

      if (!hasValidVersion || isExpired) {
        window.localStorage.removeItem(draftStorageKey);
        if (!emailId) applyDefaultTemplateState();
        setIsDraftHydrated(true);
        return;
      }

      setNome(parsedDraft.nome);
      setAssunto(parsedDraft.assunto);
      setPreviewText(parsedDraft.previewText);
      setBuilderPayload(parsedDraft.builderPayload);
      setSenderConfig(parsedDraft.senderConfig);
      setTargetConfig(normalizeTargetConfig(parsedDraft.targetConfig));
      setSettingsConfig(normalizeSettingsConfig(parsedDraft.settingsConfig));
    } catch {
      window.localStorage.removeItem(draftStorageKey);
      if (!emailId) {
        setNome(initialBuilderPayload.nome || "Nova campanha de e-mail");
        setAssunto("");
        setPreviewText("");
        setBuilderPayload(initialBuilderPayload);
        setSenderConfig(null);
        setTargetConfig(DEFAULT_MARKETING_EMAIL_TARGET_CONFIG);
        setSettingsConfig(DEFAULT_SETTINGS);
      }
    } finally {
      setIsDraftHydrated(true);
    }
  }, [draftStorageKey, emailId, initialBuilderPayload]);

  useEffect(() => {
    if (!detailQuery.data) return;

    const email = detailQuery.data;
    setNome(email.nome);
    setAssunto(email.assunto ?? "");
    setPreviewText(email.previewText ?? "");
    setBuilderPayload(getBuilderPayloadFromDetail(email, templateSlug));
    setSenderConfig(
      email.senderConfig ?? recipientOptionsQuery.data?.sender ?? null,
    );
    setTargetConfig(normalizeTargetConfig(email.targetConfig));
    setSettingsConfig(normalizeSettingsConfig(email.settingsConfig));
  }, [detailQuery.data, recipientOptionsQuery.data?.sender, templateSlug]);

  useEffect(() => {
    if (!senderConfig && recipientOptionsQuery.data?.sender) {
      setSenderConfig(recipientOptionsQuery.data.sender);
    }
  }, [recipientOptionsQuery.data?.sender, senderConfig]);

  useEffect(() => {
    if (!isDraftHydrated) return;

    const draft: EmailEditorDraftStorage = {
      version: EMAIL_EDITOR_DRAFT_VERSION,
      nome,
      assunto,
      previewText,
      templateSlug,
      builderPayload,
      senderConfig,
      targetConfig,
      settingsConfig,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
  }, [
    assunto,
    builderPayload,
    draftStorageKey,
    isDraftHydrated,
    nome,
    previewText,
    senderConfig,
    settingsConfig,
    targetConfig,
    templateSlug,
  ]);

  useEffect(() => {
    const root = buildBuilderTreeFromPayload(builderPayload);
    if (!selectedNodeId) {
      setSelectedNodeId(root.id);
      return;
    }

    const ids = new Set([
      root.id,
      ...root.areas.map((area) => area.id),
      ...root.areas.flatMap((area) => area.children.map((node) => node.id)),
    ]);

    if (!ids.has(selectedNodeId)) setSelectedNodeId(root.id);
  }, [builderPayload, selectedNodeId]);

  const saveMutation = useMutation({
    mutationFn: async (nextStatus: "RASCUNHO" | "PUBLICADO") => {
      const payload: CreateMarketingEmailPayload = {
        nome,
        status: nextStatus,
        tipo: "CAMPANHA",
        assunto: assunto || null,
        previewText: previewText || null,
        templateSlug,
        htmlContent: null,
        contentConfig: {
          builder: convertPopupPayloadToEmailBuilderConfig(builderPayload),
          popupPayload: builderPayload,
        },
        targetConfig,
        senderConfig:
          senderConfig ?? recipientOptionsQuery.data?.sender ?? null,
        settingsConfig,
        destinatariosEstimados: 0,
      };

      if (emailId) {
        return updateMarketingEmail(emailId, payload);
      }

      return createMarketingEmail(payload);
    },
    onSuccess: async (result, nextStatus) => {
      toastCustom.success(
        nextStatus === "PUBLICADO"
          ? "Campanha preparada e publicada."
          : "Rascunho salvo com sucesso.",
      );
      await queryClient.invalidateQueries({
        queryKey: ["admin-marketing-emails-list"],
      });
      if (!emailId) {
        router.replace(
          `/dashboard/marketing/emails/${result.id}/editar?step=${currentStep}`,
        );
      } else {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.marketingEmails.detail(emailId),
        });
      }
    },
    onError: (error) => {
      toastCustom.error(
        error?.message || "Não foi possível salvar a campanha.",
      );
    },
  });

  const previewPosition = useMemo(
    () =>
      viewport === "DESKTOP"
        ? builderPayload.posicaoDesktop
        : builderPayload.posicaoMobile,
    [builderPayload.posicaoDesktop, builderPayload.posicaoMobile, viewport],
  );

  const zoomOptions = useMemo(
    () => [
      { value: "75", label: "75%" },
      { value: "90", label: "90%" },
      { value: "100", label: "100%" },
    ],
    [],
  );

  const senderSummary = senderConfig
    ? `${senderConfig.displayName} · ${senderConfig.fromEmail}`
    : "Remetente não definido";
  const filteredRecipientOptions = useMemo(() => {
    const contatos = recipientOptionsQuery.data?.contatos ?? [];
    const search = recipientSearch.trim().toLowerCase();

    if (!search) return contatos;

    return contatos.filter((contato) => {
      const nome = contato.nome.toLowerCase();
      const email = contato.email?.toLowerCase() ?? "";

      return nome.includes(search) || email.includes(search);
    });
  }, [recipientOptionsQuery.data?.contatos, recipientSearch]);

  const recipientSummary = useMemo(() => {
    if (targetConfig.audienceType === "ALL_CONTACTS") {
      return "Todos os contatos";
    }

    if (targetConfig.audienceType === "LISTS") {
      const total = targetConfig.listIds.length;
      return total === 1
        ? "1 lista selecionada"
        : `${total} listas selecionadas`;
    }

    const total = targetConfig.contactIds.length;
    return total === 1
      ? "1 contato selecionado"
      : `${total} contatos selecionados`;
  }, [targetConfig]);

  const scheduledDate = useMemo(
    () => parseScheduledDate(settingsConfig.scheduledAt),
    [settingsConfig.scheduledAt],
  );
  const scheduledTime = useMemo(
    () => formatScheduledTime(settingsConfig.scheduledAt),
    [settingsConfig.scheduledAt],
  );

  const isSubjectReady = Boolean(assunto.trim() && previewText.trim());
  const isNameReady = Boolean(nome.trim());
  const isCreationReady = Boolean(
    buildBuilderTreeFromPayload(builderPayload).areas.some(
      (area) => area.children.length > 0,
    ),
  );
  const isSenderReady = Boolean(
    senderConfig?.displayName?.trim() && senderConfig?.fromEmail?.trim(),
  );
  const isScheduledAtValid = Boolean(
    settingsConfig.deliveryMode !== "SCHEDULED" ||
      (scheduledDate &&
        !Number.isNaN(scheduledDate.getTime()) &&
        scheduledDate.getTime() > Date.now()),
  );
  const isSenderDraftReady = Boolean(
    senderDraft?.displayName?.trim() && senderDraft?.fromEmail?.trim(),
  );
  const isSubjectDraftReady = Boolean(
    subjectDraft?.subject.trim() && subjectDraft?.previewText.trim(),
  );
  const isRecipientsReady =
    targetConfig.audienceType === "ALL_CONTACTS" ||
    targetConfig.listIds.length > 0 ||
    targetConfig.contactIds.length > 0;
  const isConfigurationReady =
    isNameReady && isSenderReady && isRecipientsReady && isSubjectReady;
  const isDeliveryReady =
    settingsConfig.deliveryMode === "NOW" || isScheduledAtValid;
  const contentBlockCount = useMemo(
    () =>
      buildBuilderTreeFromPayload(builderPayload).areas.reduce(
        (total, area) => total + area.children.length,
        0,
      ),
    [builderPayload],
  );

  const handleMoveNode = (nodeId: string, direction: "up" | "down") => {
    const root = buildBuilderTreeFromPayload(builderPayload);
    const area = findAreaForNode(root, nodeId);
    if (!area) return;

    const currentIndex = area.children.findIndex((node) => node.id === nodeId);
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= area.children.length
    ) {
      return;
    }

    const nextChildren = [...area.children];
    const [moving] = nextChildren.splice(currentIndex, 1);
    nextChildren.splice(targetIndex, 0, moving);

    const nextRoot = {
      ...root,
      areas: root.areas.map((item) =>
        item.id === area.id ? { ...item, children: nextChildren } : item,
      ),
    };

    setBuilderPayload(
      syncBuilderTreeToLegacy(updateBuilderRoot(builderPayload, nextRoot)),
    );
    setSelectedNodeId(nodeId);
  };

  const handleRemoveNode = (nodeId: string) => {
    const root = buildBuilderTreeFromPayload(builderPayload);
    const nextRoot = removeNodeFromBuilder(root, nodeId);
    setBuilderPayload(
      syncBuilderTreeToLegacy(updateBuilderRoot(builderPayload, nextRoot)),
    );
    setSelectedNodeId(nextRoot.id);
  };

  const handleBuilderDragStart = (event: DragStartEvent) => {
    if (activeSidebar !== "BLOCKS") return;
    setActiveDragId(String(event.active.id));
  };

  const handleBuilderDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    if (activeSidebar !== "BLOCKS") return;

    const { active, over } = event;
    if (!over) return;

    const root = buildBuilderTreeFromPayload(builderPayload);
    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith("palette:")) {
      const type = activeId.replace("palette:", "");
      const targetArea =
        root.areas.find((area) => area.id === overId) ??
        findAreaForNode(root, overId) ??
        root.areas.find(
          (area) => area.id === resolvePreferredAreaId(root, selectedNodeId),
        ) ??
        root.areas[0];

      if (!targetArea) return;

      const nextRoot = addNodeToArea(
        root,
        targetArea.id,
        createAtomicNode(type as any),
      );
      const inserted = nextRoot.areas
        .find((area) => area.id === targetArea.id)
        ?.children.at(-1);
      setBuilderPayload(
        syncBuilderTreeToLegacy(updateBuilderRoot(builderPayload, nextRoot)),
      );
      setSelectedNodeId(inserted?.id ?? targetArea.id);
      return;
    }

    if (activeId === overId) return;

    const sourceArea = findAreaForNode(root, activeId);
    if (!sourceArea) return;

    const targetArea =
      root.areas.find((area) => area.id === overId) ??
      findAreaForNode(root, overId);
    if (!targetArea) return;

    const targetIndex =
      targetArea.id === overId
        ? targetArea.children.length
        : targetArea.children.findIndex((node) => node.id === overId);

    const nextRoot = moveNodeBetweenAreas(
      root,
      activeId,
      targetArea.id,
      targetIndex < 0 ? undefined : targetIndex,
    );

    setBuilderPayload(
      syncBuilderTreeToLegacy(updateBuilderRoot(builderPayload, nextRoot)),
    );
    setSelectedNodeId(activeId);
  };

  const toggleValue = (key: "contactIds" | "listIds", value: string) => {
    setTargetConfig((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  };

  const navigateToStep = (step: EmailEditorStep) => {
    const params = new URLSearchParams(searchParams?.toString());

    params.set("step", step);
    if (!emailId) {
      params.set("template", templateSlug);
    } else {
      params.delete("template");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleStepChange = (step: EmailEditorStep) => {
    if (isReadOnly) return;
    navigateToStep(step);
  };

  useEffect(() => {
    const rawStep = searchParams?.get("step");
    if (
      rawStep === "configuracao" ||
      rawStep === "criacao" ||
      rawStep === "validacao" ||
      rawStep === "envio"
    ) {
      return;
    }

    const params = new URLSearchParams(searchParams?.toString());
    params.set("step", "configuracao");
    if (!emailId) {
      params.set("template", templateSlug);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [emailId, pathname, router, searchParams, templateSlug]);

  const isEditorLoading =
    Boolean(emailId) &&
    (!isDraftHydrated ||
      detailQuery.isLoading ||
      recipientOptionsQuery.isLoading);

  if (isEditorLoading) {
    return <EmailEditorLoadingSkeleton step={currentStep} />;
  }

  const handleOpenSenderModal = () => {
    setSenderDraft(
      senderConfig
        ? { ...senderConfig }
        : recipientOptionsQuery.data?.sender
          ? { ...recipientOptionsQuery.data.sender }
          : null,
    );
    setIsSenderOpen(true);
  };

  const handleCloseSenderModal = () => {
    setSenderDraft(null);
    setIsSenderOpen(false);
  };

  const handleSaveSenderModal = () => {
    if (!isSenderDraftReady || !senderDraft) return;
    setSenderConfig({ ...senderDraft });
    setSenderDraft(null);
    setIsSenderOpen(false);
  };

  const handleOpenSubjectModal = () => {
    setSubjectDraft({
      subject: assunto,
      previewText,
    });
    setIsSubjectOpen(true);
  };

  const handleCloseSubjectModal = () => {
    setSubjectDraft(null);
    setIsSubjectOpen(false);
  };

  const handleSaveSubjectModal = () => {
    if (!isSubjectDraftReady || !subjectDraft) return;
    setAssunto(subjectDraft.subject.trim());
    setPreviewText(subjectDraft.previewText.trim());
    setSubjectDraft(null);
    setIsSubjectOpen(false);
  };

  const handleDeliveryModeChange = (mode: "NOW" | "SCHEDULED") => {
    setSettingsConfig((current) => ({
      ...current,
      deliveryMode: mode,
      scheduledAt:
        mode === "SCHEDULED"
          ? current.scheduledAt || createDefaultScheduledAt()
          : null,
    }));
  };

  const handleScheduledDateChange = (date: Date | null) => {
    setSettingsConfig((current) => ({
      ...current,
      scheduledAt: combineDateAndTime(
        date,
        formatScheduledTime(current.scheduledAt) || "09:00",
      ),
    }));
  };

  const handleScheduledTimeChange = (time: string) => {
    setSettingsConfig((current) => ({
      ...current,
      scheduledAt: combineDateAndTime(
        parseScheduledDate(current.scheduledAt) ?? new Date(),
        time,
      ),
    }));
  };

  return (
    <div className="space-y-6 pb-32 md:pb-36">
      {currentStep === "configuracao" ? (
        <>
          <EmailEditorFlowHeader
            currentStep={currentStep}
            onStepChange={handleStepChange}
          />

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-6">
            <div className="max-w-[720px]">
              <InputCustom
                label="Nome da campanha"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                required
                placeholder="Nome da campanha"
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
            <CampaignStepCard
              title="Remetente"
              description="Quem está enviando esta campanha de e-mail?"
              completed={isSenderReady}
              summary={senderSummary}
              cta="Gerenciar remetente"
              onClick={handleOpenSenderModal}
            />
            <CampaignStepCard
              title="Destinatários"
              description="As pessoas que recebem sua campanha"
              completed={isRecipientsReady}
              summary={recipientSummary}
              cta="Adicionar destinatários"
              onClick={() => setIsRecipientsOpen(true)}
            />
            <CampaignStepCard
              title="Assunto"
              description="Adicione uma linha de assunto para esta campanha."
              completed={isSubjectReady}
              summary={
                assunto.trim()
                  ? `${assunto}${previewText.trim() ? ` · ${previewText}` : ""}`
                  : "Nenhum assunto definido ainda."
              }
              cta="Adicionar assunto"
              onClick={handleOpenSubjectModal}
            />
          </section>
        </>
      ) : null}

      {currentStep === "criacao" ? (
        <>
          <EmailEditorFlowHeader
            currentStep={currentStep}
            onStepChange={handleStepChange}
          />
        </>
      ) : null}

      {currentStep === "criacao" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleBuilderDragStart}
          onDragEnd={handleBuilderDragEnd}
          onDragCancel={() => setActiveDragId(null)}
        >
          <BuildMarketing
            sections={[
              { id: "BASE", label: "Base", icon: "Settings" },
              { id: "BLOCKS", label: "Blocos", icon: "Layout" },
            ]}
            activeSection={activeSidebar}
            onSectionChange={(sectionId) => {
              const next = sectionId as ActiveSidebar;
              setActiveSidebar(next);
              if (next === "BLOCKS") {
                setSelectedNodeId(
                  buildBuilderTreeFromPayload(builderPayload).id,
                );
              }
            }}
            sidebarTitle={activeSidebar === "BLOCKS" ? "Blocos" : "Base"}
            sidebarSubtitle={
              activeSidebar === "BLOCKS"
                ? "Biblioteca, ordem e elementos do e-mail."
                : "Configurações visuais e estruturais do conteúdo."
            }
            sidebarContent={
              activeSidebar === "BLOCKS" ? (
                <PopupContentBuilder
                  value={builderPayload}
                  onChange={setBuilderPayload}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                  hiddenAtomicTypes={["CONSENT", "ROULETTE"]}
                />
              ) : (
                <PopupSettingsPanelContent
                  value={builderPayload}
                  onChange={setBuilderPayload}
                  tab="BASE"
                />
              )
            }
            toolbar={
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setViewport("DESKTOP")}
                    aria-label="Visualizar em desktop"
                    className={cn(
                      "flex h-9 cursor-pointer items-center gap-2 px-3.5 text-sm! font-medium transition-colors",
                      viewport === "DESKTOP"
                        ? "bg-[var(--primary-color)] text-white"
                        : "text-slate-600",
                    )}
                  >
                    <Monitor className="h-4 w-4" />
                    Web
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewport("MOBILE")}
                    aria-label="Visualizar em mobile"
                    className={cn(
                      "flex h-9 cursor-pointer items-center gap-2 px-3.5 text-sm! font-medium transition-colors",
                      viewport === "MOBILE"
                        ? "bg-[var(--primary-color)] text-white"
                        : "text-slate-600",
                    )}
                  >
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </button>
                </div>

                <SelectCustom
                  options={zoomOptions}
                  value={zoom}
                  onChange={(value) => setZoom(value ?? "100")}
                  searchable={false}
                  clearable={false}
                  fullWidth={false}
                  size="sm"
                  className="w-[110px] [&_button]:cursor-pointer"
                />
              </div>
            }
            contentClassName="p-0"
          >
            <div
              className={cn(
                "grid h-full min-h-[calc(100dvh-22rem)]",
                activeSidebar === "BLOCKS"
                  ? "xl:grid-cols-[minmax(0,1fr)_360px]"
                  : "grid-cols-1",
              )}
            >
              <div className="border-b border-slate-200 bg-slate-100/70 px-3 py-4 xl:border-b-0 xl:border-r">
                <div
                  className="origin-top transition-transform"
                  style={{ transform: `scale(${Number(zoom) / 100})` }}
                >
                  <div className="mx-auto max-w-[760px] rounded-[28px] border border-slate-200 bg-white p-4">
                    <PopupPreview
                      content={builderPayload.contentConfig}
                      fields={builderPayload.formFields}
                      design={builderPayload.designConfig}
                      viewport={viewport}
                      position={previewPosition}
                      editable={activeSidebar === "BLOCKS"}
                      selectedNodeId={selectedNodeId}
                      onSelectNode={setSelectedNodeId}
                      onMoveNode={handleMoveNode}
                      onRemoveNode={handleRemoveNode}
                    />
                  </div>
                </div>
              </div>

              {activeSidebar === "BLOCKS" ? (
                <PopupBlockInspector
                  value={builderPayload}
                  onChange={setBuilderPayload}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                  flush
                />
              ) : null}
            </div>
          </BuildMarketing>

          <DragOverlay>
            {activeDragId?.startsWith("palette:") ? (
              <AtomicDragPreview
                type={activeDragId.replace("palette:", "") as any}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : null}

      {currentStep === "validacao" ? (
        <>
          <EmailEditorFlowHeader
            currentStep={currentStep}
            onStepChange={handleStepChange}
          />

          <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
            <div className="space-y-4">
              <section className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="pt-4">
                  <ValidationSectionCard
                    flush
                    title="Remetente"
                    summary={senderSummary}
                    onEdit={
                      isReadOnly
                        ? undefined
                        : () => navigateToStep("configuracao")
                    }
                  />
                  <ValidationSectionCard
                    flush
                    title="Destinatários"
                    summary={recipientSummary}
                    onEdit={
                      isReadOnly
                        ? undefined
                        : () => navigateToStep("configuracao")
                    }
                  />
                  <ValidationSectionCard
                    flush
                    title="Assunto"
                    summary={assunto || "Assunto não definido"}
                    details={previewText || undefined}
                    onEdit={
                      isReadOnly
                        ? undefined
                        : () => navigateToStep("configuracao")
                    }
                  />
                  <ValidationSectionCard
                    flush
                    title="Conteúdo"
                    summary={
                      contentBlockCount === 1
                        ? "1 bloco"
                        : `${contentBlockCount} blocos`
                    }
                    details={
                      isCreationReady
                        ? "Conteúdo pronto"
                        : "Conteúdo não definido"
                    }
                    onEdit={
                      isReadOnly ? undefined : () => navigateToStep("criacao")
                    }
                  />
                </div>
              </section>

            </div>

            <section className="rounded-[24px] border border-slate-200 bg-white p-4 md:p-5">
              <div className="mb-4 flex items-center justify-end gap-3">
                <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setViewport("DESKTOP")}
                    aria-label="Visualizar em desktop"
                    className={cn(
                      "flex h-9 cursor-pointer items-center gap-2 px-3.5 text-sm! font-medium transition-colors",
                      viewport === "DESKTOP"
                        ? "bg-[var(--primary-color)] text-white"
                        : "text-slate-600",
                    )}
                  >
                    <Monitor className="h-4 w-4" />
                    Web
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewport("MOBILE")}
                    aria-label="Visualizar em mobile"
                    className={cn(
                      "flex h-9 cursor-pointer items-center gap-2 px-3.5 text-sm! font-medium transition-colors",
                      viewport === "MOBILE"
                        ? "bg-[var(--primary-color)] text-white"
                        : "text-slate-600",
                    )}
                  >
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </button>
                </div>
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-[#f8fafc] p-3 md:p-4">
                <PopupPreview
                  content={builderPayload.contentConfig}
                  fields={builderPayload.formFields}
                  design={builderPayload.designConfig}
                  viewport={viewport}
                  position={previewPosition}
                />
              </div>
            </section>
          </section>
        </>
      ) : null}

      {currentStep === "envio" ? (
        <>
          <EmailEditorFlowHeader
            currentStep={currentStep}
            onStepChange={handleStepChange}
          />

          <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5">
              <div className="space-y-1 border-b border-slate-200 pb-4">
                <h3 className="mb-0! text-sm! font-semibold text-slate-950">
                  Resumo
                </h3>
                <p className="mb-0! text-sm! text-slate-500">
                  Última revisão antes do envio.
                </p>
              </div>

              <div className="pt-4">
                <ValidationSectionCard
                  flush
                  title="Remetente"
                  summary={senderSummary}
                />
                <ValidationSectionCard
                  flush
                  title="Destinatários"
                  summary={recipientSummary}
                />
                <ValidationSectionCard
                  flush
                  title="Assunto"
                  summary={assunto || "Assunto não definido"}
                  details={previewText || undefined}
                />
                <ValidationSectionCard
                  flush
                  title="Conteúdo"
                  summary={
                    contentBlockCount === 1
                      ? "1 bloco"
                      : `${contentBlockCount} blocos`
                  }
                />
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5">
              <div className="space-y-1 border-b border-slate-200 pb-4">
                <h3 className="mb-0! text-sm! font-semibold text-slate-950">
                  Quando você gostaria de enviar a campanha?
                </h3>
                <p className="mb-0! text-sm! text-slate-500">
                  Escolha envio imediato ou agendado.
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition",
                    settingsConfig.deliveryMode === "NOW"
                      ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5"
                      : "border-slate-200 bg-white hover:border-slate-300",
                  )}
                >
                  <input
                    type="radio"
                    name="delivery-mode"
                    className="mt-1 h-4 w-4 accent-[var(--primary-color)]"
                    checked={settingsConfig.deliveryMode === "NOW"}
                    onChange={() => handleDeliveryModeChange("NOW")}
                  />
                  <div className="space-y-1">
                    <p className="mb-0! text-sm! font-medium text-slate-900">
                      Enviar agora
                    </p>
                    <p className="mb-0! text-sm! text-slate-500">
                      Dispara a campanha assim que for confirmada.
                    </p>
                  </div>
                </label>

                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition",
                    settingsConfig.deliveryMode === "SCHEDULED"
                      ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5"
                      : "border-slate-200 bg-white hover:border-slate-300",
                  )}
                >
                  <input
                    type="radio"
                    name="delivery-mode"
                    className="mt-1 h-4 w-4 accent-[var(--primary-color)]"
                    checked={settingsConfig.deliveryMode === "SCHEDULED"}
                    onChange={() => handleDeliveryModeChange("SCHEDULED")}
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="mb-0! text-sm! font-medium text-slate-900">
                      Agendar para mais tarde
                    </p>
                    <p className="mb-0! text-sm! text-slate-500">
                      Defina a data e o horário do envio automático.
                    </p>
                  </div>
                </label>

                {settingsConfig.deliveryMode === "SCHEDULED" ? (
                  <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-2">
                    <DatePickerCustom
                      label="Data do envio"
                      value={scheduledDate}
                      onChange={handleScheduledDateChange}
                      placeholder="Selecionar data"
                      minDate={MIN_SEND_DATE}
                      required
                      clearable
                      error={
                        !scheduledDate || isScheduledAtValid
                          ? undefined
                          : "Escolha uma data futura"
                      }
                    />
                    <TimeInputCustom
                      label="Horário do envio"
                      value={scheduledTime}
                      onChange={handleScheduledTimeChange}
                      required
                      error={
                        scheduledTime || isScheduledAtValid
                          ? undefined
                          : "Informe o horário"
                      }
                    />
                  </div>
                ) : null}
              </div>
            </section>
          </section>
        </>
      ) : null}

      {!isReadOnly ? (
      <section className="sticky bottom-1 z-20">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 md:px-6">
          <div className="flex flex-wrap items-center justify-end gap-3">
            {currentStep === "configuracao" ? (
              <>
                <ButtonCustom
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => saveMutation.mutate("RASCUNHO")}
                  disabled={saveMutation.isPending || !isNameReady}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Salvar rascunho
                </ButtonCustom>
                <ButtonCustom
                  type="button"
                  size="lg"
                  onClick={() => navigateToStep("criacao")}
                  disabled={!isConfigurationReady}
                >
                  Continuar para criação
                </ButtonCustom>
              </>
            ) : null}

            {currentStep === "criacao" ? (
              <>
                <ButtonCustom
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => saveMutation.mutate("RASCUNHO")}
                  disabled={saveMutation.isPending || !isNameReady}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Salvar rascunho
                </ButtonCustom>
                <ButtonCustom
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigateToStep("configuracao")}
                >
                  Voltar para configuração
                </ButtonCustom>
                <ButtonCustom
                  type="button"
                  size="lg"
                  onClick={() => navigateToStep("validacao")}
                  disabled={!isCreationReady}
                >
                  Continuar para validação
                </ButtonCustom>
              </>
            ) : null}

            {currentStep === "validacao" ? (
              <>
                <ButtonCustom
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => saveMutation.mutate("RASCUNHO")}
                  disabled={saveMutation.isPending || !isNameReady}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Salvar rascunho
                </ButtonCustom>
                <ButtonCustom
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setIsPreviewOpen(true)}
                  disabled={!isCreationReady}
                  >
                    <Eye className="h-4 w-4" />
                    Pré-visualizar e testar
                  </ButtonCustom>
                  <ButtonCustom
                    type="button"
                    size="lg"
                    onClick={() => navigateToStep("envio")}
                    disabled={!isConfigurationReady || !isCreationReady}
                  >
                    Continuar para envio
                  </ButtonCustom>
                </>
            ) : null}

            {currentStep === "envio" ? (
              <>
                <ButtonCustom
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => saveMutation.mutate("RASCUNHO")}
                  disabled={saveMutation.isPending || !isNameReady}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Salvar rascunho
                </ButtonCustom>
                <ButtonCustom
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setIsPreviewOpen(true)}
                  disabled={!isCreationReady}
                >
                  <Eye className="h-4 w-4" />
                  Pré-visualizar e testar
                </ButtonCustom>
                <ButtonCustom
                  type="button"
                  size="lg"
                  onClick={() => saveMutation.mutate("PUBLICADO")}
                  disabled={
                    saveMutation.isPending ||
                    !isConfigurationReady ||
                    !isCreationReady ||
                    !isDeliveryReady
                  }
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {settingsConfig.deliveryMode === "SCHEDULED"
                    ? "Agendar envio"
                    : "Enviar agora"}
                </ButtonCustom>
              </>
            ) : null}
          </div>
        </div>
      </section>
      ) : null}

      <ModalCustom
        isOpen={isSenderOpen}
        onClose={handleCloseSenderModal}
        size="xl"
        backdrop="blur"
      >
        <ModalContentWrapper>
          <ModalHeader>
            <ModalTitle>Remetente</ModalTitle>
          </ModalHeader>
          <ModalBody className="space-y-5">
            <div className="space-y-4 p-1">
              <InputCustom
                label="Endereço de e-mail"
                value={senderDraft?.fromEmail ?? ""}
                disabled
                required
              />
              <InputCustom
                label="Nome exibido"
                required
                value={senderDraft?.displayName ?? ""}
                onChange={(event) =>
                  setSenderDraft((current) =>
                    current
                      ? { ...current, displayName: event.target.value }
                      : null,
                  )
                }
              />
            </div>
          </ModalBody>
          <ModalFooter className="justify-end gap-3">
            <ButtonCustom variant="outline" onClick={handleCloseSenderModal}>
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              onClick={handleSaveSenderModal}
              disabled={!isSenderDraftReady}
            >
              Salvar
            </ButtonCustom>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>

      <ModalCustom
        isOpen={isRecipientsOpen}
        onClose={() => setIsRecipientsOpen(false)}
        size="3xl"
        backdrop="blur"
        scrollBehavior="outside"
      >
        <ModalContentWrapper>
          <ModalHeader>
            <ModalTitle>Destinatários</ModalTitle>
          </ModalHeader>
          <ModalBody className="overflow-visible">
            <div className="space-y-5">
              <SelectCustom
                label="Enviar para"
                options={AUDIENCE_OPTIONS.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                value={targetConfig.audienceType}
                onChange={(value) =>
                  value &&
                  setTargetConfig((current) => ({
                    ...current,
                    audienceType:
                      value as MarketingEmailTargetConfig["audienceType"],
                    contactIds: [],
                    listIds: [],
                  }))
                }
                searchable={false}
                clearable={false}
              />

              {targetConfig.audienceType === "LISTS" ? (
                <div className="space-y-3">
                  <MultiSelectCustom
                    label="Listas salvas"
                    options={
                      recipientOptionsQuery.data?.lists.map((list) => ({
                        value: list.id,
                        label: list.nome,
                        searchKeywords: [
                          list.nome,
                          String(list.recipientCount),
                        ],
                      })) ?? []
                    }
                    value={
                      recipientOptionsQuery.data?.lists
                        .filter((list) =>
                          targetConfig.listIds.includes(list.id),
                        )
                        .map((list) => ({
                          value: list.id,
                          label: list.nome,
                        })) ?? []
                    }
                    onChange={(options) =>
                      setTargetConfig((current) => ({
                        ...current,
                        listIds: options.map((option) => option.value),
                      }))
                    }
                    placeholder="Selecione uma ou mais listas"
                    emptyIndicator={
                      <div className="px-3 py-4 text-sm text-slate-500">
                        Nenhuma lista disponível.
                      </div>
                    }
                  />
                </div>
              ) : null}

              {targetConfig.audienceType === "MANUAL_CONTACTS" ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <InputCustom
                      label="Pesquisar contato"
                      placeholder="Buscar por nome ou e-mail"
                      value={recipientSearch}
                      onChange={(event) =>
                        setRecipientSearch(event.target.value)
                      }
                    />
                  </div>

                  <div className="max-h-[320px] space-y-2 overflow-y-auto p-3">
                    {filteredRecipientOptions.length ? (
                      filteredRecipientOptions.map((contato) => {
                        const active = targetConfig.contactIds.includes(
                          contato.id,
                        );

                        return (
                          <button
                            key={contato.id}
                            type="button"
                            onClick={() =>
                              toggleValue("contactIds", contato.id)
                            }
                            aria-pressed={active}
                            className={cn(
                              "flex w-full cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                              active
                                ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5"
                                : "border-slate-200 hover:border-slate-300",
                            )}
                          >
                            <AvatarCustom
                              name={contato.nome}
                              src={contato.avatarUrl ?? null}
                              size="md"
                              className="shrink-0"
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="mb-0! truncate text-sm! font-medium text-slate-900">
                                  {contato.nome}
                                </p>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                  {contato.status}
                                </span>
                                {contato.tag ? (
                                  <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                                    {contato.tag}
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1! mb-0! truncate text-xs! text-slate-500">
                                {contato.email || "Sem e-mail cadastrado"}
                              </p>
                            </div>

                            <div
                              className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                                active
                                  ? "border-[var(--primary-color)] bg-[var(--primary-color)] text-white"
                                  : "border-slate-300 bg-white text-transparent",
                              )}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center">
                        <p className="mb-1! text-sm! font-medium text-slate-900">
                          {recipientSearch.trim()
                            ? "Nenhum contato encontrado"
                            : "Nenhum contato disponível"}
                        </p>
                        <p className="mb-0! text-xs! text-slate-500">
                          {recipientSearch.trim()
                            ? "Ajuste a busca para localizar outro contato."
                            : "Cadastre contatos antes de montar uma audiência individual."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </ModalBody>
          <ModalFooter className="justify-end gap-3">
            <ButtonCustom
              variant="outline"
              onClick={() => setIsRecipientsOpen(false)}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom onClick={() => setIsRecipientsOpen(false)}>
              Salvar
            </ButtonCustom>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>

      <ModalCustom
        isOpen={isSubjectOpen}
        onClose={handleCloseSubjectModal}
        size="2xl"
        backdrop="blur"
      >
        <ModalContentWrapper>
          <ModalHeader>
            <ModalTitle>Assunto</ModalTitle>
          </ModalHeader>
          <ModalBody className="space-y-4 p-1">
            <InputCustom
              label="Assunto"
              value={subjectDraft?.subject ?? ""}
              onChange={(event) =>
                setSubjectDraft((current) => ({
                  subject: event.target.value,
                  previewText: current?.previewText ?? "",
                }))
              }
              required
            />
            <SimpleTextarea
              label="Pré-visualização do texto"
              value={subjectDraft?.previewText ?? ""}
              onChange={(event) =>
                setSubjectDraft((current) => ({
                  subject: current?.subject ?? "",
                  previewText: event.target.value,
                }))
              }
              rows={5}
              required
              maxLength={EMAIL_PREVIEW_TEXT_MAX_LENGTH}
              showCharCount
            />
          </ModalBody>
          <ModalFooter className="justify-end gap-3">
            <ButtonCustom variant="outline" onClick={handleCloseSubjectModal}>
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              onClick={handleSaveSubjectModal}
              disabled={!isSubjectDraftReady}
            >
              Salvar
            </ButtonCustom>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>

      <ModalCustom
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        size="5xl"
        backdrop="blur"
      >
        <ModalContentWrapper>
          <ModalHeader>
            <ModalTitle>Pré-visualização</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
              <PopupPreview
                content={builderPayload.contentConfig}
                fields={builderPayload.formFields}
                design={builderPayload.designConfig}
                viewport="DESKTOP"
                position={builderPayload.posicaoDesktop}
              />
            </div>
          </ModalBody>
        </ModalContentWrapper>
      </ModalCustom>
    </div>
  );
}
