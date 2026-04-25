import { z } from 'zod';

export const evolutionSchema = z.object({
    dataHora: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Data e hora inválidas'),
    tipoAtendimento: z.string().min(1, 'Selecione o tipo de atendimento'),
    duracaoSessao: z.coerce.number().min(1, 'Duração deve ser maior que zero'),
    numeroSessao: z.coerce.number().optional().or(z.literal('')),
    pacienteId: z.string().min(1, 'Selecione um paciente'),
    pacienteNome: z.string().optional(),
    
    // SOAP
    subjetivo: z.string().min(3, 'O campo Subjetivo é obrigatório (mín. 3 caracteres)'),
    objetivo: z.string().optional().or(z.literal('')),
    avaliacao: z.string().optional().or(z.literal('')),
    plano: z.string().optional().or(z.literal('')),
    
    // Metadados Clínicos
    humorPaciente: z.enum(['muito_baixo', 'baixo', 'neutro', 'bom', 'muito_bom']).default('neutro'),
    nivelRisco: z.enum(['baixo', 'moderado', 'alto', 'critico']).default('baixo'),
    observacoes: z.string().optional().or(z.literal('')),
    
    tecnicas: z.array(z.object({
        id: z.any(),
        nome: z.string(),
        checked: z.boolean()
    })).optional().default([]),
});
