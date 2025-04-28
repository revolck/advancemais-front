import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, BadRequestError } from '@/lib/api';
import { logger } from '@/lib/logger';
import { validators } from '@/lib/security';
import { redirect } from 'next/navigation';

export const POST = apiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { document } = body;

  // Validação básica
  if (!document) {
    throw new BadRequestError('O documento (CPF/CNPJ) é obrigatório');
  }

  // Validar formato do documento (CPF ou CNPJ)
  const isCPF = document.length === 11;
  const isCNPJ = document.length === 14;

  if (isCPF && !validators.cpf(document)) {
    throw new BadRequestError('CPF inválido');
  }

  if (isCNPJ && !validators.cnpj(document)) {
    throw new BadRequestError('CNPJ inválido');
  }

  if (!isCPF && !isCNPJ) {
    throw new BadRequestError('Documento deve ser um CPF (11 dígitos) ou CNPJ (14 dígitos)');
  }

  // Lógica de recuperação de senha (mock)
  logger.info('Solicitação de recuperação de senha', {
    context: 'auth',
    data: { document },
  });

  // Em produção, enviar email ou SMS com link de recuperação
  // Por enquanto, só simulamos o processo

  // Redirect para página de confirmação
  return {
    success: true,
    message: 'Email de recuperação enviado com sucesso. Por favor, verifique sua caixa de entrada.',
  };
});

// Rota GET para receber o token de recuperação
export const GET = apiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    throw new BadRequestError('Token de recuperação não fornecido');
  }

  // Validar o token (mock)
  logger.info('Validação de token de recuperação de senha', {
    context: 'auth',
    data: { token },
  });

  // Em produção, validar o token no banco de dados
  // e redirecionar para a página de definição de nova senha

  // Redirect para página de nova senha
  return NextResponse.redirect(new URL('/reset-password/new?token=' + token, req.url));
});
