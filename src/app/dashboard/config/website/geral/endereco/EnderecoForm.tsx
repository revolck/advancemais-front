"use client";

import {
  FormEvent,
  useEffect,
  useState,
  ChangeEvent,
} from "react";
import { InputCustom, ButtonCustom } from "@/components/ui/custom";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  listInformacoesGerais,
  createInformacoesGerais,
  updateInformacoesGerais,
} from "@/api/websites/components/informacoes-gerais";
import type { InformacoesGeraisBackendResponse } from "@/api/websites/components/informacoes-gerais/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        setStates(data.sort((a, b) => a.nome.localeCompare(b.nome))),
      )
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (estado) {
      fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`,
      )
        .then((res) => res.json())
        .then((data: CityItem[]) =>
          setCities(data.sort((a, b) => a.nome.localeCompare(b.nome))),
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
      <Select value={estado} onValueChange={setEstado}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {states.map((s) => (
            <SelectItem key={s.sigla} value={s.sigla}>
              {s.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={cidade} onValueChange={setCidade}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Cidade" />
        </SelectTrigger>
        <SelectContent>
          {cities.map((c) => (
            <SelectItem key={c.id} value={c.nome}>
              {c.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ButtonCustom type="submit">Salvar</ButtonCustom>
    </form>
  );
}

