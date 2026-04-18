import { describe, it, expect } from 'vitest';
import { db } from './db';

describe('SupabaseDB Mapping Logic', () => {
  describe('_mapKeysToDB', () => {
    it('deve mapear campos globais de CamelCase para snake_case', () => {
      const item = { 
        nome: 'Joao', 
        userId: '123',
        status: 'ativo'
      };
      // Usando a tabela 'patients' para validar contra o esquema
      const result = db._mapKeysToDB(item, 'patients');
      
      expect(result).toHaveProperty('name', 'Joao');
      expect(result).toHaveProperty('user_id', '123');
      expect(result).toHaveProperty('status', 'ativo');
    });

    it('deve filtrar colunas nao permitidas pelo esquema da tabela', () => {
      const item = { 
        name: 'Joao', 
        campoInexistente: 'blabla'
      };
      const result = db._mapKeysToDB(item, 'patients');
      
      expect(result).toHaveProperty('name', 'Joao');
      expect(result).not.toHaveProperty('campo_inexistente');
      expect(result).not.toHaveProperty('campoInexistente');
    });

    it('deve aplicar mapeamentos especificos da tabela docs_tcle', () => {
      const item = { 
        pacienteCpf: '123', 
        frequenciaSessoes: 'semanal'
      };
      const result = db._mapKeysToDB(item, 'docs_tcle');
      
      expect(result).toHaveProperty('paciente_cpf', '123');
      expect(result).toHaveProperty('frequencia_sessoes', 'semanal');
    });
  });

  describe('_mapKeysFromDB', () => {
    it('deve mapear campos de snake_case para CamelCase', () => {
      const dbItem = { 
        user_id: '123', 
        patient_name: 'Maria' 
      };
      const result = db._mapKeysFromDB(dbItem);
      
      expect(result).toHaveProperty('userId', '123');
      expect(result).toHaveProperty('pacienteNome', 'Maria');
    });

    it('deve mapear automaticamente campos snake_case desconhecidos para camelCase', () => {
      const dbItem = { 
        campo_novo_do_banco: 'valor' 
      };
      const result = db._mapKeysFromDB(dbItem);
      
      expect(result).toHaveProperty('campoNovoDoBanco', 'valor');
    });

    it('deve manter fallbacks de compatibilidade', () => {
      const dbItem = { 
        patient_name: 'Maria' 
      };
      const result = db._mapKeysFromDB(dbItem);
      
      expect(result).toHaveProperty('paciente', 'Maria');
    });
  });
});
