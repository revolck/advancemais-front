"use client";

import { useEffect, useState, FormEvent } from "react";
import { Loader2 } from "lucide-react";
import {
  InputCustom,
  FileUpload,
  type FileUploadItem,
  RichTextarea,
} from "@/components/ui/custom";
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
        
        // Se não encontrar dados (404), não é erro - apenas não há conteúdo ainda
        if (res.status === 404) {
          return;
        }
        
        // Outros erros são tratados
        if (!res.ok) {
          switch (res.status) {
            case 401:
              toastCustom.error("Sessão expirada. Faça login novamente");
              break;
            case 403:
              toastCustom.error("Você não tem permissão para acessar este conteúdo");
              break;
            case 500:
              toastCustom.error("Erro do servidor ao carregar dados existentes");
              break;
            default:
              toastCustom.error("Erro ao carregar dados existentes");
          }
          return;
        }
        
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
          
          // Toast informativo quando carrega dados existentes
          toastCustom.info("Conteúdo existente carregado");
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        
        // Tratamento de erros de rede
        if (err instanceof TypeError && err.message.includes('fetch')) {
          toastCustom.error("Erro de conexão ao carregar dados. Verifique sua internet");
        } else {
          toastCustom.error("Erro inesperado ao carregar dados existentes");
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
    }
    
    // Feedback quando arquivo é removido
    if (currentCount < previousCount) {
      toastCustom.info("Imagem removida");
      setContent((prev) => ({ ...prev, imagemUrl: undefined }));
    }
    
    // Limpar imagemUrl se não há arquivos
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
    if (description.length > 500) {
      toastCustom.error("A descrição deve ter no máximo 500 caracteres");
      return;
    }

    if (files.length === 0 && !content.imagemUrl) {
      toastCustom.error("Uma imagem é obrigatória");
      return;
    }

    const uploading = files.find(f => f.status === "uploading");
    if (uploading) {
      toastCustom.error("Aguarde o upload da imagem terminar");
      return;
    }

    const failed = files.find(f => f.status === "failed");
    if (failed) {
      toastCustom.error("Erro no upload da imagem. Tente novamente");
      return;
    }

    setIsLoading(true);
    
    // Toast de loading
    toastCustom.info("Salvando conteúdo...");
    
    try {
      const formData = new FormData();
      formData.append("titulo", title);
      formData.append("descricao", description);

      const file = files[0];
      if (file?.file) {
        formData.append("imagem", file.file);
      } else if (content.imagemUrl) {
        formData.append("imagemUrl", content.imagemUrl);
      }

      const method = content.id ? "PUT" : "POST";
      const url = content.id
        ? `/api/v1/website/sobre/${content.id}`
        : "/api/v1/website/sobre";
        
      const res = await fetch(url, { method, body: formData });
      
      // Tratamento de erros específicos da API
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        
        switch (res.status) {
          case 400:
            toastCustom.error(errorData?.message || "Dados inválidos. Verifique os campos e tente novamente");
            break;
          case 401:
            toastCustom.error("Sessão expirada. Faça login novamente");
            break;
          case 403:
            toastCustom.error("Você não tem permissão para esta ação");
            break;
          case 413:
            toastCustom.error("Arquivo muito grande. Selecione uma imagem menor que 5MB");
            break;
          case 422:
            toastCustom.error(errorData?.message || "Erro de validação nos dados enviados");
            break;
          case 500:
            toastCustom.error("Erro interno do servidor. Tente novamente em alguns minutos");
            break;
          case 503:
            toastCustom.error("Serviço temporariamente indisponível. Tente novamente");
            break;
          default:
            toastCustom.error(`Erro ao salvar (${res.status}). Tente novamente`);
        }
        return;
      }
      
      const saved = await res.json();
      
      // Verificar se a resposta contém os dados esperados
      if (!saved || !saved.id) {
        toastCustom.error("Resposta inválida do servidor");
        return;
      }
      
      // Toast de sucesso detalhado
      const action = content.id ? "atualizado" : "criado";
      toastCustom.success(`Conteúdo ${action} com sucesso!`);
      
      // Atualizar estado
      setContent({
        id: saved.id,
        titulo: saved.titulo,
        descricao: saved.descricao,
        imagemUrl: saved.imagemUrl,
      });
      
      // Atualizar files se houver imagem
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
      
      // Tratamento de erros de rede
      if (err instanceof TypeError && err.message.includes('fetch')) {
        toastCustom.error("Erro de conexão. Verifique sua internet e tente novamente");
      } else if (err instanceof Error) {
        toastCustom.error(`Erro inesperado: ${err.message}`);
      } else {
        toastCustom.error("Erro inesperado. Tente novamente");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Conteúdo Básico */}
        <div className="space-y-3">
            <div>
              <InputCustom
                label="Título"
                id="titulo"
                value={content.titulo}
                onChange={(e) => setContent(prev => ({ ...prev, titulo: e.target.value }))}
                maxLength={50}
                placeholder="Digite o título da seção sobre"
                required
              />
            </div>

            <div>
              <Label htmlFor="descricao" className="text-sm font-medium text-gray-700">
                Descrição <span className="text-red-500">*</span>
              </Label>
              <div className="mt-1">
                <RichTextarea
                  id="descricao"
                  value={content.descricao}
                  onChange={(e) => setContent(prev => ({ ...prev, descricao: e.target.value }))}
                  maxLength={500}
                  placeholder="Descreva sobre sua empresa..."
                  className="min-h-[100px]"
                  required
                />
              </div>
            </div>
          </div>

        {/* Upload de Imagem */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Imagem</h4>
          
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Imagem de Destaque <span className="text-red-500">*</span>
            </Label>
            <div className="mt-2">
              <FileUpload
                files={files}
                multiple={false}
                maxFiles={1}
                validation={{
                  maxSize: 5 * 1024 * 1024,
                  acceptedTypes: ["image/*"],
                }}
                onUpload={async (_file) => ({})}
                onFilesChange={handleFilesChange}
                showProgress={false}
              />
            </div>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-2xl bg-[var(--color-blue)] text-white py-4 px-8 font-medium hover:bg-[var(--color-blue)]/90 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Salvar"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}