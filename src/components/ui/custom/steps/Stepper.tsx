"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type StepperOrientation = "horizontal" | "vertical";
export type StepperVariant = "card" | "minimal";
export type StepState = "active" | "completed" | "inactive" | "loading";

export interface StepIndicators {
  active?: React.ReactNode;
  completed?: React.ReactNode;
  inactive?: React.ReactNode;
  loading?: React.ReactNode;
}

interface StepperContextValue {
  activeStep: number;
  orientation: StepperOrientation;
  variant: StepperVariant;
  indicators: StepIndicators;
  triggerNodes: HTMLButtonElement[];
  registerTrigger: (node: HTMLButtonElement) => void;
  unregisterTrigger: (node: HTMLButtonElement) => void;
  setActiveStep: (step: number) => void;
  focusNext: (currentIndex: number) => void;
  focusPrev: (currentIndex: number) => void;
  focusFirst: () => void;
  focusLast: () => void;
}

interface StepItemContextValue {
  step: number;
  state: StepState;
  isDisabled: boolean;
  isLoading: boolean;
}

const StepperContext = React.createContext<StepperContextValue | undefined>(
  undefined
);
const StepItemContext = React.createContext<StepItemContextValue | undefined>(
  undefined
);

function useStepper() {
  const context = React.useContext(StepperContext);
  if (!context) {
    throw new Error("useStepper must be used within a Stepper");
  }
  return context;
}

function useStepItem() {
  const context = React.useContext(StepItemContext);
  if (!context) {
    throw new Error("useStepItem must be used within a StepperItem");
  }
  return context;
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  orientation?: StepperOrientation;
  variant?: StepperVariant;
  indicators?: StepIndicators;
}

export function Stepper({
  defaultValue = 1,
  value,
  onValueChange,
  orientation = "horizontal",
  variant = "card",
  indicators = {},
  className,
  children,
  ...props
}: StepperProps) {
  const isControlled = typeof value === "number";
  const [internalStep, setInternalStep] = React.useState(defaultValue);
  const [triggerNodes, setTriggerNodes] = React.useState<HTMLButtonElement[]>(
    []
  );

  const activeStep = isControlled ? (value as number) : internalStep;

  const setActiveStep = React.useCallback(
    (step: number) => {
      if (!isControlled) {
        setInternalStep(step);
      }
      onValueChange?.(step);
    },
    [isControlled, onValueChange]
  );

  const registerTrigger = React.useCallback((node: HTMLButtonElement) => {
    setTriggerNodes((prev) => {
      if (!node || prev.includes(node)) return prev;
      return [...prev, node];
    });
  }, []);

  const unregisterTrigger = React.useCallback((node: HTMLButtonElement) => {
    setTriggerNodes((prev) => prev.filter((item) => item !== node));
  }, []);

  const focusTriggerAt = React.useCallback(
    (index: number) => {
      const target = triggerNodes[index];
      if (target) target.focus();
    },
    [triggerNodes]
  );

  const focusNext = React.useCallback(
    (currentIndex: number) => {
      if (!triggerNodes.length) return;
      focusTriggerAt((currentIndex + 1) % triggerNodes.length);
    },
    [focusTriggerAt, triggerNodes]
  );

  const focusPrev = React.useCallback(
    (currentIndex: number) => {
      if (!triggerNodes.length) return;
      focusTriggerAt(
        (currentIndex - 1 + triggerNodes.length) % triggerNodes.length
      );
    },
    [focusTriggerAt, triggerNodes]
  );

  const focusFirst = React.useCallback(
    () => focusTriggerAt(0),
    [focusTriggerAt]
  );
  const focusLast = React.useCallback(() => {
    if (!triggerNodes.length) return;
    focusTriggerAt(triggerNodes.length - 1);
  }, [focusTriggerAt, triggerNodes]);

  const contextValue = React.useMemo<StepperContextValue>(
    () => ({
      activeStep,
      orientation,
      variant,
      indicators,
      triggerNodes,
      registerTrigger,
      unregisterTrigger,
      setActiveStep,
      focusNext,
      focusPrev,
      focusFirst,
      focusLast,
    }),
    [
      activeStep,
      orientation,
      variant,
      indicators,
      triggerNodes,
      registerTrigger,
      unregisterTrigger,
      setActiveStep,
      focusNext,
      focusPrev,
      focusFirst,
      focusLast,
    ]
  );

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        role="tablist"
        aria-orientation={orientation}
        data-orientation={orientation}
        data-slot="stepper"
        className={cn("w-full", className)}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}

Stepper.displayName = "Stepper";

export interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
  completed?: boolean;
  disabled?: boolean;
  loading?: boolean;
  isLast?: boolean;
}

export function StepperItem({
  step,
  completed = false,
  disabled = false,
  loading = false,
  className,
  children,
  isLast = false,
  ...props
}: StepperItemProps) {
  const { activeStep, orientation } = useStepper();

  const baseState: StepState =
    completed || step < activeStep
      ? "completed"
      : step === activeStep
      ? "active"
      : "inactive";
  const state: StepState =
    loading && step === activeStep ? "loading" : baseState;

  const showVerticalTrack = orientation === "vertical" && !isLast;

  return (
    <StepItemContext.Provider
      value={{ step, state, isDisabled: disabled, isLoading: loading }}
    >
      <div
        data-slot="stepper-item"
        data-state={state}
        className={cn(
          "group/step relative flex min-w-0",
          orientation === "horizontal"
            ? "flex-1 flex-row items-center gap-2 md:gap-3"
            : "w-full flex-col items-center gap-4",
          className
        )}
        {...props}
      >
        {children}
        {showVerticalTrack && (
          <span
            aria-hidden="true"
            className="pointer-events-none mt-2 h-12 w-px bg-slate-900"
          />
        )}
      </div>
    </StepItemContext.Provider>
  );
}

StepperItem.displayName = "StepperItem";

export interface StepperTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function StepperTrigger({
  asChild = false,
  className,
  children,
  ...props
}: StepperTriggerProps) {
  const { step, state, isDisabled, isLoading } = useStepItem();
  const {
    activeStep,
    setActiveStep,
    registerTrigger,
    unregisterTrigger,
    triggerNodes,
    focusNext,
    focusPrev,
    focusFirst,
    focusLast,
    orientation,
    variant,
  } = useStepper();

  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const node = buttonRef.current;
    if (!node) return;
    registerTrigger(node);
    return () => unregisterTrigger(node);
  }, [registerTrigger, unregisterTrigger]);

  const isSelected = activeStep === step;
  const id = `stepper-trigger-${step}`;
  const panelId = `stepper-panel-${step}`;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const index = triggerNodes.findIndex((node) => node === buttonRef.current);
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusNext(index);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusPrev(index);
        break;
      case "Home":
        event.preventDefault();
        focusFirst();
        break;
      case "End":
        event.preventDefault();
        focusLast();
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        setActiveStep(step);
        break;
      default:
        break;
    }
  };

  if (asChild) {
    return (
      <span
        data-slot="stepper-trigger"
        data-state={state}
        className={className}
        aria-selected={isSelected}
        aria-controls={panelId}
        id={id}
      >
        {children}
      </span>
    );
  }

  return (
    <button
      ref={buttonRef}
      role="tab"
      id={id}
      aria-selected={isSelected}
      aria-controls={panelId}
      tabIndex={isSelected ? 0 : -1}
      data-slot="stepper-trigger"
      data-state={state}
      data-loading={isLoading}
      disabled={isDisabled}
      onClick={() => setActiveStep(step)}
      onKeyDown={handleKeyDown}
      className={cn(
        // Minimal variant → compact, inline look
        variant === "minimal"
          ? cn(
              "group/trigger relative flex min-w-0 items-center gap-2 rounded-md px-1 py-1 text-left transition-colors",
              orientation === "vertical" && "w-full",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
            )
          : cn(
              // Card variant (previous default styles)
              "group/trigger relative flex w-full min-w-0 max-w-[240px] flex-col items-center gap-3 rounded-xl border border-transparent bg-white px-4 py-3 text-center transition-all",
              orientation === "vertical" && "items-start text-left",
              "hover:border-blue-500/40 hover:bg-white",
              state === "active" &&
                "border-blue-500/80 bg-white shadow-[0_16px_40px_rgba(37,99,235,0.18)]",
              state === "completed" && "border-blue-500/60",
              state === "inactive" && "opacity-85"
            ),
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

StepperTrigger.displayName = "StepperTrigger";

export function StepperIndicator({
  children,
  className,
}: React.ComponentProps<"div">) {
  const { state, isLoading } = useStepItem();
  const { indicators } = useStepper();

  const resolvedIndicator = React.useMemo(() => {
    if (isLoading && indicators.loading) return indicators.loading;
    if (state === "completed" && indicators.completed)
      return indicators.completed;
    if (state === "active" && indicators.active) return indicators.active;
    if (state === "inactive" && indicators.inactive) return indicators.inactive;
    return null;
  }, [indicators, state, isLoading]);

  return (
    <div
      data-slot="stepper-indicator"
      data-state={state}
      className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-all",
        // Inactive
        state === "inactive" && "border-gray-200 bg-gray-100 text-gray-500",
        // Active + Completed
        (state === "completed" || state === "active") &&
          "border-[var(--primary-color)] bg-[var(--primary-color)] text-white",
        // Loading
        state === "loading" &&
          "border-[var(--primary-color)] bg-white text-[var(--primary-color)]",
        className
      )}
    >
      {resolvedIndicator ?? children}
    </div>
  );
}

export function StepperSeparator({
  className,
  hidden,
}: React.ComponentProps<"div"> & { hidden?: boolean }) {
  const { state } = useStepItem();
  if (hidden) return null;
  return (
    <div
      aria-hidden
      data-complete={state === "completed" ? "true" : undefined}
      className={cn(
        "mx-2 md:mx-1 h-0.5 w-full flex-1 bg-gray-200 data-[complete=true]:bg-[var(--primary-color)]",
        className
      )}
    />
  );
}

StepperSeparator.displayName = "StepperSeparator";

export function StepperTitle({
  children,
  className,
}: React.ComponentProps<"p">) {
  const { state } = useStepItem();
  return (
    <p
      data-slot="stepper-title"
      data-state={state}
      className={cn(
        "!text-sm !leading-tight !font-medium !text-gray-800 !mb-0 pt-3",
        state === "active" && "text-gray-800",
        state === "completed" && "text-gray-800",
        className
      )}
    >
      {children}
    </p>
  );
}

StepperTitle.displayName = "StepperTitle";

export function StepperDescription({
  children,
  className,
}: React.ComponentProps<"p">) {
  const { state } = useStepItem();
  return (
    <p
      data-slot="stepper-description"
      data-state={state}
      className={cn(
        "!text-xs mt-0.5 !text-muted-foreground",
        state === "active" && "!text-slate-500",
        className
      )}
    >
      {children}
    </p>
  );
}

StepperDescription.displayName = "StepperDescription";

export function StepperNav({
  children,
  className,
}: React.ComponentProps<"nav">) {
  const { orientation, variant } = useStepper();
  return (
    <nav
      data-slot="stepper-nav"
      data-orientation={orientation}
      className={cn(
        variant === "minimal"
          ? cn(
              orientation === "horizontal"
                ? "flex w-full flex-row items-center gap-2 md:gap-3"
                : "flex w-full flex-col gap-4"
            )
          : "flex w-full flex-col gap-6 md:flex-row md:items-start md:justify-between",
        className
      )}
    >
      {children}
    </nav>
  );
}

StepperNav.displayName = "StepperNav";

export function StepperPanel({
  children,
  className,
}: React.ComponentProps<"div">) {
  return (
    <div data-slot="stepper-panel" className={cn("w-full", className)}>
      {children}
    </div>
  );
}

StepperPanel.displayName = "StepperPanel";

export interface StepperContentProps extends React.ComponentProps<"div"> {
  value: number;
  forceMount?: boolean;
}

export function StepperContent({
  value,
  forceMount = false,
  className,
  children,
  ...props
}: StepperContentProps) {
  const { activeStep } = useStepper();
  const isActive = activeStep === value;

  if (!forceMount && !isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`stepper-panel-${value}`}
      aria-labelledby={`stepper-trigger-${value}`}
      data-slot="stepper-content"
      hidden={!isActive && !forceMount}
      className={cn(isActive ? "block" : "hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
}

StepperContent.displayName = "StepperContent";

export { useStepper, useStepItem };
