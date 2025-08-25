"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  InputCustom,
  ButtonCustom,
  FileUpload,
  type FileUploadItem,
} from "@/components/ui/custom";
import { routes } from "@/api/routes";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toastCustom } from "@/components/ui/custom/toast";

interface SobreContent {
  id?: string;
  titulo: string;
  descricao: string;
  imagemUrl?: string;
}

export default function SobreForm() {
  const [content, setContent] = useState<SobreContent>({
    titulo: "",
    descricao: "",
  });
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/v1/website/sobre");
        if (!res.ok) return;
        const data: any[] = await res.json();
        const first = data[0];
        if (first) {
          setContent({
            id: first.id,
            titulo: first.titulo ?? "",
            descricao: first.descricao ?? "",
            imagemUrl: first.imagemUrl ?? undefined,
          });
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
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleFilesChange = (list: FileUploadItem[]) => {
    setFiles(list);
    if (list.length === 0) {
      setContent((prev) => ({ ...prev, imagemUrl: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const title = content.titulo.trim();
    const description = content.descricao.trim();

    if (title.length < 10 || title.length > 50) {
      toastCustom.error("O título deve ter entre 10 e 50 caracteres.");
      return;
    }
    if (description.length < 10 || description.length > 500) {
      toastCustom.error("A descrição deve ter entre 10 e 500 caracteres.");
      return;
    }
    if (files.length === 0 && !content.imagemUrl) {
      toastCustom.error("Selecione uma imagem.");
      return;
    }

    const uploading = files.find(f => f.status === "uploading");
    if (uploading) {
      toastCustom.error("Aguarde o upload da imagem terminar.");
      return;
    }

    const failed = files.find(f => f.status === "failed");
    if (failed) {
      toastCustom.error("Erro no upload da imagem.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("titulo", title);
    formData.append("descricao", description);

    const file = files[0];
    if (file?.uploadedUrl) {
      formData.append("imagemUrl", file.uploadedUrl);
    } else if (content.imagemUrl) {
      formData.append("imagemUrl", content.imagemUrl);
    }

    try {
      const method = content.id ? "PUT" : "POST";
      const url = content.id
        ? `/api/v1/website/sobre/${content.id}`
        : "/api/v1/website/sobre";
      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error("Erro ao salvar");
      const saved = await res.json();
      toastCustom.success("Conteúdo salvo com sucesso.");
      setContent({
        id: saved.id,
        titulo: saved.titulo,
        descricao: saved.descricao,
        imagemUrl: saved.imagemUrl,
      });
      setFiles([
        {
          id: saved.id,
          name: saved.imagemTitulo || "imagem",
          size: 0,
          type: "image",
          status: "completed",
          uploadDate: new Date(saved.atualizadoEm || Date.now()),
          previewUrl: saved.imagemUrl,
          uploadedUrl: saved.imagemUrl,
        },
      ]);
    } catch (err) {
      console.error(err);
      toastCustom.error("Erro ao salvar o conteúdo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label>Imagem</Label>
        <FileUpload
          files={files}
          multiple={false}
          maxFiles={1}
          validation={{
            maxSize: 5 * 1024 * 1024,
            acceptedTypes: ["image/*"],
          }}
          uploadUrl={routes.upload.slider()}
          onFilesChange={handleFilesChange}
          showProgress={false}
        />
      </div>

      <div className="space-y-2">
        <InputCustom
          label="Título"
          id="titulo"
          value={content.titulo}
          onChange={(e) =>
            setContent((prev) => ({ ...prev, titulo: e.target.value }))
          }
          maxLength={50}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">
          Descrição <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="descricao"
          value={content.descricao}
          onChange={(e) =>
            setContent((prev) => ({ ...prev, descricao: e.target.value }))
          }
          className="min-h-[120px] resize-none"
          maxLength={500}
          required
        />
      </div>

      <ButtonCustom type="submit" icon="Save" isLoading={isLoading}>
        Salvar
      </ButtonCustom>
    </form>
  );
}

