// src/app/academia/db/loader.ts
import { UserRole } from "@/config/roles";
import type { AcademiaAudience } from "@/lib/academia/types";

export interface VideoAcademia {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: string;
  thumbnailUrl?: string;
  posterUrl?: string;
  category: "Introdução" | "Cursos" | "Usuários" | "Configurações";
  module: "primeiros-passos" | "gestao-cursos" | "gestao-usuarios" | "configuracoes";
  level: "Iniciante" | "Intermediário" | "Avançado";
  tags: string[];
  transcript?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ContentType = "trilhas" | "artigos" | "tutoriais";

/**
 * Carrega conteúdo (trilhas/artigos/tutoriais) do JSON estático baseado na role do usuário.
 * 
 * Regras:
 * - ADMIN e MODERADOR: veem tudo (TODOS + EMPRESA + ALUNO_CANDIDATO + INSTRUTOR + PEDAGOGICO + ADMIN + MODERADOR)
 * - Outras roles: veem TODOS + sua própria role
 */
export async function loadContent(
  userRole: UserRole | null,
  contentType: ContentType
): Promise<VideoAcademia[]> {
  // Se não houver role (não autenticado), retorna vazio
  if (!userRole) return [];

  const allContent: VideoAcademia[] = [];

  try {
    // 1. Sempre carrega TODOS
    const todosModule = await import(`./TODOS/${contentType}.json`);
    allContent.push(...(todosModule.default || []));

    // 2. Se for ADMIN ou MODERADOR, carrega tudo
    if (userRole === UserRole.ADMIN || userRole === UserRole.MODERADOR) {
      const roles: Array<Exclude<UserRole, "ADMIN" | "MODERADOR">> = [
        UserRole.EMPRESA,
        UserRole.ALUNO_CANDIDATO,
        UserRole.INSTRUTOR,
        UserRole.PEDAGOGICO,
      ];

      for (const role of roles) {
        try {
          const roleModule = await import(`./${role}/${contentType}.json`);
          allContent.push(...(roleModule.default || []));
        } catch (err) {
          console.warn(`Falha ao carregar ${contentType} para role ${role}:`, err);
        }
      }

      // Carrega também ADMIN e MODERADOR
      try {
        const adminModule = await import(`./ADMIN/${contentType}.json`);
        allContent.push(...(adminModule.default || []));
      } catch {}
      try {
        const modModule = await import(`./MODERADOR/${contentType}.json`);
        allContent.push(...(modModule.default || []));
      } catch {}
    } else {
      // 3. Carrega só a role específica do usuário
      try {
        const userRoleModule = await import(`./${userRole}/${contentType}.json`);
        allContent.push(...(userRoleModule.default || []));
      } catch (err) {
        console.warn(`Falha ao carregar ${contentType} para role ${userRole}:`, err);
      }
    }

    // Remove duplicados por ID e filtra por isActive
    const uniqueContent = Array.from(
      new Map(allContent.map((item) => [item.id, item])).values()
    ).filter((item) => item.isActive !== false);

    return uniqueContent;
  } catch (error) {
    console.error(`Erro ao carregar ${contentType}:`, error);
    return [];
  }
}

/**
 * Carrega um vídeo específico por ID (verifica permissão)
 */
export async function loadVideoById(
  videoId: string,
  userRole: UserRole | null,
  contentType: ContentType = "trilhas"
): Promise<VideoAcademia | null> {
  const allVideos = await loadContent(userRole, contentType);
  return allVideos.find((v) => v.id === videoId) || null;
}

