import { z } from 'zod';

// Schema base para documentos genéricos
export const documentSchema = z.object({
  pacienteId: z.string().min(1, 'Selecione um paciente'),
  pacienteNome: z.string().min(1, 'Nome do paciente é obrigatório'),
  tipo: z.string().min(1, 'Tipo de documento obrigatório'),
  categoria: z.string().optional(),
  conteudo: z.string().min(1, 'O conteúdo do documento não pode estar vazio'),
  modeloId: z.string().optional(),
  status: z.enum(['rascunho', 'finalizado', 'Rascunho', 'Finalizado', 'Em Revisão']).default('rascunho')
});

// Schema específico para Laudo Psicológico
export const laudoSchema = z.object({
  pacienteId: z.string().min(1, 'Selecione um paciente'),
  pacienteNome: z.string().min(1, 'Nome do paciente é obrigatório'),
  solicitante: z.string().min(1, 'Solicitante é obrigatório'),
  identificacao: z.string().min(1, 'Identificação é obrigatória'),
  demanda: z.string().min(1, 'Descrição da demanda é obrigatória'),
  procedimento: z.string().min(1, 'Procedimento é obrigatório'),
  analiseConclusao: z.string().min(1, 'Análise e conclusão são obrigatórias'),
  status: z.string().default('Rascunho')
});

// Schema específico para Atestado
export const atestadoSchema = z.object({
  pacienteId: z.string().min(1, 'Selecione um paciente'),
  pacienteNome: z.string().min(1, 'Nome do paciente é obrigatório'),
  finalidade: z.string().min(1, 'Finalidade é obrigatória'),
  parecer: z.string().min(1, 'Parecer é obrigatório'),
  cid: z.string().optional(),
  diasAfastamento: z.string().optional(),
  status: z.string().default('Rascunho')
});

// Schema específico para Declaração
export const declaracaoSchema = z.object({
  pacienteId: z.string().min(1, 'Selecione um paciente'),
  pacienteNome: z.string().min(1, 'Nome do paciente é obrigatório'),
  conteudo: z.string().min(1, 'Conteúdo da declaração é obrigatório'),
  dataSessao: z.string().optional(),
  status: z.string().default('Rascunho')
});

// Schema específico para Recibo
export const reciboSchema = z.object({
  pacienteId: z.string().min(1, 'Selecione um paciente'),
  pacienteNome: z.string().min(1, 'Nome do paciente é obrigatório'),
  valor: z.number().min(0.01, 'Valor deve ser maior que zero'),
  servico: z.string().min(1, 'Descrição do serviço é obrigatória'),
  data: z.string().min(1, 'Data é obrigatória'),
  status: z.string().default('Emitido')
});
