"use client";

import { useEffect, useState } from "react";
import { InputCustom } from "@/components/ui/custom/input";
import { formatarDataDigitada, lerDataDigitada } from "./data-digitada";

interface DataDigitavelInputProps {
  label?: string;
  value: Date | null;
  onChange: (data: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  mensagemMin?: string;
  mensagemMax?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  name?: string;
}

/**
 * Data digitada (DD/MM/AAAA) com teclado numérico. Para datas antigas e conhecidas,
 * como nascimento, digitar é muito mais rápido do que navegar anos num calendário,
 * principalmente no celular.
 */
export function DataDigitavelInput({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  mensagemMin,
  mensagemMax,
  required,
  disabled,
  error,
  name,
}: DataDigitavelInputProps) {
  const [texto, setTexto] = useState(() => formatarDataDigitada(value));
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  // Valor trocado por fora (ex.: formulário recarregado com o perfil)
  useEffect(() => {
    const atual = lerDataDigitada(texto);
    const mesmoValor =
      (atual.tipo === "ok" && value && atual.data.getTime() === value.getTime()) ||
      (!value && atual.tipo !== "ok");
    if (!mesmoValor) {
      setTexto(formatarDataDigitada(value));
      setErroLocal(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novo = e.target.value;
    setTexto(novo);
    const resultado = lerDataDigitada(novo, { minDate, maxDate, mensagemMin, mensagemMax });
    if (resultado.tipo === "ok") {
      setErroLocal(null);
      onChange(resultado.data);
    } else {
      setErroLocal(resultado.tipo === "invalida" ? resultado.mensagem : null);
      onChange(null);
    }
  };

  return (
    <InputCustom
      name={name}
      label={label}
      required={required}
      disabled={disabled}
      value={texto}
      onChange={handleChange}
      mask="date"
      inputMode="numeric"
      autoComplete="bday"
      placeholder="DD/MM/AAAA"
      icon="Calendar"
      error={erroLocal ?? error}
      // Data completa e inválida: avisa na hora, sem esperar sair do campo
      forceError={Boolean(erroLocal)}
    />
  );
}
