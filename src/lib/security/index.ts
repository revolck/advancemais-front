import { randomBytes, createHash } from 'crypto';

/**
 * Utilitários de segurança para a aplicação
 */

/**
 * Sanitiza strings para prevenir XSS
 */
export function sanitizeString(input: string): string {
  if (!input) return '';

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

/**
 * Gera um ID único seguro
 */
export function generateSecureId(length = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Gera um hash para senhas ou outros dados sensíveis
 * (Na produção, use bcrypt ou Argon2)
 */
export function hashData(data: string, salt?: string): string {
  const useSalt = salt || randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(data + useSalt)
    .digest('hex');

  return `${hash}:${useSalt}`;
}

/**
 * Verifica se um hash corresponde aos dados originais
 */
export function verifyHash(data: string, hashedData: string): boolean {
  const [hash, salt] = hashedData.split(':');

  if (!hash || !salt) return false;

  const compareHash = createHash('sha256')
    .update(data + salt)
    .digest('hex');

  return hash === compareHash;
}

/**
 * Gera um token seguro para autenticação
 */
export function generateAuthToken(): string {
  return randomBytes(48).toString('hex');
}

/**
 * Funções para validação de dados
 */
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password: string): boolean => {
    // Verifica se a senha tem pelo menos 8 caracteres, uma letra maiúscula,
    // uma letra minúscula e um número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  },

  cpf: (cpf: string): boolean => {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais (caso inválido)
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Verifica o primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let mod = sum % 11;
    let digit1 = mod < 2 ? 0 : 11 - mod;

    if (parseInt(cpf.charAt(9)) !== digit1) return false;

    // Verifica o segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    mod = sum % 11;
    let digit2 = mod < 2 ? 0 : 11 - mod;

    return parseInt(cpf.charAt(10)) === digit2;
  },

  cnpj: (cnpj: string): boolean => {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/[^\d]/g, '');

    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) return false;

    // Verifica se todos os dígitos são iguais (caso inválido)
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    // Verifica o primeiro dígito verificador
    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    const digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    // Verifica o segundo dígito verificador
    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    return result === parseInt(digits.charAt(1));
  },

  username: (username: string): boolean => {
    // Apenas letras, números e underscores, 3-20 caracteres
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  },
};

/**
 * Limita o número de tentativas de uma operação
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; timestamp: number }> = new Map();
  private readonly maxAttempts: number;
  private readonly timeWindow: number; // em milissegundos

  constructor(maxAttempts = 5, timeWindowMinutes = 15) {
    this.maxAttempts = maxAttempts;
    this.timeWindow = timeWindowMinutes * 60 * 1000;
  }

  /**
   * Verifica se a chave (geralmente IP ou userID) atingiu o limite
   */
  hasReachedLimit(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      return false;
    }

    // Se o tempo expirou, reseta a contagem
    if (now - record.timestamp > this.timeWindow) {
      this.attempts.set(key, { count: 1, timestamp: now });
      return false;
    }

    return record.count >= this.maxAttempts;
  }

  /**
   * Incrementa a contagem de tentativas
   */
  increment(key: string): void {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      this.attempts.set(key, { count: 1, timestamp: now });
      return;
    }

    // Se o tempo expirou, reseta a contagem
    if (now - record.timestamp > this.timeWindow) {
      this.attempts.set(key, { count: 1, timestamp: now });
      return;
    }

    // Incrementa a contagem
    this.attempts.set(key, {
      count: record.count + 1,
      timestamp: record.timestamp,
    });
  }

  /**
   * Reseta a contagem de tentativas para uma chave
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }
}
