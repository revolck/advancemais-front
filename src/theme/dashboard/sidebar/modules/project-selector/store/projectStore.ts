"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toastCustom } from "@/components/ui/custom";
import { parseCookies, setCookie } from "nookies";
import type { Project } from "../types/project.types";

// Constantes para cookies
const TENANT_COOKIE_NAME = "tenant_selection";
const TENANT_SELECTION_DATE = "tenant_selection_date";
const COOKIE_OPTIONS = {
  maxAge: 24 * 60 * 60, // 24 horas
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

// Sample projects data
const sampleProjects: Project[] = [
  {
    id: "1",
    name: "Instituto Amadal",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Instituto Amigos da Sopa Maceió",
    logoUrl: "https://kokonutui.com/logo.svg",
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Tech Solutions",
    createdAt: new Date(),
  },
  {
    id: "4",
    name: "Global Marketing Agency",
    logoUrl: "https://kokonutui.com/logo-black.svg",
    createdAt: new Date(),
  },
  {
    id: "5",
    name: "Healthcare Innovations",
    createdAt: new Date(),
  },
];

/**
 * Interface de estado para o store de projetos/tenants
 */
interface ProjectState {
  // Estados
  projects: Project[];
  selectedProject: Project | null;
  hasSelectedProject: boolean;
  lastSelectionDate: string | null;
  isFirstTimeUser: boolean;
  isLoading: boolean;
  isSelectorModalOpen: boolean;
  isConfirmingSelection: boolean;
  temporarySelectedProject: Project | null;
  isManualSelection: boolean; // Flag para indicar se é uma seleção manual (mudança de projeto)
  isNavigating: boolean; // Novo estado para controlar se está em navegação

  // Ações
  selectProject: (project: Project) => void;
  setTemporarySelectedProject: (project: Project | null) => void;
  confirmProjectSelection: () => Promise<void>;
  openProjectSelector: (isManual?: boolean) => void;
  closeProjectSelector: () => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (id: string) => void;
  setIsLoading: (loading: boolean) => void;
  resetFirstTimeUser: () => void;
  setNavigating: (navigating: boolean) => void; // Nova ação para controlar navegação

  // Getters
  shouldShowProjectSelector: () => boolean;
  checkAndUpdateSelectionDate: () => void;

  // Cookie operations
  saveToCookies: (project: Project) => void;
  loadFromCookies: () => Project | null;
  isSelectionFromToday: () => boolean;
}

// Helper para obter a data atual no formato YYYY-MM-DD
const getCurrentDate = () => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Store de projetos/tenants utilizando Zustand com persistência
 */
export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      projects: sampleProjects,
      selectedProject: null,
      hasSelectedProject: false,
      lastSelectionDate: null,
      isFirstTimeUser: true,
      isLoading: false,
      isSelectorModalOpen: false,
      isConfirmingSelection: false,
      temporarySelectedProject: null,
      isManualSelection: false,
      isNavigating: false, // Novo estado

      // Controlador de navegação
      setNavigating: (navigating) => set({ isNavigating: navigating }),

      // Seleção temporária de projeto (para a modal)
      setTemporarySelectedProject: (project) =>
        set({ temporarySelectedProject: project }),

      // Salvar dados em cookies
      saveToCookies: (project) => {
        // Salvamos o ID do projeto e a data de seleção
        setCookie(null, TENANT_COOKIE_NAME, project.id, COOKIE_OPTIONS);
        setCookie(
          null,
          TENANT_SELECTION_DATE,
          getCurrentDate(),
          COOKIE_OPTIONS
        );
      },

      // Carregar dados dos cookies
      loadFromCookies: () => {
        const cookies = parseCookies();
        const tenantId = cookies[TENANT_COOKIE_NAME];

        if (!tenantId) return null;

        // Encontra o projeto pelo ID
        const project = get().projects.find((p) => p.id === tenantId);
        return project || null;
      },

      // Verificar se a seleção foi feita hoje
      isSelectionFromToday: () => {
        const cookies = parseCookies();
        const selectionDate = cookies[TENANT_SELECTION_DATE];

        if (!selectionDate) return false;

        return selectionDate === getCurrentDate();
      },

      // Ações
      selectProject: (project) => {
        // Salva em cookies para persistência entre sessões
        get().saveToCookies(project);

        set({
          selectedProject: project,
          hasSelectedProject: true,
          lastSelectionDate: getCurrentDate(),
          isLoading: true,
        });
      },

      // Confirmação de seleção - processo completo
      confirmProjectSelection: async () => {
        const state = get();
        const project = state.temporarySelectedProject;

        if (!project) return;

        // Inicia processo de confirmação
        set({ isConfirmingSelection: true });

        try {
          // Seleciona o projeto no estado
          get().selectProject(project);

          // Simula carregamento de dados
          await new Promise((resolve) => setTimeout(resolve, 800));

          // Fecha o modal ANTES de mostrar o toast
          set({
            isSelectorModalOpen: false,
            isConfirmingSelection: false,
            isManualSelection: false,
            isFirstTimeUser: false, // Marca que não é mais a primeira vez após confirmação
          });

          // Aguarda um pouco para garantir que o modal fechou
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Mostra o toast de sucesso
          toastCustom.success({
            title: "Projeto selecionado",
            description: `Você está agora trabalhando em: ${project.name}`,
          });

          // Finaliza o carregamento
          set({ isLoading: false });
        } catch (error) {
          // Em caso de erro
          toastCustom.error({
            title: "Erro ao selecionar projeto",
            description: "Ocorreu um erro ao carregar os dados do projeto.",
          });

          set({
            isLoading: false,
            isConfirmingSelection: false,
          });
        }
      },

      // Abrir o seletor de projetos (com flag para identificar se é seleção manual)
      openProjectSelector: (isManual = false) => {
        const state = get();
        set({
          isSelectorModalOpen: true,
          temporarySelectedProject: state.selectedProject,
          isManualSelection: isManual, // Define se é uma abertura manual (troca) ou automática
        });
      },

      // Fechar o seletor de projetos
      closeProjectSelector: () => {
        const state = get();

        // Se estiver no processo de confirmação, não permitir fechar
        if (state.isConfirmingSelection) return;

        set({
          isSelectorModalOpen: false,
          temporarySelectedProject: null,
          isManualSelection: false,
        });
      },

      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),

      updateProject: (project) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === project.id ? project : p
          ),
          selectedProject:
            state.selectedProject?.id === project.id
              ? project
              : state.selectedProject,
        })),

      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          selectedProject:
            state.selectedProject?.id === id ? null : state.selectedProject,
          hasSelectedProject:
            state.selectedProject?.id === id ? false : state.hasSelectedProject,
        })),

      setIsLoading: (loading) => set({ isLoading: loading }),

      resetFirstTimeUser: () => set({ isFirstTimeUser: false }),

      // Getters e métodos utilitários
      shouldShowProjectSelector: () => {
        const state = get();

        // Se for a primeira vez do usuário ou não houver projeto selecionado
        if (state.isFirstTimeUser || !state.hasSelectedProject) {
          return true;
        }

        // Se só tiver um projeto, não mostra o seletor
        if (state.projects.length === 1) {
          return false;
        }

        // Verifica se a seleção já foi feita hoje
        return !state.isSelectionFromToday();
      },

      checkAndUpdateSelectionDate: () => {
        const state = get();

        // Se estiver navegando, não abra o seletor de projetos
        if (state.isNavigating) return;

        // Primeiro tentamos carregar do cookie
        const savedProject = state.loadFromCookies();

        // Se encontramos um projeto nos cookies e a seleção foi feita hoje
        if (savedProject && state.isSelectionFromToday()) {
          // Atualizamos o estado sem abrir a modal
          set({
            selectedProject: savedProject,
            hasSelectedProject: true,
            lastSelectionDate: getCurrentDate(),
            isFirstTimeUser: false,
          });
          return;
        }

        // Verificar se precisa mostrar seletor hoje
        if (state.shouldShowProjectSelector() && !state.isNavigating) {
          set({ isSelectorModalOpen: true });
        }

        // Se tem só um projeto, seleciona automaticamente
        if (state.projects.length === 1 && !state.selectedProject) {
          get().selectProject(state.projects[0]);
          set({
            isLoading: false,
            isFirstTimeUser: false,
          });
        }
      },
    }),
    {
      name: "tenant-storage", // Nome usado para armazenamento persistente
      partialize: (state) => ({
        // Não persistimos estados temporários
        selectedProject: state.selectedProject,
        hasSelectedProject: state.hasSelectedProject,
        lastSelectionDate: state.lastSelectionDate,
        isFirstTimeUser: state.isFirstTimeUser,
        // Não persistimos o estado de navegação
      }),
    }
  )
);
