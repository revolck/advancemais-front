/** Interpretação de datas digitadas como DD/MM/AAAA (sem fuso: meia-noite local) */

export type ResultadoDataDigitada =
  | { tipo: "vazia" }
  | { tipo: "incompleta" }
  | { tipo: "invalida"; mensagem: string }
  | { tipo: "ok"; data: Date };

const inicioDoDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function formatarDataDigitada(data: Date | null | undefined): string {
  if (!data || Number.isNaN(data.getTime())) return "";
  const dd = String(data.getDate()).padStart(2, "0");
  const mm = String(data.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${data.getFullYear()}`;
}

export function lerDataDigitada(
  texto: string,
  limites: { minDate?: Date; maxDate?: Date; mensagemMin?: string; mensagemMax?: string } = {}
): ResultadoDataDigitada {
  const digitos = texto.replace(/\D/g, "");
  if (!digitos) return { tipo: "vazia" };
  if (digitos.length < 8) return { tipo: "incompleta" };

  const dia = Number(digitos.slice(0, 2));
  const mes = Number(digitos.slice(2, 4));
  const ano = Number(digitos.slice(4, 8));
  const data = new Date(ano, mes - 1, dia);
  // 31/02 vira 03/03 no Date: confere se a data montada é a mesma digitada
  if (
    mes < 1 ||
    mes > 12 ||
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return { tipo: "invalida", mensagem: "Data inválida. Use o formato DD/MM/AAAA." };
  }
  if (limites.minDate && data < inicioDoDia(limites.minDate)) {
    return {
      tipo: "invalida",
      mensagem:
        limites.mensagemMin ?? `A data deve ser a partir de ${formatarDataDigitada(limites.minDate)}.`,
    };
  }
  if (limites.maxDate && data > inicioDoDia(limites.maxDate)) {
    return {
      tipo: "invalida",
      mensagem:
        limites.mensagemMax ?? `A data deve ser até ${formatarDataDigitada(limites.maxDate)}.`,
    };
  }
  return { tipo: "ok", data };
}
