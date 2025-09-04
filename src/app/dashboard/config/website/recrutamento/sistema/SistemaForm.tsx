"use client";

import { useEffect, useState, FormEvent } from "react";
import { InputCustom, SimpleTextarea, ButtonCustom } from "@/components/ui/custom";
import { Label } from "@/components/ui/label";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  listSistema,
  createSistema,
  updateSistema,
  type SistemaBackendResponse,
} from "@/api/websites/components";
import { Skeleton } from "@/components/ui/skeleton";

interface SistemaContent {
  id?: string;
  titulo: string;
  descricao: string;
  subtitulo: string;
  etapa1Titulo: string;
  etapa1Descricao: string;
  etapa2Titulo: string;
  etapa2Descricao: string;
  etapa3Titulo: string;
  etapa3Descricao: string;
}

export default function SistemaForm() {
  const [content, setContent] = useState<SistemaContent>({
    titulo: "",
    descricao: "",
    subtitulo: "",
    etapa1Titulo: "",
    etapa1Descricao: "",
    etapa2Titulo: "",
    etapa2Descricao: "",
    etapa3Titulo: "",
    etapa3Descricao: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const applyData = (data: SistemaBackendResponse) => {
      setContent({
        id: data.id,
        titulo: data.titulo ?? "",
        descricao: data.descricao ?? "",
        subtitulo: data.subtitulo ?? "",
        etapa1Titulo: data.etapa1Titulo ?? "",
        etapa1Descricao: data.etapa1Descricao ?? "",
        etapa2Titulo: data.etapa2Titulo ?? "",
        etapa2Descricao: data.etapa2Descricao ?? "",
        etapa3Titulo: data.etapa3Titulo ?? "",
        etapa3Descricao: data.etapa3Descricao ?? "",
      });
    };

    const fetchData = async () => {
      setIsFetching(true);
      try {
        const list = await listSistema({ headers: { Accept: "application/json" } });
        const first = list?.[0];
        if (first) applyData(first);
      } catch (err) {
        toastCustom.error("Erro ao carregar conteúdo");
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const {
      titulo,
      descricao,
      subtitulo,
      etapa1Titulo,
      etapa1Descricao,
      etapa2Titulo,
      etapa2Descricao,
      etapa3Titulo,
      etapa3Descricao,
    } = content;

    if (!titulo.trim()) {
      toastCustom.error("O título é obrigatório");
      return;
    }
    if (!descricao.trim()) {
      toastCustom.error("A descrição é obrigatória");
      return;
    }
    if (!subtitulo.trim()) {
      toastCustom.error("O subtítulo é obrigatório");
      return;
    }

    const blocks = [
      { t: etapa1Titulo, d: etapa1Descricao, i: 1 },
      { t: etapa2Titulo, d: etapa2Descricao, i: 2 },
      { t: etapa3Titulo, d: etapa3Descricao, i: 3 },
    ];
    for (const b of blocks) {
      if (!b.t.trim() || !b.d.trim()) {
        toastCustom.error(`Preencha título e descrição da etapa ${b.i}`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        subtitulo: subtitulo.trim(),
        etapa1Titulo: etapa1Titulo.trim(),
        etapa1Descricao: etapa1Descricao.trim(),
        etapa2Titulo: etapa2Titulo.trim(),
        etapa2Descricao: etapa2Descricao.trim(),
        etapa3Titulo: etapa3Titulo.trim(),
        etapa3Descricao: etapa3Descricao.trim(),
      };

      const saved = content.id
        ? await updateSistema(content.id, payload)
        : await createSistema(payload);

      toastCustom.success(
        content.id
          ? "Conteúdo atualizado com sucesso!"
          : "Conteúdo criado com sucesso!",
      );

      setContent({
        id: saved.id,
        titulo: saved.titulo ?? "",
        descricao: saved.descricao ?? "",
        subtitulo: saved.subtitulo ?? "",
        etapa1Titulo: saved.etapa1Titulo ?? "",
        etapa1Descricao: saved.etapa1Descricao ?? "",
        etapa2Titulo: saved.etapa2Titulo ?? "",
        etapa2Descricao: saved.etapa2Descricao ?? "",
        etapa3Titulo: saved.etapa3Titulo ?? "",
        etapa3Descricao: saved.etapa3Descricao ?? "",
      });
    } catch (err) {
      toastCustom.error("Erro ao salvar conteúdo");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-24 w-full" />
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            onChange={(e) => setContent((p) => ({ ...p, descricao: e.target.value }))}
            maxLength={600}
            showCharCount
            className="min-h-[200px]"
            required
          />
        </div>
      </div>

      <InputCustom
        label="Subtítulo"
        id="subtitulo"
        value={content.subtitulo}
        onChange={(e) => setContent((p) => ({ ...p, subtitulo: e.target.value }))}
        maxLength={150}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <InputCustom
              label={`Etapa ${i} - Título`}
              id={`etapa${i}Titulo`}
              value={(content as any)[`etapa${i}Titulo`]}
              onChange={(e) =>
                setContent((p) => ({ ...p, [`etapa${i}Titulo`]: e.target.value } as any))
              }
              maxLength={80}
              required
            />
            <SimpleTextarea
              label={`Etapa ${i} - Descrição`}
              id={`etapa${i}Descricao`}
              value={(content as any)[`etapa${i}Descricao`]}
              onChange={(e) =>
                setContent((p) => ({ ...p, [`etapa${i}Descricao`]: e.target.value } as any))
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
  );
}
