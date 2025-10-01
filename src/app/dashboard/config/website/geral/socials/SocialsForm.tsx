"use client";

import { FormEvent, useEffect, useState, ChangeEvent } from "react";
import { InputCustom, ButtonCustom } from "@/components/ui/custom";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  listInformacoesGerais,
  createInformacoesGerais,
  updateInformacoesGerais,
} from "@/api/websites/components/informacoes-gerais";
import type { InformacoesGeraisBackendResponse } from "@/api/websites/components/informacoes-gerais/types";
import { Skeleton } from "@/components/ui/skeleton";

interface SocialsState {
  instagram: string;
  facebook: string;
  youtube: string;
  linkedin: string;
}

export default function SocialsForm() {
  const [state, setState] = useState<SocialsState>({
    instagram: "",
    facebook: "",
    youtube: "",
    linkedin: "",
  });
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // carregando dados
  const [isSaving, setIsSaving] = useState(false); // salvando submit

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
            instagram: first.instagram ?? "",
            facebook: first.facebook ?? "",
            youtube: first.youtube ?? "",
            linkedin: first.linkedin ?? "",
          });
        }
      } catch {
        toastCustom.error("Não foi possível carregar as redes sociais");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange =
    (field: keyof SocialsState) => (e: ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!state.instagram) {
      toastCustom.error("Instagram é obrigatório");
      return;
    }
    setIsSaving(true);
    try {
      if (!id) {
        toastCustom.error("Nenhum registro base encontrado para atualizar.");
        return;
      }
      await updateInformacoesGerais(id, state);
      toastCustom.success("Redes sociais salvas");
    } catch {
      toastCustom.error("Erro ao salvar redes sociais");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset disabled={isSaving} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputCustom
            label="Instagram"
            value={state.instagram}
            onChange={handleChange("instagram")}
            required
            disabled={isSaving}
          />
          <InputCustom
            label="Facebook"
            value={state.facebook}
            onChange={handleChange("facebook")}
            disabled={isSaving}
          />
          <InputCustom
            label="YouTube"
            value={state.youtube}
            onChange={handleChange("youtube")}
            disabled={isSaving}
          />
          <InputCustom
            label="LinkedIn"
            value={state.linkedin}
            onChange={handleChange("linkedin")}
            disabled={isSaving}
          />
        </div>
        {!id && (
          <p className="text-xs text-muted-foreground/80">
            Para atualizar redes sociais é necessário já existir um registro base
            (criado em Endereço/Contato). Selecione os dados e clique em salvar
            para verificar.
          </p>
        )}
        <div className="pt-4 flex justify-end">
          <ButtonCustom
            type="submit"
            size="lg"
            variant="default"
            className="w-40"
            withAnimation
            isLoading={isSaving}
            disabled={isSaving || !state.instagram}
          >
            Salvar
          </ButtonCustom>
        </div>
      </fieldset>
    </form>
  );
}
