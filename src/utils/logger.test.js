import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

describe('logger.js with PII redaction', () => {
  let spyLog, spyError;

  beforeEach(() => {
    spyLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    spyError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve redigir campos sensiveis simples', () => {
    const data = { cpf: '123.456.789-00', nome: 'Joao Silva' };
    logger.log('Teste:', data);

    expect(spyLog).toHaveBeenCalledWith('Teste:', expect.objectContaining({
      cpf: '[REDACTED]',
      nome: 'Joao Silva'
    }));
  });

  it('deve redigir campos sensiveis em objetos aninhados', () => {
    const data = { 
      paciente: { 
        email: 'teste@email.com',
        telefone: '11999999999'
      },
      status: 'ativo'
    };
    logger.log('Aninhado:', data);

    expect(spyLog).toHaveBeenCalledWith('Aninhado:', expect.objectContaining({
      paciente: {
        email: '[REDACTED]',
        telefone: '[REDACTED]'
      },
      status: 'ativo'
    }));
  });

  it('deve redigir campos em arrays de objetos', () => {
    const data = [
      { cpf: '111' },
      { cpf: '222' }
    ];
    logger.log('Lista:', data);

    expect(spyLog).toHaveBeenCalledWith('Lista:', [
      { cpf: '[REDACTED]' },
      { cpf: '[REDACTED]' }
    ]);
  });

  it('deve redigir senhas e chaves pix', () => {
    const data = { senha: '123', pix_key: 'abc' };
    logger.error('Erro sensivel:', data);

    expect(spyError).toHaveBeenCalledWith('Erro sensivel:', expect.objectContaining({
      senha: '[REDACTED]',
      pix_key: '[REDACTED]'
    }));
  });
});
