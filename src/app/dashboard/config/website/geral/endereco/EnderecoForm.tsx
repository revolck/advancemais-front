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
import { SelectCustom } from "@/components/ui/custom/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCepData } from "@/theme/website/components/contact-form-section/utils";

interface StateItem {
  sigla: string;
  nome: string;
}

interface CityItem {
  id: number;
  nome: string;
}

export default function EnderecoForm() {
  const [id, setId] = useState<string | null>(null);
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
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
          setCep(first.cep ?? "");
          setEndereco(first.endereco ?? "");
          setEstado(first.estado ?? "");
          setCidade(first.cidade ?? "");
        }
      } catch {
        toastCustom.error("Não foi possível carregar endereço");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((res) => res.json())
      .then((data: StateItem[]) =>
        setStates(data.sort((a, b) => a.nome.localeCompare(b.nome)))
      )
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (estado) {
      fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`
      )
        .then((res) => res.json())
        .then((data: CityItem[]) =>
          setCities(data.sort((a, b) => a.nome.localeCompare(b.nome)))
        )
        .catch(() => setCities([]));
    }
  }, [estado]);

  const handleCepChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCep(value);
    const clean = value.replace(/\D/g, "");
    if (clean.length === 8) {
      fetchCepData(value).then((res) => {
        if (res.address) setEndereco(res.address);
        if (res.state) setEstado(res.state);
        if (res.city) setCidade(res.city);
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!cep || !endereco || !estado || !cidade) {
      toastCustom.error("Preencha todos os campos");
      return;
    }
    try {
      const payload = { cep, endereco, estado, cidade };
      if (id) {
        await updateInformacoesGerais(id, payload);
      } else {
        const created = await createInformacoesGerais(payload);
        setId(created.id);
      }
      toastCustom.success("Endereço salvo");
    } catch {
      toastCustom.error("Erro ao salvar endereço");
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
          label="CEP"
          mask="cep"
          value={cep}
          onChange={handleCepChange}
          required
        />
        <InputCustom
          label="Endereço"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          required
        />
        <SelectCustom
          label="Estado"
          mode="single"
          placeholder="Estado"
          options={states.map((s) => ({ value: s.sigla, label: s.nome }))}
          value={estado || null}
          onChange={(v) => setEstado(v || "")}
          required
        />
        <SelectCustom
          label="Cidade"
          mode="single"
          placeholder="Cidade"
          options={cities.map((c) => ({ value: c.nome, label: c.nome }))}
          value={cidade || null}
          onChange={(v) => setCidade(v || "")}
          disabled={!estado}
          required
        />
      </div>
      <div className="pt-4 flex justify-end">
        <ButtonCustom
          type="submit"
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
