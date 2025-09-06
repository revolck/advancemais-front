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

interface ContatoState {
  telefone1: string;
  telefone2: string;
  whatsapp: string;
  email: string;
}

export default function ContatoForm() {
  const [state, setState] = useState<ContatoState>({
    telefone1: "",
    telefone2: "",
    whatsapp: "",
    email: "",
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
            telefone1: first.telefone1 ?? "",
            telefone2: first.telefone2 ?? "",
            whatsapp: first.whatsapp ?? "",
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

  const handleChange = (field: keyof ContatoState) => (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setState((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!state.telefone1 || !state.whatsapp || !state.email) {
      toastCustom.error("Preencha os campos obrigatórios");
      return;
    }
    try {
      if (id) {
        await updateInformacoesGerais(id, state);
      } else {
        const created = await createInformacoesGerais(state);
        setId(created.id);
      }
      toastCustom.success("Contatos salvos");
    } catch {
      toastCustom.error("Erro ao salvar contatos");
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputCustom
          label="Telefone (1)"
          mask="phone"
          value={state.telefone1}
          onChange={handleChange("telefone1")}
          required
        />
        <InputCustom
          label="Telefone (2)"
          mask="phone"
          value={state.telefone2}
          onChange={handleChange("telefone2")}
        />
        <InputCustom
          label="WhatsApp"
          mask="phone"
          value={state.whatsapp}
          onChange={handleChange("whatsapp")}
          required
        />
        <InputCustom
          label="E-mail"
          type="email"
          value={state.email}
          onChange={handleChange("email")}
          required
        />
      </div>
      <div className="pt-4 flex justify-end">
        <ButtonCustom type="submit" size="lg" variant="default" className="w-40" withAnimation>
          Salvar
        </ButtonCustom>
      </div>
    </form>
  );
}
