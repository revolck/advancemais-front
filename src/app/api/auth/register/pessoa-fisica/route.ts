import { NextRequest, NextResponse } from 'next/server';
import { registerUserPF } from '@/lib/auth';
import { apiHandler, BadRequestError } from '@/lib/api';
import { validators } from '@/lib/security';

export const POST = apiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const {
    name,
    email,
    password,
    cpf,
    birthDate,
    gender,
    phone,
    roleId, // Isso agora será tratado como role
    address,
  } = body;

  // Validação básica
  if (!name || !email || !password || !cpf || !birthDate || !gender || !phone || !address) {
    throw new BadRequestError('Todos os campos são obrigatórios');
  }

  // Validar formato de email
  if (!validators.email(email)) {
    throw new BadRequestError('Email inválido');
  }

  // Validação do CPF
  if (!validators.cpf(cpf)) {
    throw new BadRequestError('CPF inválido');
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
    // Tenta registrar o usuário - passando roleId como role
    const result = await registerUserPF(
      name,
      email,
      password,
      cpf,
      birthDate,
      gender,
      phone,
      roleId, // Passando roleId como o papel do usuário
      address
    );

    // Retorna os dados básicos do usuário e tokens
    return {
      user: {
        id: result.user.id,
        document: result.user.document,
        email: result.user.email,
        name: result.user.name,
        type: result.user.type,
        role: result.user.role,
      },
      accessToken: result.accessToken, // Agora retornamos o accessToken
      success: true,
    };
  } catch (error: any) {
    throw new BadRequestError(error.message || 'Erro ao registrar usuário');
  }
});
