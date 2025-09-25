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
  listHeaderPages,
  createHeaderPage,
  updateHeaderPage,
  type HeaderPageBackendResponse,
} from "@/api/websites/components";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadImage, deleteImage, getImageTitle } from "@/services/upload";

interface HeaderContent {
  id?: string;
  subtitulo?: string;
  titulo: string;
  descricao?: string;
  imagemUrl?: string;
  buttonLabel?: string;
  buttonLink?: string;
}

const PAGE_KEY = "RECRUTAMENTO" as const;

export default function HeaderForm() {
  const [content, setContent] = useState<HeaderContent>({ titulo: "" });
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [oldImageUrl, setOldImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const applyData = (first: HeaderPageBackendResponse) => {
      setContent({
        id: first.id,
        subtitulo: first.subtitulo ?? "",
        titulo: first.titulo ?? "",
        descricao: first.descricao ?? "",
        imagemUrl: first.imagemUrl ?? undefined,
        buttonLabel: first.buttonLabel ?? "",
        buttonLink: first.buttonLink ?? "",
      });
      setOldImageUrl(first.imagemUrl ?? undefined);

      if (first.imagemUrl) {
        const item: FileUploadItem = {
          id: "existing",
          name: getImageTitle(first.imagemUrl) || "imagem",
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

    const fetchData = async () => {
      setIsFetching(true);
      try {
        const data = await listHeaderPages({
          headers: { Accept: "application/json" },
        });
        const first = (data || []).find(
          (h) => (h.page || "").toString().toUpperCase() === PAGE_KEY
        );
        if (first) applyData(first);
      } catch (err) {
        toastCustom.error("Erro ao carregar cabeçalho");
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, []);

  const handleFilesChange = (list: FileUploadItem[]) => {
    if (list.length === 0) setContent((p) => ({ ...p, imagemUrl: undefined }));
    setFiles(list);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const titulo = content.titulo.trim();
    const subtitulo = (content.subtitulo || "").trim();
    const descricao = (content.descricao || "").trim();
    const buttonLabel = (content.buttonLabel || "").trim();
    const link = (content.buttonLink || "").trim();

    if (!titulo) {
      toastCustom.error("O título é obrigatório");
      return;
    }
    if (!subtitulo) {
      toastCustom.error("O subtítulo é obrigatório");
      return;
    }
    if (!descricao) {
      toastCustom.error("A descrição é obrigatória");
      return;
    }
    if (!buttonLabel) {
      toastCustom.error("O texto do botão é obrigatório");
      return;
    }
    if (!link) {
      toastCustom.error("O link do botão é obrigatório");
      return;
    }
    if (link && !/^https?:\/\//i.test(link)) {
      toastCustom.error("A URL do botão deve começar com http ou https");
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

    setIsLoading(true);
    toastCustom.info("Salvando cabeçalho...");

    let uploadResult: { url: string; title: string } | undefined;
    try {
      const fileItem = files[0];
      const previousUrl = oldImageUrl;
      if (fileItem?.file) {
        try {
          uploadResult = await uploadImage(
            fileItem.file,
            "website/header-pages",
            previousUrl
          );
        } catch (err) {
          toastCustom.error("Erro no upload da imagem. Tente novamente");
          return;
        }
      } else if (!fileItem && previousUrl) {
        await deleteImage(previousUrl);
      } else if (previousUrl) {
        uploadResult = { url: previousUrl, title: getImageTitle(previousUrl) };
      }

      const payload = {
        subtitulo,
        titulo,
        descricao,
        imagemUrl: uploadResult?.url || content.imagemUrl,
        buttonLabel,
        buttonLink: link,
        page: PAGE_KEY,
      };

      const saved = content.id
        ? await updateHeaderPage(content.id, payload)
        : await createHeaderPage(payload);

      toastCustom.success(
        content.id
          ? "Cabeçalho atualizado com sucesso!"
          : "Cabeçalho criado com sucesso!"
      );

      setContent({
        id: saved.id,
        subtitulo: saved.subtitulo ?? "",
        titulo: saved.titulo ?? "",
        descricao: saved.descricao ?? "",
        imagemUrl: saved.imagemUrl ?? undefined,
        buttonLabel: saved.buttonLabel ?? "",
        buttonLink: saved.buttonLink ?? "",
      });

      if (saved.imagemUrl) {
        setFiles([
          {
            id: saved.id,
            name: getImageTitle(saved.imagemUrl) || "imagem",
            size: 0,
            type: "image",
            status: "completed",
            uploadDate: new Date(saved.atualizadoEm || Date.now()),
            previewUrl: saved.imagemUrl,
            uploadedUrl: saved.imagemUrl,
          },
        ]);
      } else {
        setFiles([]);
      }

      setOldImageUrl(saved.imagemUrl ?? undefined);
    } catch (err) {
      const status = (err as any)?.status;
      let message = "Não foi possível salvar";
      if (status === 401) message = "Sessão expirada. Faça login novamente";
      else if (status === 403)
        message = "Você não tem permissão para esta ação";
      toastCustom.error(message);
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
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload de Imagem */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Imagem do Cabeçalho <span className="text-red-500">*</span>
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

          {/* Campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputCustom
              label="Título"
              id="titulo"
              value={content.titulo}
              onChange={(e) =>
                setContent((p) => ({ ...p, titulo: e.target.value }))
              }
              maxLength={80}
              required
            />
            <InputCustom
              label="Subtítulo"
              id="subtitulo"
              value={content.subtitulo || ""}
              onChange={(e) =>
                setContent((p) => ({ ...p, subtitulo: e.target.value }))
              }
              maxLength={100}
              required
            />
          </div>

          <div>
            <Label
              htmlFor="descricao"
              className="text-sm font-medium text-gray-700 required"
            >
              Descrição
            </Label>
            <div className="mt-1">
              <SimpleTextarea
                id="descricao"
                value={content.descricao || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setContent((p) => ({ ...p, descricao: e.target.value }))
                }
                maxLength={600}
                showCharCount
                className="min-h-[200px]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputCustom
              label="Texto do Botão"
              id="buttonLabel"
              value={content.buttonLabel || ""}
              onChange={(e) =>
                setContent((p) => ({ ...p, buttonLabel: e.target.value }))
              }
              maxLength={40}
              required
            />
            <InputCustom
              label="Link do Botão"
              id="buttonLink"
              value={content.buttonLink || ""}
              onChange={(e) =>
                setContent((p) => ({ ...p, buttonLink: e.target.value }))
              }
              maxLength={200}
              type="url"
              icon="Link"
              required
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
              withAnimation
            >
              Salvar
            </ButtonCustom>
          </div>
        </form>
      )}
    </div>
  );
}
