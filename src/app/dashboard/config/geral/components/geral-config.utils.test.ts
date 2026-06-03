import { describe, expect, it } from "vitest";

import type { ConfigCategoryGroup } from "@/api/configuracoes-gerais/types";
import {
  buildConfigPayload,
  getNextSecretDraftFromMaskedKey,
  getSecretFieldInputState,
} from "./geral-config.utils";

const baseGroup: ConfigCategoryGroup = {
  category: "mercadopago",
  label: "Mercado Pago",
  description: "",
  items: [
    {
      key: "mp_access_token",
      label: "Access token de produção",
      type: "string",
      secret: true,
      configured: true,
      source: "DB",
      maskedPreview: "********token12",
      value: null,
    },
    {
      key: "assinaturas_grace_days",
      label: "Dias de tolerância",
      type: "number",
      secret: false,
      configured: true,
      source: "ENV",
      value: 5,
    },
    {
      key: "cron_cobranca_enabled",
      label: "Cron de cobrança ativo",
      type: "boolean",
      secret: false,
      configured: true,
      source: "DB",
      value: true,
    },
    {
      key: "assinaturas_emails_enabled",
      label: "Enviar e-mails de assinaturas",
      type: "boolean",
      secret: false,
      configured: true,
      source: "DB",
      value: false,
    },
    {
      key: "course_payment_methods",
      label: "Métodos de pagamento para cursos e turmas",
      type: "csv",
      secret: false,
      configured: true,
      source: "DB",
      value: "pix,boleto,card",
    },
  ],
};

describe("geral-config utils", () => {
  it("não envia segredos quando o draft continua em keep", () => {
    const payload = buildConfigPayload(
      baseGroup,
      { assinaturas_grace_days: 10 },
      { mp_access_token: { action: "keep", value: "" } },
    );

    expect(payload.values).toEqual({ assinaturas_grace_days: 10 });
    expect(payload.secrets).toEqual({});
  });

  it("não marca segredo como replace só por exibir valor mascarado", () => {
    const state = getSecretFieldInputState(baseGroup.items[0], {
      action: "keep",
      value: "",
    });

    expect(state.showingMaskedValue).toBe(true);
    expect(state.inputValue).toBe("********token12");
  });

  it("só troca para replace quando há interação real de edição", () => {
    expect(getNextSecretDraftFromMaskedKey("a")).toEqual({
      action: "replace",
      value: "a",
    });
    expect(getNextSecretDraftFromMaskedKey("Backspace")).toEqual({
      action: "replace",
      value: "",
    });
    expect(getNextSecretDraftFromMaskedKey("Tab")).toBeNull();
  });

  it("envia toggles booleanos alterados e preserva os que não mudaram", () => {
    const payload = buildConfigPayload(
      baseGroup,
      {
        assinaturas_grace_days: 5,
        cron_cobranca_enabled: false,
        assinaturas_emails_enabled: false,
      },
      { mp_access_token: { action: "keep", value: "" } },
    );

    expect(payload.values).toEqual({
      cron_cobranca_enabled: false,
    });
    expect(payload.secrets).toEqual({});
  });

  it("serializa multiselect CSV apenas quando houver mudança real", () => {
    const payload = buildConfigPayload(
      baseGroup,
      {
        course_payment_methods: ["pix", "card"],
      },
      { mp_access_token: { action: "keep", value: "" } },
    );

    expect(payload.values).toEqual({
      course_payment_methods: "pix,card",
    });
  });
});
