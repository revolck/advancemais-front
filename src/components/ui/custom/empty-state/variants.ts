import { cva } from "class-variance-authority";

export const emptyStateVariants = cva(
  // "relative isolate flex w-full flex-col rounded-3xl transition-colors duration-200 text-gray-600 p-5 h-full min-h-[calc(100vh-8rem)] mt-5",
  "relative isolate flex w-full flex-col rounded-3xl transition-colors duration-200 text-gray-600 p-5",
  {
    variants: {
      align: {
        center: "items-center text-center",
        start: "items-start text-left",
      },
      size: {
        sm: "gap-5 px-6 py-8",
        md: "gap-6 px-8 py-10",
        lg: "gap-8 px-10 py-14",
      },
      fullHeight: {
        true: "min-h-[320px] justify-center",
        false: "",
      },
    },
    defaultVariants: {
      align: "center",
      size: "md",
      fullHeight: false,
    },
  }
);
