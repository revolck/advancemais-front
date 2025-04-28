import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';
import { apiLogger } from '@/lib/logger';
import { apiHandler, BadRequestError } from '@/lib/api';

export const POST = apiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { document, password, remember } = body;

  // Validação básica
  if (!document || !password) {
    throw new BadRequestError('Documento (CPF/CNPJ) e senha são obrigatórios');
  }

  try {
    // Tenta fazer login
    const user = await loginUser(document, password);

    // Retorna os dados básicos do usuário
    return {
      user: {
        id: user.id,
        document: user.document,
        email: user.email,
        name: user.name || user.companyName,
        type: user.type,
        role: user.role,
      },
      success: true,
    };
  } catch (error: any) {
    throw new BadRequestError(error.message || 'Erro ao fazer login');
  }
});
