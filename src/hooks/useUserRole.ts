"use client";

import { useEffect, useState } from "react";
import { UserRole } from "@/config/roles";

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_role="))
      ?.split("=")[1] as UserRole | undefined;

    if (cookie) {
      setRole(cookie);
    }
  }, []);

  return role;
}
