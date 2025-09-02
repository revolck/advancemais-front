"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  InputCustom,
  SimpleTextarea,
  ButtonCustom,
  IconSelector,
  toastCustom,
} from "@/components/ui/custom";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  listPlaninhas,
  createPlaninhas,
  updatePlaninhas,
  type PlaninhasBackendResponse,
} from "@/api/websites/components";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PlaninhasContent {
  id?: string;
  titulo: string;
  descricao: string;
  icone1?: string;
  titulo1: string;
  descricao1: string;
  icone2?: string;
  titulo2: string;
  descricao2: string;
  icone3?: string;
  titulo3: string;
  descricao3: string;
}

interface PlaninhasFormProps {
  initialData?: PlaninhasBackendResponse;
}

export default function PlaninhasForm({ initialData }: PlaninhasFormProps) {
  const [content, setContent] = useState<PlaninhasContent>({
    titulo: "",
    descricao: "",
    icone1: undefined,
    titulo1: "",
    descricao1: "",
    icone2: undefined,
    titulo2: "",
    descricao2: "",
    icone3: undefined,
    titulo3: "",
    descricao3: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!initialData);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) =>
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);

  useEffect(() => {
    const applyData = (d: PlaninhasBackendResponse) => {
      setContent({
        id: d.id,
        titulo: d.titulo ?? "",
        descricao: d.descricao ?? "",
        icone1: d.icone1 ?? undefined,
        titulo1: d.titulo1 ?? "",
        descricao1: d.descricao1 ?? "",
        icone2: d.icone2 ?? undefined,
        titulo2: d.titulo2 ?? "",
        descricao2: d.descricao2 ?? "",
        icone3: d.icone3 ?? undefined,
        titulo3: d.titulo3 ?? "",
        descricao3: d.descricao3 ?? "",
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
        const list = await listPlaninhas();
        const first = list?.[0];
        if (first) applyData(first);
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
    if (isLoading) return;

    const title = content.titulo.trim();
    const description = content.descricao.trim();

    if (!title) {
      toastCustom.error("O título é obrigatório");
      return;
    }
    if (!description) {
      toastCustom.error("A descrição é obrigatória");
      return;
    }

    // Validar blocos 1..3
    const blocks = [
      { i: 1, icon: content.icone1, t: content.titulo1, d: content.descricao1 },
      { i: 2, icon: content.icone2, t: content.titulo2, d: content.descricao2 },
      { i: 3, icon: content.icone3, t: content.titulo3, d: content.descricao3 },
    ];

    for (const b of blocks) {
      if (!b.icon || !b.t.trim() || !b.d.trim()) {
        toastCustom.error(
          `Preencha ícone, título e descrição do bloco ${b.i}`
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload = {
        titulo: title,
        descricao: description,
        icone1: content.icone1!,
        titulo1: content.titulo1.trim(),
        descricao1: content.descricao1.trim(),
        icone2: content.icone2!,
        titulo2: content.titulo2.trim(),
        descricao2: content.descricao2.trim(),
        icone3: content.icone3!,
        titulo3: content.titulo3.trim(),
        descricao3: content.descricao3.trim(),
      };

      const saved = content.id
        ? await updatePlaninhas(content.id, payload)
        : await createPlaninhas(payload);

      if (!saved || !saved.id) {
        toastCustom.error("Resposta inválida do servidor");
        return;
      }

      toastCustom.success(
        content.id ? "Conteúdo atualizado com sucesso" : "Conteúdo criado com sucesso"
      );

      setContent((prev) => ({ ...prev, id: saved.id }));
    } catch (err) {
      const status = (err as any)?.status;
      let errorMessage = "Erro ao salvar. Tente novamente";
      switch (status) {
        case 400:
        case 422:
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
      }
      toastCustom.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Atualiza ícone localmente e envia para API (se já existir registro), igual DiferenciaisForm
  const handleIconChange = async (index: number, iconName: string) => {
    setContent((prev) => ({ ...prev, [`icone${index}`]: iconName } as any));

    if (!content.id) return; // sem registro ainda

    try {
      const payload: Record<string, string> = {};
      payload[`icone${index}`] = iconName;
      await updatePlaninhas(content.id, payload);
      addLog(`Ícone do bloco ${index} atualizado para: ${iconName}`);
      toastCustom.success(`Ícone do bloco ${index} atualizado`);
    } catch (err) {
      addLog(`Erro ao atualizar ícone ${index}: ${String(err)}`);
      toastCustom.error(`Erro ao atualizar ícone do bloco ${index}`);
    }
  };

  // Preview do ícone selecionado
  const renderIconPreview = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName] as LucideIcon;
    return IconComponent ? (
      <IconComponent className="h-5 w-5 text-gray-600" />
    ) : null;
  };

  return (
    <div className="space-y-6">
      {isFetching ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cabeçalho */}
          <div className="space-y-3">
            <InputCustom
              label="Título Geral"
              id="titulo"
              value={content.titulo}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, titulo: e.target.value }))
              }
              maxLength={100}
              placeholder="Digite o título geral"
              required
            />
            <InputCustom
              label="Descrição Geral"
              id="descricao"
              value={content.descricao}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, descricao: e.target.value }))
              }
              maxLength={255}
              placeholder="Digite a descrição geral"
              required
            />
          </div>

          {/* Cards/Blocos 1..3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-semibold">Card {i}</Label>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Icone selecionado:</span>
                    {renderIconPreview((content as any)[`icone${i}`])}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`icone${i}`} className="text-sm font-medium text-gray-700">
                    Ícone
                  </Label>
                  <IconSelector
                    value={(content as any)[`icone${i}`]}
                    onValueChange={(iconName) => handleIconChange(i, iconName)}
                    placeholder="Selecionar ícone"
                  />
                </div>

                <InputCustom
                  label={`Título`}
                  id={`titulo${i}`}
                  value={(content as any)[`titulo${i}`]}
                  onChange={(e) =>
                    setContent((prev) => ({ ...prev, [`titulo${i}`]: e.target.value } as any))
                  }
                  maxLength={80}
                  placeholder="Título do card"
                  required
                />
                <SimpleTextarea
                  id={`descricao${i}`}
                  value={(content as any)[`descricao${i}`]}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setContent((prev) => ({ ...prev, [`descricao${i}`]: e.target.value } as any))
                  }
                  maxLength={300}
                  showCharCount
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
              withAnimation
            >
              Salvar
            </ButtonCustom>
          </div>
        </form>
      )}

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
