import { describe, it, expect } from 'vitest';
import MaskService from './maskService';

describe('MaskService applyMask deletion', () => {
  const service = MaskService.getInstance();

  it('allows deleting characters in CPF mask', () => {
    const withDigit = service.processInput('087.015.278-4', 'cpf');
    expect(withDigit).toBe('087.015.278-4');
    const withoutDigit = service.processInput('087.015.278-', 'cpf');
    expect(withoutDigit).toBe('087.015.278');
  });

  it('allows deleting characters in CNPJ mask', () => {
    const withDigit = service.processInput('12.345.678/0001-9', 'cnpj');
    expect(withDigit).toBe('12.345.678/0001-9');
    const withoutDigit = service.processInput('12.345.678/0001-', 'cnpj');
    expect(withoutDigit).toBe('12.345.678/0001');
  });
});
