"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Tag,
  User2,
} from "lucide-react";

import {
  createPopupLeadInterest,
  createPopupLeadNote,
  createPopupLeadOpportunity,
  deletePopupLeadInterest,
  deletePopupLeadNote,
  deletePopupLeadOpportunity,
  getPopupContactActivity,
  getPopupContact,
  updatePopupContact,
  updatePopupLeadNote,
  updatePopupLeadOpportunity,
} from "@/api/websites/components/popups";
import type {
  CreatePopupLeadOpportunityPayload,
  PopupLeadDetail,
  PopupLeadListItem,
  PopupLeadStatus,
  ListPopupContactsResponse,
  UpdatePopupContactPayload,
  UpdatePopupLeadOpportunityPayload,
} from "@/api/websites/components/popups";
import { getUserProfile, listUsuarios } from "@/api/usuarios";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ButtonCustom,
  CommentCustom,
  SelectCustom,
  toastCustom,
} from "@/components/ui/custom";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { normalizeCep } from "@/lib/cep";
import { formatTelefone } from "@/theme/dashboard/components/admin/usuario-details/utils/formatters";
import { PopupLeadHeader } from "./PopupLeadHeader";
import { PopupLeadActivityTab } from "./PopupLeadActivityTab";
import { EditPopupLeadAddressModal } from "./EditPopupLeadAddressModal";
import { EditPopupLeadModal } from "./EditPopupLeadModal";
import { PopupLeadInterestsTab } from "./PopupLeadInterestsTab";
import { PopupLeadOpportunitiesTab } from "./PopupLeadOpportunitiesTab";

const LEAD_STATUS_OPTIONS: Array<{ value: PopupLeadStatus; label: string }> = [
  { value: "NOVO", label: "Novo" },
  { value: "EM_ATENDIMENTO", label: "Em atendimento" },
  { value: "QUALIFICANDO", label: "Qualificando" },
  { value: "QUALIFICADO", label: "Qualificado" },
  { value: "CONVERTIDO", label: "Convertido" },
  { value: "PERDIDO", label: "Perdido" },
  { value: "ARQUIVADO", label: "Arquivado" },
];

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getLeadPrimaryLabel(detail: PopupLeadDetail) {
  return (
    detail.nome || detail.email || detail.telefone || "Lead sem identificação"
  );
}

function getLeadSecondaryLabel(detail: PopupLeadDetail) {
  return detail.email || "Email não informado";
}

function buildWhatsappHref(value?: string | null) {
  const digits = value?.replace(/\D/g, "") ?? "";
  if (digits.length < 10) return null;

  return `https://wa.me/55${digits}?text=${encodeURIComponent(
    "Olá! Sou da equipe da Advance+ e vi seu contato no CRM. Podemos conversar por aqui?",
  )}`;
}

function formatPhoneLink(value?: string | null) {
  const digits = value?.replace(/\D/g, "") ?? "";
  if (digits.length < 10) return null;

  return (
    <a
      href={`tel:+55${digits}`}
      className="text-primary hover:underline"
    >
      {formatTelefone(value)}
    </a>
  );
}

function formatWhatsappLink(value?: string | null) {
  const href = buildWhatsappHref(value);
  if (!href) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {formatTelefone(value)}
        </a>
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>
        Enviar mensagem pelo WhatsApp
      </TooltipContent>
    </Tooltip>
  );
}

function hasLeadAddress(detail: PopupLeadDetail | UpdatePopupContactPayload) {
  return Boolean(
      detail.endereco ||
      detail.cidade ||
      detail.estado,
  );
}

interface PopupLeadDetailsViewProps {
  leadId: string;
}

export function PopupLeadDetailsView({ leadId }: PopupLeadDetailsViewProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "interests" | "opportunities"
  >("overview");
  const [detailForm, setDetailForm] = useState<UpdatePopupContactPayload>({
    nome: "",
    email: "",
    telefone: "",
    whatsapp: "",
    empresa: "",
    dataNascimento: null,
    endereco: "",
    cidade: "",
    estado: "",
    status: "NOVO",
    ownerUsuarioId: null,
    tag: "",
  });
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
  const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState(false);
  const [savingField, setSavingField] = useState<
    "status" | "ownerUsuarioId" | null
  >(null);

  const detailQuery = useQuery({
    queryKey: queryKeys.marketingPopups.contactDetail(leadId),
    queryFn: () => getPopupContact(leadId),
    refetchOnWindowFocus: false,
  });

  const historyQuery = useQuery({
    queryKey: queryKeys.marketingPopups.contactActivity(leadId),
    queryFn: () => getPopupContactActivity(leadId),
    refetchOnWindowFocus: false,
  });

  const ownersQuery = useQuery({
    queryKey: queryKeys.usuarios.list({
      page: 1,
      limit: 50,
      status: "ATIVO",
    }),
    queryFn: () => listUsuarios({ page: 1, limit: 50, status: "ATIVO" }),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const profileQuery = useQuery({
    queryKey: ["usuario-profile"],
    queryFn: () => getUserProfile(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!detailQuery.data) return;

    const detail = detailQuery.data;
    setDetailForm((current) => {
      const next = {
        nome: detail.nome ?? "",
        email: detail.email ?? "",
        telefone: detail.telefone ?? "",
        whatsapp: detail.whatsapp ?? "",
        empresa: detail.empresa ?? "",
        dataNascimento: detail.dataNascimento ?? null,
        endereco: detail.endereco ?? "",
        cidade: detail.cidade ?? "",
        estado: detail.estado ?? "",
        status: detail.status,
        ownerUsuarioId: detail.ownerUsuarioId ?? null,
        tag: detail.tag ?? "",
      };

      const isSame =
        current.nome === next.nome &&
        current.email === next.email &&
        current.telefone === next.telefone &&
        current.whatsapp === next.whatsapp &&
        current.empresa === next.empresa &&
        current.dataNascimento === next.dataNascimento &&
        current.endereco === next.endereco &&
        current.cidade === next.cidade &&
        current.estado === next.estado &&
        current.status === next.status &&
        current.ownerUsuarioId === next.ownerUsuarioId &&
        current.tag === next.tag;

      return isSame ? current : next;
    });
  }, [detailQuery.data]);

  const invalidateLead = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.marketingPopups.contactDetail(leadId),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.marketingPopups.contactActivity(leadId),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.marketingPopups.contactHistory(leadId),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.marketingPopups.contacts({}),
      }),
    ]);
  };

  const syncContactsListCache = (detail: PopupLeadDetail) => {
    queryClient.setQueriesData<ListPopupContactsResponse>(
      {
        queryKey: ["admin-marketing-popup-contacts"],
      },
      (current) => {
        if (!current) return current;

        const nextContato: PopupLeadListItem = {
          id: detail.id,
          contactKey: detail.contactKey,
          nome: detail.nome ?? null,
          email: detail.email ?? null,
          telefone: detail.telefone ?? null,
          whatsapp: detail.whatsapp ?? null,
          empresa: detail.empresa ?? null,
          dataNascimento: detail.dataNascimento ?? null,
          endereco: detail.endereco ?? null,
          cidade: detail.cidade ?? null,
          estado: detail.estado ?? null,
          tag: detail.tag ?? null,
          origemPath: detail.origemPath ?? null,
          popupId: detail.popupId ?? null,
          popupNome: detail.popupNome ?? null,
          status: detail.status,
          ownerUsuarioId: detail.ownerUsuarioId ?? null,
          owner: detail.owner ?? null,
          inscricoesCount: detail.inscricoesCount,
          primeiraCapturaEm: detail.primeiraCapturaEm,
          ultimaCapturaEm: detail.ultimaCapturaEm,
        };

        return {
          ...current,
          contatos: current.contatos.map((item) =>
            item.id === detail.id ? nextContato : item,
          ),
        };
      },
    );
  };

  const saveDetailMutation = useMutation({
    mutationFn: (payload: UpdatePopupContactPayload) =>
      updatePopupContact(leadId, payload),
    onSuccess: (data) => {
      setDetailForm({
        nome: data.nome ?? "",
        email: data.email ?? "",
        telefone: data.telefone ?? "",
        whatsapp: data.whatsapp ?? "",
        empresa: data.empresa ?? "",
        dataNascimento: data.dataNascimento ?? null,
        endereco: data.endereco ?? "",
        cidade: data.cidade ?? "",
        estado: data.estado ?? "",
        status: data.status ?? "NOVO",
        ownerUsuarioId: data.ownerUsuarioId ?? null,
        tag: data.tag ?? "",
      });
      queryClient.setQueryData(
        queryKeys.marketingPopups.contactDetail(leadId),
        data,
      );
      syncContactsListCache(data);
      toastCustom.success("Contato atualizado.");
    },
    onError: (error) => {
      toastCustom.error(
        error instanceof Error ? error.message : "Erro ao salvar contato.",
      );
    },
  });

  const saveLeadField = (
    patch: UpdatePopupContactPayload,
    field: "status" | "ownerUsuarioId",
  ) => {
    const nextForm = { ...detailForm, ...patch };

    const hasChanges = Object.entries(patch).some(([key, value]) => {
      const currentValue = nextForm[key as keyof UpdatePopupContactPayload];
      const previousValue = detailForm[key as keyof UpdatePopupContactPayload];
      return previousValue !== value && currentValue !== previousValue;
    });

    if (!hasChanges) return;

    setDetailForm(nextForm);
    setSavingField(field);
    saveDetailMutation.mutate({ ...patch }, {
      onSettled: () => {
        setSavingField((current) => (current === field ? null : current));
      },
    });
  };

  const createNoteMutation = useMutation({
    mutationFn: (conteudo: string) => createPopupLeadNote(leadId, { conteudo }),
    onSuccess: async () => {
      toastCustom.success("Nota adicionada.");
      await invalidateLead();
    },
    onError: (error) => {
      toastCustom.error(
        error instanceof Error ? error.message : "Erro ao adicionar nota.",
      );
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, conteudo }: { noteId: string; conteudo: string }) =>
      updatePopupLeadNote(leadId, noteId, { conteudo }),
    onSuccess: async () => {
      toastCustom.success("Nota atualizada.");
      await invalidateLead();
    },
    onError: (error) => {
      toastCustom.error(
        error instanceof Error ? error.message : "Erro ao atualizar nota.",
      );
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => deletePopupLeadNote(leadId, noteId),
    onSuccess: async () => {
      toastCustom.success("Nota removida.");
      await invalidateLead();
    },
    onError: (error) => {
      toastCustom.error(
        error instanceof Error ? error.message : "Erro ao remover nota.",
      );
    },
  });

  const createInterestMutation = useMutation({
    mutationFn: (label: string) =>
      createPopupLeadInterest(leadId, { label: label.trim() }),
    onSuccess: async () => {
      toastCustom.success("Interesse adicionado.");
      await invalidateLead();
    },
    onError: (error) => {
      toastCustom.error(
        error instanceof Error ? error.message : "Erro ao adicionar interesse.",
      );
    },
  });

  const deleteInterestMutation = useMutation({
    mutationFn: (interestId: string) =>
      deletePopupLeadInterest(leadId, interestId),
    onSuccess: async () => {
      toastCustom.success("Interesse removido.");
      await invalidateLead();
    },
    onError: (error) => {
      toastCustom.error(
        error instanceof Error ? error.message : "Erro ao remover interesse.",
      );
    },
  });

  const createOpportunityMutation = useMutation({
    mutationFn: (payload: CreatePopupLeadOpportunityPayload) =>
      createPopupLeadOpportunity(leadId, payload),
    onSuccess: async () => {
      toastCustom.success("Oportunidade criada.");
      await invalidateLead();
    },
    onError: (error) => {
      toastCustom.error(
        error instanceof Error ? error.message : "Erro ao criar oportunidade.",
      );
    },
  });

  const updateOpportunityMutation = useMutation({
    mutationFn: ({
      opportunityId,
      payload,
    }: {
      opportunityId: string;
      payload: UpdatePopupLeadOpportunityPayload;
    }) => updatePopupLeadOpportunity(leadId, opportunityId, payload),
    onSuccess: async () => {
      toastCustom.success("Oportunidade atualizada.");
      await invalidateLead();
    },
    onError: (error) => {
      toastCustom.error(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar oportunidade.",
      );
    },
  });

  const deleteOpportunityMutation = useMutation({
    mutationFn: (opportunityId: string) =>
      deletePopupLeadOpportunity(leadId, opportunityId),
    onSuccess: async () => {
      toastCustom.success("Oportunidade removida.");
      await invalidateLead();
    },
    onError: (error) => {
      toastCustom.error(
        error instanceof Error
          ? error.message
          : "Erro ao remover oportunidade.",
      );
    },
  });

  const detail = detailQuery.data;
  const history = historyQuery.data ?? [];
  const currentUserId =
    profileQuery.data && "usuario" in profileQuery.data
      ? profileQuery.data.usuario.id
      : null;

  const ownerOptions = useMemo(
    () =>
      (ownersQuery.data?.usuarios ?? [])
        .filter(
          (usuario) =>
            usuario.role === "ADMIN" || usuario.role === "MODERADOR",
        )
        .map((usuario) => ({
          value: usuario.id,
          label: usuario.nomeCompleto,
        })),
    [ownersQuery.data?.usuarios],
  );

  if (detailQuery.isLoading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8">
        <div className="h-7 w-48 animate-pulse rounded bg-slate-100" />
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="h-[520px] animate-pulse rounded-[28px] bg-slate-100" />
          <div className="h-[520px] animate-pulse rounded-[28px] bg-slate-100" />
        </div>
      </div>
    );
  }

  if (detailQuery.error || !detail) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8">
        <Alert variant="destructive">
          <AlertDescription>
            {detailQuery.error?.message || "Erro ao carregar o contato."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PopupLeadHeader
        title={getLeadPrimaryLabel(detail)}
        subtitle={getLeadSecondaryLabel(detail)}
        onEditContact={() => setIsEditContactModalOpen(true)}
        onEditAddress={() => setIsEditAddressModalOpen(true)}
        addressActionLabel={
          hasLeadAddress(detail) ? "Editar endereço" : "Adicionar endereço"
        }
      />

      <div className="space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { value: "overview", label: "Sobre" },
              {
                value: "interests",
                label: "Interesses",
                badge: String(detail.interests.length),
              },
              {
                value: "opportunities",
                label: "Oportunidades",
                badge: String(detail.opportunities.length),
              },
              {
                value: "history",
                label: "Histórico",
                badge: String(history.length),
              },
            ].map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.value as
                        | "overview"
                        | "history"
                        | "interests"
                        | "opportunities",
                    )
                  }
                  className={[
                    "inline-flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "border-[var(--primary-color)]/20 bg-[var(--primary-color)]/10 text-[var(--primary-color)]"
                      : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  ].join(" ")}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        isActive
                          ? "bg-[var(--secondary-color)] text-white"
                          : "bg-slate-200/80 text-slate-600",
                      ].join(" ")}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7">
          {activeTab === "overview" && (
            <OverviewTab
              detail={detail}
              detailForm={detailForm}
              ownerOptions={ownerOptions}
              currentUserId={currentUserId}
              onSaveLeadField={saveLeadField}
              isFieldsLoading={detailQuery.isLoading || ownersQuery.isLoading}
              savingField={savingField}
              onCreateNote={(conteudo) => createNoteMutation.mutate(conteudo)}
              createNotePending={createNoteMutation.isPending}
              onUpdateNote={(noteId, conteudo) =>
                updateNoteMutation.mutate({ noteId, conteudo })
              }
              updateNotePending={updateNoteMutation.isPending}
              onDeleteNote={(noteId) => deleteNoteMutation.mutate(noteId)}
              deletingNoteId={deleteNoteMutation.variables ?? null}
            />
          )}

          {activeTab === "history" && (
            <PopupLeadActivityTab
              activity={history}
              isLoading={historyQuery.isLoading}
            />
          )}

          {activeTab === "interests" && (
            <PopupLeadInterestsTab
              interests={detail.interests}
              isCreating={createInterestMutation.isPending}
              onDeleteInterest={async (interestId) => {
                await deleteInterestMutation.mutateAsync(interestId);
              }}
              deletingId={deleteInterestMutation.variables ?? null}
              onCreateInterest={async (label) => {
                await createInterestMutation.mutateAsync(label);
              }}
            />
          )}

          {activeTab === "opportunities" && (
            <PopupLeadOpportunitiesTab
              opportunities={detail.opportunities}
              ownerOptions={ownerOptions}
              defaultOwnerUsuarioId={detail.ownerUsuarioId ?? null}
              isLoading={ownersQuery.isLoading}
              isCreating={createOpportunityMutation.isPending}
              isUpdating={updateOpportunityMutation.isPending}
              onCreateOpportunity={async (payload) => {
                await createOpportunityMutation.mutateAsync(payload);
              }}
              onUpdateOpportunity={async (opportunityId, payload) => {
                await updateOpportunityMutation.mutateAsync({
                  opportunityId,
                  payload,
                });
              }}
              onDeleteOpportunity={async (opportunityId) => {
                await deleteOpportunityMutation.mutateAsync(opportunityId);
              }}
              deletingId={deleteOpportunityMutation.variables ?? null}
            />
          )}
        </div>
      </div>

      {isEditContactModalOpen && (
        <EditPopupLeadModal
          isOpen={isEditContactModalOpen}
          onClose={() => setIsEditContactModalOpen(false)}
          initialValues={detailForm}
          isSubmitting={saveDetailMutation.isPending}
          onSubmit={(values) => {
            setDetailForm((previous) => ({ ...previous, ...values }));
            setIsEditContactModalOpen(false);
            saveDetailMutation.mutate(values);
          }}
        />
      )}

      {isEditAddressModalOpen && (
        <EditPopupLeadAddressModal
          isOpen={isEditAddressModalOpen}
          onClose={() => setIsEditAddressModalOpen(false)}
          initialValues={detailForm}
          isSubmitting={saveDetailMutation.isPending}
          onSubmit={(values) => {
            setDetailForm((previous) => ({ ...previous, ...values }));
            setIsEditAddressModalOpen(false);
            saveDetailMutation.mutate(values);
          }}
        />
      )}
    </div>
  );
}

function OverviewTab({
  detail,
  detailForm,
  ownerOptions,
  currentUserId,
  onSaveLeadField,
  isFieldsLoading,
  savingField,
  onCreateNote,
  createNotePending,
  onUpdateNote,
  updateNotePending,
  onDeleteNote,
  deletingNoteId,
}: {
  detail: PopupLeadDetail;
  detailForm: UpdatePopupContactPayload;
  ownerOptions: Array<{ value: string; label: string }>;
  currentUserId: string | null;
  onSaveLeadField: (
    patch: UpdatePopupContactPayload,
    field: "status" | "ownerUsuarioId",
  ) => void;
  isFieldsLoading: boolean;
  savingField: "status" | "ownerUsuarioId" | null;
  onCreateNote: (conteudo: string) => void;
  createNotePending: boolean;
  onUpdateNote: (noteId: string, conteudo: string) => void;
  updateNotePending: boolean;
  onDeleteNote: (noteId: string) => void;
  deletingNoteId: string | null;
}) {
  const phoneSummary = [
    formatPhoneLink(detail.telefone),
    formatWhatsappLink(detail.whatsapp),
  ].filter(Boolean);
  const emailValue = detail.email?.trim();
  const addressValue = (() => {
    const cityState = [detail.cidade, detail.estado]
      .filter((item) => Boolean(item?.trim()))
      .join("/");
    return [detail.endereco, cityState].filter(Boolean).join(" • ");
  })();
  const birthDateValue = detail.dataNascimento
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(detail.dataNascimento))
    : null;
  const noteComments = detail.notes.map((note) => ({
    id: note.id,
    content: note.conteudo,
    author: note.autor?.nome || note.autor?.email || "Equipe interna",
    authorId: note.autor?.id ?? null,
    avatarUrl: note.autor?.avatarUrl ?? null,
    updatedAt: note.atualizadoEm || note.criadoEm,
    canEdit: Boolean(note.autor?.id && note.autor.id === currentUserId),
    canDelete: Boolean(note.autor?.id && note.autor.id === currentUserId),
  }));
  const isStatusLoading = isFieldsLoading || savingField === "status";
  const isOwnerLoading = isFieldsLoading || savingField === "ownerUsuarioId";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
      <section className="space-y-4 rounded-2xl border border-gray-200/60 bg-white p-6">
        <CommentCustom
          comments={noteComments}
          emptyTitle="Sem notas registradas"
          emptyDescription="As anotações internas deste contato aparecerão aqui."
          createPending={createNotePending}
          updatePending={updateNotePending}
          deletingId={deletingNoteId}
          formatDate={formatDate}
          onCreate={onCreateNote}
          onUpdate={onUpdateNote}
          onDelete={onDeleteNote}
        />
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <div className="space-y-4 border-b border-slate-200/70 pb-5">
            {isStatusLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : (
              <SelectCustom
                label="Status"
                options={LEAD_STATUS_OPTIONS}
                value={detailForm.status ?? "NOVO"}
                onChange={(status) => {
                  if (!status) return;
                  const nextStatus = (status as PopupLeadStatus) || "NOVO";
                  if (nextStatus === (detailForm.status ?? "NOVO")) return;
                  onSaveLeadField({ status: nextStatus }, "status");
                }}
              />
            )}

            {isOwnerLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : (
              <SelectCustom
                label="Atendimento"
                placeholder="Selecionar responsável"
                options={ownerOptions}
                value={detailForm.ownerUsuarioId ?? null}
                onChange={(ownerUsuarioId) => {
                  const nextOwnerUsuarioId = ownerUsuarioId ?? null;
                  if (
                    nextOwnerUsuarioId === (detailForm.ownerUsuarioId ?? null)
                  ) {
                    return;
                  }
                  onSaveLeadField(
                    { ownerUsuarioId: nextOwnerUsuarioId },
                    "ownerUsuarioId",
                  );
                }}
              />
            )}
          </div>

          <dl className="mt-4 space-y-4 text-sm">
            <OverviewInfoRow
              icon={MapPin}
              label="Página de captura"
              value={detail.origemPath}
            />
            <OverviewInfoRow
              icon={Tag}
              label="Última rotina"
              value={detail.popupNome}
            />
            <OverviewInfoRow
              icon={User2}
              label="Inscrições"
              value={String(detail.inscricoesCount)}
            />
            <OverviewInfoRow
              icon={Clock3}
              label="Primeira captura"
              value={formatDate(detail.primeiraCapturaEm)}
            />
            <OverviewInfoRow
              icon={Clock3}
              label="Última captura"
              value={formatDate(detail.ultimaCapturaEm)}
            />
            <OverviewInfoRow
              icon={Building2}
              label="Empresa"
              value={detail.empresa}
            />
            <OverviewInfoRow
              icon={CalendarDays}
              label="Data de nascimento"
              value={birthDateValue}
            />
            <OverviewInfoRow
              icon={Mail}
              label="E-mail"
              value={
                emailValue ? (
                  <a
                    href={`mailto:${emailValue}`}
                    className="text-primary break-words hover:underline"
                  >
                    {emailValue}
                  </a>
                ) : null
              }
            />
            <OverviewInfoRow
              icon={Phone}
              label="Telefone / WhatsApp"
              value={
                phoneSummary.length > 0 ? (
                  <span className="flex flex-wrap items-center gap-2">
                    {phoneSummary.map((item, index) => (
                      <span key={index} className="contents">
                        {index > 0 ? <span className="text-gray-400">•</span> : null}
                        {item}
                      </span>
                    ))}
                  </span>
                ) : null
              }
            />
            <OverviewInfoRow icon={MapPin} label="Endereço" value={addressValue} />
            <OverviewInfoRow icon={Tag} label="Tag" value={detail.tag} />
          </dl>
        </div>
      </aside>
    </div>
  );
}

function OverviewInfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User2;
  label: string;
  value?: React.ReactNode | null;
}) {
  const hasValue =
    value !== null &&
    value !== undefined &&
    (!(typeof value === "string") || value.trim().length > 0);

  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="flex flex-1 flex-col">
        <dt className="text-xs font-medium uppercase text-gray-600">{label}</dt>
        <dd className="text-xs text-gray-500">{hasValue ? value : "—"}</dd>
      </div>
    </div>
  );
}
