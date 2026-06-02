"use client";

import React from "react";
import { VerticalTabs, type VerticalTabItem } from "@/components/ui/custom";

import { getConfiguracoesGerais } from "@/api/configuracoes-gerais";
import type {
  ConfigCategory,
  ConfigCategoryGroup,
} from "@/api/configuracoes-gerais/types";
import { toastCustom } from "@/components/ui/custom/toast";
import { GeralConfigPanel } from "./components/GeralConfigPanel";

const TAB_META: Record<
  ConfigCategory,
  { label: string; icon: VerticalTabItem["icon"] }
> = {
  mercadopago: { label: "Mercado Pago", icon: "CreditCard" },
  emails: { label: "E-mails", icon: "Mail" },
  agenda: { label: "Agenda", icon: "CalendarClock" },
  logs: { label: "Logs", icon: "ScrollText" },
  uploads: { label: "Uploads", icon: "UploadCloud" },
  integracoes: { label: "Integrações", icon: "Cable" },
};

const TAB_ORDER: ConfigCategory[] = [
  "mercadopago",
  "emails",
  "agenda",
  "logs",
  "uploads",
  "integracoes",
];

export default function GeralConfigPage() {
  const [groups, setGroups] = React.useState<ConfigCategoryGroup[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadConfig = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getConfiguracoesGerais();
      setGroups(response.data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as configurações.";
      toastCustom.error({
        title: "Configurações indisponíveis",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  const handleSaved = React.useCallback((updated: ConfigCategoryGroup) => {
    setGroups((current) =>
      current.map((group) =>
        group.category === updated.category ? updated : group,
      ),
    );
  }, []);

  const byCategory = React.useMemo(() => {
    return groups.reduce<Record<string, ConfigCategoryGroup>>((acc, group) => {
      acc[group.category] = group;
      return acc;
    }, {});
  }, [groups]);

  const items: VerticalTabItem[] = TAB_ORDER.map((category) => ({
    value: category,
    label: TAB_META[category].label,
    icon: TAB_META[category].icon,
    badge:
      byCategory[category]?.items.filter((item) => item.source === "DB")
        .length || undefined,
    content: (
      <GeralConfigPanel
        group={byCategory[category]}
        loading={loading}
        onSaved={handleSaved}
      />
    ),
  }));

  return (
    <div className="bg-white rounded-3xl p-5 h-full min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-1 min-h-0">
        <VerticalTabs
          items={items}
          defaultValue="mercadopago"
          variant="spacious"
          size="sm"
          withAnimation
          showIndicator
          tabsWidth="md"
          classNames={{
            root: "h-full",
            contentWrapper: "h-full overflow-hidden",
            tabsContent: "h-full overflow-auto p-6",
            tabsList: "p-2",
            tabsTrigger: "mb-1",
          }}
        />
      </div>
    </div>
  );
}
