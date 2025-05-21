/**
 * Serviço para aplicação e validação de máscaras em campos de entrada
 *
 * Segue o padrão Singleton para garantir uma única instância em toda a aplicação
 */

import { MaskType, MaskConfig } from "@/types/components/input";

class MaskService {
  private static instance: MaskService | null = null;

  /**
   * Padrões de máscara predefinidos
   */
  private maskPatterns: Record<MaskType, MaskConfig | null> = {
    cpf: {
      mask: "999.999.999-99",
      alwaysShowMask: false,
    },
    cnpj: {
      mask: "99.999.999/9999-99",
      alwaysShowMask: false,
    },
    phone: {
      mask: "(99) 99999-9999",
      alwaysShowMask: false,
    },
    cep: {
      mask: "99999-999",
      alwaysShowMask: false,
    },
    date: {
      mask: "99/99/9999",
      alwaysShowMask: false,
    },
    money: {
      mask: "R$ 999.999.999,99",
      alwaysShowMask: true,
    },
    creditCard: {
      mask: "9999 9999 9999 9999",
      alwaysShowMask: false,
    },
    time: {
      mask: "99:99",
      alwaysShowMask: false,
    },
    rg: {
      mask: "99.999.999-9",
      alwaysShowMask: false,
    },
    numeric: null, // Usa apenas validação, sem máscara
    alphanumeric: null, // Usa apenas validação, sem máscara
    email: null, // Usa apenas validação, sem máscara
    password: null, // Usa apenas validação, sem máscara
    custom: null, // Configurado externamente via parâmetros
  };

  /**
   * Padrões de caracteres para formatação
   */
  private formatChars: Record<string, RegExp> = {
    "9": /[0-9]/,
    a: /[a-zA-Z]/,
    "*": /[a-zA-Z0-9]/,
  };

  /**
   * Padrões para validação de formatos
   */
  private validationPatterns: Record<string, RegExp> = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    numeric: /^[0-9]+$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    password: /^.{6,}$/, // Mínimo 6 caracteres
    phone: /^\(\d{2}\) \d{5}-\d{4}$/,
    cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    cep: /^\d{5}-\d{3}$/,
  };

  /**
   * Construtor privado para implementar Singleton
   */
  private constructor() {}

  /**
   * Obtém a instância única do serviço
   */
  public static getInstance(): MaskService {
    if (!MaskService.instance) {
      MaskService.instance = new MaskService();
    }
    return MaskService.instance;
  }

  /**
   * Obtém a configuração de máscara para um tipo específico
   */
  public getMaskConfig(
    maskType: MaskType,
    customConfig?: MaskConfig
  ): MaskConfig | null {
    if (maskType === "custom") {
      return customConfig || null;
    }

    return this.maskPatterns[maskType];
  }

  /**
   * Aplica a máscara ao valor informado
   */
  public applyMask(
    value: string,
    maskType: MaskType,
    customConfig?: MaskConfig
  ): string {
    // Tipos sem máscara retornam o valor original
    if (["email", "password", "numeric", "alphanumeric"].includes(maskType)) {
      return value;
    }

    const config = this.getMaskConfig(maskType, customConfig);
    if (!config || !config.mask) return value;

    let result = "";
    let valueIndex = 0;
    const formatChars = config.formatChars || this.formatChars;

    // Aplica a máscara caractere a caractere
    for (let i = 0; i < config.mask.length; i++) {
      const maskChar = config.mask[i];

      // Se for um caractere especial de formatação
      if (formatChars[maskChar]) {
        if (valueIndex < value.length) {
          const valueChar = value[valueIndex];

          // Se o caractere do valor corresponde ao padrão da máscara
          if (formatChars[maskChar].test(valueChar)) {
            result += valueChar;
            valueIndex++;
          } else {
            // Se não corresponder, avança para o próximo caractere do valor
            valueIndex++;
            i--; // Mantém a posição na máscara
          }
        } else {
          // Acabaram os caracteres do valor
          if (config.alwaysShowMask) {
            result += config.maskChar || "_";
          } else {
            break;
          }
        }
      } else {
        // Caractere fixo da máscara
        result += maskChar;
      }
    }

    return result;
  }

  /**
   * Remove a máscara do valor
   */
  public removeMask(value: string, maskType: MaskType): string {
    switch (maskType) {
      case "cpf":
      case "cnpj":
      case "phone":
      case "cep":
      case "date":
      case "creditCard":
      case "time":
      case "rg":
        return value.replace(/[^\d]/g, "");
      case "money":
        return value.replace(/[^\d,]/g, "").replace(",", ".");
      default:
        return value;
    }
  }

  /**
   * Valida o valor com base no tipo de máscara
   */
  public validate(value: string, maskType: MaskType): boolean {
    if (!value) return true; // Campo vazio é considerado válido

    switch (maskType) {
      case "email":
        return this.validationPatterns.email.test(value);
      case "numeric":
        return this.validationPatterns.numeric.test(value);
      case "alphanumeric":
        return this.validationPatterns.alphanumeric.test(value);
      case "password":
        return this.validationPatterns.password.test(value);
      case "phone":
        return value.length === 0 || this.validationPatterns.phone.test(value);
      case "cpf":
        // Validação básica de formato
        if (!this.validationPatterns.cpf.test(value)) return false;

        // Validação completa de CPF
        const cpf = value.replace(/[^\d]/g, "");
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

        // Algoritmo de validação de CPF
        let sum = 0;
        let remainder;

        for (let i = 1; i <= 9; i++) {
          sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }

        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) {
          sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }

        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;

        return true;

      case "cnpj":
        return this.validationPatterns.cnpj.test(value);

      case "cep":
        return this.validationPatterns.cep.test(value);

      default:
        return true;
    }
  }

  /**
   * Processa o valor de entrada aplicando a máscara ou validação apropriada
   */
  public processInput(
    value: string,
    maskType: MaskType,
    customConfig?: MaskConfig
  ): string {
    if (["email", "password"].includes(maskType)) {
      return value;
    }

    if (maskType === "numeric") {
      return value.replace(/[^\d]/g, "");
    }

    if (maskType === "alphanumeric") {
      return value.replace(/[^a-zA-Z0-9]/g, "");
    }

    return this.applyMask(value, maskType, customConfig);
  }
}

export default MaskService;
