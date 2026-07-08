"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ButtonCustom, InputCustom } from "@/components/ui/custom";
import { toastCustom } from "@/components/ui/custom/toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  listInformacoesGerais,
  updateInformacoesGerais,
} from "@/api/websites/components/informacoes-gerais";
import type { InformacoesGeraisBackendResponse } from "@/api/websites/components/informacoes-gerais/types";

interface WorkWithUsState {
  trabalheConoscoUrl: string;
}

function isValidAbsoluteUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function WorkWithUsForm() {
  const [state, setState] = useState<WorkWithUsState>({
    trabalheConoscoUrl: "",
  });
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await listInformacoesGerais({
          headers: { Accept: "application/json" },
        });
        const first: InformacoesGeraisBackendResponse | undefined = data[0];

        if (first && mounted) {
          setId(first.id);
          setState({
            trabalheConoscoUrl: first.trabalheConoscoUrl ?? "",
          });
        }
      } catch {
        toastCustom.error(
          "Não foi possível carregar o link de Trabalhe Conosco",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange =
    (field: keyof WorkWithUsState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const value = state.trabalheConoscoUrl.trim();

    if (value && !isValidAbsoluteUrl(value)) {
      toastCustom.error("Informe uma URL absoluta válida");
      return;
    }

    setIsSaving(true);
    try {
      if (!id) {
        toastCustom.error(
          "Nenhum registro base encontrado. Cadastre as informações gerais antes de salvar este link.",
        );
        return;
      }

      await updateInformacoesGerais(id, {
        trabalheConoscoUrl: value || null,
      });
      setState({ trabalheConoscoUrl: value });
      toastCustom.success("Link de Trabalhe Conosco salvo");
    } catch {
      toastCustom.error("Erro ao salvar o link de Trabalhe Conosco");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset disabled={isSaving} className="space-y-6">
        <InputCustom
          label="URL externa"
          value={state.trabalheConoscoUrl}
          onChange={handleChange("trabalheConoscoUrl")}
          placeholder="https://empresa.com/carreiras"
          disabled={isSaving}
        />

        <div className="flex justify-end pt-4">
          <ButtonCustom
            type="submit"
            size="lg"
            variant="default"
            className="w-40"
            withAnimation
            isLoading={isSaving}
            disabled={isSaving}
          >
            Salvar
          </ButtonCustom>
        </div>
      </fieldset>
    </form>
  );
}
