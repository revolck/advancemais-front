"use client";

import type { ReactNode } from "react";
import { Laptop, MonitorSmartphone, Smartphone } from "lucide-react";

import type { CreatePopupPayload } from "@/api/websites/components/popups";
import {
  DatePickerRangeCustom,
  InputCustom,
  SelectCustom,
} from "@/components/ui/custom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  getPopupTriggerTargetsGroupedForScope,
  POPUP_SPECIFIC_PAGES,
} from "@/components/marketing-popups/triggerTargets";
import {
  POPUP_DEVICE_LABEL,
  POPUP_FREQUENCY_LABEL,
  POPUP_PAGE_RULE_LABEL,
  POPUP_POSITION_LABEL,
  POPUP_SCOPE_LABEL,
  POPUP_SPECIFIC_PAGE_LABEL,
  POPUP_STATUS_LABEL,
  POPUP_TRIGGER_LABEL,
} from "./constants";

interface PopupSettingsSidebarProps {
  value: CreatePopupPayload;
  onChange: (next: CreatePopupPayload) => void;
}

export type PopupSidebarTab = "BASE";

const option = (value: string, label: string) => ({ value, label });

const PAGE_RULE_DEFAULT = {
  mode: "ALL_PAGES" as const,
  urlContains: "",
  htmlSelector: "",
  pageKey: null,
};

function parseStoredDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toDayBoundaryIso(date: Date, edge: "start" | "end") {
  const next = new Date(date);
  if (edge === "start") {
    next.setHours(0, 0, 0, 0);
  } else {
    next.setHours(23, 59, 59, 999);
  }
  return next.toISOString();
}

function buildTriggerTargetOptions(
  scope: CreatePopupPayload["escopo"],
  trigger: CreatePopupPayload["gatilho"],
) {
  const groups = getPopupTriggerTargetsGroupedForScope(scope, trigger);
  const options: Array<{ value: string; label: string; disabled?: boolean }> =
    [];

  if (groups.site.length > 0) {
    options.push(option("__group-site", "Site"),);
    options[options.length - 1].disabled = true;
    options.push(...groups.site.map((target) => option(target.id, target.label)));
  }

  if (groups.dashboard.length > 0) {
    options.push(option("__group-dashboard", "Painel"));
    options[options.length - 1].disabled = true;
    options.push(
      ...groups.dashboard.map((target) => option(target.id, target.label)),
    );
  }

  return options;
}

function AccordionSection({
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
        <div className="w-full space-y-2.5 rounded-2xl px-2 py-2">
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function NativeRadioGroup<T extends string>({
  value,
  options,
  onChange,
  emphasizeCards = false,
}: {
  value: T;
  options: Array<{ value: T; label: string; hint?: string }>;
  onChange: (value: T) => void;
  emphasizeCards?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-2",
        emphasizeCards ? "grid-cols-3" : "sm:grid-cols-2",
      )}
    >
      {options.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            "cursor-pointer rounded-2xl border bg-white px-4 py-4 text-left transition-colors",
            emphasizeCards &&
              "flex min-h-[72px] flex-col items-center justify-center px-2 py-2 text-center",
            value === item.value
              ? "bg-[var(--primary-color)] shadow-[inset_0_0_0_1px_#06286B]"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
          )}
        >
          {emphasizeCards ? (
            <>
              <span
                className={cn(
                  "mb-1.5 text-slate-400",
                  value === item.value && "text-[var(--secondary-color)]",
                )}
              >
                {item.value === "AMBOS" ? (
                  <MonitorSmartphone className="h-4 w-4" />
                ) : item.value === "DESKTOP" ? (
                  <Laptop className="h-4 w-4" />
                ) : (
                  <Smartphone className="h-4 w-4" />
                )}
              </span>
              <span
                className={cn(
                  "block !text-sm leading-none font-medium text-slate-900 mt-1",
                  value === item.value && "text-white",
                )}
              >
                {item.label}
              </span>
            </>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span
                  className={cn(
                    "block !text-sm font-medium text-slate-900",
                    value === item.value && "text-white",
                  )}
                >
                  {item.label}
                </span>
                {item.hint && (
                  <span
                    className={cn(
                      "block !text-xs text-slate-500",
                      value === item.value && "text-white/80",
                    )}
                  >
                    {item.hint}
                  </span>
                )}
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

export function PopupSettingsSidebar({
  value,
  onChange,
}: PopupSettingsSidebarProps) {
  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-slate-200 bg-white">
      <PopupSettingsPanelContent value={value} onChange={onChange} tab="BASE" />
    </aside>
  );
}

interface PopupSettingsPanelContentProps {
  value: CreatePopupPayload;
  onChange: (next: CreatePopupPayload) => void;
  tab: PopupSidebarTab;
  embedded?: boolean;
}

export function PopupSettingsPanelContent({
  value,
  onChange,
  tab,
  embedded = false,
}: PopupSettingsPanelContentProps) {
  const pageRuleMode = value.pageRules?.mode ?? "ALL_PAGES";
  const isLegacyHtmlRule = pageRuleMode === "HTML_SELECTOR";
  const canUseSpecificPage = value.escopo !== "DASHBOARD";
  const triggerTargetOptions = buildTriggerTargetOptions(
    value.escopo,
    value.gatilho,
  );
  const pageRuleOptions = [
    option("ALL_PAGES", POPUP_PAGE_RULE_LABEL.ALL_PAGES),
    ...(canUseSpecificPage
      ? [option("SPECIFIC_PAGE", POPUP_PAGE_RULE_LABEL.SPECIFIC_PAGE)]
      : []),
    option("URL_CONTAINS", POPUP_PAGE_RULE_LABEL.URL_CONTAINS),
  ];

  const update = (patch: Partial<CreatePopupPayload>) => {
    onChange({ ...value, ...patch });
  };

  const updatePageRules = (
    patch: Partial<NonNullable<CreatePopupPayload["pageRules"]>>,
  ) => {
    update({
      pageRules: { ...(value.pageRules ?? PAGE_RULE_DEFAULT), ...patch },
    });
  };

  const updateSubscription = (
    patch: Partial<NonNullable<CreatePopupPayload["subscriptionConfig"]>>,
  ) => {
    update({
      subscriptionConfig: {
        ...(value.subscriptionConfig ?? {
          email: "DESCADASTRADOS_E_DESCONHECIDOS",
          whatsapp: "QUALQUER_UM",
        }),
        ...patch,
      },
    });
  };

  return (
    <div
      className={cn(
        "min-h-0 flex-1 space-y-2.5 overflow-y-auto",
        embedded ? "p-0" : "p-3",
      )}
    >
      {tab === "BASE" && (
        <Accordion
          type="multiple"
          defaultValue={[
            "status",
            "nome",
            "dispositivo",
            "posicao",
            "gatilho",
            "local",
            "exibicao",
            "segmentacao",
          ]}
          className="space-y-2"
        >
          <AccordionSection value="status" title="Status do popup">
            <SelectCustom
              label="Situação"
              options={Object.entries(POPUP_STATUS_LABEL).map(
                ([currentValue, label]) => option(currentValue, label),
              )}
              value={value.status}
              onChange={(status) =>
                status && update({ status: status as CreatePopupPayload["status"] })
              }
            />
          </AccordionSection>

          <AccordionSection value="nome" title="Nome do popup">
            <InputCustom
              label="Digite o nome do pop-up"
              value={value.nome}
              onChange={(event) => update({ nome: event.target.value })}
              maxLength={100}
              required
            />
          </AccordionSection>

          <AccordionSection value="dispositivo" title="Escolha um dispositivo">
            <NativeRadioGroup
              value={value.dispositivo}
              onChange={(dispositivo) => update({ dispositivo })}
              emphasizeCards
              options={[
                { value: "AMBOS", label: POPUP_DEVICE_LABEL.AMBOS },
                { value: "MOBILE", label: POPUP_DEVICE_LABEL.MOBILE },
                { value: "DESKTOP", label: POPUP_DEVICE_LABEL.DESKTOP },
              ]}
            />
          </AccordionSection>

          <AccordionSection
            value="posicao"
            title="Escolha a posição de exibição"
          >
            <SelectCustom
              label="Desktop"
              options={Object.entries(POPUP_POSITION_LABEL).map(
                ([value, label]) => option(value, label),
              )}
              value={value.posicaoDesktop}
              onChange={(posicaoDesktop) =>
                posicaoDesktop &&
                update({ posicaoDesktop: posicaoDesktop as never })
              }
            />
            <SelectCustom
              label="Mobile"
              options={Object.entries(POPUP_POSITION_LABEL).map(
                ([value, label]) => option(value, label),
              )}
              value={value.posicaoMobile}
              onChange={(posicaoMobile) =>
                posicaoMobile &&
                update({ posicaoMobile: posicaoMobile as never })
              }
            />
          </AccordionSection>

          <AccordionSection value="gatilho" title="Definir gatilhos">
            <SelectCustom
              label="Gatilho"
              options={Object.entries(POPUP_TRIGGER_LABEL).map(
                ([value, label]) => option(value, label),
              )}
              value={value.gatilho}
              onChange={(gatilho) => {
                if (!gatilho) return;
                const nextTrigger = gatilho as CreatePopupPayload["gatilho"];
                update({
                  gatilho: nextTrigger,
                  triggerTarget:
                    nextTrigger === "CLIQUE" || nextTrigger === "HOVER"
                      ? value.triggerTarget
                      : null,
                });
              }}
            />
            {value.gatilho === "ATRASO" && (
              <InputCustom
                label="Tempo de atraso"
                type="number"
                value={String(value.atrasoSegundos)}
                onChange={(event) =>
                  update({ atrasoSegundos: Number(event.target.value || 0) })
                }
              />
            )}
            {value.gatilho === "INATIVIDADE" && (
              <InputCustom
                label="Tempo de inatividade em segundos"
                type="number"
                value={String(value.inatividadeSegundos ?? 15)}
                onChange={(event) =>
                  update({
                    inatividadeSegundos: Number(event.target.value || 15),
                  })
                }
              />
            )}
            {value.gatilho === "SCROLL" && (
              <InputCustom
                label="Percentual de scroll"
                type="number"
                value={String(value.scrollPercentual ?? 50)}
                onChange={(event) =>
                  update({
                    scrollPercentual: Number(event.target.value || 50),
                  })
                }
              />
            )}
            {(value.gatilho === "CLIQUE" || value.gatilho === "HOVER") && (
              <SelectCustom
                label="Alvo do gatilho"
                required
                options={triggerTargetOptions}
                value={value.triggerTarget ?? null}
                onChange={(triggerTarget) =>
                  update({
                    triggerTarget: triggerTarget as CreatePopupPayload["triggerTarget"],
                    seletorAlvo: null,
                  })
                }
              />
            )}
          </AccordionSection>

          <AccordionSection value="local" title="Determinar o local">
            <SelectCustom
              label="Aplicação"
              options={Object.entries(POPUP_SCOPE_LABEL).map(([value, label]) =>
                option(value, label),
              )}
              value={value.escopo}
              onChange={(escopo) => {
                if (!escopo) return;
                const nextScope = escopo as CreatePopupPayload["escopo"];
                const allowedTargets = getPopupTriggerTargetsGroupedForScope(
                  nextScope,
                  value.gatilho,
                );
                const allowedTargetIds = [
                  ...allowedTargets.site,
                  ...allowedTargets.dashboard,
                ].map((target) => target.id);

                update({
                  escopo: nextScope,
                  triggerTarget:
                    value.triggerTarget &&
                    !allowedTargetIds.includes(value.triggerTarget)
                      ? null
                      : value.triggerTarget,
                  pageRules:
                    nextScope === "DASHBOARD" &&
                    (value.pageRules?.mode ?? "ALL_PAGES") === "SPECIFIC_PAGE"
                      ? { ...PAGE_RULE_DEFAULT }
                      : value.pageRules,
                });
              }}
            />
            <SelectCustom
              label="Regra de página"
              placeholder={
                isLegacyHtmlRule
                  ? "Selecione uma nova regra"
                  : "Selecione a regra"
              }
              options={pageRuleOptions}
              value={isLegacyHtmlRule ? null : pageRuleMode}
              onChange={(mode) => {
                if (!mode) return;

                if (mode === "SPECIFIC_PAGE") {
                  updatePageRules({
                    mode: "SPECIFIC_PAGE",
                    pageKey: value.pageRules?.pageKey ?? "HOME",
                    urlContains: "",
                    htmlSelector: "",
                  });
                  return;
                }

                if (mode === "URL_CONTAINS") {
                  updatePageRules({
                    mode: "URL_CONTAINS",
                    urlContains:
                      value.pageRules?.mode === "URL_CONTAINS"
                        ? value.pageRules.urlContains ?? ""
                        : "",
                    pageKey: null,
                    htmlSelector: "",
                  });
                  return;
                }

                updatePageRules({
                  mode: "ALL_PAGES",
                  urlContains: "",
                  pageKey: null,
                  htmlSelector: "",
                });
              }}
            />
            {isLegacyHtmlRule && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="!text-xs text-amber-700">
                  Esta regra usa um modo legado baseado em HTML. Escolha uma
                  nova regra antes de salvar.
                </p>
              </div>
            )}
            {pageRuleMode === "SPECIFIC_PAGE" && canUseSpecificPage && (
              <SelectCustom
                label="Página"
                required
                options={POPUP_SPECIFIC_PAGES.map((page) =>
                  option(page.key, POPUP_SPECIFIC_PAGE_LABEL[page.key]),
                )}
                value={value.pageRules?.pageKey ?? null}
                onChange={(pageKey) =>
                  updatePageRules({
                    pageKey: pageKey as NonNullable<
                      CreatePopupPayload["pageRules"]
                    >["pageKey"],
                  })
                }
              />
            )}
            {pageRuleMode === "URL_CONTAINS" && (
              <InputCustom
                label="Trecho da rota"
                required
                placeholder="/cursos"
                value={value.pageRules?.urlContains ?? ""}
                helperText="Use uma rota iniciando com '/'. Ex.: /cursos ou /dashboard/usuarios."
                onChange={(event) =>
                  updatePageRules({ urlContains: event.target.value })
                }
              />
            )}
          </AccordionSection>

          <AccordionSection value="exibicao" title="Cronograma e limites">
            <SelectCustom
              label="Cronograma"
              options={[
                option("EXIBIR_AGORA", "Exibir agora"),
                option("PERIODO", "Exibir durante um período"),
              ]}
              value={value.cronograma}
              onChange={(cronograma) =>
                cronograma && update({ cronograma: cronograma as never })
              }
            />
            {value.cronograma === "PERIODO" && (
              <DatePickerRangeCustom
                label="Período de exibição"
                required
                value={{
                  from: parseStoredDate(value.inicioEm),
                  to: parseStoredDate(value.fimEm),
                }}
                onChange={(range) =>
                  update({
                    inicioEm: range.from
                      ? toDayBoundaryIso(range.from, "start")
                      : null,
                    fimEm: range.to ? toDayBoundaryIso(range.to, "end") : null,
                  })
                }
                placeholder="Selecionar período"
              />
            )}
            <SelectCustom
              label="Frequência de exibição"
              options={Object.entries(POPUP_FREQUENCY_LABEL).map(
                ([value, label]) => option(value, label),
              )}
              value={value.frequencia}
              onChange={(frequencia) =>
                frequencia && update({ frequencia: frequencia as never })
              }
            />
          </AccordionSection>

          <AccordionSection
            value="segmentacao"
            title="Segmentação e identificação"
          >
            <InputCustom
              label="Status de inscrição de email"
              value={value.subscriptionConfig?.email ?? ""}
              onChange={(event) =>
                updateSubscription({ email: event.target.value })
              }
            />
            <InputCustom
              label="Status de inscrição de WhatsApp"
              value={value.subscriptionConfig?.whatsapp ?? ""}
              onChange={(event) =>
                updateSubscription({ whatsapp: event.target.value })
              }
            />
            <InputCustom
              label="Selecione a tag"
              value={value.tag ?? ""}
              onChange={(event) => update({ tag: event.target.value })}
            />
          </AccordionSection>
        </Accordion>
      )}

    </div>
  );
}
