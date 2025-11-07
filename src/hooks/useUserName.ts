"use client";

import { useState, useEffect } from "react";
import { getUserProfile } from "@/api/usuarios";

/**
 * Detecta o gênero baseado no nome (fallback quando não há informação no perfil)
 */
function detectGenderFromName(name: string): "masculino" | "feminino" {
  if (!name) return "masculino";

  const normalizedName = name.trim().toLowerCase();

  // Nomes comuns femininos que terminam em consoante
  const feminineNames = [
    "maria",
    "ana",
    "julia",
    "sophia",
    "isabella",
    "manuela",
    "laura",
    "valentina",
    "alice",
    "helena",
    "luiza",
    "beatriz",
    "giovanna",
    "lara",
    "mariana",
    "nicole",
    "rafaela",
    "catarina",
    "fernanda",
    "patricia",
  ];

  if (feminineNames.includes(normalizedName)) {
    return "feminino";
  }

  // Terminações comuns de nomes femininos em português
  const feminineEndings = ["a", "ia", "ea", "ara", "ira", "ela", "ana", "ina"];

  // Verifica se termina com alguma dessas terminações (exceto algumas exceções masculinas)
  const masculineExceptions = [
    "josé",
    "henrique",
    "lucas",
    "matheus",
    "gabriel",
    "arthur",
    "rafael",
    "bernardo",
    "heitor",
    "nicolas",
    "davi",
    "joão",
    "guilherme",
    "enzo",
    "gustavo",
    "pedro",
    "murilo",
  ];

  if (masculineExceptions.includes(normalizedName)) {
    return "masculino";
  }

  // Se termina com 'a' e não está nas exceções, provavelmente é feminino
  if (
    normalizedName.endsWith("a") &&
    !normalizedName.endsWith("oa") &&
    !normalizedName.endsWith("ua")
  ) {
    return "feminino";
  }

  // Padrão: masculino
  return "masculino";
}

export function useUserName() {
  const [userName, setUserName] = useState<string | null>(null);
  const [userGender, setUserGender] = useState<"masculino" | "feminino" | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        // Tenta primeiro do localStorage (mais rápido)
        const cachedName = localStorage.getItem("userName");
        const cachedGender = localStorage.getItem("userGender") as
          | "masculino"
          | "feminino"
          | null;
        if (cachedName) {
          setUserName(cachedName);
          setUserGender(cachedGender || detectGenderFromName(cachedName));
          setIsLoading(false);
        }

        // Busca do perfil completo
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (!token) {
          setIsLoading(false);
          return;
        }

        const profile = await getUserProfile(token);
        if (
          profile?.success &&
          "usuario" in profile &&
          profile.usuario?.nomeCompleto
        ) {
          const fullName = profile.usuario.nomeCompleto.trim();
          const firstName = fullName.split(" ")[0] || "";

          if (firstName) {
            setUserName(firstName);

            // Tenta obter gênero do perfil, senão detecta pelo nome
            let gender: "masculino" | "feminino" = "masculino";
            
            // Verifica se o perfil tem o campo genero (pode não estar no tipo TypeScript)
            const profileUsuario = profile.usuario as any;
            if (
              profileUsuario?.genero &&
              typeof profileUsuario.genero === "string"
            ) {
              const genero = profileUsuario.genero.toUpperCase().trim();
              if (genero === "FEMININO") {
                gender = "feminino";
              } else if (genero === "MASCULINO") {
                gender = "masculino";
              } else {
                // Se não for definido ou for outro valor, detecta pelo nome
                gender = detectGenderFromName(firstName);
              }
            } else {
              // Fallback: detecta pelo nome
              gender = detectGenderFromName(firstName);
            }

            setUserGender(gender);

            // Cache no localStorage para uso futuro
            localStorage.setItem("userName", firstName);
            localStorage.setItem("userGender", gender);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar nome do usuário:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserName();
  }, []);

  return { userName, userGender, isLoading };
}
