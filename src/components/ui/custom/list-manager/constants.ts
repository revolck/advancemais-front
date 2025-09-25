export const LIST_ANIMATIONS = {
  FADE_IN: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.2 },
  },
  SLIDE_IN: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3 },
  },
  SCALE_IN: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 },
  },
};

export const LIST_MESSAGES = {
  CREATE_SUCCESS: "Item criado com sucesso!",
  UPDATE_SUCCESS: "Item atualizado com sucesso!",
  DELETE_SUCCESS: "Item removido com sucesso!",
  REFRESH_SUCCESS: "Lista atualizada com sucesso!",
  CREATE_ERROR: "Erro ao criar item",
  UPDATE_ERROR: "Erro ao atualizar item",
  DELETE_ERROR: "Erro ao remover item",
  REFRESH_ERROR: "Erro ao atualizar lista",
  LOAD_ERROR: "Erro ao carregar itens",
  LIMIT_REACHED: "Limite máximo atingido",
  NO_ITEMS: "Nenhum item encontrado",
  EMPTY_STATE_DEFAULT: "Comece criando seu primeiro item.",
  EMPTY_STATE_LIMIT: "Limite de itens atingido.",
} as const;

export const LIST_DEFAULTS = {
  ENTITY_NAME: "Item",
  ENTITY_NAME_PLURAL: "Itens",
  MAX_ITEMS: undefined,
  ENABLE_REFRESH: true,
  SHOW_EMPTY_STATE: true,
  ANIMATION_TYPE: "FADE_IN" as keyof typeof LIST_ANIMATIONS,
} as const;
