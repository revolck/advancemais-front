"use client";

import { limparCookiesDeSessao } from "@/lib/auth-cookies";
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular obtenção do usuário do token/cookie
    const getUserFromToken = () => {
      try {
        // Aqui você obteria o usuário do token JWT ou cookie
        // Por enquanto, vou simular com dados mockados
        const roleCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("user_role="))
          ?.split("=")[1];

        const mockUser: User = {
          id: "user-123",
          email: "user@example.com",
          name: "Usuário Teste",
          role: roleCookie ?? "ADMIN",
        };

        setUser(mockUser);
      } catch (error) {
        console.error("Erro ao obter usuário:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUserFromToken();
  }, []);

  const logout = async () => {
    // Limpar cookies/tokens
    limparCookiesDeSessao();

    setUser(null);
  };

  return {
    user,
    loading,
    logout,
  };
};
