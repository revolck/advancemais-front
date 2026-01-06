"use client";

import { FormEvent, useEffect, useState, ChangeEvent } from "react";
import { InputCustom, ButtonCustom } from "@/components/ui/custom";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  listInformacoesGerais,
  updateInformacoesGerais,
} from "@/api/websites/components/informacoes-gerais";
import type { InformacoesGeraisBackendResponse } from "@/api/websites/components/informacoes-gerais/types";
import { Skeleton } from "@/components/ui/skeleton";
import { MaskService } from "@/services";

interface ContatoState {
  telefone1: string;
  telefone2: string;
  whatsapp: string;
  email: string;
}

const maskService = MaskService.getInstance();

export default function ContatoForm() {
  const [state, setState] = useState<ContatoState>({
    telefone1: "",
    telefone2: "",
    whatsapp: "",
    email: "",
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
            telefone1: first.telefone1
              ? maskService.applyMask(String(first.telefone1), "phone")
              : "",
            telefone2: first.telefone2
              ? maskService.applyMask(String(first.telefone2), "phone")
              : "",
            whatsapp: first.whatsapp
              ? maskService.applyMask(String(first.whatsapp), "phone")
              : "",
            email: first.email ?? "",
          });
        }
      } catch {
        toastCustom.error("Não foi possível carregar contatos");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange =
    (field: keyof ContatoState) => (e: ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!state.telefone1 || !state.whatsapp || !state.email) {
      toastCustom.error("Preencha os campos obrigatórios");
      return;
    }
    if (!maskService.validate(state.telefone1, "phone")) {
      toastCustom.error("Informe um Telefone (1) válido com DDD");
      return;
    }
    if (state.telefone2 && !maskService.validate(state.telefone2, "phone")) {
      toastCustom.error("Informe um Telefone (2) válido com DDD");
      return;
    }
    if (!maskService.validate(state.whatsapp, "phone")) {
      toastCustom.error("Informe um WhatsApp válido com DDD");
      return;
    }
    setIsSaving(true);
    try {
      if (!id) {
        toastCustom.error("Nenhum registro base encontrado para atualizar.");
        return;
      }
      await updateInformacoesGerais(id, {
        telefone1: maskService.removeMask(state.telefone1, "phone"),
        telefone2: state.telefone2
          ? maskService.removeMask(state.telefone2, "phone")
          : "",
        whatsapp: maskService.removeMask(state.whatsapp, "phone"),
        email: state.email,
      });
      toastCustom.success("Contatos salvos");
    } catch {
      toastCustom.error("Erro ao salvar contatos");
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
            label="Telefone (1)"
            mask="phone"
            value={state.telefone1}
            onChange={handleChange("telefone1")}
            required
            disabled={isSaving}
          />
          <InputCustom
            label="Telefone (2)"
            mask="phone"
            value={state.telefone2}
            onChange={handleChange("telefone2")}
            disabled={isSaving}
          />
          <InputCustom
            label="WhatsApp"
            mask="phone"
            value={state.whatsapp}
            onChange={handleChange("whatsapp")}
            required
            disabled={isSaving}
          />
          <InputCustom
            label="E-mail"
            type="email"
            value={state.email}
            onChange={handleChange("email")}
            required
            disabled={isSaving}
          />
        </div>
        <div className="pt-4 flex justify-end">
          <ButtonCustom
            type="submit"
            size="lg"
            variant="default"
            className="w-40"
            withAnimation
            isLoading={isSaving}
            disabled={
              isSaving || !state.telefone1 || !state.whatsapp || !state.email
            }
          >
            Salvar
          </ButtonCustom>
        </div>
      </fieldset>
    </form>
  );
}
