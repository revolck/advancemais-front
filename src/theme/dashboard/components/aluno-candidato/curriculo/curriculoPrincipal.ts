export type PrincipalChoice = "SIM" | "NAO" | null;

export type CurriculoPrincipalCreationState =
  | "loading"
  | "error"
  | "first"
  | "additional";

export function getCurriculoPrincipalCreationState({
  curriculosCount,
  isError,
}: {
  curriculosCount: number | null;
  isError: boolean;
}): CurriculoPrincipalCreationState {
  if (curriculosCount !== null) {
    return curriculosCount === 0 ? "first" : "additional";
  }

  return isError ? "error" : "loading";
}

export function getEffectivePrincipalChoice({
  isEditMode,
  creationState,
  principalChoice,
}: {
  isEditMode: boolean;
  creationState: CurriculoPrincipalCreationState | null;
  principalChoice: PrincipalChoice;
}): PrincipalChoice {
  if (isEditMode) return principalChoice;
  if (creationState === "first") return "SIM";
  if (creationState === "additional") return principalChoice ?? "NAO";
  return null;
}
