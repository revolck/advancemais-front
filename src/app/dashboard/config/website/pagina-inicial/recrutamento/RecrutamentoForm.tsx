"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  InputCustom,
  FileUpload,
  type FileUploadItem,
  SimpleTextarea,
  ButtonCustom,
} from "@/components/ui/custom";
import { Label } from "@/components/ui/label";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  listRecrutamento,
  createRecrutamento,
  updateRecrutamento,
  type RecrutamentoBackendResponse,
} from "@/api/websites/components";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadImage, deleteImage, getImageTitle } from "@/services/upload";

interface RecrutamentoContent {
  id?: string;
  titulo: string;
  descricao: string;
  buttonUrl: string;
  buttonLabel: string;
  imagemUrl?: string;
}

interface RecrutamentoFormProps {
  initialData?: RecrutamentoBackendResponse;
}

export default function RecrutamentoForm({ initialData }: RecrutamentoFormProps) {
  const [content, setContent] = useState<RecrutamentoContent>({
    titulo: "",
    descricao: "",
    buttonUrl: "",
    buttonLabel: "",
  });
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(!initialData);
  const [oldImageUrl, setOldImageUrl] = useState<string | undefined>(
    initialData?.imagemUrl
  );

  const addLog = (message: string) =>
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);

  useEffect(() => {
    const applyData = (first: RecrutamentoBackendResponse) => {
      setContent({
        id: first.id,
        titulo: first.titulo ?? "",
        descricao: first.descricao ?? "",
        buttonUrl: first.buttonUrl ?? "",
        buttonLabel: first.buttonLabel ?? "",
        imagemUrl: first.imagemUrl ?? undefined,
      });
      setOldImageUrl(first.imagemUrl ?? undefined);

      if (first.imagemUrl) {
        const item: FileUploadItem = {
          id: "existing",
          name: first.imagemTitulo || "imagem",
          size: 0,
          type: "image",
          status: "completed",
          uploadDate: new Date(first.criadoEm || Date.now()),
          previewUrl: first.imagemUrl,
          uploadedUrl: first.imagemUrl,
        };
        setFiles([item]);
      }
    };

    if (initialData) {
      applyData(initialData);
      setIsFetching(false);
      return;
    }

    const fetchData = async () => {
      setIsFetching(true);
      try {
        const data = await listRecrutamento();
        const first = data[0];

        if (first) {
          applyData(first);
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
            toastCustom.error("Erro ao carregar dados existentes");
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [initialData]);

  const handleFilesChange = (list: FileUploadItem[]) => {
    const previousCount = files.length;
    const currentCount = list.length;

    // Feedback quando arquivo é adicionado
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

    // Bloqueia múltiplos cliques
    if (isLoading) return;

    const title = content.titulo.trim();
    const description = content.descricao.trim();
    const buttonUrl = content.buttonUrl.trim();
    const buttonLabel = content.buttonLabel.trim();

    // Validações com toasts específicos
    if (!title) {
      toastCustom.error("O título é obrigatório");
      return;
    }
    if (title.length < 10) {
      toastCustom.error("O título deve ter pelo menos 10 caracteres");
      return;
    }
    if (title.length > 50) {
      toastCustom.error("O título deve ter no máximo 50 caracteres");
      return;
    }

    if (!description) {
      toastCustom.error("A descrição é obrigatória");
      return;
    }
    if (description.length < 10) {
      toastCustom.error("A descrição deve ter pelo menos 10 caracteres");
      return;
    }

    if (!buttonUrl) {
      toastCustom.error("A URL do botão é obrigatória");
      return;
    }
    if (!buttonLabel) {
      toastCustom.error("O texto do botão é obrigatório");
      return;
    }

    if (files.length === 0 && !content.imagemUrl) {
      toastCustom.error("Uma imagem é obrigatória");
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

    // Toast de loading
    toastCustom.info("Salvando conteúdo...");

    let uploadResult: { url: string; title: string } | undefined;

    try {
      const payload: {
        titulo: string;
        descricao: string;
        buttonUrl: string;
        buttonLabel: string;
        imagemUrl?: string;
        imagemTitulo?: string;
      } = {
        titulo: title,
        descricao: description,
        buttonUrl,
        buttonLabel,
      };

      const fileItem = files[0];
      const previousUrl = oldImageUrl;

      if (fileItem?.file) {
        addLog(`Upload iniciado: ${fileItem.name}`);
        try {
          uploadResult = await uploadImage(
            fileItem.file,
            "website/recrutamento",
            previousUrl,
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
        ? await updateRecrutamento(content.id, payload)
        : await createRecrutamento(payload);

      addLog(`Resposta da API: ${JSON.stringify(saved)}`);

      if (!saved || !saved.id) {
        toastCustom.error("Resposta inválida do servidor");
        return;
      }

      if (content.id) {
        toastCustom.success("Informações atualizadas com sucesso!");
      } else {
        toastCustom.success("Informações criadas com sucesso!");
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
        titulo: saved.titulo,
        descricao: saved.descricao,
        buttonUrl: saved.buttonUrl,
        buttonLabel: saved.buttonLabel,
        imagemUrl: finalImageUrl,
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
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload de Imagem */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Imagem de Destaque <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2">
                  <FileUpload
                    files={files}
                    multiple={false}
                    maxFiles={1}
                    validation={{ accept: [".jpg", ".png", ".webp"] }}
                    autoUpload={false}
                    deleteOnRemove={false}
                    onFilesChange={handleFilesChange}
                    showProgress={false}
                  />
                </div>
              </div>
            </div>

            {/* Conteúdo Básico */}
            <div className="space-y-3">
              <div>
                <InputCustom
                  label="Título"
                  id="titulo"
                  value={content.titulo}
                  onChange={(e) =>
                    setContent((prev) => ({ ...prev, titulo: e.target.value }))
                  }
                  maxLength={50}
                  placeholder="Digite o título da seção de recrutamento"
                  required
                />
              </div>

              <div>
                <InputCustom
                  label="URL do Botão"
                  id="buttonUrl"
                  type="url"
                  value={content.buttonUrl}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      buttonUrl: e.target.value,
                    }))
                  }
                  placeholder="https://exemplo.com/recrutamento"
                  required
                />
              </div>

              <div>
                <InputCustom
                  label="Texto do Botão"
                  id="buttonLabel"
                  value={content.buttonLabel}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      buttonLabel: e.target.value,
                    }))
                  }
                  maxLength={50}
                  placeholder="Digite o texto do botão"
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="descricao"
                  className="text-sm font-medium text-gray-700"
                >
                  Descrição <span className="text-red-500">*</span>
                </Label>
                <div className="mt-1">
                  <SimpleTextarea
                    id="descricao"
                    value={content.descricao}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setContent((prev) => ({
                        ...prev,
                        descricao: e.target.value,
                      }))
                    }
                    maxLength={500}
                    showCharCount={true}
                    placeholder="Descreva a seção de recrutamento."
                    className="min-h-[250px]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Botão de Salvar */}
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
          </form>
        </>
      )}
    </div>
  );
}
