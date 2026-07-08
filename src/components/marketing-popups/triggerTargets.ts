import type {
  PopupSpecificPageKey,
  PopupScope,
  PopupTrigger,
  PopupTriggerTarget,
} from "@/api/websites/components/popups";

interface PopupTriggerTargetDefinition {
  id: PopupTriggerTarget;
  label: string;
  scope: Exclude<PopupScope, "AMBOS">;
  triggers: Array<Extract<PopupTrigger, "CLIQUE" | "HOVER">>;
  routes?: string[];
}

export const POPUP_TRIGGER_TARGETS: PopupTriggerTargetDefinition[] = [
  {
    id: "website-logo",
    label: "Site: logo principal",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
    routes: ["/", "/sobre", "/cursos", "/recrutamento", "/treinamento", "/vagas"],
  },
  {
    id: "website-nav-home",
    label: "Site: menu Página Inicial",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
    routes: ["/", "/sobre", "/cursos", "/recrutamento", "/treinamento", "/vagas"],
  },
  {
    id: "website-nav-about",
    label: "Site: menu Sobre",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
    routes: ["/", "/sobre", "/cursos", "/recrutamento", "/treinamento", "/vagas"],
  },
  {
    id: "website-nav-courses",
    label: "Site: menu Cursos",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
    routes: ["/", "/cursos", "/vagas", "/recrutamento"],
  },
  {
    id: "website-nav-vagas",
    label: "Site: menu Vagas",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
    routes: ["/", "/cursos", "/vagas", "/recrutamento"],
  },
  {
    id: "website-nav-recruitment",
    label: "Site: menu Recrutamento & Seleção",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
    routes: ["/", "/recrutamento"],
  },
  {
    id: "website-nav-training",
    label: "Site: menu Treinamento In Company",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
    routes: ["/", "/treinamento"],
  },
  {
    id: "website-user-menu",
    label: "Site: menu do perfil",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
  },
  {
    id: "website-recrutamento-cta",
    label: "Site: botão da seção Recrutamento",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
    routes: ["/"],
  },
  {
    id: "website-footer-about",
    label: "Site: footer Quem Somos",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
  },
  {
    id: "website-footer-how-it-works",
    label: "Site: footer Como funciona",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
  },
  {
    id: "website-footer-how-to-buy",
    label: "Site: footer Como comprar",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
  },
  {
    id: "website-footer-cookie-preferences",
    label: "Site: footer Preferências de Cookies",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
  },
  {
    id: "website-footer-courses",
    label: "Site: footer Cursos",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
  },
  {
    id: "website-footer-for-business",
    label: "Site: footer Para empresas",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
  },
  {
    id: "website-footer-for-candidates",
    label: "Site: footer Para candidatos",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
  },
  {
    id: "website-footer-faq",
    label: "Site: footer FAQ",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
  },
  {
    id: "website-footer-help-center",
    label: "Site: footer Central de Ajuda",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
  },
  {
    id: "website-footer-ombudsman",
    label: "Site: footer Ouvidoria",
    scope: "WEBSITE",
    triggers: ["CLIQUE", "HOVER"],
  },
  {
    id: "dashboard-user-menu",
    label: "Painel: menu do perfil",
    scope: "DASHBOARD",
    triggers: ["CLIQUE", "HOVER"],
  },
  {
    id: "dashboard-sidebar-item",
    label: "Painel: item do menu lateral",
    scope: "DASHBOARD",
    triggers: ["CLIQUE", "HOVER"],
  },
  {
    id: "dashboard-vagas-create-button",
    label: "Painel: botão Cadastrar vaga",
    scope: "DASHBOARD",
    triggers: ["CLIQUE", "HOVER"],
    routes: ["/dashboard/empresas/vagas"],
  },
  {
    id: "dashboard-popup-new-button",
    label: "Painel: botão Novo popup",
    scope: "DASHBOARD",
    triggers: ["CLIQUE", "HOVER"],
    routes: ["/dashboard/marketing/popup"],
  },
  {
    id: "dashboard-popup-save-draft-button",
    label: "Painel: botão Salvar rascunho",
    scope: "DASHBOARD",
    triggers: ["CLIQUE", "HOVER"],
    routes: [
      "/dashboard/marketing/popup/criar",
      "/dashboard/marketing/popup/editor",
    ],
  },
  {
    id: "dashboard-popup-publish-button",
    label: "Painel: botão Publicar",
    scope: "DASHBOARD",
    triggers: ["CLIQUE", "HOVER"],
    routes: [
      "/dashboard/marketing/popup/criar",
      "/dashboard/marketing/popup/editor",
    ],
  },
];

export const POPUP_SPECIFIC_PAGES: Array<{
  key: PopupSpecificPageKey;
  label: string;
  path: string;
}> = [
  { key: "HOME", label: "Página inicial", path: "/" },
  { key: "ABOUT", label: "Sobre", path: "/sobre" },
  { key: "COURSES", label: "Cursos", path: "/cursos" },
  {
    key: "RECRUITMENT",
    label: "Recrutamento & seleção",
    path: "/recrutamento",
  },
  {
    key: "TRAINING",
    label: "Treinamento In Company",
    path: "/treinamento",
  },
  { key: "JOBS", label: "Vagas", path: "/vagas" },
  { key: "FAQ", label: "FAQ", path: "/faq" },
  {
    key: "PRIVACY",
    label: "Política de privacidade",
    path: "/politica-privacidade",
  },
  { key: "TERMS", label: "Termos de uso", path: "/termos-uso" },
];

export function getPopupTriggerTargetsForScope(
  scope: PopupScope,
  trigger?: PopupTrigger | null,
) {
  return POPUP_TRIGGER_TARGETS.filter((target) => {
    const matchesScope =
      scope === "AMBOS" ? true : target.scope === scope;
    const matchesTrigger = trigger
      ? target.triggers.includes(trigger as Extract<PopupTrigger, "CLIQUE" | "HOVER">)
      : true;
    return matchesScope && matchesTrigger;
  });
}

export function getPopupTriggerTargetsGroupedForScope(
  scope: PopupScope,
  trigger?: PopupTrigger | null,
) {
  const filtered = getPopupTriggerTargetsForScope(scope, trigger);

  return {
    site: filtered.filter((target) => target.scope === "WEBSITE"),
    dashboard: filtered.filter((target) => target.scope === "DASHBOARD"),
  };
}

export function getPopupTriggerTargetLabel(
  targetId?: PopupTriggerTarget | string | null,
) {
  if (!targetId) return null;
  return (
    POPUP_TRIGGER_TARGETS.find((target) => target.id === targetId)?.label ?? null
  );
}

export function getPopupSpecificPageByKey(
  pageKey?: PopupSpecificPageKey | string | null,
) {
  if (!pageKey) return null;
  return POPUP_SPECIFIC_PAGES.find((page) => page.key === pageKey) ?? null;
}
