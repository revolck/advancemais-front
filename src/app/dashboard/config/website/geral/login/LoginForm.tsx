"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  FileUpload,
  type FileUploadItem,
  InputCustom,
  ButtonCustom,
} from "@/components/ui/custom";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  listLoginImages,
  createLoginImage,
  updateLoginImage,
  type LoginImageBackendResponse,
} from "@/api/websites/components";
import { uploadImage, deleteImage, getImageTitle } from "@/services/upload";

interface LoginContent {
  id?: string;
  imagemUrl?: string;
  link?: string;
  imagemTitulo?: string;
}

export default function LoginForm() {
  const [content, setContent] = useState<LoginContent>({});
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [oldImageUrl, setOldImageUrl] = useState<string | undefined>(undefined);

  const addLog = (message: string) =>
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        const data = await listLoginImages({
          headers: { Accept: "application/json" },
        });
        const latest: LoginImageBackendResponse | undefined =
          data[data.length - 1];
        if (latest) {
          setContent({
            id: latest.id,
            imagemUrl: latest.imagemUrl,
            link: latest.link ?? undefined,
            imagemTitulo: latest.imagemTitulo,
          });
          setOldImageUrl(latest.imagemUrl ?? undefined);

          if (latest.imagemUrl) {
            const item: FileUploadItem = {
              id: "existing",
              name:
                latest.imagemTitulo ||
                getImageTitle(latest.imagemUrl) ||
                "imagem",
              size: 0,
              type: "image",
              status: "completed",
              uploadDate: new Date(latest.criadoEm || Date.now()),
              previewUrl: latest.imagemUrl,
              uploadedUrl: latest.imagemUrl,
            };
            setFiles([item]);
          }
        }
      } catch (err) {
        addLog(`Erro ao carregar dados: ${String(err)}`);
        const status = (err as any)?.status;
        switch (status) {
          case 401:
            toastCustom.error("Sessão expirada. Faça login novamente");
            break;
          case 403:
            toastCustom.error(
              "Você não tem permissão para acessar este conteúdo"
            );
            break;
          case 500:
            toastCustom.error("Erro do servidor ao carregar dados existentes");
            break;
          default:
            toastCustom.error("Não foi possível carregar a imagem de login");
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, []);

  const handleFilesChange = (list: FileUploadItem[]) => {
    const previousCount = files.length;
    const currentCount = list.length;

    if (currentCount > previousCount) {
      addLog(`Arquivo selecionado: ${list.map((f) => f.name).join(", ")}`);
    }

    if (currentCount < previousCount) {
      setContent((prev) => ({ ...prev, imagemUrl: undefined }));
      addLog("Arquivo removido");
    }

    if (currentCount === 0) {
      setContent((prev) => ({ ...prev, imagemUrl: undefined }));
    }

    setFiles(list);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    const link = content.link?.trim();

    if (files.length === 0 && !content.imagemUrl) {
      toastCustom.error("Uma imagem é obrigatória");
      return;
    }

    if (link && !/^https?:\/\//i.test(link)) {
      toastCustom.error("O link deve começar com http ou https");
      return;
    }

    const uploading = files.find((f) => f.status === "uploading");
    if (uploading) {
      toastCustom.error("Aguarde o upload da imagem terminar");
      return;
    }

    const failed = files.find((f) => f.status === "failed");
    if (failed) {
      toastCustom.error("Erro no upload da imagem. Tente novamente");
      return;
    }

    setIsLoading(true);
    toastCustom.info("Salvando conteúdo...");

    let uploadResult: { url: string; title: string } | undefined;

    try {
      const payload: {
        link?: string;
        imagemUrl?: string;
        imagemTitulo?: string;
      } = {
        link: link || undefined,
      };

      const fileItem = files[0];
      const previousUrl = oldImageUrl;

      if (fileItem?.file) {
        addLog(`Upload iniciado: ${fileItem.name}`);
        try {
          uploadResult = await uploadImage(
            fileItem.file,
            "website/imagem-login",
            previousUrl
          );
          addLog(`Upload concluído: ${uploadResult.url}`);
        } catch (err) {
          addLog(`Upload erro: ${String(err)}`);
          toastCustom.error("Erro no upload da imagem. Tente novamente");
          return;
        }
      } else if (!fileItem && previousUrl) {
        await deleteImage(previousUrl);
        addLog(`Arquivo antigo removido: ${previousUrl}`);
      } else if (previousUrl) {
        uploadResult = { url: previousUrl, title: getImageTitle(previousUrl) };
        addLog(`Usando imagem existente: ${previousUrl}`);
      }

      if (uploadResult) {
        payload.imagemUrl = uploadResult.url;
        payload.imagemTitulo = uploadResult.title;
      }

      addLog(`Payload enviado: ${JSON.stringify(payload)}`);

      const saved = content.id
        ? await updateLoginImage(content.id, payload)
        : await createLoginImage(payload);

      addLog(`Resposta da API: ${JSON.stringify(saved)}`);

      if (!saved || !saved.id) {
        toastCustom.error("Resposta inválida do servidor");
        return;
      }

      if (content.id) {
        toastCustom.success("Imagem de login atualizada com sucesso!");
      } else {
        toastCustom.success("Imagem de login cadastrada com sucesso!");
      }

      const finalImageUrl = payload.imagemUrl || saved.imagemUrl;
      const finalImageTitle = payload.imagemTitulo || saved.imagemTitulo;

      if (payload.imagemUrl && payload.imagemUrl !== saved.imagemUrl) {
        addLog(
          `Forçando uso da imagem enviada: ${payload.imagemUrl} (API retornou ${saved.imagemUrl})`
        );
      }

      setContent({
        id: saved.id,
        imagemUrl: finalImageUrl,
        link: saved.link ?? payload.link,
        imagemTitulo: finalImageTitle,
      });

      if (finalImageUrl) {
        setFiles([
          {
            id: saved.id,
            name: finalImageTitle || "imagem",
            size: 0,
            type: "image",
            status: "completed",
            uploadDate: new Date(saved.atualizadoEm || Date.now()),
            previewUrl: finalImageUrl,
            uploadedUrl: finalImageUrl,
          },
        ]);
      } else {
        setFiles([]);
      }

      setOldImageUrl(finalImageUrl);
    } catch (err) {
      addLog(`Erro ao salvar: ${String(err)}`);
      const status = (err as any)?.status;
      let errorMessage: string;
      switch (status) {
        case 400:
          errorMessage =
            (err as Error).message ||
            "Dados inválidos. Verifique os campos e tente novamente";
          break;
        case 401:
          errorMessage = "Sessão expirada. Faça login novamente";
          break;
        case 403:
          errorMessage = "Você não tem permissão para esta ação";
          break;
        case 413:
          errorMessage =
            "Arquivo muito grande. Selecione uma imagem menor que 5MB";
          break;
        case 422:
          errorMessage =
            (err as Error).message || "Erro de validação nos dados enviados";
          break;
        case 500:
          errorMessage =
            "Erro interno do servidor. Tente novamente em alguns minutos";
          break;
        case 503:
          errorMessage =
            "Serviço temporariamente indisponível. Tente novamente";
          break;
        default:
          errorMessage =
            err instanceof TypeError
              ? "Erro de conexão. Verifique sua internet e tente novamente"
              : `Erro ao salvar${
                  status ? ` (${status})` : ""
                }. Tente novamente`;
      }
      toastCustom.error(
        errorMessage ||
          "Não foi possível salvar as informações. Tente novamente"
      );
      addLog(`Erro da API: ${errorMessage}`);

      if (uploadResult?.url) {
        await deleteImage(uploadResult.url);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {isFetching ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-1/3" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset disabled={isLoading} className="space-y-6">
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">
              Imagem de Login <span className="text-red-500">*</span>
            </Label>
                <FileUpload
                  files={files}
                  multiple={false}
                  maxFiles={1}
                  validation={{ accept: [".jpg", ".png", ".webp"] }}
                  autoUpload={false}
                  deleteOnRemove={false}
                  onFilesChange={handleFilesChange}
                  showProgress={false}
                  disabled={isLoading}
                />
          </div>

          <div>
            <InputCustom
              label="Link"
              id="link"
              value={content.link ?? ""}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, link: e.target.value }))
              }
              maxLength={255}
              placeholder="https://example.com"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <ButtonCustom
              type="submit"
              isLoading={isLoading}
              disabled={
                isLoading ||
                (!content.imagemUrl && files.length === 0) ||
                files.some((f) => f.status === "uploading")
              }
              size="lg"
              variant="default"
              className="w-40"
              withAnimation={true}
            >
              Salvar
            </ButtonCustom>
          </div>
          </fieldset>
        </form>
      )}
    </div>
  );
}
