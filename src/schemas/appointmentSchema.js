import { z } from 'zod';

export const appointmentSchema = z.object({
  pacienteId: z.string().min(1, 'Selecione um paciente'),
  paciente: z.string().min(1, 'Nome do paciente é obrigatório'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use AAAA-MM-DD)'), // String formatada ISO
  hora: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido'),
  duracao: z.union([z.number(), z.string()]),
  tipo: z.string().min(1, 'Selecione o tipo'),
  recorrencia: z.enum(['unica', 'semanal', 'quinzenal', 'mensal']).default('unica'),
  qtdReplicar: z.number().min(1).max(52).default(1),
  status: z.string().default('confirmado'),
  obs: z.string().optional(),
  // Metadados de calendário para facilitar rebuild se necessário
  dia: z.number(),
  mes: z.number(),
  ano: z.number(),
  diaSemana: z.string(),
  reminderEnabled: z.boolean().default(true)
});
