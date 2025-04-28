import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { generateAuthToken, generateSecureId, hashData, verifyHash, validators } from '../security';
import { logger } from '../logger';

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
  role: 'admin' | 'user';
  type: 'pf' | 'pj'; // Pessoa física ou jurídica
  createdAt: Date;
  updatedAt: Date;
}

// Token de autenticação
export interface AuthToken {
  token: string;
  userId: string;
  expires: Date;
}

// Nomes dos cookies
const AUTH_COOKIE_NAME = 'auth-token';
const USER_COOKIE_NAME = 'user-data';

// Duração do token em dias
const TOKEN_DURATION_DAYS = 7;

// Mock de banco de dados de usuários para exemplo
// Em produção, isso seria substituído por um banco de dados real
const MOCK_USERS: Record<string, User & { password: string }> = {
  '1': {
    id: '1',
    document: '08705420440', // CPF
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    type: 'pf',
    password: hashData('password123'), // NUNCA use senhas como esta em produção!
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  '2': {
    id: '2',
    document: '45543915000181', // CNPJ
    email: 'empresa@example.com',
    companyName: 'Empresa Exemplo LTDA',
    tradeName: 'Empresa Exemplo',
    role: 'user',
    type: 'pj',
    password: hashData('password123'), // NUNCA use senhas como esta em produção!
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
};

// Mock de tokens
const MOCK_TOKENS: Record<string, AuthToken> = {};

/**
 * Login de usuário
 */
export async function loginUser(document: string, password: string): Promise<User> {
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

  // Gera um token de autenticação
  const token = generateAuthToken();
  const expires = new Date();
  expires.setDate(expires.getDate() + TOKEN_DURATION_DAYS);

  // Armazena o token
  MOCK_TOKENS[token] = {
    token,
    userId: user.id,
    expires,
  };

  // Define os cookies
  const cookieStore = cookies();

  // Em Next.js 15, temos que usar .set() diretamente no objeto retornado
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    expires,
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

  cookieStore.set(USER_COOKIE_NAME, JSON.stringify(userData), {
    expires,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  logger.info('Login bem-sucedido', {
    context: 'auth',
    user: user.id,
    data: { document },
  });

  // Retorna o usuário (sem a senha)
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Logout de usuário
 */
export function logoutUser(): void {
  const cookieStore = cookies();

  // Obtém o token atual
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    // Remove o token do "banco de dados"
    delete MOCK_TOKENS[token];

    // Remove os cookies
    cookieStore.delete(AUTH_COOKIE_NAME);
    cookieStore.delete(USER_COOKIE_NAME);

    logger.info('Logout realizado', { context: 'auth' });
  }
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
  roleId: string,
  address: {
    zipCode: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    complement?: string;
  }
): Promise<User> {
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

  // Cria um novo usuário
  const id = generateSecureId(8);
  const now = new Date();
  const newUser: User & { password: string } = {
    id,
    document: cpf,
    email,
    name,
    role: 'user',
    type: 'pf',
    password: hashData(password),
    createdAt: now,
    updatedAt: now,
  };

  // Armazena o usuário
  MOCK_USERS[id] = newUser;

  logger.info('Registro PF bem-sucedido', {
    context: 'auth',
    user: id,
    data: { email, cpf },
  });

  // Retorna o usuário (sem a senha)
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
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
  website?: string,
  address: {
    zipCode: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    complement?: string;
  }
): Promise<User> {
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

  // Cria um novo usuário
  const id = generateSecureId(8);
  const now = new Date();
  const newUser: User & { password: string } = {
    id,
    document: cnpj,
    email,
    companyName,
    tradeName,
    role: 'user',
    type: 'pj',
    password: hashData(password),
    createdAt: now,
    updatedAt: now,
  };

  // Armazena o usuário
  MOCK_USERS[id] = newUser;

  logger.info('Registro PJ bem-sucedido', {
    context: 'auth',
    user: id,
    data: { email, cnpj },
  });

  // Retorna o usuário (sem a senha)
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

/**
 * Obtém o usuário atual a partir do token
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const tokenData = MOCK_TOKENS[token];

  if (!tokenData || new Date() > tokenData.expires) {
    // Token expirado ou inválido
    cookieStore.delete(AUTH_COOKIE_NAME);
    cookieStore.delete(USER_COOKIE_NAME);
    return null;
  }

  const user = MOCK_USERS[tokenData.userId];

  if (!user) {
    // Usuário não encontrado
    cookieStore.delete(AUTH_COOKIE_NAME);
    cookieStore.delete(USER_COOKIE_NAME);
    return null;
  }

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
 * Verifica se o usuário é admin
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();

  if (user.role !== 'admin') {
    redirect('/unauthorized');
  }

  return user;
}
