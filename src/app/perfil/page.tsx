"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile } from "@/api/usuarios";
import type { UsuarioProfileResponse } from "@/api/usuarios/types";
import { ProfileForm } from "@/theme/dashboard/components/profile/ProfileForm";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonCustom } from "@/components/ui/custom";
import {
  AvatarCustom,
  EmptyState,
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  FileUpload,
} from "@/components/ui/custom";
import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import type { FileUploadItem } from "@/components/ui/custom/file-upload/types";
import { deleteFile, uploadImage } from "@/services/upload/uploadService";

const MAX_AVATAR_SIZE = 1 * 1024 * 1024;
const REQUIRED_AVATAR_DIMENSION = 250;

export default function PerfilPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [formActions, setFormActions] = useState<{
    onCancel: () => void;
    onSave: () => void;
    isDirty: boolean;
    isSubmitting: boolean;
  } | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarFiles, setAvatarFiles] = useState<FileUploadItem[]>([]);
  const [pendingAvatarDelete, setPendingAvatarDelete] = useState(false);

  const validateAvatarFile = useCallback(
    async (file: File): Promise<{ isValid: boolean; error?: string }> => {
      if (file.size > MAX_AVATAR_SIZE) {
        return {
          isValid: false,
          error: "A imagem deve ter no máximo 1 MB.",
        };
      }

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !["jpg", "jpeg", "png"].includes(ext)) {
        return {
          isValid: false,
          error: "Formato inválido. Envie JPG ou PNG.",
        };
      }

      return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
          URL.revokeObjectURL(url);
          const width = img.width;
          const height = img.height;

          const isSquare = width === height;
          if (
            !isSquare ||
            width < 100 ||
            height < 100 ||
            width > REQUIRED_AVATAR_DIMENSION ||
            height > REQUIRED_AVATAR_DIMENSION
          ) {
            resolve({
              isValid: false,
              error: `A imagem deve ser quadrada (100x100 a 250x250). Dimensões atuais: ${width}x${height}px`,
            });
          } else {
            resolve({ isValid: true });
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve({
            isValid: false,
            error: "Erro ao carregar a imagem para validação",
          });
        };

        img.src = url;
      });
    },
    []
  );

  const handleFilesAdded = useCallback(
    async (newFiles: FileUploadItem[]) => {
      if (newFiles.length === 0) return;

      const fileItem = newFiles[0];
      if (!fileItem.file) return;

      const validation = await validateAvatarFile(fileItem.file);
      if (!validation.isValid) {
        setAvatarFiles([
          {
            ...fileItem,
            status: "failed",
            error: validation.error,
          },
        ]);
        return;
      }

      setPendingAvatarDelete(false);
      setAvatarFiles(newFiles);
    },
    [validateAvatarFile]
  );

  const handleActionsChange = useCallback(
    (actions: {
      onCancel: () => void;
      onSave: () => void;
      isDirty: boolean;
      isSubmitting: boolean;
    }) => {
      setFormActions(actions);
    },
    []
  );

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
    onSuccess: (response) => {
      // Log para debug: verificar o que a API retorna após atualizar
      console.log(
        "📤 Resposta da API após atualizar:",
        JSON.stringify(response, null, 2)
      );

      // Atualiza o cache diretamente com os dados retornados
      if (response && "usuario" in response) {
        queryClient.setQueryData(["user-profile"], response);
      }
      // Sempre invalida para garantir que os dados sejam recarregados do servidor
      // Isso é necessário porque a API pode não retornar todos os campos atualizados
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error) => {
      console.error("❌ Erro na mutation:", error);
    },
  });

  const profile = useMemo(() => {
    if (!profileResponse || !("usuario" in profileResponse)) {
      return null;
    }
    return profileResponse.usuario;
  }, [profileResponse]);

  const profileStats = useMemo(() => {
    if (!profileResponse || !("stats" in profileResponse)) return null;
    return profileResponse.stats;
  }, [profileResponse]);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-60" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Skeleton className="h-9 w-full rounded-full" />
              <Skeleton className="h-9 w-full rounded-full" />
              <Skeleton className="h-9 w-full rounded-full" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7">
          <Skeleton className="h-6 w-64" />
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 pb-24">
        <section className="rounded-3xl border border-gray-200 bg-white px-6 py-8 sm:px-8 sm:py-10">
          <EmptyState
            title="Erro ao carregar perfil"
            description={
              error instanceof Error
                ? error.message
                : "Não foi possível carregar os dados do seu perfil. Tente novamente."
            }
            illustration="fileNotFound"
            size="lg"
            fullHeight={false}
            maxContentWidth="md"
            actions={
              <div className="flex justify-center items-center mt-6">
                <ButtonCustom
                  onClick={() => router.refresh()}
                  variant="primary"
                  size="lg"
                  icon="RefreshCw"
                  withAnimation
                >
                  Tentar novamente
                </ButtonCustom>
              </div>
            }
          />
        </section>
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

  const hasNewAvatarFile =
    avatarFiles.length > 0 &&
    avatarFiles[0]?.file &&
    avatarFiles[0]?.status !== "failed";
  const canSaveAvatar = pendingAvatarDelete || hasNewAvatarFile;
  const lastLoginLabel = profile.ultimoLogin
    ? new Date(profile.ultimoLogin).toLocaleString("pt-BR")
    : null;

  return (
    <>
      <div className="space-y-8 pb-8">
        <section className="rounded-3xl border border-gray-200 bg-white px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <AvatarCustom
                name={profile.nomeCompleto}
                src={profile.avatarUrl ?? undefined}
                size="xl"
                withBorder
                className="cursor-pointer transition-opacity hover:opacity-90"
                onClick={() => setIsAvatarModalOpen(true)}
              />
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full bg-white text-[var(--primary-color)] border-2 border-white hover:bg-[var(--secondary-color)] hover:text-white transition-all duration-300 ease-in-out cursor-pointer"
                aria-label="Editar foto de perfil"
              >
                <Pencil className="w-3 h-3 transition-colors duration-300" />
              </button>
            </div>
            <div className="space-y-1">
              <h4 className="!text-xl font-semibold text-gray-900 !mb-0">
                {profile.nomeCompleto}
              </h4>
              {lastLoginLabel && (
                <p className="!text-xs text-gray-500 !mb-0">
                  Último acesso: {lastLoginLabel}
                </p>
              )}
            </div>
          </div>
        </section>

        <section>
          <ProfileForm
            profile={profile}
            isLoading={updateProfileMutation.isPending}
            onSubmit={async (data) => {
              await updateProfileMutation.mutateAsync(data);
            }}
            renderActions={(actions) => (
              <ButtonCustom
                type="button"
                variant="primary"
                size="md"
                onClick={actions.onSave}
                disabled={!actions.isDirty || actions.isSubmitting}
                isLoading={actions.isSubmitting}
              >
                {actions.isSubmitting ? "Salvando..." : "Salvar alterações"}
              </ButtonCustom>
            )}
            onActionsChange={handleActionsChange}
          />
        </section>
      </div>

      {/* Modal de upload de avatar */}
      <ModalCustom
        isOpen={isAvatarModalOpen}
        onOpenChange={setIsAvatarModalOpen}
        size="xl"
        backdrop="blur"
      >
        <ModalContentWrapper>
          <ModalHeader>
            <ModalTitle className="mb-0!">Alterar foto de perfil</ModalTitle>
            <p className="text-xs! text-gray-600! mt-0!">
              A imagem precisa ser PNG ou JPG e deve respeitar as dimensões
              mínimas de 100x100 e máximas de 250x250 pixels.
            </p>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <FileUpload
                files={avatarFiles}
                multiple={false}
                maxFiles={1}
                validation={{
                  maxSize: 1 * 1024 * 1024, // 1MB
                  accept: [".jpg", ".jpeg", ".png"], // Apenas PNG e JPG
                  maxFiles: 1,
                }}
                autoUpload={false}
                deleteOnRemove={false}
                showPreview={true}
                showProgress={true}
                onFilesChange={(files) => setAvatarFiles(files)}
                onFilesAdded={handleFilesAdded}
                onFileRemove={() => {
                  setAvatarFiles([]);
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            {profile.avatarUrl && (
              <ButtonCustom
                variant="outline"
                size="md"
                onClick={() => {
                  setAvatarFiles([]);
                  setPendingAvatarDelete(true);
                }}
                disabled={updateProfileMutation.isPending}
              >
                Remover foto
              </ButtonCustom>
            )}
            <ButtonCustom
              variant="outline"
              size="md"
              onClick={() => {
                setIsAvatarModalOpen(false);
                setAvatarFiles([]);
                setPendingAvatarDelete(false);
              }}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              size="md"
              onClick={async () => {
                if (!canSaveAvatar) return;
                try {
                  if (pendingAvatarDelete) {
                    if (profile.avatarUrl) {
                      await deleteFile(profile.avatarUrl);
                    }
                    await updateProfileMutation.mutateAsync({
                      avatarUrl: null,
                    } as any);
                    setIsAvatarModalOpen(false);
                    setAvatarFiles([]);
                    setPendingAvatarDelete(false);
                    return;
                  }

                  const fileItem = avatarFiles[0];
                  if (!fileItem?.file) return;

                  setAvatarFiles([
                    {
                      ...fileItem,
                      status: "uploading",
                      progress: 30,
                    },
                  ]);

                  let uploadedUrl: string | null = null;
                  try {
                    const result = await uploadImage(
                      fileItem.file,
                      "usuarios/avatar"
                    );
                    uploadedUrl = result.url;
                    setAvatarFiles([
                      {
                        ...fileItem,
                        status: "completed",
                        progress: 100,
                        uploadedUrl: result.url,
                      },
                    ]);

                    await updateProfileMutation.mutateAsync({
                      avatarUrl: result.url,
                    } as any);
                  } catch (error) {
                    if (uploadedUrl) {
                      await deleteFile(uploadedUrl);
                    }
                    throw error;
                  }

                  setIsAvatarModalOpen(false);
                  setAvatarFiles([]);
                } catch (error) {
                  setAvatarFiles((prev) =>
                    prev.length > 0
                      ? [
                          {
                            ...prev[0],
                            status: "failed",
                            error: "Falha ao salvar a imagem. Tente novamente.",
                          },
                        ]
                      : prev
                  );
                  console.error("Erro ao atualizar avatar:", error);
                }
              }}
              disabled={!canSaveAvatar}
              isLoading={updateProfileMutation.isPending}
            >
              Salvar
            </ButtonCustom>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>
    </>
  );
}
