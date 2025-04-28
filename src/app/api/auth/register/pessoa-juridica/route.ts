import { NextRequest, NextResponse } from 'next/server';
import { registerUserPJ } from '@/lib/auth';
import { apiHandler, BadRequestError } from '@/lib/api';
import { validators } from '@/lib/security';

export const POST = apiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const {
    companyName,
    tradeName,
    legalName,
    cnpj,
    email,
    password,
    phone,
    website,
    address,
    role = 'Empresa', // Valor padrão para role de pessoas jurídicas
  } = body;

  // Validação básica
  if (
    !companyName ||
    !tradeName ||
    !legalName ||
    !cnpj ||
    !email ||
    !password ||
    !phone ||
    !address
  ) {
    throw new BadRequestError('Todos os campos são obrigatórios');
  }

  // Validar formato de email
  if (!validators.email(email)) {
    throw new BadRequestError('Email inválido');
  }

  // Validação do CNPJ
  if (!validators.cnpj(cnpj)) {
    throw new BadRequestError('CNPJ inválido');
  }

  // Validar senha forte
  if (!validators.password(password)) {
    throw new BadRequestError(
      'Senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números'
    );
  }

  // Validar endereço
  if (
    !address.zipCode ||
    !address.street ||
    !address.number ||
    !address.neighborhood ||
    !address.city ||
    !address.state
  ) {
    throw new BadRequestError('Todos os campos do endereço são obrigatórios');
  }

  try {
    // Tenta registrar o usuário
    const result = await registerUserPJ(
      companyName,
      tradeName,
      legalName,
      cnpj,
      email,
      password,
      phone,
      role,
      website,
      address
    );

    // Retorna os dados básicos do usuário e tokens
    return {
      user: {
        id: result.user.id,
        document: result.user.document,
        email: result.user.email,
        companyName: result.user.companyName,
        tradeName: result.user.tradeName,
        type: result.user.type,
        role: result.user.role,
      },
      accessToken: result.accessToken,
      success: true,
    };
  } catch (error: any) {
    throw new BadRequestError(error.message || 'Erro ao registrar usuário');
  }
});
