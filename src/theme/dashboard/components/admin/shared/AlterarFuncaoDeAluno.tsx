"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { updateUsuarioRole } from "@/api/usuarios";
import type { UpdateUsuarioRolePayload } from "@/api/usuarios";
import { toastCustom } from "@/components/ui/custom/toast";
import { getRoleLabel, UserRole } from "@/config/roles";
import { useUserRole } from "@/hooks/useUserRole";
import { contaDoToken, lerCookie } from "@/lib/auth-cookies";
import { AlterarFuncaoUsuarioModal } from "../usuario-details/modal-acoes/AlterarFuncaoUsuarioModal";
import {
  funcoesParaAluno,
  mensagemErroTrocaDeFuncao,
} from "../usuario-details/utils/funcoes";

/** Só administrador e moderador trocam a função de um aluno/candidato */
export function usePodeAlterarFuncaoDeAluno() {
  const role = useUserRole();
  return role === UserRole.ADMIN || role === UserRole.MODERADOR;
}

interface AlterarFuncaoDeAlunoProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: { id: string; nome: string; email: string };
}

/**
 * Troca a função de um aluno/candidato a partir das telas de Cursos › Alunos e
 * Empresas › Candidatos. Depois de trocar, a pessoa deixa de ser aluno: abre a ficha
 * dela em Usuários.
 */
export function AlterarFuncaoDeAluno({
  isOpen,
  onOpenChange,
  usuario,
}: AlterarFuncaoDeAlunoProps) {
  const role = useUserRole();
  const router = useRouter();
  const queryClient = useQueryClient();
  const funcoes = useMemo(
    () => funcoesParaAluno(role, contaDoToken(lerCookie("token")), usuario.id),
    [role, usuario.id],
  );
  const primeiroNome = usuario.nome.trim().split(/\s+/)[0] || usuario.nome;

  const confirmar = async (payload: UpdateUsuarioRolePayload) => {
    try {
      const { data } = await updateUsuarioRole(usuario.id, payload);
      toastCustom.success({
        title: `${primeiroNome} agora é ${getRoleLabel(data.role)}`,
        description:
          "As sessões abertas foram encerradas. No próximo acesso o painel já aparece com a função nova.",
      });
      await queryClient.invalidateQueries();
      router.push(`/dashboard/usuarios/${usuario.id}`);
    } catch (error) {
      toastCustom.error(mensagemErroTrocaDeFuncao(error));
      throw error;
    }
  };

  if (funcoes.length === 0) return null;

  return (
    <AlterarFuncaoUsuarioModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      usuarioId={usuario.id}
      usuarioNome={usuario.nome}
      usuarioEmail={usuario.email}
      tipoUsuario="PESSOA_FISICA"
      roleAtual="ALUNO_CANDIDATO"
      availableRoles={funcoes}
      onConfirm={confirmar}
    />
  );
}
