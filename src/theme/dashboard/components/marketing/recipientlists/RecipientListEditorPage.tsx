"use client";

import { AlertCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  createRecipientList,
  getRecipientListById,
  getRecipientListRecipientsOptions,
  getRecipientListRuleOptions,
  updateRecipientList,
} from "@/api/websites/components/recipientlists";
import type {
  CreateRecipientListPayload,
  UpdateRecipientListPayload,
} from "@/api/websites/components/recipientlists";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyState, toastCustom } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { RecipientListForm } from "./RecipientListForm";

interface RecipientListEditorPageProps {
  listId?: string;
}

function RecipientListFormSkeleton() {
  return (
    <div className="w-full relative">
      <div className="rounded-3xl bg-white p-6 border border-gray-200 space-y-6">
        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:[grid-template-columns:minmax(0,1.6fr)_220px_220px]">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-28 w-full rounded-md" />
          </div>
        </section>

        <section className="space-y-4 border-t border-gray-200 pt-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_200px] lg:items-end">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-4 w-80 rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
            <Skeleton className="h-12 w-full rounded-md" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={`recipient-rule-skeleton-${index}`}
                className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 xl:grid-cols-[180px_minmax(0,1.15fr)_220px_minmax(0,1.35fr)_48px]"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 rounded" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-14 rounded" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12 rounded" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
                <div className="flex items-end">
                  <Skeleton className="h-12 w-12 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 border-t border-gray-200 pt-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-4 w-72 rounded" />
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-64 rounded" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-2 mt-10">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function RecipientListEditorPage({
  listId,
}: RecipientListEditorPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(listId);

  const ruleOptionsQuery = useQuery({
    queryKey: queryKeys.marketingRecipientLists.ruleOptions(),
    queryFn: getRecipientListRuleOptions,
    refetchOnWindowFocus: false,
  });

  const recipientsOptionsQuery = useQuery({
    queryKey: queryKeys.marketingRecipientLists.recipientsOptions({
      search: "",
      kind: "ALL",
      limit: 100,
    }),
    queryFn: () =>
      getRecipientListRecipientsOptions({
        search: "",
        kind: "ALL",
        limit: 100,
      }),
    refetchOnWindowFocus: false,
  });

  const detailQuery = useQuery({
    queryKey: listId
      ? queryKeys.marketingRecipientLists.detail(listId)
      : ["admin-marketing-recipient-list-create"],
    queryFn: () => getRecipientListById(listId as string),
    enabled: isEditMode,
    refetchOnWindowFocus: false,
  });

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["admin-marketing-recipient-lists"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["admin-marketing-email-recipient-options"],
      }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: createRecipientList,
    onSuccess: async () => {
      toastCustom.success("Lista criada com sucesso.");
      await invalidateAll();
      router.push("/dashboard/marketing/listas");
    },
    onError: (error) => {
      toastCustom.error(error?.message || "Erro ao criar lista.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRecipientListPayload }) =>
      updateRecipientList(id, payload),
    onSuccess: async () => {
      toastCustom.success("Lista atualizada com sucesso.");
      await invalidateAll();
      router.push("/dashboard/marketing/listas");
    },
    onError: (error) => {
      toastCustom.error(error?.message || "Erro ao atualizar lista.");
    },
  });

  const isLoading =
    ruleOptionsQuery.isLoading ||
    recipientsOptionsQuery.isLoading ||
    (isEditMode && detailQuery.isLoading);
  const isReady =
    Boolean(ruleOptionsQuery.data) &&
    Boolean(recipientsOptionsQuery.data) &&
    (!isEditMode || Boolean(detailQuery.data));

  const error =
    ruleOptionsQuery.error ||
    recipientsOptionsQuery.error ||
    detailQuery.error;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error.message || "Erro ao carregar editor de lista."}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !isReady) {
    return <RecipientListFormSkeleton />;
  }

  if (isEditMode && !detailQuery.data) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <EmptyState
          fullHeight
          illustration="fileNotFound"
          illustrationAlt="Lista não encontrada"
          title="Lista não encontrada"
          description="A lista solicitada não está mais disponível."
        />
      </div>
    );
  }

  return (
    <RecipientListForm
      mode={isEditMode ? "edit" : "create"}
      list={detailQuery.data ?? null}
      ruleOptions={ruleOptionsQuery.data}
      recipientOptions={recipientsOptionsQuery.data}
      isSubmitting={createMutation.isPending || updateMutation.isPending}
      onCancel={() => router.push("/dashboard/marketing/listas")}
      onSubmit={async (payload) => {
        if (isEditMode) {
          await updateMutation.mutateAsync({
            id: listId as string,
            payload: payload as UpdateRecipientListPayload,
          });
          return;
        }

        await createMutation.mutateAsync(payload as CreateRecipientListPayload);
      }}
    />
  );
}
