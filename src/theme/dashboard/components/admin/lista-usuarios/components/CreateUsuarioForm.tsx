"use client";

import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ButtonCustom } from "@/components/ui/custom";
import { InputCustom } from "@/components/ui/custom/input";
import { SelectCustom } from "@/components/ui/custom/select";
import { toastCustom } from "@/components/ui/custom";
import { createUsuario, type CreateUsuarioPayload, type Role, type TipoUsuario, type StatusUsuario } from "@/api/usuarios";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { invalidateUsuarios } from "@/lib/react-query/invalidation";
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
  status: StatusUsuario | null;
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
  status: "ATIVO",
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

export function CreateUsuarioForm({ onSuccess, onCancel }: CreateUsuarioFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
    if (role) {
      setAvailableRoles(getAvailableRoles(role));
    }
  }, []);

  const tipoUsuarioOptions = [
    { label: "Pessoa Física", value: "PESSOA_FISICA" },
    { label: "Pessoa Jurídica", value: "PESSOA_JURIDICA" },
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

  const statusOptions = [
    { label: "Ativo", value: "ATIVO" },
    { label: "Inativo", value: "INATIVO" },
    { label: "Suspenso", value: "SUSPENSO" },
    { label: "Bloqueado", value: "BLOQUEADO" },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.nomeCompleto.trim()) newErrors.nomeCompleto = "Nome completo é obrigatório";
    if (!formData.email.trim()) newErrors.email = "Email é obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email inválido";
    
    if (!formData.senha) newErrors.senha = "Senha é obrigatória";
    else if (formData.senha.length < 8) newErrors.senha = "Senha deve ter no mínimo 8 caracteres";
    
    if (!formData.confirmarSenha) newErrors.confirmarSenha = "Confirmação de senha é obrigatória";
    else if (formData.senha !== formData.confirmarSenha) newErrors.confirmarSenha = "Senhas não coincidem";
    
    if (!formData.telefone.trim()) newErrors.telefone = "Telefone é obrigatório";
    if (!formData.tipoUsuario) newErrors.tipoUsuario = "Tipo de usuário é obrigatório";
    if (!formData.role) newErrors.role = "Role é obrigatória";
    
    if (formData.tipoUsuario === "PESSOA_FISICA" && !formData.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório para pessoa física";
    }
    
    if (formData.tipoUsuario === "PESSOA_JURIDICA" && !formData.cnpj.trim()) {
      newErrors.cnpj = "CNPJ é obrigatório para pessoa jurídica";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
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
        status: formData.status || "ATIVO",
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

      const response = await createUsuario(payload);

      if (response.success) {
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
          description: error.message || "Você não tem permissão para criar usuários com esta role",
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
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputCustom
              label="Nome Completo"
              placeholder="Digite o nome completo"
              value={formData.nomeCompleto}
              onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
              error={errors.nomeCompleto}
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

            <InputCustom
              label="Telefone"
              placeholder="(00) 00000-0000"
              value={formData.telefone}
              onChange={(e) => handleInputChange("telefone", e.target.value)}
              error={errors.telefone}
              required
            />

            <SelectCustom
              label="Tipo de Usuário"
              placeholder="Selecione o tipo"
              options={tipoUsuarioOptions}
              value={formData.tipoUsuario}
              onChange={(value) => handleInputChange("tipoUsuario", value)}
              error={errors.tipoUsuario}
              required
            />

            {formData.tipoUsuario === "PESSOA_FISICA" && (
              <InputCustom
                label="CPF"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => handleInputChange("cpf", e.target.value)}
                error={errors.cpf}
                required
              />
            )}

            {formData.tipoUsuario === "PESSOA_JURIDICA" && (
              <InputCustom
                label="CNPJ"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) => handleInputChange("cnpj", e.target.value)}
                error={errors.cnpj}
                required
              />
            )}

            <SelectCustom
              label="Função (Role)"
              placeholder="Selecione a função"
              options={roleOptions}
              value={formData.role}
              onChange={(value) => handleInputChange("role", value)}
              error={errors.role}
              required
            />

            <SelectCustom
              label="Status"
              placeholder="Selecione o status"
              options={statusOptions}
              value={formData.status}
              onChange={(value) => handleInputChange("status", value)}
              error={errors.status}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputCustom
              label="Data de Nascimento"
              type="date"
              value={formData.dataNascimento}
              onChange={(e) => handleInputChange("dataNascimento", e.target.value)}
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
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Senha de Acesso</h2>
          
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
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>

            <div className="relative">
              <InputCustom
                label="Confirmar Senha"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Digite a senha novamente"
                value={formData.confirmarSenha}
                onChange={(e) => handleInputChange("confirmarSenha", e.target.value)}
                error={errors.confirmarSenha}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <ButtonCustom
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            type="submit"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Cadastrar Usuário
          </ButtonCustom>
        </div>
      </form>
    </div>
  );
}

