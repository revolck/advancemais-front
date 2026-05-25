export type CurriculoApplicationStatus =
  | "not-applicable"
  | "loading"
  | "available"
  | "missing"
  | "error";

export interface CurriculoApplicationAvailability {
  status: CurriculoApplicationStatus;
  isBlocked: boolean;
  tooltip: string | null;
}

export function getCurriculoApplicationAvailability({
  shouldValidate = true,
  isLoading,
  isError,
  curriculoCount,
}: {
  shouldValidate?: boolean;
  isLoading: boolean;
  isError: boolean;
  curriculoCount: number;
}): CurriculoApplicationAvailability {
  if (!shouldValidate) {
    return { status: "not-applicable", isBlocked: false, tooltip: null };
  }

  if (curriculoCount > 0) {
    return { status: "available", isBlocked: false, tooltip: null };
  }

  if (isLoading) {
    return {
      status: "loading",
      isBlocked: true,
      tooltip: "Aguarde enquanto verificamos seus currículos.",
    };
  }

  if (isError) {
    return {
      status: "error",
      isBlocked: true,
      tooltip: "Não foi possível verificar seus currículos agora. Tente novamente.",
    };
  }

  return {
    status: "missing",
    isBlocked: true,
    tooltip: "Cadastre um currículo para se candidatar a esta vaga.",
  };
}
