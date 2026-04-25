import { z } from 'zod';

const validateCPF = (cpf) => {
    if (!cpf) return false;
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

    return true;
};

export const patientSchema = z.object({
    nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').max(100, 'O nome é muito longo'),
    cpf: z.string().min(1, 'CPF é obrigatório').refine(val => validateCPF(val), { message: 'CPF inválido' }),
    dataNascimento: z.string().optional().or(z.literal('')),
    genero: z.string().optional().or(z.literal('')),
    telefone: z.string().min(1, 'Telefone é obrigatório').refine(val => {
        const clean = val.replace(/\D/g, '');
        return clean.length >= 10 && clean.length <= 15;
    }, { message: 'Telefone inválido' }),
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    
    // Endereço
    cep: z.string().optional().or(z.literal('')),
    rua: z.string().optional().or(z.literal('')),
    numero: z.string().optional().or(z.literal('')),
    bairro: z.string().optional().or(z.literal('')),
    cidade: z.string().optional().or(z.literal('')),
    estado: z.string().optional().or(z.literal('')),
    
    // Dados Clínicos
    queixa: z.string().optional().or(z.literal('')),
    historico: z.string().optional().or(z.literal('')),
    responsavel: z.string().optional().or(z.literal('')),
    plano: z.string().optional().or(z.literal('')),
    status: z.enum(['Ativo', 'Inativo']).default('Ativo'),
    isMenor: z.boolean().default(false),
    
    dadosResponsavel: z.object({
        nome: z.string().optional().or(z.literal('')),
        cpf: z.string().optional().or(z.literal('')),
        dataNascimento: z.string().optional().or(z.literal('')),
        telefone: z.string().optional().or(z.literal(''))
    }).optional(),
    
    precoSessao: z.string().optional().or(z.literal('')),
    estadoCivil: z.string().optional().or(z.literal('')),
    profissao: z.string().optional().or(z.literal('')),
    emergency_contact: z.string().optional().or(z.literal('')),
    allergies: z.string().optional().or(z.literal('')),
    medications: z.string().optional().or(z.literal('')),
    referral_source: z.string().optional().or(z.literal(''))
}).refine((data) => {
    if (data.isMenor && (!data.dadosResponsavel || !data.dadosResponsavel.nome)) {
        return false;
    }
    return true;
}, {
    message: 'Nome do responsável é obrigatório para menores de idade',
    path: ['dadosResponsavel', 'nome']
}).refine((data) => {
    if (data.isMenor && data.dadosResponsavel?.cpf && !validateCPF(data.dadosResponsavel.cpf)) {
        return false;
    }
    return true;
}, {
    message: 'CPF do responsável inválido',
    path: ['dadosResponsavel', 'cpf']
});
