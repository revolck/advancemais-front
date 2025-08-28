"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  InputCustom,
  SimpleTextarea,
  ButtonCustom,
} from "@/components/ui/custom";
import { Label } from "@/components/ui/label";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  listSobreEmpresa,
  createSobreEmpresa,
  updateSobreEmpresa,
  type SobreEmpresaBackendResponse,
} from "@/api/websites/components";
import { Skeleton } from "@/components/ui/skeleton";

interface SobreEmpresaContent {
  id?: string;
  titulo: string;
  descricao: string;
  descricaoVisao: string;
  descricaoMissao: string;
  descricaoValores: string;
  videoUrl: string;
}

interface SobreEmpresaFormProps {
  initialData?: SobreEmpresaBackendResponse;
}

export default function SobreEmpresaForm({ initialData }: SobreEmpresaFormProps) {
  const [content, setContent] = useState<SobreEmpresaContent>({
    titulo: "",
    descricao: "",
    descricaoVisao: "",
    descricaoMissao: "",
    descricaoValores: "",
    videoUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(!initialData);

  const addLog = (message: string) =>
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);

  useEffect(() => {
    const applyData = (data: SobreEmpresaBackendResponse) => {
      setContent({
        id: data.id,
        titulo: data.titulo ?? "",
        descricao: data.descricao ?? "",
        descricaoVisao: data.descricaoVisao ?? "",
        descricaoMissao: data.descricaoMissao ?? "",
        descricaoValores: data.descricaoValores ?? "",
        videoUrl: data.videoUrl ?? "",
      });
    };

    if (initialData) {
      applyData(initialData);
      setIsFetching(false);
      return;
    }

    const fetchData = async () => {
      setIsFetching(true);
      try {
        const data = await listSobreEmpresa();
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
            toastCustom.error("Você não tem permissão para acessar este conteúdo");
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (content.id) {
        await updateSobreEmpresa(content.id, content);
        toastCustom.success("Conteúdo atualizado com sucesso");
        addLog("Conteúdo atualizado com sucesso");
      } else {
        const result = await createSobreEmpresa(content);
        setContent((prev) => ({ ...prev, id: result.id }));
        toastCustom.success("Conteúdo criado com sucesso");
        addLog("Conteúdo criado com sucesso");
      }
    } catch (err) {
      const status = (err as any)?.status;
      let errorMessage = "";
      switch (status) {
        case 400:
          errorMessage = "Dados inválidos. Verifique os campos";
          break;
        case 401:
          errorMessage = "Sessão expirada. Faça login novamente";
          break;
        case 403:
          errorMessage = "Você não tem permissão para realizar esta ação";
          break;
        case 500:
          errorMessage = "Erro interno do servidor";
          break;
        default:
          errorMessage =
            err instanceof TypeError
              ? "Erro de conexão. Verifique sua internet e tente novamente"
              : "Erro ao salvar. Tente novamente";
      }
      toastCustom.error(errorMessage);
      addLog(`Erro da API: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {isFetching ? (
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-1/3" />
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <div>
                <InputCustom
                  label="Título"
                  id="titulo"
                  value={content.titulo}
                  onChange={(e) =>
                    setContent((prev) => ({ ...prev, titulo: e.target.value }))
                  }
                  maxLength={100}
                  placeholder="Digite o título principal"
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
                    maxLength={1000}
                    showCharCount={true}
                    placeholder="Descreva sobre a empresa"
                    className="min-h-[150px]"
                    required
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="descricaoVisao"
                  className="text-sm font-medium text-gray-700"
                >
                  Visão <span className="text-red-500">*</span>
                </Label>
                <div className="mt-1">
                  <SimpleTextarea
                    id="descricaoVisao"
                    value={content.descricaoVisao}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setContent((prev) => ({
                        ...prev,
                        descricaoVisao: e.target.value,
                      }))
                    }
                    maxLength={1000}
                    showCharCount={true}
                    placeholder="Descreva a visão da empresa"
                    className="min-h-[150px]"
                    required
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="descricaoMissao"
                  className="text-sm font-medium text-gray-700"
                >
                  Missão <span className="text-red-500">*</span>
                </Label>
                <div className="mt-1">
                  <SimpleTextarea
                    id="descricaoMissao"
                    value={content.descricaoMissao}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setContent((prev) => ({
                        ...prev,
                        descricaoMissao: e.target.value,
                      }))
                    }
                    maxLength={1000}
                    showCharCount={true}
                    placeholder="Descreva a missão da empresa"
                    className="min-h-[150px]"
                    required
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="descricaoValores"
                  className="text-sm font-medium text-gray-700"
                >
                  Valores <span className="text-red-500">*</span>
                </Label>
                <div className="mt-1">
                  <SimpleTextarea
                    id="descricaoValores"
                    value={content.descricaoValores}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setContent((prev) => ({
                        ...prev,
                        descricaoValores: e.target.value,
                      }))
                    }
                    maxLength={1000}
                    showCharCount={true}
                    placeholder="Descreva os valores da empresa"
                    className="min-h-[150px]"
                    required
                  />
                </div>
              </div>

              <div>
                <InputCustom
                  label="URL do Vídeo"
                  id="videoUrl"
                  type="url"
                  value={content.videoUrl}
                  onChange={(e) =>
                    setContent((prev) => ({ ...prev, videoUrl: e.target.value }))
                  }
                  placeholder="https://exemplo.com/video"
                />
              </div>
            </div>

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
        </>
      )}
    </div>
  );
}
