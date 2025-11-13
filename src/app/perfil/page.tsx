"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile } from "@/api/usuarios";
import type { UsuarioProfileResponse } from "@/api/usuarios/types";
import { ProfileForm } from "@/theme/dashboard/components/profile/ProfileForm";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/custom";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

export default function PerfilPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Busca o perfil do usuário
  const {
    data: profileResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        throw new Error("Token não encontrado");
      }

      const response = await getUserProfile(token);
      if (!response || !("success" in response) || !response.success) {
        throw new Error("Erro ao carregar perfil");
      }

      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });

  // Mutation para atualizar o perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UsuarioProfileResponse["usuario"]>) => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        throw new Error("Token não encontrado");
      }

      const response = await updateUserProfile(data, token);
      if (!response || !("success" in response) || !response.success) {
        throw new Error("Erro ao atualizar perfil");
      }

      return response;
    },
    onSuccess: () => {
      // Invalida a query do perfil para refetch
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });

  const profile = useMemo(() => {
    if (!profileResponse || !("usuario" in profileResponse)) {
      return null;
    }
    return profileResponse.usuario;
  }, [profileResponse]);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-8">
        <div className="rounded-xl bg-white p-4 md:p-5 border border-gray-200/60">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-50/50 p-12 shadow-sm">
        <div className="text-center max-w-md mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Erro ao carregar perfil
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {error instanceof Error
              ? error.message
              : "Ocorreu um erro ao buscar os dados do perfil. Tente novamente."}
          </p>
          <button
            onClick={() => router.refresh()}
            className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl hover:opacity-90 transition-all font-medium shadow-md hover:shadow-lg"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <EmptyState
        title="Perfil não encontrado"
        description="Não foi possível carregar os dados do seu perfil."
        illustration="fileNotFound"
      />
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="rounded-xl bg-white p-4 md:p-5 border border-gray-200/60">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>

        <ProfileForm
          profile={profile}
          isLoading={updateProfileMutation.isPending}
          onSubmit={async (data) => {
            try {
              await updateProfileMutation.mutateAsync(data);
            } catch (error) {
              throw error;
            }
          }}
        />
      </div>
    </div>
  );
}

