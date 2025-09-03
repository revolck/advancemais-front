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
  listAdvanceAjuda,
  createAdvanceAjuda,
  updateAdvanceAjuda,
  type AdvanceAjudaBackendResponse,
} from "@/api/websites/components";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadImage, deleteImage, getImageTitle } from "@/services/upload";

interface AjudaContent {
  id?: string;
  titulo: string;
  descricao: string;
  imagemUrl?: string;
  titulo1: string;
  descricao1: string;
  titulo2: string;
  descricao2: string;
  titulo3: string;
  descricao3: string;
}

export default function AjudaForm() {
  const [content, setContent] = useState<AjudaContent>({
    titulo: "",
    descricao: "",
    imagemUrl: undefined,
    titulo1: "",
    descricao1: "",
    titulo2: "",
    descricao2: "",
    titulo3: "",
    descricao3: "",
  });
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [oldImageUrl, setOldImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const applyData = (first: AdvanceAjudaBackendResponse) => {
      setContent({
        id: first.id,
        titulo: first.titulo ?? "",
        descricao: first.descricao ?? "",
        imagemUrl: first.imagemUrl ?? undefined,
        titulo1: first.titulo1 ?? "",
        descricao1: first.descricao1 ?? "",
        titulo2: first.titulo2 ?? "",
        descricao2: first.descricao2 ?? "",
        titulo3: first.titulo3 ?? "",
        descricao3: first.descricao3 ?? "",
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
        const data = await listAdvanceAjuda({ headers: { Accept: "application/json" } });
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

  const handleFilesChange = (list: FileUploadItem[]) => {
    if (list.length === 0) setContent((p) => ({ ...p, imagemUrl: undefined }));
    setFiles(list);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const titulo = content.titulo.trim();
    const descricao = content.descricao.trim();
    const t1 = content.titulo1.trim();
    const d1 = content.descricao1.trim();
    const t2 = content.titulo2.trim();
    const d2 = content.descricao2.trim();
    const t3 = content.titulo3.trim();
    const d3 = content.descricao3.trim();

    if (!titulo) {
      toastCustom.error("O título é obrigatório");
      return;
    }
    if (!descricao) {
      toastCustom.error("A descrição é obrigatória");
      return;
    }
    if (!t1 || !d1 || !t2 || !d2 || !t3 || !d3) {
      toastCustom.error("Preencha todos os blocos de conteúdo");
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
    toastCustom.info("Salvando conteúdo...");

    let uploadResult: { url: string; title: string } | undefined;
    try {
      const fileItem = files[0];
      const previousUrl = oldImageUrl;
      if (fileItem?.file) {
        try {
          uploadResult = await uploadImage(fileItem.file, "website/ajuda", previousUrl);
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
        titulo,
        descricao,
        imagemUrl: uploadResult?.url || content.imagemUrl,
        imagemTitulo: uploadResult?.title,
        titulo1: t1,
        descricao1: d1,
        titulo2: t2,
        descricao2: d2,
        titulo3: t3,
        descricao3: d3,
      };

      const saved = content.id
        ? await updateAdvanceAjuda(content.id, payload)
        : await createAdvanceAjuda(payload);

      toastCustom.success(content.id ? "Conteúdo atualizado com sucesso!" : "Conteúdo criado com sucesso!");

      setContent({
        id: saved.id,
        titulo: saved.titulo ?? "",
        descricao: saved.descricao ?? "",
        imagemUrl: saved.imagemUrl ?? undefined,
        titulo1: saved.titulo1 ?? "",
        descricao1: saved.descricao1 ?? "",
        titulo2: saved.titulo2 ?? "",
        descricao2: saved.descricao2 ?? "",
        titulo3: saved.titulo3 ?? "",
        descricao3: saved.descricao3 ?? "",
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
          {/* Upload de Imagem */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Imagem <span className="text-red-500">*</span>
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

          {/* Campos principais */}
          <div className="space-y-4">
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
          </div>

          {/* Blocos 1..3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <InputCustom
                  label={`Título ${i}`}
                  id={`titulo${i}`}
                  value={(content as any)[`titulo${i}`]}
                  onChange={(e) =>
                    setContent((p) => ({ ...p, [`titulo${i}`]: e.target.value } as any))
                  }
                  maxLength={80}
                  required
                />
                <SimpleTextarea
                  id={`descricao${i}`}
                  value={(content as any)[`descricao${i}`]}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setContent((p) => ({ ...p, [`descricao${i}`]: e.target.value } as any))
                  }
                  maxLength={300}
                  showCharCount
                  className="min-h-[120px]"
                  required
                />
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <ButtonCustom
              type="submit"
              isLoading={isLoading}
              disabled={
                isLoading || (!content.imagemUrl && files.length === 0) || files.some((f) => f.status === "uploading")
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
