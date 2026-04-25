import { z } from 'zod';

export const financeSchema = z.object({
    tipo: z.enum(['receita', 'despesa']),
    desc: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres').max(200, 'Descrição muito longa'),
    valor: z.preprocess((val) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') return parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0;
        return 0;
    }, z.number().positive('O valor deve ser maior que zero')),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
    dataVencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de vencimento inválida'),
    status: z.enum(['recebido', 'pendente', 'pago']),
    formaPag: z.string().optional().default('pix'),
    categoria: z.string().optional().default('clinica'),
    subcategoria: z.string().optional().or(z.literal('')),
    pacienteId: z.string().nullable().optional(),
    pacienteNome: z.string().nullable().optional(),
    parcelas: z.coerce.number().int().min(1).max(60).default(1),
    frequencia: z.enum(['mensal', 'quinzenal', 'semanal']).nullable().optional(),
});
