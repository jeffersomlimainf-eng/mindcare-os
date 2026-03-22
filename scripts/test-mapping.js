const mappings = {
    'userId': 'user_id',
    'tenantId': 'tenant_id',
    'pacienteId': 'patient_id',
    'pacienteNome': 'patient_name',
    'profissionalNome': 'professional_name',
    'dataHora': 'data_hora',
    'criadoEm': 'created_at',
    'createdAt': 'created_at',
    'atualizadoEm': 'updated_at',
    'updatedAt': 'updated_at',
    'nome': 'name',
    'email': 'email',
    'telefone': 'phone',
    'sexo': 'gender',
    'cpf': 'cpf',
    'dataNascimento': 'birth_date',
    'precoSessao': 'price_per_session',
    'iniciais': 'initials',
    'cor': 'color',
    'status': 'status',
    'bairro': 'address_neighborhood',
    'horaInicio': 'time_start',
    'duracao': 'duration',
    'nivelRisco': 'risk_level',
    'queixa': 'complaint',
    'historico': 'history',
    'plano': 'health_plan',
    'conteudo': 'content_soap'
};

const allowedColumns = [
    'id', 'tenant_id', 'full_name', 'email', 'crp', 'phone', 'specialty', 'plan_id', 
    'onboarding_completed', 'configurations', 'created_at', 'updated_at', 'role', 
    'clinic_name', 'clinic_cnpj', 'documento_id', 'patient_id', 'patient_name', 
    'status', 'queixa_principal', 'historico_familiar', 'expectativas', 'observacoes_gerais', 
    'professional_name', 'user_id', 'solicitante', 'identificacao', 'demanda', 
    'procedimento', 'analise_conclusao', 'data_atendimento', 'hora_inicio', 'hora_fim', 
    'finalidade', 'data', 'time_start', 'duration', 'type', 'recurrence', 'obs', 
    'dias_afastamento', 'cid', 'parecer', 'nome', 'categoria', 'ícone', 'cor', 'uso', 
    'conteudo', 'name', 'description', 'value', 'date', 'due_date', 'payment_method', 
    'category', 'subcategory', 'group_id', 'current_installment', 'total_installments', 
    'frequency', 'especialidade_destino', 'profissional_destino', 'clinica_destino', 
    'motivo', 'resumo_clinico', 'objetivo', 'urgencia', 'data_hora', 'content_soap', 
    'techniques', 'observations', 'humor', 'risk_level', 'format', 'cpf', 'birth_date', 
    'gender', 'initials', 'address_zip', 'address_street', 'address_number', 
    'address_neighborhood', 'address_city', 'address_state', 'complaint', 'history', 
    'price_per_session', 'health_plan', 'is_minor', 'responsible_data', 'marital_status', 
    'profession', 'bairro', 'paciente_id', 'paciente_nome'
];

function _mapKeysToDB(item) {
    if (!item) return item;
    const mapped = { ...item };
    
    const cleaned = {};
    Object.keys(item).forEach(key => {
        const camelToSnake = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        const dbKey = mappings[key] || camelToSnake;
        
        // Allow exact matches in case the UI already sends snake_case
        if (allowedColumns.includes(dbKey)) {
            cleaned[dbKey] = item[key];
        } else if (allowedColumns.includes(key)) {
            cleaned[key] = item[key];
        }
    });

    return cleaned;
}

const patientItem = {
    nome: 'Teste Da Silva',
    cpf: '111.222.333-44',
    telefone: '99',
    dataNascimento: '1990-01-01',
    bairro: 'Centro',
    sexo: 'M',
    precoSessao: '100',
    plano: 'Unimed',
    queixa: 'Ansiedade',
    historico: 'Nenhum',
    userId: 'uuid-here',
    id: 'generated-uuid-here',
    tenantId: 'tenant-primary',
    created_at: 'now'
};

console.log('PATIENT PAYLOAD:', _mapKeysToDB(patientItem));

const agendaItem = {
    patient_id: '123',
    patient_name: 'Teste',
    data: '2024',
    time_start: '09:00',
    type: 'Consulta'
};
console.log('AGENDA PAYLOAD:', _mapKeysToDB(agendaItem));

