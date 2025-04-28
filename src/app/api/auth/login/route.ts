import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';
import { apiHandler, BadRequestError } from '@/lib/api';
import { logger } from '@/lib/logger'; // Usando logger em vez de apiLogger

export const POST = apiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { document, password, remember } = body;

  // Validação básica
  if (!document || !password) {
    logger.warn('Tentativa de login sem credenciais completas', {
      context: 'auth',
      data: { hasDocument: !!document, hasPassword: !!password },
    });
    throw new BadRequestError('Documento (CPF/CNPJ) e senha são obrigatórios');
  }

  try {
    // Tenta fazer login usando a função atualizada
    const result = await loginUser(document, password);

    // Log para rastreamento
    logger.info('Login bem-sucedido', {
      context: 'auth',
      user: result.user.id,
    });

    // Retorna os dados do usuário e tokens
    return {
      user: {
        id: result.user.id,
        document: result.user.document,
        email: result.user.email,
        name: result.user.name || result.user.companyName,
        type: result.user.type,
        role: result.user.role,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      success: true,
    };
  } catch (error: any) {
    // Log do erro
    logger.error('Falha no login', error, {
      context: 'auth',
      data: { document },
    });

    throw new BadRequestError(error.message || 'Erro ao fazer login');
  }
});
