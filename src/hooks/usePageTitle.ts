import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${title} | Advance+`;

    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}
