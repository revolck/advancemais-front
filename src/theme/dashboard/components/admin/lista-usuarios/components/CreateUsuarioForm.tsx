"use client";

import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ButtonCustom } from "@/components/ui/custom";
import { InputCustom } from "@/components/ui/custom/input";
import { SelectCustom } from "@/components/ui/custom/select";
import type { SelectOption } from "@/components/ui/custom/select/types";
import { toastCustom } from "@/components/ui/custom";
import { DatePickerCustom } from "@/components/ui/custom/date-picker";
import {
  createUsuario,
  type CreateUsuarioPayload,
  type Role,
  type TipoUsuario,
  type StatusUsuario,
} from "@/api/usuarios";
import { Eye, EyeOff, Loader2, User } from "lucide-react";
import { FormLoadingModal } from "@/components/ui/custom/form-loading-modal";
import { invalidateUsuarios } from "@/lib/react-query/invalidation";
import { lookupCep, normalizeCep } from "@/lib/cep";

// Funções de formatação com máscaras
const formatCPF = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const formatCNPJ = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
};

// Função simples para decodificar JWT sem biblioteca externa
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

interface FormData {
  nomeCompleto: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  telefone: string;
  tipoUsuario: TipoUsuario | null;
  role: Role | null;
  cpf: string;
  cnpj: string;
  dataNascimento: string;
  genero: string;
  logradouro: string;
  numeroEndereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

const initialFormData: FormData = {
  nomeCompleto: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  telefone: "",
  tipoUsuario: "PESSOA_FISICA",
  role: null,
  cpf: "",
  cnpj: "",
  dataNascimento: "",
  genero: "",
  logradouro: "",
  numeroEndereco: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
};

export interface CreateUsuarioFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Função para obter roles disponíveis com base na role do usuário logado
const getAvailableRoles = (userRole: string): Role[] => {
  const allRoles: Role[] = [
    "ADMIN",
    "MODERADOR",
    "EMPRESA",
    "ALUNO_CANDIDATO",
    "INSTRUTOR",
    "PEDAGOGICO",
    "SETOR_DE_VAGAS",
    "RECRUTADOR",
    "FINANCEIRO",
  ];

  switch (userRole) {
    case "ADMIN":
      return allRoles; // Todas as roles

    case "MODERADOR":
      return allRoles.filter((r) => r !== "ADMIN" && r !== "MODERADOR");

    case "PEDAGOGICO":
      return ["ALUNO_CANDIDATO", "INSTRUTOR"];

    default:
      return [];
  }
};

// Função para obter role do usuário logado
const getUserRole = (): string | null => {
  try {
    if (typeof document === "undefined") return null;
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (!token) return null;
    const decoded = decodeJWT(token);
    return decoded?.role || null;
  } catch {
    return null;
  }
};

export function CreateUsuarioForm({
  onSuccess,
  onCancel,
}: CreateUsuarioFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [estadoOptions, setEstadoOptions] = useState<SelectOption[]>([]);
  const [cidadesOptions, setCidadesOptions] = useState<SelectOption[]>([]);
  const [citiesCache, setCitiesCache] = useState<
    Record<string, SelectOption[]>
  >({});
  const [isLoadingEstados, setIsLoadingEstados] = useState(false);
  const [isLoadingCidades, setIsLoadingCidades] = useState(false);

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
    if (role) {
      setAvailableRoles(getAvailableRoles(role));
    }
  }, []);

  useEffect(() => {
    const fetchEstados = async () => {
      setIsLoadingEstados(true);
      try {
        const response = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
        );
        if (!response.ok) {
          throw new Error("Erro ao carregar estados");
        }
        const data: Array<{ sigla: string; nome: string }> =
          await response.json();
        const options = data.map((estado) => ({
          value: estado.sigla,
          label: estado.nome,
        }));
        setEstadoOptions(options);
      } catch (error) {
        console.error("Erro ao carregar estados do IBGE:", error);
      } finally {
        setIsLoadingEstados(false);
      }
    };

    fetchEstados();
  }, []);

  const tipoUsuarioOptions = [
    { label: "Pessoa Física", value: "PESSOA_FISICA" as TipoUsuario },
    { label: "Pessoa Jurídica", value: "PESSOA_JURIDICA" as TipoUsuario },
  ];

  const roleOptions = availableRoles.map((role) => ({
    label: role.replace(/_/g, " "),
    value: role,
  }));

  const generoOptions = [
    { label: "Masculino", value: "MASCULINO" },
    { label: "Feminino", value: "FEMININO" },
    { label: "Outro", value: "OUTRO" },
    { label: "Prefiro não informar", value: "PREFIRO_NAO_INFORMAR" },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.nomeCompleto.trim())
      newErrors.nomeCompleto = "Nome completo é obrigatório";
    if (!formData.email.trim()) newErrors.email = "Email é obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email inválido";

    if (!formData.senha) newErrors.senha = "Senha é obrigatória";
    else if (formData.senha.length < 8)
      newErrors.senha = "Senha deve ter no mínimo 8 caracteres";

    if (!formData.confirmarSenha)
      newErrors.confirmarSenha = "Confirmação de senha é obrigatória";
    else if (formData.senha !== formData.confirmarSenha)
      newErrors.confirmarSenha = "Senhas não coincidem";

    if (!formData.telefone.trim())
      newErrors.telefone = "Telefone é obrigatório";
    if (!formData.tipoUsuario)
      newErrors.tipoUsuario = "Tipo de usuário é obrigatório";
    if (!formData.role) newErrors.role = "Role é obrigatória";

    if (formData.tipoUsuario === "PESSOA_FISICA" && !formData.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório para pessoa física";
    }

    if (formData.tipoUsuario === "PESSOA_JURIDICA" && !formData.cnpj.trim()) {
      newErrors.cnpj = "CNPJ é obrigatório para pessoa jurídica";
    }

    if (!formData.logradouro.trim())
      newErrors.logradouro = "Logradouro é obrigatório";
    if (!formData.numeroEndereco.trim())
      newErrors.numeroEndereco = "Número é obrigatório";
    if (!formData.bairro.trim()) newErrors.bairro = "Bairro é obrigatório";
    if (!formData.cidade.trim()) newErrors.cidade = "Cidade é obrigatória";
    if (!formData.estado.trim()) newErrors.estado = "Estado é obrigatório";
    if (!formData.cep.trim()) newErrors.cep = "CEP é obrigatório";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleTipoUsuarioChange = (value: TipoUsuario) => {
    setFormData((prev) => ({
      ...prev,
      tipoUsuario: value,
      cpf: value === "PESSOA_FISICA" ? prev.cpf : "",
      cnpj: value === "PESSOA_JURIDICA" ? prev.cnpj : "",
    }));
    if (errors.tipoUsuario)
      setErrors((prev) => ({ ...prev, tipoUsuario: undefined }));
    if (value === "PESSOA_FISICA" && errors.cnpj) {
      setErrors((prev) => ({ ...prev, cnpj: undefined }));
    }
    if (value === "PESSOA_JURIDICA" && errors.cpf) {
      setErrors((prev) => ({ ...prev, cpf: undefined }));
    }
  };

  const normalizeText = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const applyCityFromOptions = (
    options: SelectOption[],
    cityToSelect?: string | null
  ) => {
    if (!cityToSelect) {
      handleInputChange("cidade", "");
      return;
    }
    const normalizedTarget = normalizeText(cityToSelect);
    const foundOption =
      options.find(
        (option) => normalizeText(option.value) === normalizedTarget
      ) || null;
    handleInputChange("cidade", foundOption ? foundOption.value : "");
  };

  const fetchCitiesByUf = async (uf: string, cityToSelect?: string | null) => {
    if (!uf) return;

    const cached = citiesCache[uf];
    if (cached) {
      setCidadesOptions(cached);
      applyCityFromOptions(cached, cityToSelect);
      return;
    }

    setIsLoadingCidades(true);
    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
      );
      if (!response.ok) {
        throw new Error("Erro ao carregar cidades");
      }
      const data: Array<{ nome: string }> = await response.json();
      const options = data.map((city) => ({
        value: city.nome,
        label: city.nome,
      }));
      setCidadesOptions(options);
      setCitiesCache((prev) => ({ ...prev, [uf]: options }));
      applyCityFromOptions(options, cityToSelect);
    } catch (error) {
      console.error("Erro ao carregar cidades do estado:", uf, error);
      setCidadesOptions([]);
      if (cityToSelect) {
        handleInputChange("cidade", "");
      }
    } finally {
      setIsLoadingCidades(false);
    }
  };

  const handleEstadoChange = (value: string | null) => {
    const uf = value ?? "";
    handleInputChange("estado", uf);
    handleInputChange("cidade", "");

    if (!uf) {
      setCidadesOptions([]);
      return;
    }

    setCidadesOptions([]);
    fetchCitiesByUf(uf);
  };

  const handleCepChange = async (value: string) => {
    const formattedCep = normalizeCep(value);
    handleInputChange("cep", formattedCep);

    if (errors.cep) {
      setErrors((prev) => ({ ...prev, cep: undefined }));
    }

    const cleanCep = value.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setIsLoadingCep(false);
      return;
    }

    setIsLoadingCep(true);
    try {
      const result = await lookupCep(cleanCep);
      if ("error" in result) {
        setErrors((prev) => ({ ...prev, cep: result.error }));
        return;
      }

      handleInputChange("cep", result.cep);

      if (result.street) {
        handleInputChange("logradouro", result.street);
      }

      if (result.neighborhood) {
        handleInputChange("bairro", result.neighborhood);
      }

      setErrors((prev) => {
        const updated = { ...prev, cep: undefined };
        if (result.street) updated.logradouro = undefined;
        if (result.neighborhood) updated.bairro = undefined;
        return updated;
      });

      if (result.state) {
        handleInputChange("estado", result.state);
        await fetchCitiesByUf(result.state, result.city || undefined);
      } else {
        handleEstadoChange(null);
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setErrors((prev) => ({
        ...prev,
        cep: "Erro ao buscar CEP. Tente novamente.",
      }));
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setLoadingStep("Criando usuário...");
    try {
      const payload: CreateUsuarioPayload = {
        nomeCompleto: formData.nomeCompleto.trim(),
        email: formData.email.trim(),
        senha: formData.senha,
        confirmarSenha: formData.confirmarSenha,
        telefone: formData.telefone.replace(/\D/g, ""),
        tipoUsuario: formData.tipoUsuario!,
        role: formData.role!,
        aceitarTermos: true,
        status: "ATIVO" as StatusUsuario,
      };

      if (formData.tipoUsuario === "PESSOA_FISICA" && formData.cpf) {
        payload.cpf = formData.cpf.replace(/\D/g, "");
      }

      if (formData.tipoUsuario === "PESSOA_JURIDICA" && formData.cnpj) {
        payload.cnpj = formData.cnpj.replace(/\D/g, "");
      }

      if (formData.dataNascimento) {
        payload.dataNascimento = formData.dataNascimento;
      }

      if (formData.genero) {
        payload.genero = formData.genero;
      }

      payload.endereco = {
        logradouro: formData.logradouro.trim(),
        numero: formData.numeroEndereco.trim(),
        bairro: formData.bairro.trim(),
        cidade: formData.cidade.trim(),
        estado: formData.estado.trim(),
        cep: formData.cep.replace(/\D/g, ""),
      };

      setLoadingStep("Salvando usuário...");
      const response = await createUsuario(payload);

      if (response.success) {
        setLoadingStep("Finalizando...");
        toastCustom.success({
          title: "Sucesso!",
          description: "Usuário cadastrado com sucesso",
        });
        invalidateUsuarios(queryClient);
        onSuccess?.();
      }
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);

      // Tratamento de erros específicos
      if (error.code === "FORBIDDEN_ROLE") {
        toastCustom.error({
          title: "Permissão Negada",
          description:
            error.message ||
            "Você não tem permissão para criar usuários com esta role",
        });
      } else if (error.code === "USER_ALREADY_EXISTS") {
        toastCustom.error({
          title: "Usuário Já Existe",
          description: "Email, CPF ou CNPJ já cadastrado no sistema",
        });
      } else if (error.errors && Array.isArray(error.errors)) {
        // Erros de validação
        const fieldErrors: Partial<Record<keyof FormData, string>> = {};
        error.errors.forEach((err: any) => {
          if (err.path && err.message) {
            fieldErrors[err.path as keyof FormData] = err.message;
          }
        });
        setErrors(fieldErrors);
        toastCustom.error({
          title: "Erro de Validação",
          description: "Verifique os campos do formulário",
        });
      } else {
        toastCustom.error({
          title: "Erro ao cadastrar",
          description: error.message || "Não foi possível cadastrar o usuário",
        });
      }
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="w-full relative">
      <FormLoadingModal
        isLoading={isLoading}
        title="Criando usuário..."
        loadingStep={loadingStep}
        icon={User}
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl bg-white p-6 border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:[grid-template-columns:0.2fr_0.2fr_0.6fr] gap-4">
            <SelectCustom
              label="Tipo de usuário"
              placeholder="Selecione o tipo"
              options={tipoUsuarioOptions}
              value={formData.tipoUsuario}
              onChange={(value) =>
                handleTipoUsuarioChange(value as TipoUsuario)
              }
              error={errors.tipoUsuario}
              required
            />

            {formData.tipoUsuario === "PESSOA_FISICA" ? (
              <InputCustom
                label="CPF"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => handleInputChange("cpf", formatCPF(e.target.value))}
                error={errors.cpf}
                maxLength={14}
                required
              />
            ) : (
              <InputCustom
                label="CNPJ"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) => handleInputChange("cnpj", formatCNPJ(e.target.value))}
                error={errors.cnpj}
                maxLength={18}
                required
              />
            )}

            <InputCustom
              label={
                formData.tipoUsuario === "PESSOA_JURIDICA"
                  ? "Razão Social"
                  : "Nome Completo"
              }
              placeholder={
                formData.tipoUsuario === "PESSOA_JURIDICA"
                  ? "Digite a razão social"
                  : "Digite o nome completo"
              }
              value={formData.nomeCompleto}
              onChange={(e) =>
                handleInputChange("nomeCompleto", e.target.value)
              }
              error={errors.nomeCompleto}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:[grid-template-columns:0.2fr_0.2fr_0.25fr_0.2fr_0.15fr] gap-4">
            <SelectCustom
              label="Função (Role)"
              placeholder="Selecione a função"
              options={roleOptions}
              value={formData.role}
              onChange={(value) => handleInputChange("role", value)}
              error={errors.role}
              required
            />

            <InputCustom
              label="Telefone"
              placeholder="(00) 00000-0000"
              value={formData.telefone}
              onChange={(e) => handleInputChange("telefone", formatPhone(e.target.value))}
              error={errors.telefone}
              maxLength={15}
              required
            />

            <InputCustom
              label="Email"
              type="email"
              placeholder="exemplo@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              error={errors.email}
              required
            />

            <DatePickerCustom
              label="Data de Nascimento"
              value={
                formData.dataNascimento
                  ? new Date(`${formData.dataNascimento}T00:00:00`)
                  : null
              }
              onChange={(date) =>
                handleInputChange(
                  "dataNascimento",
                  date ? new Date(date).toISOString().slice(0, 10) : ""
                )
              }
              format="dd/MM/yyyy"
              error={errors.dataNascimento}
            />

            <SelectCustom
              label="Gênero"
              placeholder="Selecione o gênero"
              options={generoOptions}
              value={formData.genero}
              onChange={(value) => handleInputChange("genero", value)}
              error={errors.genero}
            />
          </div>

          <div className="grid grid-cols-1 md:[grid-template-columns:0.2fr_0.2fr_0.3fr_0.3fr] gap-4">
            <div className="relative">
              <InputCustom
                label="CEP"
                placeholder="00000-000"
                value={formData.cep}
                onChange={(e) => handleCepChange(e.target.value)}
                error={errors.cep}
                required
                disabled={isLoadingCep}
              />
              {isLoadingCep && (
                <Loader2 className="absolute right-3 top-9 h-5 w-5 animate-spin text-gray-400" />
              )}
            </div>

            <div className="relative">
              <SelectCustom
                label="Estado"
                placeholder={
                  isLoadingEstados
                    ? "Carregando estados..."
                    : "Selecione o estado"
                }
                options={estadoOptions}
                value={formData.estado || null}
                onChange={(value) => handleEstadoChange(value)}
                disabled={isLoadingEstados || estadoOptions.length === 0}
                error={errors.estado}
                required
              />
              {isLoadingEstados && (
                <Loader2 className="absolute right-3 top-9 h-5 w-5 animate-spin text-gray-400" />
              )}
            </div>

            <div className="relative">
              <SelectCustom
                label="Cidade"
                placeholder={
                  formData.estado
                    ? "Selecione a cidade"
                    : "Selecione um estado para listar as cidades"
                }
                options={cidadesOptions}
                value={formData.cidade || null}
                onChange={(value) => handleInputChange("cidade", value || "")}
                disabled={
                  !formData.estado ||
                  isLoadingCidades ||
                  cidadesOptions.length === 0
                }
                error={errors.cidade}
                required
              />
              {isLoadingCidades && (
                <Loader2 className="absolute right-3 top-9 h-5 w-5 animate-spin text-gray-400" />
              )}
            </div>

            <InputCustom
              label="Bairro"
              placeholder="Informe o bairro"
              value={formData.bairro}
              onChange={(e) => handleInputChange("bairro", e.target.value)}
              error={errors.bairro}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:[grid-template-columns:0.2fr_0.8fr] gap-4">
            <InputCustom
              label="Número"
              placeholder="Nº"
              value={formData.numeroEndereco}
              onChange={(e) =>
                handleInputChange("numeroEndereco", e.target.value)
              }
              error={errors.numeroEndereco}
              required
            />
            <InputCustom
              label="Logradouro"
              placeholder="Rua / Avenida"
              value={formData.logradouro}
              onChange={(e) => handleInputChange("logradouro", e.target.value)}
              error={errors.logradouro}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <InputCustom
                label="Senha"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={formData.senha}
                onChange={(e) => handleInputChange("senha", e.target.value)}
                error={errors.senha}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <InputCustom
                label="Confirmar Senha"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Digite a senha novamente"
                value={formData.confirmarSenha}
                onChange={(e) =>
                  handleInputChange("confirmarSenha", e.target.value)
                }
                error={errors.confirmarSenha}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-10">
            <ButtonCustom
              type="button"
              size="md"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              type="submit"
              size="md"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Cadastrando..." : "Cadastrar Usuário"}
            </ButtonCustom>
          </div>
        </div>
      </form>
    </div>
  );
}
