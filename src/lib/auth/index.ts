import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { generateSecureId, hashData, verifyHash, verifyToken } from '../security';
import { logger } from '../logger';

// Definição dos tipos de usuário
export type UserType = 'PESSOA_FISICA' | 'PESSOA_JURIDICA';

// Definição dos papéis de usuário
export type UserRole =
  | 'Administrador'
  | 'Gerente'
  | 'Financeiro'
  | 'Professor'
  | 'Aluno'
  | 'Empresa'
  | 'Pedagógico'
  | 'Recrutadores'
  | 'Recursos Humanos';

/**
 * Estrutura básica de um usuário
 */
export interface User {
  id: string;
  document: string; // CPF ou CNPJ
  email: string;
  name?: string;
  companyName?: string; // Para pessoa jurídica
  tradeName?: string; // Para pessoa jurídica
  role: UserRole;
  type: UserType;
  createdAt: Date;
  updatedAt: Date;
}

// Nomes dos cookies
const ACCESS_TOKEN_COOKIE = 'access-token';
const REFRESH_TOKEN_COOKIE = 'refresh-token';
const USER_COOKIE_NAME = 'user-data';

// Duração dos tokens
const ACCESS_TOKEN_EXPIRY_MINUTES = 60; // 1 hora
const REFRESH_TOKEN_EXPIRY_DAYS = 7; // 7 dias

// Mock de banco de dados de usuários para exemplo
const MOCK_USERS: Record<string, User & { password: string }> = {
  '73667a40-4d1d-40ad-a4e6-2b0a0b4ddc6f': {
    id: '73667a40-4d1d-40ad-a4e6-2b0a0b4ddc6f',
    document: '08705420440', // CPF
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'Administrador',
    type: 'PESSOA_FISICA',
    password: hashData('password123'), // NUNCA use senhas como esta em produção!
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  '83667a40-5e2e-50be-b5f7-3c1b1c5eef7g': {
    id: '83667a40-5e2e-50be-b5f7-3c1b1c5eef7g',
    document: '45543915000181', // CNPJ
    email: 'empresa@example.com',
    companyName: 'Empresa Exemplo LTDA',
    tradeName: 'Empresa Exemplo',
    role: 'Empresa',
    type: 'PESSOA_JURIDICA',
    password: hashData('password123'), // NUNCA use senhas como esta em produção!
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
};

// Helper functions para lidar com cookies no Next.js 15
function setCookie(name: string, value: string, options: any): void {
  // Garantir que usamos a API correta para o Next.js 15
  const cookieJar = cookies();
  (cookieJar as any).set(name, value, options);
}

function getCookie(name: string): string | undefined {
  const cookieJar = cookies();
  return (cookieJar as any).get(name)?.value;
}

function deleteCookie(name: string): void {
  const cookieJar = cookies();
  (cookieJar as any).delete(name);
}

/**
 * Login de usuário
 */
export async function loginUser(
  document: string,
  password: string
): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  logger.info('Tentativa de login', { context: 'auth', data: { document } });

  // Encontra o usuário pelo documento (CPF ou CNPJ)
  const user = Object.values(MOCK_USERS).find(u => u.document === document);

  if (!user) {
    logger.warn('Tentativa de login com documento não cadastrado', {
      context: 'auth',
      data: { document },
    });
    throw new Error('Credenciais inválidas');
  }

  // Verifica a senha
  if (!verifyHash(password, user.password)) {
    logger.warn('Tentativa de login com senha incorreta', {
      context: 'auth',
      data: { document },
    });
    throw new Error('Credenciais inválidas');
  }

  // Gera tokens JWT (simulados para desenvolvimento)
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Calcula expiração dos tokens
  const accessTokenExpiry = new Date();
  accessTokenExpiry.setMinutes(accessTokenExpiry.getMinutes() + ACCESS_TOKEN_EXPIRY_MINUTES);

  const refreshTokenExpiry = new Date();
  refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  // Define os cookies usando os helpers
  setCookie(ACCESS_TOKEN_COOKIE, accessToken, {
    expires: accessTokenExpiry,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });

  setCookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    expires: refreshTokenExpiry,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });

  // Cookie com dados básicos do usuário (não-sensíveis)
  const userData = {
    id: user.id,
    document: user.document,
    name: user.name || user.companyName,
    role: user.role,
    type: user.type,
  };

  setCookie(USER_COOKIE_NAME, JSON.stringify(userData), {
    expires: refreshTokenExpiry,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  logger.info('Login bem-sucedido', {
    context: 'auth',
    user: user.id,
    data: { document },
  });

  // Retorna o usuário (sem a senha) e tokens
  const { password: _, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
}

/**
 * Logout de usuário
 */
export function logoutUser(): void {
  // Remover todos os cookies usando os helpers
  deleteCookie(ACCESS_TOKEN_COOKIE);
  deleteCookie(REFRESH_TOKEN_COOKIE);
  deleteCookie(USER_COOKIE_NAME);

  logger.info('Logout realizado', { context: 'auth' });
}

/**
 * Registra um novo usuário (pessoa física)
 */
export async function registerUserPF(
  name: string,
  email: string,
  password: string,
  cpf: string,
  birthDate: string,
  gender: string,
  phone: string,
  role: string,
  address: {
    zipCode: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    complement?: string;
  }
): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  logger.info('Tentativa de registro de pessoa física', {
    context: 'auth',
    data: { email, cpf },
  });

  // Verifica se o CPF já está em uso
  if (Object.values(MOCK_USERS).some(u => u.document === cpf)) {
    logger.warn('Tentativa de registro com CPF já cadastrado', {
      context: 'auth',
      data: { cpf },
    });
    throw new Error('CPF já cadastrado');
  }

  // Verifica se o email já está em uso
  if (Object.values(MOCK_USERS).some(u => u.email === email)) {
    logger.warn('Tentativa de registro com email já cadastrado', {
      context: 'auth',
      data: { email },
    });
    throw new Error('Email já cadastrado');
  }

  // Usando os parâmetros (para demonstrar que são utilizados)
  logger.debug('Processando dados do registro', {
    data: {
      nome: name,
      dataNascimento: birthDate,
      genero: gender,
      telefone: phone,
      endereco: {
        cep: address.zipCode,
        logradouro: address.street,
        numero: address.number,
        bairro: address.neighborhood,
        cidade: address.city,
        estado: address.state,
        complemento: address.complement,
      },
    },
  });

  // Cria um novo usuário
  const id = generateSecureId();
  const now = new Date();
  const userRole = validateUserRole(role);

  const newUser: User & { password: string } = {
    id,
    document: cpf,
    email,
    name,
    role: userRole,
    type: 'PESSOA_FISICA',
    password: hashData(password),
    createdAt: now,
    updatedAt: now,
  };

  // Armazena o usuário
  MOCK_USERS[id] = newUser;

  // Gera tokens JWT
  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  logger.info('Registro PF bem-sucedido', {
    context: 'auth',
    user: id,
    data: { email, cpf },
  });

  // Retorna o usuário (sem a senha) e tokens
  const { password: _, ...userWithoutPassword } = newUser;
  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
}

/**
 * Registra um novo usuário (pessoa jurídica)
 */
export async function registerUserPJ(
  companyName: string,
  tradeName: string,
  legalName: string,
  cnpj: string,
  email: string,
  password: string,
  phone: string,
  role: string,
  website?: string,
  address?: {
    zipCode: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    complement?: string;
  }
): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  logger.info('Tentativa de registro de pessoa jurídica', {
    context: 'auth',
    data: { email, cnpj },
  });

  // Verifica se o CNPJ já está em uso
  if (Object.values(MOCK_USERS).some(u => u.document === cnpj)) {
    logger.warn('Tentativa de registro com CNPJ já cadastrado', {
      context: 'auth',
      data: { cnpj },
    });
    throw new Error('CNPJ já cadastrado');
  }

  // Verifica se o email já está em uso
  if (Object.values(MOCK_USERS).some(u => u.email === email)) {
    logger.warn('Tentativa de registro com email já cadastrado', {
      context: 'auth',
      data: { email },
    });
    throw new Error('Email já cadastrado');
  }

  // Usando os parâmetros (para demonstrar que são utilizados)
  logger.debug('Processando dados da empresa', {
    data: {
      razaoSocial: companyName,
      nomeFantasia: tradeName,
      responsavelLegal: legalName,
      telefone: phone,
      site: website || 'Não informado',
      endereco: address
        ? {
            cep: address.zipCode,
            rua: address.street,
            numero: address.number,
            bairro: address.neighborhood,
            cidade: address.city,
            estado: address.state,
          }
        : 'Não informado',
    },
  });

  // Cria um novo usuário
  const id = generateSecureId();
  const now = new Date();
  const userRole = validateUserRole(role);

  const newUser: User & { password: string } = {
    id,
    document: cnpj,
    email,
    companyName,
    tradeName,
    role: userRole,
    type: 'PESSOA_JURIDICA',
    password: hashData(password),
    createdAt: now,
    updatedAt: now,
  };

  // Armazena o usuário
  MOCK_USERS[id] = newUser;

  // Gera tokens JWT
  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  logger.info('Registro PJ bem-sucedido', {
    context: 'auth',
    user: id,
    data: { email, cnpj },
  });

  // Retorna o usuário (sem a senha) e tokens
  const { password: _, ...userWithoutPassword } = newUser;
  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
}

/**
 * Obtém o usuário atual a partir do token
 */
export async function getCurrentUser(): Promise<User | null> {
  const accessToken = getCookie(ACCESS_TOKEN_COOKIE);

  if (!accessToken) {
    const refreshToken = getCookie(REFRESH_TOKEN_COOKIE);
    if (refreshToken) {
      // Tentativa de atualizar o token usando o refresh token
      return refreshUserSession(refreshToken);
    }
    return null;
  }

  // Verifica o token
  const payload = verifyToken(accessToken);
  if (!payload) {
    // Token inválido, tenta usar o refresh token
    const refreshToken = getCookie(REFRESH_TOKEN_COOKIE);
    if (refreshToken) {
      return refreshUserSession(refreshToken);
    }
    // Se não conseguir atualizar, retorna null
    return null;
  }

  const userId = payload.sub;
  const user = MOCK_USERS[userId];

  if (!user) {
    // Usuário não encontrado
    deleteCookie(ACCESS_TOKEN_COOKIE);
    deleteCookie(REFRESH_TOKEN_COOKIE);
    deleteCookie(USER_COOKIE_NAME);
    return null;
  }

  // Retorna o usuário (sem a senha)
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Atualiza a sessão do usuário usando o refresh token
 */
async function refreshUserSession(refreshToken: string): Promise<User | null> {
  // Verifica o refresh token
  const payload = verifyToken(refreshToken);
  if (!payload || payload.type !== 'refresh') {
    // Token inválido ou não é um refresh token
    deleteCookie(ACCESS_TOKEN_COOKIE);
    deleteCookie(REFRESH_TOKEN_COOKIE);
    deleteCookie(USER_COOKIE_NAME);
    return null;
  }

  const userId = payload.sub;
  const user = MOCK_USERS[userId];

  if (!user) {
    // Usuário não encontrado
    deleteCookie(ACCESS_TOKEN_COOKIE);
    deleteCookie(REFRESH_TOKEN_COOKIE);
    deleteCookie(USER_COOKIE_NAME);
    return null;
  }

  // Gera novo access token
  const newAccessToken = generateAccessToken(user);

  // Calcula expiração do token
  const accessTokenExpiry = new Date();
  accessTokenExpiry.setMinutes(accessTokenExpiry.getMinutes() + ACCESS_TOKEN_EXPIRY_MINUTES);

  // Atualiza o cookie
  setCookie(ACCESS_TOKEN_COOKIE, newAccessToken, {
    expires: accessTokenExpiry,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });

  // Retorna o usuário (sem a senha)
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Verifica se o usuário está autenticado
 * Útil para proteção de rotas no lado do servidor
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

/**
 * Verifica se o usuário tem o papel especificado
 */
export async function requireRole(roles: UserRole | UserRole[]): Promise<User> {
  const user = await requireAuth();

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!allowedRoles.includes(user.role)) {
    redirect('/unauthorized');
  }

  return user;
}

/**
 * Gera um token de acesso simulado
 * Em produção, use uma biblioteca como jsonwebtoken
 */
function generateAccessToken(user: User): string {
  // Este é apenas um simulador para desenvolvimento
  // Em produção, use uma biblioteca JWT adequada

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const exp = now + ACCESS_TOKEN_EXPIRY_MINUTES * 60;

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    type: 'access',
    jti: generateSecureId(12),
    iat: now,
    exp: exp,
    iss: 'api-projeto',
    aud: 'api-clients',
  };

  const headerBase64 = Buffer.from(JSON.stringify(header)).toString('base64').replace(/=/g, '');
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/=/g, '');

  // Em produção, use uma biblioteca adequada para assinar corretamente
  const signature = 'SIMULATED_SIGNATURE';

  return `${headerBase64}.${payloadBase64}.${signature}`;
}

/**
 * Gera um token de atualização simulado
 * Em produção, use uma biblioteca como jsonwebtoken
 */
function generateRefreshToken(user: User): string {
  // Este é apenas um simulador para desenvolvimento
  // Em produção, use uma biblioteca JWT adequada

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const exp = now + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60;

  const payload = {
    type: 'refresh',
    jti: generateSecureId(12),
    iat: now,
    exp: exp,
    sub: user.id,
    iss: 'api-projeto',
    aud: 'api-clients',
  };

  const headerBase64 = Buffer.from(JSON.stringify(header)).toString('base64').replace(/=/g, '');
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/=/g, '');

  // Em produção, use uma biblioteca adequada para assinar corretamente
  const signature = 'SIMULATED_SIGNATURE';

  return `${headerBase64}.${payloadBase64}.${signature}`;
}

/**
 * Valida e converte um papel de usuário
 */
function validateUserRole(role: string): UserRole {
  const validRoles: UserRole[] = [
    'Administrador',
    'Gerente',
    'Financeiro',
    'Professor',
    'Aluno',
    'Empresa',
    'Pedagógico',
    'Recrutadores',
    'Recursos Humanos',
  ];

  const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

  if (validRoles.includes(normalizedRole as UserRole)) {
    return normalizedRole as UserRole;
  }

  // Retorna um papel padrão se o papel fornecido for inválido
  return 'Aluno';
}
