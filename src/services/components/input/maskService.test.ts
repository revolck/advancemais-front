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

  it('formats alphanumeric CNPJ preserving letters as uppercase', () => {
    const formatted = service.processInput('12.abc.345/01de-35', 'cnpj');
    expect(formatted).toBe('12.ABC.345/01DE-35');
    expect(service.removeMask(formatted, 'cnpj')).toBe('12ABC34501DE35');
  });

  it('applies CPF format when using cpfCnpj mask with 11 digits', () => {
    const formatted = service.processInput('12345678901', 'cpfCnpj');
    expect(formatted).toBe('123.456.789-01');
  });

  it('switches to CNPJ format when using cpfCnpj mask with more than 11 digits', () => {
    const formatted = service.processInput('12345678901234', 'cpfCnpj');
    expect(formatted).toBe('12.345.678/9012-34');
  });

  it('treats letters in cpfCnpj mask as CNPJ', () => {
    const formatted = service.processInput('ab12cd34ef5602', 'cpfCnpj');
    expect(formatted).toBe('AB.12C.D34/EF56-02');
  });
});
