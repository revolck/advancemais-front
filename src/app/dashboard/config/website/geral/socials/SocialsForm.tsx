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
  const [loading, setLoading] = useState(true);

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

  const handleChange = (field: keyof SocialsState) => (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setState((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!state.instagram) {
      toastCustom.error("Instagram é obrigatório");
      return;
    }
    try {
      if (id) {
        await updateInformacoesGerais(id, state);
      } else {
        const created = await createInformacoesGerais(state);
        setId(created.id);
      }
      toastCustom.success("Redes sociais salvas");
    } catch {
      toastCustom.error("Erro ao salvar redes sociais");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-lg">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <InputCustom
        label="Instagram"
        value={state.instagram}
        onChange={handleChange("instagram")}
        required
      />
      <InputCustom
        label="Facebook"
        value={state.facebook}
        onChange={handleChange("facebook")}
      />
      <InputCustom
        label="YouTube"
        value={state.youtube}
        onChange={handleChange("youtube")}
      />
      <InputCustom
        label="LinkedIn"
        value={state.linkedin}
        onChange={handleChange("linkedin")}
      />
      <ButtonCustom type="submit">Salvar</ButtonCustom>
    </form>
  );
}
