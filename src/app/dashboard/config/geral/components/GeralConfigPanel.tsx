"use client";

import React from "react";
import { Info, RotateCcw, Save, TestTube2 } from "lucide-react";

import {
  testarConfiguracaoGeral,
  updateConfiguracaoGeral,
} from "@/api/configuracoes-gerais";
import type {
  ConfigCategoryGroup,
  ConfigItem,
} from "@/api/configuracoes-gerais/types";
import { ButtonCustom } from "@/components/ui/custom/button";
import { InputCustom } from "@/components/ui/custom/input";
import { MultiSelectCustom } from "@/components/ui/custom/multiselect";
import { SelectCustom } from "@/components/ui/custom/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  buildConfigPayload,
  getDisplayValue,
  getBooleanSelectValue,
  getInitialValue,
  getNextSecretDraftFromMaskedKey,
  getNumberSelectValue,
  getSecretFieldInputState,
  getStringSelectValue,
  hasDraftValue,
  isMultiSelectCsvKey,
  type ConfigEditableValue,
  type SecretDraft,
} from "./geral-config.utils";

type EditableValue = ConfigEditableValue;

type MercadoPagoMode = "production" | "test";

const MP_ACTIVE_MODE_KEY = "mp_active_mode";
const CURSOS_INSTALLMENTS_ENABLED_KEY = "cursos_installments_enabled";
const CURSOS_INSTALLMENTS_MAX_KEY = "cursos_installments_max";
const COURSE_PAYMENT_METHODS_KEY = "course_payment_methods";
const SUBSCRIPTION_PAYMENT_METHODS_KEY = "subscription_payment_methods";
const DEFAULT_CURRENCY_KEY = "assinaturas_default_currency";
const DEFAULT_RECURRENCE_KEY = "assinaturas_recorrencia_padrao";
const LOG_LEVEL_KEY = "log_level";
const MERCADOPAGO_COMMON_KEYS = new Set([
  MP_ACTIVE_MODE_KEY,
  "mp_return_success_url",
  "mp_return_failure_url",
  "mp_return_pending_url",
  "mp_billing_portal_url",
  COURSE_PAYMENT_METHODS_KEY,
  SUBSCRIPTION_PAYMENT_METHODS_KEY,
  CURSOS_INSTALLMENTS_ENABLED_KEY,
  CURSOS_INSTALLMENTS_MAX_KEY,
  "assinaturas_default_currency",
  "assinaturas_recorrencia_padrao",
  "assinaturas_grace_days",
  "assinaturas_emails_enabled",
  "assinaturas_assistida_pix_boleto",
  "assinaturas_boleto_grace_days",
  "cron_boleto_enabled",
  "cron_boleto_schedule",
  "cron_boleto_max_days",
  "cron_reconciliation_enabled",
  "cron_reconciliation_schedule",
  "cron_cobranca_enabled",
  "cron_cobranca_schedule",
]);
const MERCADOPAGO_TEST_KEYS = new Set([
  "mp_test_user_id",
  "mp_test_application_id",
  "mp_test_webhook_secret",
  "mp_test_public_key",
  "mp_test_access_token",
]);
const MERCADOPAGO_PRODUCTION_KEYS = new Set([
  "mp_user_id",
  "mp_application_id",
  "mp_webhook_secret",
  "mp_public_key",
  "mp_access_token",
  "mp_client_id",
  "mp_client_secret",
]);
const LOG_LEVEL_OPTIONS = [
  { value: "fatal", label: "Fatal" },
  { value: "error", label: "Erro" },
  { value: "warn", label: "Aviso" },
  { value: "info", label: "Informações padrão" },
  { value: "debug", label: "Diagnóstico" },
  { value: "trace", label: "Detalhado" },
  { value: "silent", label: "Sem logs" },
] as const;
const PAYMENT_METHOD_OPTIONS = [
  { value: "pix", label: "PIX" },
  { value: "boleto", label: "Boleto" },
  { value: "card", label: "Cartão" },
] as const;
const MP_ACTIVE_MODE_VALUES = ["production", "test"] as const;
const LOG_LEVEL_VALUES = LOG_LEVEL_OPTIONS.map((option) => option.value);
const INSTALLMENT_VALUES = Array.from({ length: 12 }, (_, index) => index + 1);
const SECRET_EDITING_UNAVAILABLE_MESSAGE =
  "Os campos protegidos estão em modo de leitura porque a chave de segurança da API ainda não foi configurada.";
const CONDITIONAL_FIELDS: Partial<
  Record<
    ConfigCategoryGroup["category"],
    Array<{ enabledKey: string; dependentKeys: string[] }>
  >
> = {
  mercadopago: [
    {
      enabledKey: CURSOS_INSTALLMENTS_ENABLED_KEY,
      dependentKeys: [CURSOS_INSTALLMENTS_MAX_KEY],
    },
    {
      enabledKey: "cron_boleto_enabled",
      dependentKeys: ["cron_boleto_schedule", "cron_boleto_max_days"],
    },
    {
      enabledKey: "cron_reconciliation_enabled",
      dependentKeys: ["cron_reconciliation_schedule"],
    },
    {
      enabledKey: "cron_cobranca_enabled",
      dependentKeys: ["cron_cobranca_schedule"],
    },
  ],
  agenda: [
    {
      enabledKey: "agenda_cron_aulas_enabled",
      dependentKeys: ["agenda_cron_aulas_schedule"],
    },
    {
      enabledKey: "agenda_cron_provas_enabled",
      dependentKeys: ["agenda_cron_provas_schedule"],
    },
    {
      enabledKey: "agenda_cron_entrevistas_enabled",
      dependentKeys: ["agenda_cron_entrevistas_schedule"],
    },
  ],
};

interface GeralConfigPanelProps {
  group?: ConfigCategoryGroup;
  loading?: boolean;
  onSaved: (group: ConfigCategoryGroup) => void;
}

const FIELD_HELPERS: Partial<Record<string, string>> = {
  mp_active_mode:
    "Escolha qual ambiente do Mercado Pago o sistema deve usar agora. Só o ambiente selecionado será usado nos pagamentos.",
  mp_user_id:
    "User ID da conta de produção que receberá os pagamentos reais. Não use o User ID de teste aqui.",
  mp_application_id:
    "Application ID da integração de produção no Mercado Pago. Ele é independente do ambiente de teste.",
  mp_webhook_secret:
    "Segredo do webhook de produção. Use um valor exclusivo para notificações de pagamentos reais.",
  mp_test_user_id:
    "User ID da conta de teste do Mercado Pago. Este valor não é compartilhado com Produção.",
  mp_test_application_id:
    "Application ID da integração de teste. Use o número informado nas credenciais de teste.",
  mp_test_webhook_secret:
    "Segredo do webhook de teste. Use um valor exclusivo para notificações do ambiente de teste.",
  mp_test_public_key:
    "Chave pública usada para testes no navegador. Serve para gerar formulários e tokens em ambiente de teste.",
  mp_test_access_token:
    "Use apenas a credencial de teste do Mercado Pago. Este valor não é compartilhado com Produção.",
  mp_public_key:
    "Chave pública usada no site e no checkout real. No fluxo integrado de Checkout Transparente, ela é usada pelo navegador para tokenizar os dados com segurança.",
  mp_access_token:
    "Use apenas a credencial de produção do Mercado Pago. Este valor não é compartilhado com Teste.",
  mp_client_id:
    "Identificador OAuth do aplicativo no Mercado Pago. Use apenas se a integração exigir conexão autorizada entre contas.",
  mp_client_secret:
    "Senha privada do aplicativo Mercado Pago. Mantém a autenticação segura nas integrações OAuth.",
  mp_return_success_url:
    "Página para onde o usuário volta quando o pagamento é aprovado.",
  mp_return_failure_url:
    "Página para onde o usuário volta quando o pagamento não é concluído.",
  mp_return_pending_url:
    "Página para onde o usuário volta quando o pagamento fica aguardando confirmação.",
  mp_billing_portal_url:
    "Link do portal usado para consultar ou gerenciar cobranças recorrentes.",
  course_payment_methods:
    "Define quais meios aparecem no checkout de cursos e turmas. Cartão mantém as opções visuais de crédito e débito, mas o processamento continua centralizado como cartão.",
  subscription_payment_methods:
    "Define quais meios aparecem no checkout de assinaturas. Cartão cobre a recorrência automática. Pix e boleto ficam disponíveis no fluxo assistido de pagamento.",
  cursos_installments_enabled:
    "Esta opção vale apenas para cursos e turmas. Planos recorrentes de empresas continuam sem parcelamento. O fluxo integrado recomendado do Mercado Pago é Checkout Transparente via Checkout API / Orders.",
  cursos_installments_max:
    "Escolha o maior número de parcelas permitido no cartão para cursos e turmas. Juros, parcelas sem juros e condições finais seguem a configuração da sua conta Mercado Pago.",
  assinaturas_default_currency:
    "A moeda das cobranças está fixa em BRL neste produto.",
  assinaturas_recorrencia_padrao:
    "As cobranças recorrentes usam assinatura por padrão.",
  assinaturas_grace_days:
    "Quantidade de dias de tolerância antes de considerar atraso em cobranças recorrentes.",
  assinaturas_emails_enabled:
    "Escolha se o sistema deve enviar e-mails automáticos sobre cobranças e assinaturas.",
  assinaturas_assistida_pix_boleto:
    "Ativa o fluxo assistido para Pix e boleto, com acompanhamento operacional pelo sistema. Esses meios dependem da configuração ativa da conta no Mercado Pago.",
  assinaturas_boleto_grace_days:
    "Quantidade de dias extras para boletos antes de marcar a cobrança como vencida.",
  cron_boleto_enabled:
    "Liga ou desliga a rotina automática que acompanha boletos em aberto.",
  cron_boleto_schedule:
    "Define com que frequência a rotina de boletos deve rodar.",
  cron_boleto_max_days:
    "Limita por quantos dias o sistema continua monitorando um boleto pendente.",
  cron_reconciliation_enabled:
    "Liga ou desliga a rotina que confere pagamentos e sincroniza o status interno.",
  cron_reconciliation_schedule:
    "Define com que frequência a reconciliação automática deve rodar.",
  cron_cobranca_enabled: "Liga ou desliga a rotina automática de cobrança.",
  cron_cobranca_schedule:
    "Define com que frequência a rotina de cobrança deve rodar.",
  brevo_api_key:
    "Chave privada da Brevo usada para enviar e-mails e outras mensagens automáticas.",
  brevo_from_email:
    "E-mail que aparece como remetente nas mensagens enviadas pelo sistema.",
  brevo_from_name: "Nome exibido como remetente para o usuário final.",
  brevo_smtp_host:
    "Endereço do servidor SMTP usado como apoio para envio de e-mails.",
  brevo_smtp_port:
    "Porta do servidor SMTP. Normalmente 587 para conexão segura padrão.",
  brevo_smtp_user:
    "Usuário da conta SMTP usado para autenticar o envio de e-mails.",
  brevo_smtp_password: "Senha da conta SMTP usada no envio de e-mails.",
  brevo_password_recovery_expiration_hours:
    "Define por quantas horas o link de recuperação de senha continua válido.",
  brevo_password_recovery_max_attempts:
    "Quantidade máxima de pedidos de recuperação antes de bloquear novas tentativas por segurança.",
  brevo_password_recovery_cooldown_minutes:
    "Tempo mínimo de espera entre dois pedidos de recuperação de senha.",
  brevo_max_retries:
    "Número máximo de novas tentativas quando o envio de e-mail falhar.",
  brevo_retry_delay:
    "Tempo de espera entre uma nova tentativa e outra quando houver falha no envio.",
  brevo_timeout:
    "Tempo máximo que o sistema espera pela resposta do serviço de e-mail antes de considerar falha.",
  brevo_daily_email_limit:
    "Limite diário de e-mails que o sistema pode enviar.",
  brevo_daily_sms_limit: "Limite diário de SMS que o sistema pode enviar.",
  brevo_sms_sender: "Nome curto exibido como remetente das mensagens SMS.",
  brevo_sms_unicode:
    "Permite usar caracteres especiais em SMS, como acentos e símbolos.",
  brevo_template_cache:
    "Mantém modelos de e-mail em memória para acelerar o envio.",
  brevo_preload_templates:
    "Carrega os modelos principais logo no início da aplicação.",
  email_verification_required:
    "Exige que o usuário confirme o e-mail antes de acessar a conta.",
  email_verification_expiration_hours:
    "Define por quantas horas o link de verificação de e-mail continua válido.",
  email_verification_max_resend:
    "Quantidade máxima de reenvios do e-mail de confirmação.",
  email_verification_cooldown_minutes:
    "Tempo mínimo de espera entre um reenvio e outro do e-mail de confirmação.",
  agenda_cron_aulas_enabled:
    "Liga ou desliga a rotina automática relacionada às aulas.",
  agenda_cron_aulas_schedule:
    "Define com que frequência a rotina de aulas deve rodar.",
  agenda_cron_provas_enabled:
    "Liga ou desliga a rotina automática relacionada às provas.",
  agenda_cron_provas_schedule:
    "Define com que frequência a rotina de provas deve rodar.",
  agenda_cron_entrevistas_enabled:
    "Liga ou desliga a rotina automática relacionada às entrevistas.",
  agenda_cron_entrevistas_schedule:
    "Define com que frequência a rotina de entrevistas deve rodar.",
  log_level:
    "Define a quantidade de detalhes gravados nos logs. Use menos detalhes em produção e mais detalhes para diagnóstico.",
  enable_console_log:
    "Escolha se os logs também devem aparecer no console da aplicação.",
  enable_file_log:
    "Escolha se os logs devem ser gravados em arquivo. Esta opção pode exigir reinício da API.",
  max_file_size:
    "Tamanho máximo permitido por arquivo enviado ao sistema. O valor deve ser informado em bytes.",
  allowed_mime_types:
    "Informe os tipos de arquivo permitidos, separados por vírgula. Exemplo: image/png, image/jpeg, application/pdf.",
  google_client_id:
    "Identificador público do app do Google. É usado para conectar Agenda e outros recursos Google.",
  google_client_secret:
    "Senha privada do app do Google. É usada junto com o Client ID para autorizar a integração.",
};

function placeholderFor(item: ConfigItem) {
  if (item.secret) {
    return item.configured
      ? "Valor protegido. Cole um novo valor para trocar"
      : "Cole o valor";
  }
  if (item.type === "cron") return "Ex: 60 ou 0 8 * * *";
  if (item.type === "csv") return "Ex: image/png,image/jpeg";
  if (item.type === "url") return "https://...";
  if (item.type === "email") return "nome@empresa.com";
  return "Informe um valor";
}

function getMercadoPagoMode(
  group?: ConfigCategoryGroup,
  values?: Record<string, EditableValue>,
): MercadoPagoMode {
  const currentItem = group?.items.find(
    (item) => item.key === MP_ACTIVE_MODE_KEY,
  );
  const hasDraft = values ? hasDraftValue(values, MP_ACTIVE_MODE_KEY) : false;
  const value = currentItem
    ? getDisplayValue(currentItem, values?.[MP_ACTIVE_MODE_KEY], hasDraft)
    : values?.[MP_ACTIVE_MODE_KEY];
  const resolved = getStringSelectValue(value, MP_ACTIVE_MODE_VALUES);

  return resolved === "test" ? "test" : "production";
}

function getVisibleItems(
  group: ConfigCategoryGroup,
  activeMercadoPagoMode: MercadoPagoMode,
  values?: Record<string, EditableValue>,
) {
  const conditionalRules = CONDITIONAL_FIELDS[group.category] ?? [];
  const enabledState = new Map<string, boolean>();

  conditionalRules.forEach(({ enabledKey }) => {
    const currentItem = group.items.find((item) => item.key === enabledKey);
    if (!currentItem) return;

    const hasDraft = values ? hasDraftValue(values, enabledKey) : false;
    const resolved = getBooleanSelectValue(
      getDisplayValue(currentItem, values?.[enabledKey], hasDraft),
    );

    enabledState.set(enabledKey, resolved === "true");
  });

  const shouldHideDependentField = (key: string) => {
    const rule = conditionalRules.find(({ dependentKeys }) =>
      dependentKeys.includes(key),
    );
    if (!rule) return false;
    return enabledState.get(rule.enabledKey) !== true;
  };

  if (group.category !== "mercadopago") {
    return group.items.filter((item) => !shouldHideDependentField(item.key));
  }

  return group.items.filter((item) => {
    if (shouldHideDependentField(item.key)) return false;
    if (item.key === DEFAULT_RECURRENCE_KEY) {
      return false;
    }
    if (MERCADOPAGO_COMMON_KEYS.has(item.key)) return true;
    if (activeMercadoPagoMode === "test")
      return MERCADOPAGO_TEST_KEYS.has(item.key);
    return MERCADOPAGO_PRODUCTION_KEYS.has(item.key);
  });
}

function isFieldRequired(
  item: ConfigItem,
  group: ConfigCategoryGroup,
  activeMercadoPagoMode: MercadoPagoMode,
) {
  if (item.required) return true;
  if (group.category !== "mercadopago") return Boolean(item.required);

  if (activeMercadoPagoMode === "production") {
    return [
      "mp_user_id",
      "mp_application_id",
      "mp_public_key",
      "mp_access_token",
    ].includes(item.key);
  }

  return [
    "mp_test_user_id",
    "mp_test_application_id",
    "mp_test_public_key",
    "mp_test_access_token",
  ].includes(item.key);
}

function helperTextFor(item: ConfigItem) {
  const fieldHelper = FIELD_HELPERS[item.key];
  if (fieldHelper) return fieldHelper;

  if (item.secret) {
    return "Esse dado fica protegido. Se quiser trocar, cole o novo valor e salve no final da tela.";
  }
  if (item.type === "boolean") {
    return "Escolha se esta opção deve ficar ativa no sistema.";
  }
  if (item.type === "cron") {
    return "Define de quanto em quanto tempo esta rotina deve rodar. Exemplo: 60 para uma vez por hora.";
  }
  if (item.type === "csv") {
    return "Se precisar informar mais de um item, separe por vírgula.";
  }
  if (item.type === "url") {
    return "Informe o link completo, começando com https://.";
  }
  if (item.type === "email") {
    return "Informe o e-mail que o sistema deve usar nesta configuração.";
  }
  if (item.type === "number") {
    return "Informe apenas números neste campo.";
  }
  if (item.description) {
    return item.description
      .replace(/\.env/gi, "servidor")
      .replace(/CSV/gi, "lista separada por vírgula")
      .replace(/runtime/gi, "uso imediato");
  }
  return "Preencha este campo com a informação usada pelo sistema.";
}

function hasSecretFields(group?: ConfigCategoryGroup) {
  return Boolean(group?.items.some((item) => item.secret));
}

function getSecretEditingNotice(group?: ConfigCategoryGroup) {
  if (!group || group.secretEditingAvailable !== false) return null;

  if (group.secretEditingReason === "CONFIG_ENCRYPTION_KEY_MISSING") {
    return SECRET_EDITING_UNAVAILABLE_MESSAGE;
  }

  return "Os campos protegidos estão indisponíveis para edição neste momento.";
}

export function GeralConfigPanel({
  group,
  loading,
  onSaved,
}: GeralConfigPanelProps) {
  const [values, setValues] = React.useState<Record<string, EditableValue>>({});
  const [secrets, setSecrets] = React.useState<Record<string, SecretDraft>>({});
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);

  React.useEffect(() => {
    if (!group) return;

    const nextValues: Record<string, EditableValue> = {};
    const nextSecrets: Record<string, SecretDraft> = {};

    group.items.forEach((item) => {
      if (item.secret) {
        nextSecrets[item.key] = { action: "keep", value: "" };
      } else {
        nextValues[item.key] = getInitialValue(item);
      }
    });

    setValues(nextValues);
    setSecrets(nextSecrets);
  }, [group]);

  const payload = React.useMemo(() => {
    return buildConfigPayload(group, values, secrets);
  }, [group, values, secrets]);

  const dirty =
    Object.keys(payload.values).length > 0 ||
    Object.keys(payload.secrets).length > 0;
  const activeMercadoPagoMode = React.useMemo(
    () => getMercadoPagoMode(group, values),
    [group, values],
  );
  const visibleItems = React.useMemo(
    () => (group ? getVisibleItems(group, activeMercadoPagoMode, values) : []),
    [group, activeMercadoPagoMode, values],
  );
  const secretEditingNotice = React.useMemo(
    () => getSecretEditingNotice(group),
    [group],
  );

  const resetDraft = React.useCallback(() => {
    if (!group) return;
    const nextValues: Record<string, EditableValue> = {};
    const nextSecrets: Record<string, SecretDraft> = {};

    group.items.forEach((item) => {
      if (item.secret) nextSecrets[item.key] = { action: "keep", value: "" };
      else nextValues[item.key] = getInitialValue(item);
    });

    setValues(nextValues);
    setSecrets(nextSecrets);
  }, [group]);

  const handleSave = async () => {
    if (!group || saving) return;
    const currentPayload = buildConfigPayload(group, values, secrets);
    const hasCurrentChanges =
      Object.keys(currentPayload.values).length > 0 ||
      Object.keys(currentPayload.secrets).length > 0;

    if (!hasCurrentChanges) {
      toastCustom.info("Nenhuma alteração para salvar.");
      return;
    }

    setSaving(true);
    try {
      const response = await updateConfiguracaoGeral(group.category, {
        values: currentPayload.values,
        secrets: currentPayload.secrets,
        motivo: "Alteração via painel Configurações > Geral",
      });

      onSaved(response.data);
      toastCustom.success({
        title: "Configurações salvas",
        description:
          "As novas informações já estão disponíveis para o sistema.",
      });
    } catch (error) {
      const apiCode = (error as { details?: { code?: string } })?.details?.code;
      const message =
        apiCode === "CONFIG_SECRET_UNAVAILABLE" ||
        apiCode === "CONFIG_ENCRYPTION_KEY_MISSING"
          ? "Campos protegidos não podem ser alterados agora porque a chave de segurança da API não está configurada."
          : error instanceof Error
            ? error.message
            : "Não foi possível salvar.";
      toastCustom.error({ title: "Erro ao salvar", description: message });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!group || testing) return;

    setTesting(true);
    try {
      const response = await testarConfiguracaoGeral(group.category);
      const checks = Array.isArray(response.data.checks)
        ? response.data.checks
        : [];
      const failed = checks.filter((check) => !check.ok);
      const ok =
        response.data.ok ?? response.data.success ?? failed.length === 0;

      if (ok) {
        toastCustom.success({
          title: "Teste concluído",
          description: "Tudo certo com esta configuração.",
        });
      } else {
        toastCustom.warning({
          title: "Teste com pendências",
          description:
            failed.map((check) => check.message).join(" | ") ||
            response.data.message ||
            "Revise os campos obrigatórios desta configuração.",
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível testar.";
      toastCustom.error({ title: "Erro no teste", description: message });
    } finally {
      setTesting(false);
    }
  };

  if (loading || !group) return <GeralConfigSkeleton />;

  return (
    <form
      className="flex flex-col"
      onSubmit={(event) => event.preventDefault()}
    >
      {hasSecretFields(group) && secretEditingNotice ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {secretEditingNotice}
        </div>
      ) : null}

      {group.category === "mercadopago" && (
        <div className="mb-6 max-w-md">
          <ConfigFieldRow
            item={
              group.items.find((item) => item.key === MP_ACTIVE_MODE_KEY) ??
              group.items[0]
            }
            group={group}
            activeMercadoPagoMode={activeMercadoPagoMode}
            secretEditingAvailable={group.secretEditingAvailable !== false}
            value={values[MP_ACTIVE_MODE_KEY]}
            hasDraftValue={hasDraftValue(values, MP_ACTIVE_MODE_KEY)}
            secretDraft={secrets[MP_ACTIVE_MODE_KEY]}
            onValueChange={(nextValue) =>
              setValues((current) => ({
                ...current,
                [MP_ACTIVE_MODE_KEY]: nextValue,
              }))
            }
            onSecretChange={(nextDraft) =>
              setSecrets((current) => ({
                ...current,
                [MP_ACTIVE_MODE_KEY]: nextDraft,
              }))
            }
          />
        </div>
      )}

      <div className="grid gap-x-8 gap-y-6 xl:grid-cols-2">
        {visibleItems
          .filter((item) => item.key !== MP_ACTIVE_MODE_KEY)
          .map((item) => (
            <ConfigFieldRow
              key={item.key}
              item={item}
              group={group}
              activeMercadoPagoMode={activeMercadoPagoMode}
              secretEditingAvailable={group.secretEditingAvailable !== false}
              value={values[item.key]}
              hasDraftValue={hasDraftValue(values, item.key)}
              secretDraft={secrets[item.key]}
              onValueChange={(nextValue) =>
                setValues((current) => ({ ...current, [item.key]: nextValue }))
              }
              onSecretChange={(nextDraft) =>
                setSecrets((current) => ({ ...current, [item.key]: nextDraft }))
              }
            />
          ))}
      </div>

      <footer className="mt-10 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-6">
        <ButtonCustom
          type="button"
          variant="outline"
          size="md"
          withAnimation={false}
          isLoading={testing}
          onClick={handleTest}
          disabled={testing || saving}
        >
          {!testing && <TestTube2 className="h-4 w-4" />}
          Testar
        </ButtonCustom>
        <ButtonCustom
          type="button"
          variant="outline"
          size="md"
          withAnimation={false}
          onClick={resetDraft}
          disabled={!dirty || saving}
        >
          <RotateCcw className="h-4 w-4" />
          Descartar
        </ButtonCustom>
        <ButtonCustom
          type="button"
          variant="primary"
          size="md"
          withAnimation={false}
          isLoading={saving}
          onClick={handleSave}
          disabled={!dirty || saving}
        >
          {!saving && <Save className="h-4 w-4" />}
          Salvar
        </ButtonCustom>
      </footer>
    </form>
  );
}

interface ConfigFieldRowProps {
  item: ConfigItem;
  group: ConfigCategoryGroup;
  activeMercadoPagoMode: MercadoPagoMode;
  secretEditingAvailable: boolean;
  value?: EditableValue;
  hasDraftValue: boolean;
  secretDraft?: SecretDraft;
  onValueChange: (value: EditableValue) => void;
  onSecretChange: (draft: SecretDraft) => void;
}

function ConfigFieldRow({
  item,
  group,
  activeMercadoPagoMode,
  secretEditingAvailable,
  value,
  hasDraftValue,
  secretDraft,
  onValueChange,
  onSecretChange,
}: ConfigFieldRowProps) {
  const helperText = helperTextFor(item);
  const inputId = `config-${item.key}`;

  return (
    <div className="space-y-2" data-testid={`config-field-${item.key}`}>
      <label
        htmlFor={inputId}
        className="flex items-center gap-2 text-sm font-medium text-foreground"
      >
        <span>{item.label}</span>
        {isFieldRequired(item, group, activeMercadoPagoMode) && (
          <span className="text-red-500">*</span>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={`Ajuda sobre ${item.label}`}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="start"
            sideOffset={6}
            className="w-auto max-w-[260px] whitespace-normal break-words px-3 py-2 text-left leading-5 [text-wrap:wrap]"
          >
            {helperText}
          </TooltipContent>
        </Tooltip>
      </label>

      {item.secret ? (
        <SecretField
          id={inputId}
          item={item}
          required={isFieldRequired(item, group, activeMercadoPagoMode)}
          readOnly={!secretEditingAvailable}
          draft={secretDraft}
          onChange={onSecretChange}
        />
      ) : (
        <PlainField
          id={inputId}
          item={item}
          group={group}
          activeMercadoPagoMode={activeMercadoPagoMode}
          value={value}
          hasDraftValue={hasDraftValue}
          onChange={onValueChange}
        />
      )}
    </div>
  );
}

function PlainField({
  id,
  item,
  group,
  activeMercadoPagoMode,
  value,
  hasDraftValue,
  onChange,
}: {
  id: string;
  item: ConfigItem;
  group: ConfigCategoryGroup;
  activeMercadoPagoMode: MercadoPagoMode;
  value?: EditableValue;
  hasDraftValue: boolean;
  onChange: (value: EditableValue) => void;
}) {
  const required = isFieldRequired(item, group, activeMercadoPagoMode);
  const displayValue = getDisplayValue(item, value, hasDraftValue);

  if (item.key === MP_ACTIVE_MODE_KEY) {
    const modeValue = getStringSelectValue(displayValue, MP_ACTIVE_MODE_VALUES);

    return (
      <SelectCustom
        mode="single"
        value={modeValue}
        onChange={(next) => onChange((next ?? null) as MercadoPagoMode | null)}
        required={required}
        placeholder="Escolha o ambiente"
        searchable={false}
        options={[
          { value: "production", label: "Produção" },
          { value: "test", label: "Teste" },
        ]}
      />
    );
  }

  if (item.type === "boolean") {
    const booleanValue = getBooleanSelectValue(displayValue);

    return (
      <SelectCustom
        mode="single"
        value={booleanValue ?? null}
        onChange={(next) => onChange(next === "true")}
        required={required}
        placeholder="Selecione uma opção"
        searchable={false}
        options={[
          { value: "true", label: "Sim, deixar ativo" },
          { value: "false", label: "Não, deixar desligado" },
        ]}
      />
    );
  }

  if (item.key === LOG_LEVEL_KEY) {
    const logLevelValue = getStringSelectValue(displayValue, LOG_LEVEL_VALUES);

    return (
      <SelectCustom
        mode="single"
        value={logLevelValue}
        onChange={(next) => onChange(next ?? null)}
        required={required}
        placeholder="Selecione o nível de log"
        searchable={false}
        options={LOG_LEVEL_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
      />
    );
  }

  if (item.key === DEFAULT_CURRENCY_KEY) {
    return (
      <InputCustom
        id={id}
        type="text"
        value="BRL"
        onChange={() => undefined}
        disabled
        required={required}
        placeholder="BRL"
        className="h-12 bg-muted/40 text-muted-foreground"
      />
    );
  }

  if (item.key === CURSOS_INSTALLMENTS_MAX_KEY) {
    const installmentsValue = getNumberSelectValue(
      displayValue,
      INSTALLMENT_VALUES,
    );

    return (
      <SelectCustom
        mode="single"
        value={installmentsValue}
        onChange={(next) => onChange(next ? Number(next) : null)}
        required={required}
        placeholder="Escolha o limite de parcelas"
        searchable={false}
        options={Array.from({ length: 12 }, (_, index) => {
          const installment = index + 1;
          return {
            value: String(installment),
            label:
              installment === 1 ? "1x no cartão" : `${installment}x no cartão`,
          };
        })}
      />
    );
  }

  if (item.type === "csv") {
    if (isMultiSelectCsvKey(item.key)) {
      const selectedValues = Array.isArray(displayValue) ? displayValue : [];
      return (
        <MultiSelectCustom
          options={PAYMENT_METHOD_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          value={PAYMENT_METHOD_OPTIONS.filter((option) =>
            selectedValues.includes(option.value),
          )}
          onChange={(nextOptions) =>
            onChange(nextOptions.map((option) => option.value))
          }
          placeholder="Selecione os métodos aceitos"
          hidePlaceholderWhenSelected={false}
          hideClearAllButton
          maxVisibleTags={3}
          required={required}
        />
      );
    }

    return (
      <InputCustom
        id={id}
        type="text"
        value={displayValue == null ? "" : String(displayValue)}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholderFor(item)}
        required={required}
        className="h-12"
      />
    );
  }

  return (
    <InputCustom
      id={id}
      type={
        item.type === "number"
          ? "number"
          : item.type === "email"
            ? "email"
            : item.type === "url"
              ? "url"
              : "text"
      }
      value={displayValue == null ? "" : String(displayValue)}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholderFor(item)}
      required={required}
      className="h-12"
    />
  );
}

function SecretField({
  id,
  item,
  required,
  readOnly,
  draft,
  onChange,
}: {
  id: string;
  item: ConfigItem;
  required: boolean;
  readOnly: boolean;
  draft?: SecretDraft;
  onChange: (draft: SecretDraft) => void;
}) {
  const { showingMaskedValue, inputValue } = getSecretFieldInputState(
    item,
    draft,
  );

  return (
    <InputCustom
      id={id}
      type={showingMaskedValue ? "text" : "password"}
      value={inputValue}
      readOnly={readOnly}
      onKeyDown={(event) => {
        if (readOnly) return;
        if (!showingMaskedValue) return;
        if (event.ctrlKey || event.metaKey || event.altKey) return;

        const nextDraft = getNextSecretDraftFromMaskedKey(event.key, draft);
        if (!nextDraft) return;

        event.preventDefault();
        onChange(nextDraft);
      }}
      onPaste={(event) => {
        if (readOnly) return;
        if (!showingMaskedValue) return;
        event.preventDefault();
        onChange({
          action: "replace",
          value: event.clipboardData.getData("text"),
        });
      }}
      onBlur={(event) => {
        if (readOnly) return;
        if (!event.target.value.trim() && item.configured) {
          onChange({ action: "keep", value: "" });
        }
      }}
      onChange={(event) => {
        if (readOnly) return;
        onChange({ action: "replace", value: event.target.value });
      }}
      placeholder={placeholderFor(item)}
      autoComplete="new-password"
      spellCheck={false}
      required={required}
      className={`h-12 ${showingMaskedValue ? "font-mono" : ""} ${readOnly ? "bg-muted/40 text-muted-foreground" : ""}`}
    />
  );
}

export function GeralConfigSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="grid gap-x-8 gap-y-6 xl:grid-cols-2">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
