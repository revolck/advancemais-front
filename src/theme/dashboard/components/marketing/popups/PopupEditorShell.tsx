"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Eye, Loader2, Monitor, Smartphone } from "lucide-react";

import {
  createPopup,
  getPopupById,
  updatePopup,
} from "@/api/websites/components/popups";
import type {
  CreatePopupPayload,
  WebsitePopup,
} from "@/api/websites/components/popups";
import {
  BuildMarketing,
  ButtonCustom,
  FormLoadingModal,
  ModalHeader,
  ModalContentWrapper,
  ModalCustom,
  ModalTitle,
  SelectCustom,
  toastCustom,
} from "@/components/ui/custom";
import { deleteFiles, uploadImage } from "@/services/upload";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { cn } from "@/lib/utils";
import {
  buildDefaultPopupPayload,
  hydratePopupTemplatePresentation,
} from "./constants";
import {
  AtomicDragPreview,
  PopupBlockInspector,
  PopupContentBuilder,
} from "./PopupContentBuilder";
import { PopupPreview } from "./PopupPreview";
import {
  addNodeToArea,
  buildBuilderTreeFromPayload,
  createAtomicNode,
  findAreaForNode,
  moveNodeBetweenAreas,
  removeNodeFromBuilder,
  resolvePreferredAreaId,
  syncBuilderTreeToLegacy,
  updateAtomicNode,
  updateBuilderRoot,
} from "./popupBuilder";
import {
  PopupSettingsPanelContent,
  type PopupSidebarTab,
} from "./PopupSettingsSidebar";

interface PopupEditorShellProps {
  popupId?: string;
  templateSlug?: string;
}

interface PendingPopupImageUpload {
  nodeId: string;
  tempUrl: string;
  tempAlt: string | null;
  previousUrl: string | null;
  previousAlt: string | null;
}

interface PopupEditorDraftStorage {
  payload: CreatePopupPayload;
  updatedAt: string;
}

const POPUP_EDITOR_DRAFT_TTL_MS = 20 * 60 * 1000;

function isRouteSnippetValid(value?: string | null) {
  return Boolean(value?.trim() && /^\/[^\s]*$/.test(value.trim()));
}

function normalizePageRules(
  pageRules: WebsitePopup["pageRules"],
): CreatePopupPayload["pageRules"] {
  if (!pageRules) return null;

  if (pageRules.mode === "HOME") {
    return {
      ...pageRules,
      mode: "SPECIFIC_PAGE",
      pageKey: "HOME",
      urlContains: "",
      htmlSelector: "",
    };
  }

  if (pageRules.mode === "COURSES") {
    return {
      ...pageRules,
      mode: "SPECIFIC_PAGE",
      pageKey: "COURSES",
      urlContains: "",
      htmlSelector: "",
    };
  }

  return pageRules;
}

function toPayload(popup: WebsitePopup): CreatePopupPayload {
  return {
    nome: popup.nome,
    templateSlug: popup.templateSlug,
    status: popup.status,
    dispositivo: popup.dispositivo,
    escopo: popup.escopo,
    posicaoDesktop: popup.posicaoDesktop,
    posicaoMobile: popup.posicaoMobile,
    gatilho: popup.gatilho,
    atrasoSegundos: popup.atrasoSegundos,
    inatividadeSegundos: popup.inatividadeSegundos ?? null,
    scrollPercentual: popup.scrollPercentual ?? null,
    seletorAlvo: popup.seletorAlvo ?? null,
    triggerTarget: popup.triggerTarget ?? null,
    cronograma: popup.cronograma,
    inicioEm: popup.inicioEm ?? null,
    fimEm: popup.fimEm ?? null,
    frequencia: popup.frequencia,
    tag: popup.tag ?? "From PopUp",
    redirectUrl: popup.redirectUrl ?? null,
    redirectNovaAba: popup.redirectNovaAba,
    prioridade: popup.prioridade,
    contentConfig: popup.contentConfig,
    formFields: popup.formFields,
    designConfig: popup.designConfig,
    subscriptionConfig: popup.subscriptionConfig
      ? {
          email: popup.subscriptionConfig.email,
          whatsapp: popup.subscriptionConfig.whatsapp,
        }
      : null,
    pageRules: normalizePageRules(popup.pageRules),
  };
}

function hasIncompleteCouponNode(payload: CreatePopupPayload) {
  const builderRoot = buildBuilderTreeFromPayload(payload);

  return builderRoot.areas.some((area) =>
    area.children.some(
      (node) =>
        node.type === "COUPON" &&
        (!node.couponScope || !node.couponId?.trim()),
    ),
  );
}

function hasIncompleteRouletteNode(payload: CreatePopupPayload) {
  const builderRoot = buildBuilderTreeFromPayload(payload);

  return builderRoot.areas.some((area) =>
    area.children.some(
      (node) =>
        node.type === "ROULETTE" &&
        (!node.rouletteScope ||
          !node.rouletteItems?.length ||
          !node.rouletteItems.some((item) => !item.isNoPrize && item.couponId) ||
          (node.rouletteItems.some((item) => item.isNoPrize) &&
            !node.rouletteNoPrizeMessage?.trim()) ||
          node.rouletteItems.some(
            (item) => !item.isNoPrize && !item.couponId?.trim(),
          )),
    ),
  );
}

export function PopupEditorShell({
  popupId,
  templateSlug = "newsletter-oportunidades",
}: PopupEditorShellProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [payload, setPayload] = useState<CreatePopupPayload>(() =>
    buildDefaultPopupPayload(templateSlug),
  );
  const [viewport, setViewport] = useState<"DESKTOP" | "MOBILE">("DESKTOP");
  const [zoom, setZoom] = useState("100");
  const [activeSidebar, setActiveSidebar] = useState<
    "BLOCKS" | PopupSidebarTab
  >("BASE");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isUploadingAtomicImage, setIsUploadingAtomicImage] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [pendingSaveStatus, setPendingSaveStatus] = useState<
    CreatePopupPayload["status"] | null
  >(null);
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);
  const pendingImageUploadsRef = useRef<PendingPopupImageUpload[]>([]);
  const hasRestoredLocalDraftRef = useRef(false);
  const draftStorageKey = useMemo(
    () =>
      popupId
        ? `popup-editor-draft:${popupId}`
        : `popup-editor-draft:new:${templateSlug}`,
    [popupId, templateSlug],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const detailQuery = useQuery({
    queryKey: popupId
      ? queryKeys.marketingPopups.detail(popupId)
      : ["marketing-popup-new"],
    queryFn: () => getPopupById(popupId as string),
    enabled: Boolean(popupId),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    try {
      const navigationEntry = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming | undefined;
      const isReload = navigationEntry?.type === "reload";

      if (!isReload) {
        window.localStorage.removeItem(draftStorageKey);
        setIsDraftHydrated(true);
        return;
      }

      const rawDraft = window.localStorage.getItem(draftStorageKey);
      if (!rawDraft) {
        setIsDraftHydrated(true);
        return;
      }

      const parsedDraft = JSON.parse(rawDraft) as PopupEditorDraftStorage;
      if (!parsedDraft?.payload) {
        window.localStorage.removeItem(draftStorageKey);
        setIsDraftHydrated(true);
        return;
      }

      const updatedAt = new Date(parsedDraft.updatedAt).getTime();
      if (
        !Number.isFinite(updatedAt) ||
        Date.now() - updatedAt > POPUP_EDITOR_DRAFT_TTL_MS
      ) {
        window.localStorage.removeItem(draftStorageKey);
        setIsDraftHydrated(true);
        return;
      }

      hasRestoredLocalDraftRef.current = true;
      setPayload(
        syncBuilderTreeToLegacy(
          hydratePopupTemplatePresentation(parsedDraft.payload),
        ),
      );
    } catch {
      window.localStorage.removeItem(draftStorageKey);
    } finally {
      setIsDraftHydrated(true);
    }
  }, [draftStorageKey]);

  useEffect(() => {
    if (!detailQuery.data || hasRestoredLocalDraftRef.current) return;
    setPayload(
      syncBuilderTreeToLegacy(
        toPayload(hydratePopupTemplatePresentation(detailQuery.data)),
      ),
    );
  }, [detailQuery.data]);

  useEffect(() => {
    if (!isDraftHydrated) return;

    const nextDraft: PopupEditorDraftStorage = {
      payload,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(draftStorageKey, JSON.stringify(nextDraft));
  }, [draftStorageKey, isDraftHydrated, payload]);

  useEffect(() => {
    const builderRoot = buildBuilderTreeFromPayload(payload);
    if (!selectedNodeId) {
      setSelectedNodeId(builderRoot.id);
      return;
    }

    const allIds = new Set([
      builderRoot.id,
      ...builderRoot.areas.map((area) => area.id),
      ...builderRoot.areas.flatMap((area) => area.children.map((node) => node.id)),
    ]);

    if (!allIds.has(selectedNodeId)) {
      setSelectedNodeId(builderRoot.id);
    }
  }, [payload, selectedNodeId]);

  useEffect(() => {
    return () => {
      const tempUrls = Array.from(
        new Set(pendingImageUploadsRef.current.map((item) => item.tempUrl)),
      );

      if (tempUrls.length > 0) {
        void deleteFiles(tempUrls);
      }
    };
  }, []);

  const rollbackPendingImageUploads = () => {
    const pendingUploads = pendingImageUploadsRef.current;
    if (pendingUploads.length === 0) return;

    void deleteFiles(
      Array.from(new Set(pendingUploads.map((item) => item.tempUrl))),
    );

    setPayload((current) => {
      let root = buildBuilderTreeFromPayload(current);

      for (const item of pendingUploads) {
        root = updateAtomicNode(root, item.nodeId, {
          url: item.previousUrl,
          alt: item.previousAlt,
        });
      }

      return syncBuilderTreeToLegacy(updateBuilderRoot(current, root));
    });

    pendingImageUploadsRef.current = [];
  };

  const commitPendingImageUploads = async () => {
    const pendingUploads = pendingImageUploadsRef.current;
    if (pendingUploads.length === 0) return;

    const previousUrls = Array.from(
      new Set(
        pendingUploads
          .filter((item) => item.previousUrl && item.previousUrl !== item.tempUrl)
          .map((item) => item.previousUrl as string),
      ),
    );

    pendingImageUploadsRef.current = [];

    if (previousUrls.length > 0) {
      await deleteFiles(previousUrls);
    }
  };

  const handleUploadAtomicImage = async (
    nodeId: string,
    file: File,
    currentUrl?: string | null,
    currentAlt?: string | null,
  ) => {
    if (file.size > 2 * 1024 * 1024) {
      toastCustom.error("A imagem deve ter no máximo 2MB.");
      return;
    }

    try {
      setIsUploadingAtomicImage(true);

      const existingPending = pendingImageUploadsRef.current.find(
        (item) => item.nodeId === nodeId,
      );

      const uploadResult = await uploadImage(file, "website/popups");

      if (existingPending?.tempUrl) {
        await deleteFiles([existingPending.tempUrl]);
      }

      const previousUrl =
        existingPending?.previousUrl ??
        (currentUrl && currentUrl !== existingPending?.tempUrl ? currentUrl : null);
      const previousAlt = existingPending?.previousAlt ?? currentAlt ?? null;

      pendingImageUploadsRef.current = [
        ...pendingImageUploadsRef.current.filter((item) => item.nodeId !== nodeId),
        {
          nodeId,
          tempUrl: uploadResult.url,
          tempAlt: uploadResult.title,
          previousUrl,
          previousAlt,
        },
      ];

      setPayload((current) => {
        const root = updateAtomicNode(buildBuilderTreeFromPayload(current), nodeId, {
          url: uploadResult.url,
          alt: currentAlt?.trim() ? currentAlt : uploadResult.title,
        });
        return syncBuilderTreeToLegacy(updateBuilderRoot(current, root));
      });

      toastCustom.success("Imagem enviada com sucesso.");
    } catch (error) {
      toastCustom.error(
        error instanceof Error ? error.message : "Erro ao enviar imagem.",
      );
    } finally {
      setIsUploadingAtomicImage(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async ({
      nextPayload,
      status,
    }: {
      nextPayload: CreatePopupPayload;
      status: CreatePopupPayload["status"];
    }) => {
      setPendingSaveStatus(status);
      setLoadingStep(
        status === "PUBLICADO"
          ? "Publicando pop-up..."
          : popupId
            ? "Salvando alterações..."
            : "Criando rascunho...",
      );

      if (popupId) {
        return updatePopup(popupId, nextPayload);
      }
      return createPopup(nextPayload);
    },
    onSuccess: async (popup, variables) => {
      await commitPendingImageUploads();
      window.localStorage.removeItem(draftStorageKey);
      toastCustom.success(
        variables.status === "PUBLICADO"
          ? "Pop-up publicado com sucesso."
          : "Pop-up salvo com sucesso.",
      );
      await queryClient.invalidateQueries({
        queryKey: ["admin-marketing-popups-list"],
      });
      if (variables.status === "PUBLICADO") {
        setLoadingStep("Redirecionando para a listagem...");
        router.push("/dashboard/marketing/popup");
        return;
      }

      if (!popupId) {
        router.replace(`/dashboard/marketing/popup/${popup.id}/editar`);
      }
    },
    onError: (error) => {
      rollbackPendingImageUploads();
      toastCustom.error(error?.message || "Erro ao salvar pop-up.");
    },
    onSettled: () => {
      setPendingSaveStatus(null);
      setLoadingStep("");
    },
  });

  const handleSave = (status: CreatePopupPayload["status"]) => {
    if (!payload.nome.trim()) {
      toastCustom.error("Digite o nome do pop-up.");
      return;
    }
    if (
      payload.pageRules?.mode === "HTML_SELECTOR" &&
      payload.pageRules.htmlSelector?.trim()
    ) {
      toastCustom.error(
        "Esta regra legada baseada em HTML precisa ser substituída antes de salvar.",
      );
      return;
    }
    if (
      (payload.gatilho === "CLIQUE" || payload.gatilho === "HOVER") &&
      !payload.triggerTarget?.trim()
    ) {
      toastCustom.error("Selecione o alvo do gatilho.");
      return;
    }
    if (
      payload.gatilho === "ATRASO" &&
      (!Number.isFinite(payload.atrasoSegundos) || payload.atrasoSegundos < 0)
    ) {
      toastCustom.error("Informe um tempo de atraso válido.");
      return;
    }
    if (
      payload.gatilho === "INATIVIDADE" &&
      (!payload.inatividadeSegundos ||
        !Number.isFinite(payload.inatividadeSegundos) ||
        payload.inatividadeSegundos < 1)
    ) {
      toastCustom.error("Informe um tempo de inatividade válido.");
      return;
    }
    if (
      payload.gatilho === "SCROLL" &&
      (!payload.scrollPercentual ||
        !Number.isFinite(payload.scrollPercentual) ||
        payload.scrollPercentual < 1 ||
        payload.scrollPercentual > 100)
    ) {
      toastCustom.error("Informe um percentual de scroll entre 1 e 100.");
      return;
    }
    if (
      payload.pageRules?.mode === "URL_CONTAINS" &&
      !isRouteSnippetValid(payload.pageRules.urlContains)
    ) {
      toastCustom.error("Informe um trecho de rota válido, começando com '/'.");
      return;
    }
    if (
      payload.pageRules?.mode === "SPECIFIC_PAGE" &&
      !payload.pageRules.pageKey
    ) {
      toastCustom.error("Selecione a página específica do pop-up.");
      return;
    }
    if (status === "PUBLICADO" && hasIncompleteCouponNode(payload)) {
      toastCustom.error(
        "Configure o tipo e o cupom ativo do bloco de cupom ou remova esse elemento antes de salvar.",
      );
      return;
    }

    if (status === "PUBLICADO" && hasIncompleteRouletteNode(payload)) {
      toastCustom.error(
        "Configure o tipo e ao menos um cupom na roleta ou remova esse elemento antes de salvar.",
      );
      return;
    }
    if (payload.cronograma === "PERIODO") {
      if (!payload.inicioEm || !payload.fimEm) {
        toastCustom.error("Selecione o período completo de exibição.");
        return;
      }

      if (new Date(payload.fimEm) < new Date(payload.inicioEm)) {
        toastCustom.error(
          "A data final do período não pode ser anterior à inicial.",
        );
        return;
      }
    }
    saveMutation.mutate({
      nextPayload: { ...syncBuilderTreeToLegacy(payload), status },
      status,
    });
  };

  const previewPosition = useMemo(
    () =>
      viewport === "DESKTOP" ? payload.posicaoDesktop : payload.posicaoMobile,
    [payload.posicaoDesktop, payload.posicaoMobile, viewport],
  );
  const zoomOptions = useMemo(
    () => [
      { value: "75", label: "75%" },
      { value: "90", label: "90%" },
      { value: "100", label: "100%" },
    ],
    [],
  );

  const handleMoveNode = (nodeId: string, direction: "up" | "down") => {
    const root = buildBuilderTreeFromPayload(payload);
    const area = findAreaForNode(root, nodeId);
    if (!area) return;

    const currentIndex = area.children.findIndex((node) => node.id === nodeId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
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
      areas: root.areas.map((currentArea) =>
        currentArea.id === area.id ? { ...currentArea, children: nextChildren } : currentArea,
      ),
    };

    setPayload(syncBuilderTreeToLegacy(updateBuilderRoot(payload, nextRoot)));
    setSelectedNodeId(nodeId);
  };

  const handleRemoveNode = (nodeId: string) => {
    const root = buildBuilderTreeFromPayload(payload);
    const nextRoot = removeNodeFromBuilder(root, nodeId);
    setPayload(syncBuilderTreeToLegacy(updateBuilderRoot(payload, nextRoot)));
    setSelectedNodeId(nextRoot.id);
  };

  const handleBuilderDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    if (activeSidebar !== "BLOCKS") return;

    const { active, over } = event;
    if (!over) return;

    const root = buildBuilderTreeFromPayload(payload);
    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith("palette:")) {
      const type = activeId.replace("palette:", "");
      const targetArea =
        root.areas.find((area) => area.id === overId) ??
        findAreaForNode(root, overId) ??
        root.areas.find((area) => area.id === resolvePreferredAreaId(root, selectedNodeId)) ??
        root.areas[0];

      if (!targetArea) return;

      const nextRoot = addNodeToArea(root, targetArea.id, createAtomicNode(type as any));
      const insertedNode = targetArea.id
        ? nextRoot.areas.find((area) => area.id === targetArea.id)?.children.at(-1)
        : null;

      setPayload(syncBuilderTreeToLegacy(updateBuilderRoot(payload, nextRoot)));
      setSelectedNodeId(insertedNode?.id ?? targetArea.id);
      return;
    }

    if (activeId === overId) return;

    const sourceArea = findAreaForNode(root, activeId);
    if (!sourceArea) return;

    const targetArea =
      root.areas.find((area) => area.id === overId) ?? findAreaForNode(root, overId);
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

    setPayload(syncBuilderTreeToLegacy(updateBuilderRoot(payload, nextRoot)));
    setSelectedNodeId(activeId);
  };

  const handleBuilderDragStart = (event: DragStartEvent) => {
    if (activeSidebar !== "BLOCKS") return;
    setActiveDragId(String(event.active.id));
  };

  if (detailQuery.isLoading && popupId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#06286B]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormLoadingModal
        isLoading={
          saveMutation.isPending && pendingSaveStatus === "PUBLICADO"
        }
        title="Publicando pop-up..."
        loadingStep={loadingStep}
        icon={Monitor}
      />

      <div className="flex flex-wrap items-center justify-end gap-2">
        <ButtonCustom variant="outline" onClick={() => setIsPreviewOpen(true)}>
          <Eye className="h-4 w-4" />
          Visualizar
        </ButtonCustom>
        <ButtonCustom
          variant="outline"
          data-popup-target="dashboard-popup-save-draft-button"
          disabled={saveMutation.isPending}
          onClick={() => handleSave("RASCUNHO")}
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          Salvar rascunho
        </ButtonCustom>
        <ButtonCustom
          variant="primary"
          data-popup-target="dashboard-popup-publish-button"
          disabled={saveMutation.isPending}
          onClick={() => handleSave("PUBLICADO")}
        >
          Publicar
        </ButtonCustom>
      </div>

      {activeSidebar === "BLOCKS" ? (
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
              const nextSection = sectionId as "BLOCKS" | PopupSidebarTab;
              setActiveSidebar(nextSection);

              if (nextSection === "BLOCKS") {
                const root = buildBuilderTreeFromPayload(payload);
                setSelectedNodeId(root.id);
              }
            }}
            sidebarTitle="Blocos"
            sidebarSubtitle="Biblioteca, ordem e edicao."
            sidebarContent={
              <PopupContentBuilder
                value={payload}
                onChange={setPayload}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            }
            toolbar={
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setViewport("DESKTOP")}
                    className={cn(
                      "flex h-10 cursor-pointer items-center gap-2 px-4 !text-sm font-medium transition",
                      viewport === "DESKTOP"
                        ? "bg-[#06286B] text-white"
                        : "text-slate-600",
                    )}
                  >
                    <Monitor className="h-4 w-4" />
                    Web
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewport("MOBILE")}
                    className={cn(
                      "flex h-10 cursor-pointer items-center gap-2 px-4 !text-sm font-medium transition",
                      viewport === "MOBILE"
                        ? "bg-[#06286B] text-white"
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
            <div className="grid h-full min-h-[calc(100dvh-22rem)] xl:grid-cols-[minmax(0,1fr)_360px] xl:items-stretch">
              <div className="border-b border-slate-200 bg-slate-100 px-3 py-4 xl:border-b-0 xl:border-r">
                <div
                  className="origin-top transition-transform"
                  style={{ transform: `scale(${Number(zoom) / 100})` }}
                >
                  <PopupPreview
                    content={payload.contentConfig}
                    fields={payload.formFields}
                    design={payload.designConfig}
                    viewport={viewport}
                    position={previewPosition}
                    editable
                    selectedNodeId={selectedNodeId}
                    onSelectNode={setSelectedNodeId}
                    onMoveNode={handleMoveNode}
                    onRemoveNode={handleRemoveNode}
                  />
                </div>
              </div>
              <PopupBlockInspector
                value={payload}
                onChange={setPayload}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                onUploadImage={handleUploadAtomicImage}
                isUploadingImage={isUploadingAtomicImage}
                flush
              />
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
      ) : (
        <BuildMarketing
          sections={[
            { id: "BASE", label: "Base", icon: "Settings" },
            { id: "BLOCKS", label: "Blocos", icon: "Layout" },
          ]}
          activeSection={activeSidebar}
          onSectionChange={(sectionId) => {
            const nextSection = sectionId as "BLOCKS" | PopupSidebarTab;
            setActiveSidebar(nextSection);

            if (nextSection === "BLOCKS") {
              const root = buildBuilderTreeFromPayload(payload);
              setSelectedNodeId(root.id);
            }
          }}
          sidebarTitle="Base"
          sidebarSubtitle="Campos essenciais, segmentacao e limites."
          sidebarContent={
            <PopupSettingsPanelContent
              value={payload}
              onChange={setPayload}
              tab={activeSidebar}
              embedded
            />
          }
          toolbar={
            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setViewport("DESKTOP")}
                  className={cn(
                    "flex h-10 cursor-pointer items-center gap-2 px-4 !text-sm font-medium transition",
                    viewport === "DESKTOP"
                      ? "bg-[#06286B] text-white"
                      : "text-slate-600",
                  )}
                >
                  <Monitor className="h-4 w-4" />
                  Web
                </button>
                <button
                  type="button"
                  onClick={() => setViewport("MOBILE")}
                  className={cn(
                    "flex h-10 cursor-pointer items-center gap-2 px-4 !text-sm font-medium transition",
                    viewport === "MOBILE"
                      ? "bg-[#06286B] text-white"
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
        >
          <div
            className="origin-top transition-transform"
            style={{ transform: `scale(${Number(zoom) / 100})` }}
          >
            <PopupPreview
              content={payload.contentConfig}
              fields={payload.formFields}
              design={payload.designConfig}
              viewport={viewport}
              position={previewPosition}
              showDraftPlaceholders
            />
          </div>
        </BuildMarketing>
      )}

      <ModalCustom
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        size="full"
        backdrop="blur"
        hideCloseButton
      >
        <ModalContentWrapper
          hideCloseButton
          className="max-w-none bg-transparent p-0 shadow-none"
        >
          <ModalHeader className="sr-only">
            <ModalTitle>Visualização do popup</ModalTitle>
          </ModalHeader>
          <PopupPreview
            content={payload.contentConfig}
            fields={payload.formFields}
            design={payload.designConfig}
            viewport={viewport}
            position={previewPosition}
            onClose={() => setIsPreviewOpen(false)}
            showDraftPlaceholders
          />
        </ModalContentWrapper>
      </ModalCustom>
    </div>
  );
}
