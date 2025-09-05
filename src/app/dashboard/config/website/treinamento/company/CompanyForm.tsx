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
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  listTreinamentosInCompany,
  createTreinamentosInCompany,
  updateTreinamentosInCompany,
  type TreinamentosInCompanyBackendResponse,
} from "@/api/websites/components";

interface CompanyContent {
  id?: string;
  titulo: string;
  icone1?: string;
  descricao1: string;
  icone2?: string;
  descricao2: string;
  icone3?: string;
  descricao3: string;
  icone4?: string;
  descricao4: string;
  icone5?: string;
  descricao5: string;
}

export default function CompanyForm() {
  const [content, setContent] = useState<CompanyContent>({
    titulo: "",
    icone1: undefined,
    descricao1: "",
    icone2: undefined,
    descricao2: "",
    icone3: undefined,
    descricao3: "",
    icone4: undefined,
    descricao4: "",
    icone5: undefined,
    descricao5: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) =>
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);

  useEffect(() => {
    const applyData = (d: TreinamentosInCompanyBackendResponse) => {
      setContent({
        id: d.id,
        titulo: d.titulo ?? "",
        icone1: d.icone1 ?? undefined,
        descricao1: d.descricao1 ?? "",
        icone2: d.icone2 ?? undefined,
        descricao2: d.descricao2 ?? "",
        icone3: d.icone3 ?? undefined,
        descricao3: d.descricao3 ?? "",
        icone4: d.icone4 ?? undefined,
        descricao4: d.descricao4 ?? "",
        icone5: d.icone5 ?? undefined,
        descricao5: d.descricao5 ?? "",
      });
    };

    const fetchData = async () => {
      setIsFetching(true);
      try {
        const list = await listTreinamentosInCompany({
          headers: { Accept: "application/json" },
        });
        const first = list?.[0];
        if (first) applyData(first as TreinamentosInCompanyBackendResponse);
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
  }, []);

  const handleIconChange = async (index: number, iconName: string) => {
    setContent((prev) => ({ ...prev, [`icone${index}`]: iconName } as any));

    if (!content.id) return;
    try {
      const payload: Record<string, string> = {};
      payload[`icone${index}`] = iconName;
      await updateTreinamentosInCompany(content.id, payload);
      addLog(`Ícone do bloco ${index} atualizado para: ${iconName}`);
      toastCustom.success(`Ícone do bloco ${index} atualizado`);
    } catch (err) {
      addLog(`Erro ao atualizar ícone ${index}: ${String(err)}`);
      toastCustom.error(`Erro ao atualizar ícone do bloco ${index}`);
    }
  };

  const renderIconPreview = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName] as LucideIcon;
    return IconComponent ? (
      <IconComponent className="h-5 w-5 text-gray-600" />
    ) : null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const titulo = content.titulo.trim();
    if (!titulo) {
      toastCustom.error("O título é obrigatório");
      return;
    }

    const blocks = [
      { i: 1, icon: content.icone1, d: content.descricao1 },
      { i: 2, icon: content.icone2, d: content.descricao2 },
      { i: 3, icon: content.icone3, d: content.descricao3 },
      { i: 4, icon: content.icone4, d: content.descricao4 },
      { i: 5, icon: content.icone5, d: content.descricao5 },
    ];

    for (const b of blocks) {
      if (!b.icon || !b.d.trim()) {
        toastCustom.error(
          `Preencha ícone e descrição do bloco ${b.i}`
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload = {
        titulo,
        icone1: content.icone1!,
        descricao1: content.descricao1.trim(),
        icone2: content.icone2!,
        descricao2: content.descricao2.trim(),
        icone3: content.icone3!,
        descricao3: content.descricao3.trim(),
        icone4: content.icone4!,
        descricao4: content.descricao4.trim(),
        icone5: content.icone5!,
        descricao5: content.descricao5.trim(),
      };

      const saved = content.id
        ? await updateTreinamentosInCompany(content.id, payload)
        : await createTreinamentosInCompany(payload);

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
              label="Título"
              id="titulo"
              value={content.titulo}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, titulo: e.target.value }))
              }
              maxLength={100}
              placeholder="Digite o título"
              required
            />
          </div>

          {/* Blocos 1..5 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border border-gray-200 rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-semibold">Bloco {i}</Label>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Ícone selecionado:</span>
                    {renderIconPreview((content as any)[`icone${i}`])}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`icone${i}`} className="text-sm font-medium text-gray-700">
                    Ícone <span className="text-red-500">*</span>
                  </Label>
                  <IconSelector
                    value={(content as any)[`icone${i}`]}
                    onValueChange={(iconName) => handleIconChange(i, iconName)}
                    placeholder="Selecionar ícone"
                  />
                </div>

                <SimpleTextarea
                  id={`descricao${i}`}
                  value={(content as any)[`descricao${i}`]}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setContent((prev) => ({ ...prev, [`descricao${i}`]: e.target.value } as any))
                  }
                  maxLength={300}
                  showCharCount
                  placeholder={`Descrição do bloco ${i}`}
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
                isLoading ||
                !(
                  content.titulo.trim() &&
                  [1, 2, 3, 4, 5].every(
                    (i) =>
                      Boolean((content as any)[`icone${i}`]) &&
                      Boolean((content as any)[`descricao${i}`]?.trim())
                  )
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
