import { describe, it, expect } from 'vitest';
import { valorPorExtenso, formatCurrencyBRL, parseCurrencyBRL } from './formatters';

describe('formatters.js utilities', () => {
  describe('valorPorExtenso', () => {
    it('deve converter valores simples corretamente', () => {
      expect(valorPorExtenso(1)).toBe('Um real');
      expect(valorPorExtenso(10)).toBe('Dez reais');
      expect(valorPorExtenso(100)).toBe('Cem reais');
    });

    it('deve converter centavos corretamente', () => {
      expect(valorPorExtenso(0.50)).toBe('Cinquenta centavos');
      expect(valorPorExtenso(1.50)).toBe('Um real e cinquenta centavos');
    });

    it('deve converter valores compostos corretamente', () => {
      expect(valorPorExtenso(1250.50)).toBe('Mil duzentos e cinquenta reais e cinquenta centavos');
      expect(valorPorExtenso(2500)).toBe('Dois mil e quinhentos reais');
    });

    it('deve retornar string vazia para valores invalidos', () => {
      expect(valorPorExtenso(0)).toBe('');
      expect(valorPorExtenso(-10)).toBe('');
    });
  });

  describe('formatCurrencyBRL', () => {
    it('deve formatar numeros corretamente', () => {
      expect(formatCurrencyBRL(125050)).toBe('1.250,50');
      expect(formatCurrencyBRL(1000)).toBe('10,00');
    });

    it('deve formatar strings de digitos corretamente', () => {
      expect(formatCurrencyBRL('125050')).toBe('1.250,50');
    });

    it('deve retornar string vazia para valores nulos/indefinidos', () => {
      expect(formatCurrencyBRL(null)).toBe('');
      expect(formatCurrencyBRL(undefined)).toBe('');
    });
  });

  describe('parseCurrencyBRL', () => {
    it('deve converter string BRL para numero', () => {
      expect(parseCurrencyBRL('1.250,50')).toBe(1250.50);
      expect(parseCurrencyBRL('10,00')).toBe(10);
    });

    it('deve retornar 0 para valores vazios', () => {
      expect(parseCurrencyBRL('')).toBe(0);
      expect(parseCurrencyBRL(null)).toBe(0);
    });
  });
});
