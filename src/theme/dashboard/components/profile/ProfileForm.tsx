"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ButtonCustom } from "@/components/ui/custom/button";
import { InputCustom } from "@/components/ui/custom/input";
import { toast } from "sonner";
// Removendo imports de ícones do lucide-react - InputCustom usa IconName
import type { UsuarioProfileResponse } from "@/api/usuarios/types";

// Schema de validação
const profileSchema = z.object({
  nomeCompleto: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().optional(),
  celular: z.string().optional(),
  dataNasc: z.string().optional(),
  genero: z.string().optional(),
  descricao: z.string().optional(),
  avatarUrl: z
    .string()
    .url("URL inválida")
    .optional()
    .or(z.literal("")),
  socialLinks: z.record(z.string()),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: UsuarioProfileResponse["usuario"];
  isLoading: boolean;
  onSubmit: (data: Partial<ProfileFormData>) => Promise<void>;
}

export function ProfileForm({
  profile,
  isLoading,
  onSubmit,
}: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Valores iniciais do formulário
  const defaultValues = useMemo<ProfileFormData>(
    () => ({
      nomeCompleto: profile.nomeCompleto || "",
      email: profile.email || "",
      telefone: "",
      celular: "",
      dataNasc: "",
      genero: "",
      descricao: "",
      avatarUrl: "",
      socialLinks: {
        linkedin: profile.socialLinks?.linkedin || "",
        github: profile.socialLinks?.github || "",
        portfolio: profile.socialLinks?.portfolio || "",
        website: profile.socialLinks?.website || "",
        ...(profile.socialLinks || {}),
      },
    }),
    [profile]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  const onFormSubmit = async (data: ProfileFormData) => {
    if (!isDirty) {
      toast.info("Nenhuma alteração foi feita");
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepara os dados para envio (remove campos vazios)
      const payload: Record<string, unknown> = {};
      
      if (data.nomeCompleto !== defaultValues.nomeCompleto) {
        payload.nomeCompleto = data.nomeCompleto;
      }
      // Email não pode ser alterado, então não incluímos
      
      if (data.telefone && data.telefone.trim() !== "") {
        payload.telefone = data.telefone.trim();
      }
      if (data.celular && data.celular.trim() !== "") {
        payload.celular = data.celular.trim();
      }
      if (data.dataNasc && data.dataNasc.trim() !== "") {
        payload.dataNasc = data.dataNasc.trim();
      }
      if (data.genero && data.genero.trim() !== "") {
        payload.genero = data.genero.trim();
      }
      if (data.descricao && data.descricao.trim() !== "") {
        payload.descricao = data.descricao.trim();
      }
      if (data.avatarUrl && data.avatarUrl.trim() !== "") {
        payload.avatarUrl = data.avatarUrl.trim();
      }
      
      // Processa socialLinks - remove campos vazios
      const socialLinks: Record<string, string> = {};
      if (data.socialLinks) {
        Object.entries(data.socialLinks).forEach(([key, value]) => {
          if (value && value.trim() !== "") {
            socialLinks[key] = value.trim();
          }
        });
      }
      
      if (Object.keys(socialLinks).length > 0) {
        payload.socialLinks = socialLinks;
      }

      await onSubmit(payload);
      toast.success("Perfil atualizado com sucesso!");
      reset(data); // Atualiza os valores do formulário após sucesso
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar perfil. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Informações Básicas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputCustom
            label="Nome Completo"
            {...register("nomeCompleto")}
            error={errors.nomeCompleto?.message}
            required
            icon="User"
          />

          <InputCustom
            label="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
            required
            icon="Mail"
            disabled
            helperText="O email não pode ser alterado"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputCustom
            label="Telefone"
            type="tel"
            {...register("telefone")}
            error={errors.telefone?.message}
            icon="Phone"
          />

          <InputCustom
            label="Celular"
            type="tel"
            {...register("celular")}
            error={errors.celular?.message}
            icon="Phone"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputCustom
            label="Data de Nascimento"
            type="date"
            {...register("dataNasc")}
            error={errors.dataNasc?.message}
            icon="Calendar"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Gênero
            </label>
            <select
              {...register("genero")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
            >
              <option value="">Selecione...</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMININO">Feminino</option>
              <option value="OUTRO">Outro</option>
              <option value="PREFIRO_NAO_INFORMAR">Prefiro não informar</option>
            </select>
            {errors.genero && (
              <p className="text-sm text-red-600">{errors.genero.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Descrição e Avatar */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Perfil
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Descrição
            </label>
            <textarea
              {...register("descricao")}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent resize-none"
              placeholder="Conte um pouco sobre você..."
            />
            {errors.descricao && (
              <p className="text-sm text-red-600">{errors.descricao.message}</p>
            )}
          </div>

          <InputCustom
            label="URL do Avatar"
            type="url"
            {...register("avatarUrl")}
            error={errors.avatarUrl?.message}
            icon="Globe"
            helperText="Cole a URL da sua foto de perfil"
          />
        </div>
      </div>

      {/* Links Sociais */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Links Sociais
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputCustom
            label="LinkedIn"
            type="url"
            {...register("socialLinks.linkedin")}
            icon="Globe"
            placeholder="https://linkedin.com/in/seu-perfil"
          />

          <InputCustom
            label="GitHub"
            type="url"
            {...register("socialLinks.github")}
            icon="Globe"
            placeholder="https://github.com/seu-usuario"
          />

          <InputCustom
            label="Portfolio"
            type="url"
            {...register("socialLinks.portfolio")}
            icon="Globe"
            placeholder="https://seu-portfolio.com"
          />

          <InputCustom
            label="Website"
            type="url"
            {...register("socialLinks.website")}
            icon="Globe"
            placeholder="https://seu-website.com"
          />
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
        <ButtonCustom
          type="button"
          variant="secondary"
          onClick={() => reset(defaultValues)}
          disabled={!isDirty || isLoading || isSubmitting}
        >
          Cancelar
        </ButtonCustom>
        <ButtonCustom
          type="submit"
          variant="primary"
          disabled={!isDirty || isLoading || isSubmitting}
          isLoading={isLoading || isSubmitting}
        >
          {isLoading || isSubmitting ? "Salvando..." : "Salvar Alterações"}
        </ButtonCustom>
      </div>
    </form>
  );
}

