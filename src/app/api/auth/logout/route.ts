import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth';
import { apiHandler } from '@/lib/api';
import { logger } from '@/lib/logger';

export const POST = apiHandler(async (req: NextRequest) => {
  // Executa o logout
  logoutUser();

  logger.info('Logout via API POST', { context: 'auth' });

  return {
    success: true,
    message: 'Logout realizado com sucesso',
  };
});

// Permitir também requisições GET para facilitar links de logout
export const GET = apiHandler(async (req: NextRequest) => {
  // Executa o logout
  logoutUser();

  logger.info('Logout via API GET', { context: 'auth' });

  // Redireciona para a página inicial
  return NextResponse.redirect(new URL('/', req.url));
});
