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
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await listLoginImages({ headers: { Accept: "application/json" } });
        const latest: LoginImageBackendResponse | undefined = data[data.length - 1];
        if (latest) {
          setContent({
            id: latest.id,
            imagemUrl: latest.imagemUrl,
            link: latest.link ?? undefined,
            imagemTitulo: latest.imagemTitulo,
          });
          const item: FileUploadItem = {
            id: "existing",
            name: latest.imagemTitulo || "imagem",
            size: 0,
            type: "image",
            status: "completed",
            uploadDate: new Date(latest.criadoEm),
            previewUrl: latest.imagemUrl,
            uploadedUrl: latest.imagemUrl,
          };
          setFiles([item]);
        }
      } catch (err) {
        toastCustom.error("Não foi possível carregar a imagem de login");
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleFilesChange = (list: FileUploadItem[]) => {
    setFiles(list);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;
    setIsLoading(true);
    try {
      const file = files[0]?.file;
      let resp: LoginImageBackendResponse;
      if (content.id) {
        resp = await updateLoginImage(content.id, {
          imagem: file,
          link: content.link,
          imagemTitulo: file ? file.name : content.imagemTitulo,
        });
      } else {
        resp = await createLoginImage({
          imagem: file!,
          link: content.link,
          imagemTitulo: file?.name || "login",
        });
      }
      setContent({
        id: resp.id,
        imagemUrl: resp.imagemUrl,
        link: resp.link ?? undefined,
        imagemTitulo: resp.imagemTitulo,
      });
      setFiles([
        {
          id: "existing",
          name: resp.imagemTitulo || "imagem",
          size: 0,
          type: "image",
          status: "completed",
          uploadDate: new Date(resp.criadoEm),
          previewUrl: resp.imagemUrl,
          uploadedUrl: resp.imagemUrl,
        },
      ]);
      toastCustom.success("Imagem de login salva com sucesso");
    } catch (err) {
      toastCustom.error("Erro ao salvar imagem de login");
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
                files.length === 0 ||
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

