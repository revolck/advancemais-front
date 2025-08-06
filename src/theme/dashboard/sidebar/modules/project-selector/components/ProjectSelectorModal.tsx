"use client";

import { useState, useEffect } from "react";
import { ProjectAvatar } from "./ProjectAvatar";
import { useProjectStore } from "../store/projectStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Input } from "@/components/ui/input";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Icon } from "@/components/ui/custom/Icons";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  ModalCustom,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalContentWrapper,
} from "@/components/ui/custom/modal";

import type { Project } from "../types/project.types";

export function ProjectSelectorModal() {
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Estados do Zustand
  const {
    projects,
    temporarySelectedProject,
    isFirstTimeUser,
    isSelectorModalOpen,
    isConfirmingSelection,
    isManualSelection,
    setTemporarySelectedProject,
    confirmProjectSelection,
    closeProjectSelector,
  } = useProjectStore();

  // Estados locais
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(projects);

  // Filtra os projetos com base na query de busca
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter((project: Project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  }, [searchQuery, projects]);

  // Rótulos dinâmicos baseados no contexto
  const getModalTitle = () => {
    if (isFirstTimeUser) return "Bem-vindo! Selecione um projeto";
    return isManualSelection ? "Trocar projeto" : "Selecione um projeto";
  };

  const getModalDescription = () => {
    if (isFirstTimeUser) {
      return "Selecione o projeto em que deseja trabalhar. Esta seleção determina quais dados e funcionalidades estarão disponíveis.";
    }
    return isManualSelection
      ? "Selecione outro projeto para continuar seu trabalho."
      : "É um novo dia! Por favor, confirme ou altere o projeto que deseja usar hoje.";
  };

  // Função para confirmar seleção com toast adicional
  const handleConfirmSelection = () => {
    if (!temporarySelectedProject) return;

    // Notifica que a seleção está sendo processada
    if (!isFirstTimeUser) {
      toastCustom.info({
        title: "Processando seleção",
        description: "Carregando dados do projeto...",
        icon: <Icon name="Loader2" className="animate-spin" />,
        duration: 2000,
      });
    }

    // Chama a função existente
    confirmProjectSelection();
  };

  // Animações
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, duration: 0.3 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.04,
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
      },
    }),
  };

  return (
    <ModalCustom
      isOpen={isSelectorModalOpen}
      onOpenChange={(open) => {
        if (!open && !isConfirmingSelection) {
          closeProjectSelector();
        }
      }}
      size={isMobile ? "full" : "md"}
      isDismissable={!isFirstTimeUser || isManualSelection} // Permite fechar se não for primeira vez OU for seleção manual
      isKeyboardDismissDisabled={isFirstTimeUser && !isManualSelection} // Desabilita fechar com ESC apenas na primeira vez e não for seleção manual
      backdrop="blur"
      hideCloseButton={isFirstTimeUser && !isManualSelection} // Esconde botão X apenas na primeira vez E não for seleção manual
    >
      <ModalContentWrapper
        placement={isMobile ? "bottom" : "center"}
        isDismissable={!isFirstTimeUser || isManualSelection}
        isKeyboardDismissDisabled={isFirstTimeUser && !isManualSelection}
        hideCloseButton={isFirstTimeUser && !isManualSelection}
        backdrop="blur"
        className="max-w-lg !overflow-hidden"
        motionProps={{
          initial: {
            opacity: 0,
            y: isMobile ? 20 : 0,
            scale: isMobile ? 1 : 0.98,
          },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
        }}
      >
        <ModalHeader className="pb-1">
          <ModalTitle className="text-xl font-bold">
            {getModalTitle()}
          </ModalTitle>
          <ModalDescription className="text-sm">
            {getModalDescription()}
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="py-3">
          {/* Campo de busca */}
          <div className="relative mb-4">
            <Icon
              name="Search"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
            />
            <Input
              placeholder="Pesquise por um projeto..."
              className="pl-9 h-10 focus-visible:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isConfirmingSelection}
            />
          </div>

          {/* Lista de projetos */}
          <div
            className={cn(
              "relative overflow-y-auto pr-1",
              isMobile ? "max-h-[35vh]" : "max-h-[45vh]"
            )}
          >
            <AnimatePresence mode="wait">
              {filteredProjects.length > 0 ? (
                <motion.div
                  key="project-list"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-2"
                >
                  {filteredProjects.map((project: Project, index: number) => (
                    <motion.div
                      key={project.id}
                      custom={index}
                      variants={itemVariants}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all",
                        temporarySelectedProject?.id === project.id
                          ? "bg-blue-50 border-blue-200"
                          : "hover:bg-gray-50 border-gray-200",
                        isConfirmingSelection &&
                          "opacity-60 pointer-events-none"
                      )}
                      onClick={() => {
                        if (!isConfirmingSelection) {
                          setTemporarySelectedProject(project);
                          // Toast removido aqui - não notificar a cada clique na lista
                        }
                      }}
                    >
                      <ProjectAvatar project={project} size="md" />

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {project.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Criado em:{" "}
                          {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Indicador de seleção */}
                      {temporarySelectedProject?.id === project.id && (
                        <div className="flex-shrink-0">
                          <div className="size-6 rounded-full bg-[#2d984d] flex items-center justify-center">
                            <Icon
                              name="Check"
                              size={14}
                              className="text-white"
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center py-10 text-gray-500"
                >
                  <Icon name="Info" size={40} className="mb-2 opacity-50" />
                  <p className="text-center">
                    Nenhum projeto encontrado com este nome
                  </p>
                  <p className="text-xs mt-1">
                    Tente outro nome ou limpe a busca
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ModalBody>

        <ModalFooter className="pt-2">
          <div className="w-full flex flex-col gap-3">
            {/* Botão de confirmar */}
            <ButtonCustom
              onClick={handleConfirmSelection}
              disabled={!temporarySelectedProject || isConfirmingSelection}
              variant="primary"
              size="lg"
              fullWidth
              className="h-12 text-base font-medium bg__royal-blue hover:bg__royal-blue--d20"
            >
              {isConfirmingSelection ? (
                <>
                  <Icon name="Loader2" className="mr-2 h-5 w-5 animate-spin" />
                  Carregando...
                </>
              ) : (
                "Confirmar"
              )}
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
