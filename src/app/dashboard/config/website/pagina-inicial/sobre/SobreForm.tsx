"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  InputCustom,
  FileUpload,
  type FileUploadItem,
  RichTextarea,
  ButtonCustom,
} from "@/components/ui/custom";
import { Label } from "@/components/ui/label";
import { toastCustom } from "@/components/ui/custom/toast";
import { listAbout, createAbout, updateAbout } from "@/api/websites/components";
import routes from "@/api/routes";

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
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) =>
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await listAbout();
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

          toastCustom.info("Conteúdo existente carregado");
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
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
      }
    };

    fetchData();
  }, []);

  const handleFilesChange = (list: FileUploadItem[]) => {
    const previousCount = files.length;
    const currentCount = list.length;

    setFiles(list);

    // Feedback quando arquivo é adicionado
    if (currentCount > previousCount) {
      toastCustom.success("Imagem adicionada com sucesso");
      addLog(`Arquivo selecionado: ${list.map((f) => f.name).join(", ")}`);
    }

    if (currentCount < previousCount) {
      toastCustom.info("Imagem removida");
      setContent((prev) => ({ ...prev, imagemUrl: undefined }));
      addLog("Arquivo removido");
    }

    if (currentCount === 0) {
      setContent((prev) => ({ ...prev, imagemUrl: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Bloqueia múltiplos cliques
    if (isLoading) return;

    const title = content.titulo.trim();
    const description = content.descricao.trim();

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

    // ✅ REMOVIDA: Validação de máximo de caracteres - agora é automática
    // ❌ if (description.length > 500) {
    // ❌   toastCustom.error("A descrição deve ter no máximo 500 caracteres");
    // ❌   return;
    // ❌ }

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

    try {
      const payload: {
        titulo: string;
        descricao: string;
        imagemUrl?: string;
      } = {
        titulo: title,
        descricao: description,
      };

      const file = files[0];
      if (file?.uploadedUrl) {
        payload.imagemUrl = file.uploadedUrl;
        addLog(`Usando imagem via URL: ${file.uploadedUrl}`);
      } else if (content.imagemUrl) {
        payload.imagemUrl = content.imagemUrl;
        addLog(`Usando imagem existente: ${content.imagemUrl}`);
      }

      addLog(`Payload enviado: ${JSON.stringify(payload)}`);

      const saved = content.id
        ? await updateAbout(content.id, payload)
        : await createAbout(payload);

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

      setContent({
        id: saved.id,
        titulo: saved.titulo,
        descricao: saved.descricao,
        imagemUrl: saved.imagemUrl,
      });

        if (saved.imagemUrl) {
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
        }
    } catch (err) {
      console.error("Erro ao salvar:", err);
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
              : `Erro ao salvar${status ? ` (${status})` : ""}. Tente novamente`;
      }
      toastCustom.error(
        errorMessage || "Não foi possível salvar as informações. Tente novamente",
      );
      addLog(`Erro da API: ${errorMessage}`);

      if (files[0]?.uploadedUrl) {
        try {
          await fetch(
            `${routes.upload.base()}?file=${encodeURIComponent(
              files[0].uploadedUrl.replace(/^\/+/g, ""),
            )}`,
            { method: "DELETE" },
          );
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
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
                validation={{ accept: ["image/*"] }}
                publicUrl="/sobre"
                onFilesChange={handleFilesChange}
                showProgress={false}
                onUploadStart={(file) => addLog(`Upload iniciado: ${file.name}`)}
                onUploadProgress={(id, progress) =>
                  addLog(`Upload progresso ${id}: ${Math.round(progress)}%`)
                }
                onUploadComplete={(file) =>
                  addLog(`Upload concluído: ${file.uploadedUrl}`)
                }
                onUploadError={(id, error) =>
                  addLog(`Upload erro ${id}: ${error}`)
                }
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
              placeholder="Digite o título da seção sobre"
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
              <RichTextarea
                id="descricao"
                value={content.descricao}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setContent((prev) => ({ ...prev, descricao: e.target.value }))
                }
                maxLength={500}
                showCharCount={true}
                placeholder="Descreva sobre sua empresa."
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
            disabled={isLoading}
            size="lg"
            variant="default"
            className="w-40"
            withAnimation={true}
          >
            Salvar
          </ButtonCustom>
        </div>
      </form>
      {/* Console de Debug */}
      <div className="pt-6">
        <Label className="text-sm font-medium text-gray-700">Console</Label>
        <div className="mt-2 bg-black text-green-400 p-3 rounded max-h-60 overflow-auto text-xs font-mono">
          {logs.map((log, idx) => (
            <div key={idx}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
