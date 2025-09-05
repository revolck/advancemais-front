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
  listConexaoForte,
  createConexaoForte,
  updateConexaoForte,
  type ConexaoForteBackendResponse,
} from "@/api/websites/components";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadImage, deleteImage, getImageTitle } from "@/services/upload";

interface ConexaoContent {
  id?: string;
  titulo: string;
  descricao: string;
  imagemUrl1?: string;
  imagemUrl2?: string;
  imagemUrl3?: string;
  imagemUrl4?: string;
}

type ImageKey = 1 | 2 | 3 | 4;
const imageKeys: ImageKey[] = [1, 2, 3, 4];

export default function ConexaoForm() {
  const [content, setContent] = useState<ConexaoContent>({
    titulo: "",
    descricao: "",
  });
  const [files, setFiles] = useState<Record<ImageKey, FileUploadItem[]>>({
    1: [],
    2: [],
    3: [],
    4: [],
  });
  const [oldImages, setOldImages] = useState<Record<ImageKey, string | undefined>>({
    1: undefined,
    2: undefined,
    3: undefined,
    4: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const applyData = (first: ConexaoForteBackendResponse) => {
      setContent({
        id: first.id,
        titulo: first.titulo ?? "",
        descricao: first.descricao ?? "",
        imagemUrl1: first.imagemUrl1 ?? undefined,
        imagemUrl2: first.imagemUrl2 ?? undefined,
        imagemUrl3: first.imagemUrl3 ?? undefined,
        imagemUrl4: first.imagemUrl4 ?? undefined,
      });
      const newOld: Record<ImageKey, string | undefined> = {
        1: first.imagemUrl1 ?? undefined,
        2: first.imagemUrl2 ?? undefined,
        3: first.imagemUrl3 ?? undefined,
        4: first.imagemUrl4 ?? undefined,
      };
      setOldImages(newOld);
      const newFiles: Record<ImageKey, FileUploadItem[]> = { 1: [], 2: [], 3: [], 4: [] };
      imageKeys.forEach((key) => {
        const url = newOld[key];
        if (url) {
          newFiles[key].push({
            id: `existing-${key}`,
            name: getImageTitle(url) || `imagem${key}`,
            size: 0,
            type: "image",
            status: "completed",
            uploadDate: new Date(first.criadoEm || Date.now()),
            previewUrl: url,
            uploadedUrl: url,
          });
        }
      });
      setFiles(newFiles);
    };

    const fetchData = async () => {
      setIsFetching(true);
      try {
        const data = await listConexaoForte({ headers: { Accept: "application/json" } });
        const first = data?.[0];
        if (first) applyData(first);
      } catch (err) {
        toastCustom.error("Erro ao carregar conteúdo");
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, []);

  const handleFilesChange = (key: ImageKey, list: FileUploadItem[]) => {
    if (list.length === 0) {
      setContent((p) => ({ ...p, [`imagemUrl${key}`]: undefined }));
    }
    setFiles((prev) => ({ ...prev, [key]: list }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const titulo = content.titulo.trim();
    const descricao = content.descricao.trim();

    if (!titulo) {
      toastCustom.error("O título é obrigatório");
      return;
    }
    if (!descricao) {
      toastCustom.error("A descrição é obrigatória");
      return;
    }

    const missing = imageKeys.some(
      (k) => files[k].length === 0 && !content[`imagemUrl${k}` as keyof ConexaoContent],
    );
    if (missing) {
      toastCustom.error("Todas as imagens são obrigatórias");
      return;
    }

    const uploading = imageKeys.some((k) =>
      files[k].some((f) => f.status === "uploading"),
    );
    if (uploading) {
      toastCustom.error("Aguarde o upload das imagens terminar");
      return;
    }

    setIsLoading(true);
    toastCustom.info("Salvando conteúdo...");

    const uploads: Record<ImageKey, { url: string; title: string } | undefined> = {
      1: undefined,
      2: undefined,
      3: undefined,
      4: undefined,
    };

    try {
      for (const key of imageKeys) {
        const fileItem = files[key][0];
        const previousUrl = oldImages[key];
        if (fileItem?.file) {
          try {
            uploads[key] = await uploadImage(fileItem.file, "website/conexao", previousUrl);
          } catch (err) {
            toastCustom.error(`Erro no upload da imagem ${key}. Tente novamente`);
            setIsLoading(false);
            return;
          }
        } else if (!fileItem && previousUrl) {
          await deleteImage(previousUrl);
        } else if (previousUrl) {
          uploads[key] = { url: previousUrl, title: getImageTitle(previousUrl) };
        }
      }

      const payload = {
        titulo,
        descricao,
        imagemUrl1: uploads[1]?.url || content.imagemUrl1,
        imagemTitulo1: uploads[1]?.title,
        imagemUrl2: uploads[2]?.url || content.imagemUrl2,
        imagemTitulo2: uploads[2]?.title,
        imagemUrl3: uploads[3]?.url || content.imagemUrl3,
        imagemTitulo3: uploads[3]?.title,
        imagemUrl4: uploads[4]?.url || content.imagemUrl4,
        imagemTitulo4: uploads[4]?.title,
      };

      const saved = content.id
        ? await updateConexaoForte(content.id, payload)
        : await createConexaoForte(payload);

      toastCustom.success(
        content.id ? "Conteúdo atualizado com sucesso!" : "Conteúdo criado com sucesso!",
      );

      setContent({
        id: saved.id,
        titulo: saved.titulo ?? "",
        descricao: saved.descricao ?? "",
        imagemUrl1: saved.imagemUrl1 ?? undefined,
        imagemUrl2: saved.imagemUrl2 ?? undefined,
        imagemUrl3: saved.imagemUrl3 ?? undefined,
        imagemUrl4: saved.imagemUrl4 ?? undefined,
      });
      const newOld: Record<ImageKey, string | undefined> = {
        1: saved.imagemUrl1 ?? undefined,
        2: saved.imagemUrl2 ?? undefined,
        3: saved.imagemUrl3 ?? undefined,
        4: saved.imagemUrl4 ?? undefined,
      };
      setOldImages(newOld);
      const newFiles: Record<ImageKey, FileUploadItem[]> = { 1: [], 2: [], 3: [], 4: [] };
      for (const key of imageKeys) {
        const url = newOld[key];
        if (url) {
          newFiles[key] = [
            {
              id: saved.id,
              name: getImageTitle(url) || `imagem${key}`,
              size: 0,
              type: "image",
              status: "completed",
              uploadDate: new Date(saved.atualizadoEm || Date.now()),
              previewUrl: url,
              uploadedUrl: url,
            },
          ];
        }
      }
      setFiles(newFiles);
    } catch (err) {
      const status = (err as any)?.status;
      let message = "Não foi possível salvar";
      if (status === 401) message = "Sessão expirada. Faça login novamente";
      else if (status === 403) message = "Você não tem permissão para esta ação";
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {imageKeys.map((i) => (
              <div key={i} className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {`Imagem ${i}`} <span className="text-red-500">*</span>
                </Label>
                <FileUpload
                  files={files[i]}
                  multiple={false}
                  maxFiles={1}
                  validation={{ accept: [".jpg", ".png", ".webp"] }}
                  autoUpload={false}
                  deleteOnRemove={false}
                  onFilesChange={(list) => handleFilesChange(i, list)}
                  showProgress={false}
                />
              </div>
            ))}
          </div>

          <InputCustom
            label="Título"
            id="titulo"
            value={content.titulo}
            onChange={(e) => setContent((p) => ({ ...p, titulo: e.target.value }))}
            maxLength={100}
            required
          />

          <div>
            <Label htmlFor="descricao" className="text-sm font-medium text-gray-700 required">
              Descrição
            </Label>
            <div className="mt-1">
              <SimpleTextarea
                id="descricao"
                value={content.descricao}
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

          <div className="pt-4 flex justify-end">
            <ButtonCustom
              type="submit"
              isLoading={isLoading}
              disabled={
                isLoading ||
                imageKeys.some(
                  (k) =>
                    (!content[`imagemUrl${k}` as keyof ConexaoContent] && files[k].length === 0) ||
                    files[k].some((f) => f.status === "uploading"),
                )
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
