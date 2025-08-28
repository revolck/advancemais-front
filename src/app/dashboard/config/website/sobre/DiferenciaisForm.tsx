"use client";

import { useEffect, useState, FormEvent } from "react";
import { InputCustom, RichTextarea, ButtonCustom } from "@/components/ui/custom";
import { Label } from "@/components/ui/label";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  listDiferenciais,
  createDiferenciais,
  updateDiferenciais,
  type DiferenciaisBackendResponse,
} from "@/api/websites/components";
import { Skeleton } from "@/components/ui/skeleton";

interface DiferenciaisContent {
  id?: string;
  titulo: string;
  descricao: string;
  botaoUrl: string;
  botaoLabel: string;
  icone1: string;
  titulo1: string;
  descricao1: string;
  icone2: string;
  titulo2: string;
  descricao2: string;
  icone3: string;
  titulo3: string;
  descricao3: string;
  icone4: string;
  titulo4: string;
  descricao4: string;
}

interface DiferenciaisFormProps {
  initialData?: DiferenciaisBackendResponse;
}

export default function DiferenciaisForm({ initialData }: DiferenciaisFormProps) {
  const [content, setContent] = useState<DiferenciaisContent>({
    titulo: "",
    descricao: "",
    botaoUrl: "",
    botaoLabel: "",
    icone1: "",
    titulo1: "",
    descricao1: "",
    icone2: "",
    titulo2: "",
    descricao2: "",
    icone3: "",
    titulo3: "",
    descricao3: "",
    icone4: "",
    titulo4: "",
    descricao4: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!initialData);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) =>
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);

  useEffect(() => {
    const applyData = (data: DiferenciaisBackendResponse) => {
      setContent({
        id: data.id,
        titulo: data.titulo ?? "",
        descricao: data.descricao ?? "",
        botaoUrl: data.botaoUrl ?? "",
        botaoLabel: data.botaoLabel ?? "",
        icone1: data.icone1 ?? "",
        titulo1: data.titulo1 ?? "",
        descricao1: data.descricao1 ?? "",
        icone2: data.icone2 ?? "",
        titulo2: data.titulo2 ?? "",
        descricao2: data.descricao2 ?? "",
        icone3: data.icone3 ?? "",
        titulo3: data.titulo3 ?? "",
        descricao3: data.descricao3 ?? "",
        icone4: data.icone4 ?? "",
        titulo4: data.titulo4 ?? "",
        descricao4: data.descricao4 ?? "",
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
        const data = await listDiferenciais();
        if (data[0]) {
          applyData(data[0]);
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
      const payload = { ...content };
      if (content.id) {
        await updateDiferenciais(content.id, payload);
        toastCustom.success("Conteúdo atualizado com sucesso");
      } else {
        await createDiferenciais(payload);
        toastCustom.success("Conteúdo criado com sucesso");
      }
    } catch (err) {
      addLog(`Erro ao salvar: ${String(err)}`);
      const status = (err as any)?.status;
      switch (status) {
        case 401:
          toastCustom.error("Sessão expirada. Faça login novamente");
          break;
        case 403:
          toastCustom.error("Você não tem permissão para realizar esta ação");
          break;
        case 500:
          toastCustom.error("Erro do servidor ao salvar os dados");
          break;
        default:
          toastCustom.error("Erro ao salvar os dados");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <InputCustom
            label="Título Geral"
            id="titulo"
            value={content.titulo}
            onChange={(e) => setContent((p) => ({ ...p, titulo: e.target.value }))}
            maxLength={100}
            placeholder="Digite o título geral"
            required
          />
          <InputCustom
            label="Descrição Geral"
            id="descricao"
            value={content.descricao}
            onChange={(e) => setContent((p) => ({ ...p, descricao: e.target.value }))}
            maxLength={255}
            placeholder="Digite a descrição geral"
            required
          />
          <InputCustom
            label="URL do Botão"
            id="botaoUrl"
            type="url"
            value={content.botaoUrl}
            onChange={(e) => setContent((p) => ({ ...p, botaoUrl: e.target.value }))}
            placeholder="https://exemplo.com"
            required
          />
          <InputCustom
            label="Texto do Botão"
            id="botaoLabel"
            value={content.botaoLabel}
            onChange={(e) => setContent((p) => ({ ...p, botaoLabel: e.target.value }))}
            maxLength={50}
            placeholder="Digite o texto do botão"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border rounded-md p-4 space-y-3">
              <Label>Card {i}</Label>
              <InputCustom
                label={`Ícone ${i}`}
                id={`icone${i}`}
                value={(content as any)[`icone${i}`]}
                onChange={(e) =>
                  setContent((p) => ({ ...p, [`icone${i}`]: e.target.value }))
                }
                placeholder="Nome do ícone Lucide"
                required
              />
              <InputCustom
                label={`Título ${i}`}
                id={`titulo${i}`}
                value={(content as any)[`titulo${i}`]}
                onChange={(e) =>
                  setContent((p) => ({ ...p, [`titulo${i}`]: e.target.value }))
                }
                maxLength={50}
                placeholder="Título do card"
                required
              />
              <RichTextarea
                id={`descricao${i}`}
                value={(content as any)[`descricao${i}`]}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setContent((p) => ({ ...p, [`descricao${i}`]: e.target.value }))
                }
                maxLength={200}
                showCharCount={true}
                placeholder="Descrição do card"
                required
              />
            </div>
          ))}
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

      {logs.length > 0 && (
        <div className="mt-4">
          <Label>Logs</Label>
          <div className="bg-gray-100 rounded-md p-3 text-xs space-y-1 max-h-40 overflow-y-auto">
            {logs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

