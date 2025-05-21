import { MaskType, MaskConfig } from "./types";

/**
 * Classe singleton para gerenciar máscaras e validações de campos de entrada
 */
class InputMaskService {
  private static instance: InputMaskService;

  // Padrões de máscara predefinidos
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
    numeric: null, // Usará apenas validação
    alphanumeric: null, // Usará apenas validação
    email: null, // Usará apenas validação
    password: null, // Usará apenas validação
    custom: null, // Será configurado externamente
  };

  // Padrões de caracteres de formatação
  private formatChars: Record<string, RegExp> = {
    "9": /[0-9]/,
    a: /[a-zA-Z]/,
    "*": /[a-zA-Z0-9]/,
  };

  // Padrões para validação
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

  // Construtor privado (padrão Singleton)
  private constructor() {}

  /**
   * Obtém a instância singleton do serviço
   */
  public static getInstance(): InputMaskService {
    if (!InputMaskService.instance) {
      InputMaskService.instance = new InputMaskService();
    }
    return InputMaskService.instance;
  }

  /**
   * Obtém a configuração de máscara para um tipo específico
   */
  public getMaskConfig(
    maskType: MaskType,
    customConfig?: MaskConfig
  ): MaskConfig | null {
    // Para máscara do tipo 'custom', usamos a configuração personalizada ou null
    if (maskType === "custom") {
      return customConfig || null;
    }

    // Utiliza a configuração predefinida
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
    // Para tipos sem máscara, retorna o valor original
    if (["email", "password", "numeric", "alphanumeric"].includes(maskType)) {
      return value;
    }

    const config = this.getMaskConfig(maskType, customConfig);
    if (!config || !config.mask) return value;

    let result = "";
    let valueIndex = 0;
    const formatChars = config.formatChars || this.formatChars;

    // Percorre a máscara e aplica os caracteres do valor
    for (let i = 0; i < config.mask.length; i++) {
      const maskChar = config.mask[i];

      // Se o caractere da máscara é um caractere especial de formatação
      if (formatChars[maskChar]) {
        // Se ainda existem caracteres no valor
        if (valueIndex < value.length) {
          const valueChar = value[valueIndex];

          // Se o caractere do valor corresponde ao padrão da máscara
          if (formatChars[maskChar].test(valueChar)) {
            result += valueChar;
            valueIndex++;
          } else {
            // Se não corresponder, tenta o próximo caractere do valor
            valueIndex++;
            i--; // Mantém a posição na máscara
          }
        } else {
          // Não há mais caracteres no valor, usa o placeholder ou para de processar
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
    if (!value) return true; // Campo vazio é considerado válido (validação de required é feita externamente)

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
        // Valida se está no formato correto após máscara aplicada
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
        // Validação básica de formato
        return this.validationPatterns.cnpj.test(value);

      case "cep":
        // Validação básica de formato
        return this.validationPatterns.cep.test(value);

      default:
        return true;
    }
  }

  /**
   * Processa o valor de entrada com base no tipo de máscara
   */
  public processInput(
    value: string,
    maskType: MaskType,
    customConfig?: MaskConfig
  ): string {
    // Para tipos sem máscara, aplicamos apenas validações específicas
    if (["email", "password"].includes(maskType)) {
      return value;
    }

    // Para tipos numéricos, mantemos apenas dígitos
    if (maskType === "numeric") {
      return value.replace(/[^\d]/g, "");
    }

    // Para alfanuméricos, mantemos letras e números
    if (maskType === "alphanumeric") {
      return value.replace(/[^a-zA-Z0-9]/g, "");
    }

    // Para outros tipos, aplicamos a máscara
    return this.applyMask(value, maskType, customConfig);
  }
}

export default InputMaskService;
