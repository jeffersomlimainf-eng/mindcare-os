import { supabase } from '../lib/supabase';

/**
 * Meu Sistema PSI - Supabase Database Service
 * Esta versão substitui o localStorage pelo Supabase SDK.
 * Todas as operações são assíncronas e retornam Promises.
 */

class SupabaseDB {
    constructor() {
        this.tableMap = {
            'patients': 'patients',
            'appointments': 'appointments',
            'evolutions': 'evolutions',
            'finance': 'finance',
            'laudos': 'docs_laudo',
            'atestados': 'docs_atestado',
            'declaracoes': 'docs_declaracao',
            'anamneses': 'docs_anamnese',
            'encaminhamentos': 'docs_encaminhamento',
            'tcles': 'docs_tcle',
            'models': 'models' // Se existir
        };
    }

    _getTableName(name) {
        return this.tableMap[name] || name;
    }

    async list(collectionName) {
        const table = this._getTableName(collectionName);
        const { data, error } = await supabase
            .from(table)
            .select('*');

        if (error) throw error;
        return (data || []).map(item => this._mapKeysFromDB(item));
    }

    async getById(collectionName, id) {
        const table = this._getTableName(collectionName);
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return this._mapKeysFromDB(data);
    }

    async insert(collectionName, item) {
        const table = this._getTableName(collectionName);
        const payload = {
            ...this._mapKeysToDB(item, table)
        };

        const { data, error } = await supabase
            .from(table)
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error(`[db.insert] ERRO do Supabase ao inserir na tabela '${table}':`, JSON.stringify(error, null, 2));
            console.error(`[db.insert] Payload que tentamos enviar:`, JSON.stringify(payload, null, 2));
            throw error;
        }
        return this._mapKeysFromDB(data);
    }

    async update(collectionName, id, updates) {
        const table = this._getTableName(collectionName);
        const payload = this._mapKeysToDB(updates, table);

        const { data, error } = await supabase
            .from(table)
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this._mapKeysFromDB(data);
    }

    async delete(collectionName, id) {
        const table = this._getTableName(collectionName);
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    /**
     * Retorna a lista de colunas permitidas para uma tabela específica.
     * Evita erros PGRST204 ao filtrar campos inexistentes.
     */
    _getAllowedColumns(table) {
        const baseColumns = ['id', 'user_id', 'tenant_id', 'created_at', 'updated_at'];
        
        const schemas = {
            'patients': [...baseColumns, 'name', 'email', 'phone', 'cpf', 'birth_date', 'gender', 'status', 'color', 'initials', 'address_zip', 'address_street', 'address_number', 'address_neighborhood', 'address_city', 'address_state', 'complaint', 'history', 'price_per_session', 'health_plan', 'is_minor', 'responsible_data', 'marital_status', 'profession', 'bairro'],
            'appointments': [...baseColumns, 'patient_id', 'patient_name', 'data', 'time_start', 'duration', 'status', 'type', 'recurrence', 'obs', 'reminder_sent', 'reminder_enabled'],
            'evolutions': [...baseColumns, 'patient_id', 'patient_name', 'data_hora', 'type', 'status', 'professional_name', 'content_soap', 'techniques', 'observations', 'humor', 'risk_level', 'format', 'duration_minutes', 'session_number'],
            'finance': [...baseColumns, 'type', 'description', 'value', 'date', 'due_date', 'status', 'payment_method', 'category', 'subcategory', 'group_id', 'current_installment', 'total_installments', 'frequency', 'patient_id', 'patient_name', 'pix_key', 'pix_key_type', 'professional_name', 'professional_cpf_cnpj', 'professional_email', 'professional_phone', 'link_sent', 'link_visited_count'],
            'docs_laudo': [...baseColumns, 'documento_id', 'patient_id', 'patient_name', 'status', 'solicitante', 'identificacao', 'demanda', 'procedimento', 'analise_conclusao', 'professional_name'],
            'docs_atestado': [...baseColumns, 'documento_id', 'patient_id', 'patient_name', 'status', 'finalidade', 'dias_afastamento', 'cid', 'parecer', 'professional_name'],
            'docs_declaracao': [...baseColumns, 'documento_id', 'patient_id', 'patient_name', 'status', 'data_atendimento', 'hora_inicio', 'hora_fim', 'finalidade', 'professional_name'],
            'docs_anamnese': [...baseColumns, 'documento_id', 'patient_id', 'patient_name', 'status', 'queixa_principal', 'historico_pessoal', 'historico_medico', 'historico_familiar', 'historico_social', 'sintomas_atuais', 'tratamentos_anteriores', 'observacoes_clinicas', 'plano_terapeutico', 'expectativas', 'observacoes_gerais', 'professional_name'],
            'docs_encaminhamento': [...baseColumns, 'documento_id', 'patient_id', 'patient_name', 'status', 'especialidade_destino', 'profissional_destino', 'clinica_destino', 'motivo', 'resumo_clinico', 'objetivo', 'urgencia', 'professional_name'],
            'docs_tcle': [...baseColumns, 'documento_id', 'paciente_id', 'paciente_nome', 'paciente_iniciais', 'paciente_cor', 'paciente_cpf', 'paciente_email', 'paciente_telefone', 'paciente_data_nascimento', 'tipo_atendimento', 'modalidade', 'frequencia_sessoes', 'duracao_sessoes', 'valor_sessao', 'forma_pagamento', 'sigilo_profissional', 'direitos_paciente', 'deveres_paciente', 'politica_cancelamento', 'consentimento_gravacao', 'consentimento_supervisao', 'observacoes', 'data_assinatura', 'assinado_paciente', 'assinado_profissional', 'status', 'professional_name', 'profissional_nome', 'profissional_crp', 'profissional_especialidade'],
            'models': [...baseColumns, 'nome', 'categoria', 'ícone', 'cor', 'uso', 'conteudo'],
            'waiting_list': [...baseColumns, 'nome', 'prioridade', 'preferencia', 'duracao', 'bg_badge'],
            'profiles': ['id', 'tenant_id', 'full_name', 'email', 'crp', 'phone', 'specialty', 'plan_id', 'onboarding_completed', 'configurations', 'created_at', 'updated_at', 'role', 'clinic_name', 'clinic_cnpj', 'plan_start_date', 'plan_billing_type', 'plan_payment_method', 'plan_status', 'plan_value']
        };

        return schemas[table] || [];
    }

    /**
     * Mapeia chaves de CamelCase (App) para Snake_Case (DB).
     */
    _mapKeysToDB(item, table) {
        if (!item) return item;
        
        const mappings = {
            'userId': 'user_id',
            'tenantId': 'tenant_id',
            'paciente': 'patient_name',
            'pacienteId': 'patient_id',
            'pacienteNome': 'patient_name',
            'paciente_id': 'patient_id',
            'paciente_nome': 'patient_name',
            'profissionalNome': 'professional_name',
            'profissional_nome': 'professional_name',
            'dataHora': 'data_hora',
            'criadoEm': 'created_at',
            'createdAt': 'created_at',
            'atualizadoEm': 'updated_at',
            'updatedAt': 'updated_at',
            'tecnicas': 'techniques',
            'observacoes': 'observations',
            'humorPaciente': 'humor',
            'nome': 'name',
            'email': 'email',
            'telefone': 'phone',
            'genero': 'gender',
            'sexo': 'gender',
            'cpf': 'cpf',
            'dataNascimento': 'birth_date',
            'precoSessao': 'price_per_session',
            'iniciais': 'initials',
            'cor': 'color',
            'status': 'status',
            'cep': 'address_zip',
            'rua': 'address_street',
            'numero': 'address_number',
            'bairro': 'address_neighborhood',
            'cidade': 'address_city',
            'estado': 'address_state',
            'horaInicio': 'hora_inicio',
            'horaFim': 'hora_fim',
            'timeStart': 'time_start',
            'duracao': 'duration',
            'duracaoSessao': 'duration_minutes',
            'numeroSessao': 'session_number',
            'nivelRisco': 'risk_level',
            'queixa': 'complaint',
            'historico': 'history',
            'plano': 'health_plan',
            'conteudo': 'content_soap',
            'tipo': 'type',
            'recorrencia': 'recurrence',
            'obs': 'obs',
            'dataAtendimento': 'data_atendimento',
            'expectativas': 'expectativas',
            'queixaPrincipal': 'queixa_principal',
            'historicoPessoal': 'historico_pessoal',
            'historicoMedico': 'historico_medico',
            'historicoFamiliar': 'historico_familiar',
            'historicoSocial': 'historico_social',
            'sintomasAtuais': 'sintomas_atuais',
            'tratamentosAnteriores': 'tratamentos_anteriores',
            'observacoesClinicas': 'observacoes_clinicas',
            'planoTerapeutico': 'plano_terapeutico',
            'observacoesGerais': 'observacoes_gerais',
            'isMenor': 'is_minor',
            'dadosResponsavel': 'responsible_data',
            'estadoCivil': 'marital_status',
            'profissao': 'profession',
            'desc': 'description',
            'valor': 'value',
            'dataVencimento': 'due_date',
            'formaPag': 'payment_method',
            'categoria': 'category',
            'subcategoria': 'subcategory',
            'parcelas': 'total_installments',
            'planoId': 'plan_id',
            'planoDataInicio': 'plan_start_date',
            'planoTipoFaturamento': 'plan_billing_type',
            'planoFormaPagamento': 'plan_payment_method',
            'planoStatus': 'plan_status',
            'planoValor': 'plan_value',
            'reminderSent': 'reminder_sent',
            'reminderEnabled': 'reminder_enabled'
        };

        const allowedColumns = this._getAllowedColumns(table);
        const blacklist = ['createdAt', 'updatedAt', 'criadoEm', 'atualizadoEm', 'criado_em', 'atualizado_em'];

        // Mapeamentos por tabela que sobrescrevem os globais
        const tableMappings = {
            'docs_tcle': {
                'pacienteId': 'paciente_id',
                'pacienteNome': 'paciente_nome',
                'pacienteIniciais': 'paciente_iniciais',
                'pacienteCor': 'paciente_cor',
                'pacienteCpf': 'paciente_cpf',
                'pacienteEmail': 'paciente_email',
                'pacienteTelefone': 'paciente_telefone',
                'pacienteDataNascimento': 'paciente_data_nascimento',
                'tipoAtendimento': 'tipo_atendimento',
                'frequenciaSessoes': 'frequencia_sessoes',
                'duracaoSessoes': 'duracao_sessoes',
                'valorSessao': 'valor_sessao',
                'formaPagamento': 'forma_pagamento',
                'sigiloProfissional': 'sigilo_profissional',
                'direitosPaciente': 'direitos_paciente',
                'deveresPaciente': 'deveres_paciente',
                'politicaCancelamento': 'politica_cancelamento',
                'consentimentoGravacao': 'consentimento_gravacao',
                'consentimentoSupervisao': 'consentimento_supervisao',
                'dataAssinatura': 'data_assinatura',
                'assinadoPaciente': 'assinado_paciente',
                'assinadoProfissional': 'assinado_profissional',
                'documentoId': 'documento_id',
                'profissionalNome': 'profissional_nome',
                'profissionalCrp': 'profissional_crp',
                'profissionalEspecialidade': 'profissional_especialidade',
                'observacoes': 'observacoes',
                'modalidade': 'modalidade',
                'status': 'status',
                'userId': 'user_id',
            }
        };

        const activeOverrides = tableMappings[table] || {};

        const cleaned = {};
        Object.keys(item).forEach(key => {
            // Se estiver na blacklist, pular
            if (blacklist.includes(key) || blacklist.includes(mappings[key])) return;

            const camelToSnake = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            const dbKey = activeOverrides[key] || mappings[key] || camelToSnake;
            
            // Aceitar apenas se a coluna existir na tabela específica
            if (allowedColumns.includes(dbKey)) {
                cleaned[dbKey] = item[key];
            } else if (allowedColumns.includes(key)) {
                cleaned[key] = item[key];
            }
        });

        return cleaned;
    }

    /**
     * Mapeia chaves de Snake_Case (DB) para CamelCase (App).
     */
    _mapKeysFromDB(item) {
        if (!item) return item;
        const mapped = { ...item };

        const reverseMappings = {
            'user_id': 'userId',
            'tenant_id': 'tenantId',
            'patient_id': 'pacienteId',
            'patient_name': 'pacienteNome',
            'paciente_id': 'pacienteId', // Fallback
            'paciente_nome': 'pacienteNome', // Fallback
            'professional_name': 'profissionalNome',
            'data_hora': 'dataHora',
            'created_at': 'createdAt',
            'updated_at': 'updatedAt',
            'name': 'nome',
            'email': 'email',
            'phone': 'telefone',
            'gender': 'genero',
            'cpf': 'cpf',
            'birth_date': 'dataNascimento',
            'price_per_session': 'precoSessao',
            'initials': 'iniciais',
            'color': 'cor',
            'status': 'status',
            'address_zip': 'cep',
            'address_street': 'rua',
            'address_number': 'numero',
            'address_neighborhood': 'bairro',
            'address_city': 'cidade',
            'address_state': 'estado',
            'techniques': 'tecnicas',
            'observations': 'observacoes',
            'humor': 'humorPaciente',
            'risk_level': 'nivelRisco',
            'nivel_risco': 'nivelRisco',
            'hora_inicio': 'horaInicio',
            'hora_fim': 'horaFim',
            'time_start': 'timeStart',
            'duration': 'duracao',
            'duration_minutes': 'duracaoSessao',
            'session_number': 'numeroSessao',
            'complaint': 'queixa',
            'history': 'historico',
            'health_plan': 'plano',
            'content_soap': 'conteudo',
            'type': 'tipo',
            'recurrence': 'recorrencia',
            'data_atendimento': 'dataAtendimento',
            'expectativas': 'expectativas',
            'queixa_principal': 'queixaPrincipal',
            'historico_pessoal': 'historicoPessoal',
            'historico_medico': 'historicoMedico',
            'historico_familiar': 'historicoFamiliar',
            'historico_social': 'historicoSocial',
            'sintomas_atuais': 'sintomasAtuais',
            'tratamentos_anteriores': 'tratamentosAnteriores',
            'observacoes_clinicas': 'observacoesClinicas',
            'plano_terapeutico': 'planoTerapeutico',
            'observacoes_gerais': 'observacoesGerais',
            'is_minor': 'isMenor',
            'responsible_data': 'dadosResponsavel',
            'marital_status': 'estadoCivil',
            'profession': 'profissao',
            'description': 'desc',
            'value': 'valor',
            'due_date': 'dataVencimento',
            'payment_method': 'formaPag',
            'category': 'categoria',
            'subcategory': 'subcategoria',
            'total_installments': 'parcelas',
            'plan_id': 'planoId',
            'plan_start_date': 'planoDataInicio',
            'plan_billing_type': 'planoTipoFaturamento',
            'plan_payment_method': 'planoFormaPagamento',
            'plan_status': 'planoStatus',
            'plan_value': 'planoValor',
            // TCLE specific
            'paciente_iniciais': 'pacienteIniciais',
            'paciente_cor': 'pacienteCor',
            'paciente_cpf': 'pacienteCpf',
            'paciente_email': 'pacienteEmail',
            'paciente_telefone': 'pacienteTelefone',
            'paciente_data_nascimento': 'pacienteDataNascimento',
            'tipo_atendimento': 'tipoAtendimento',
            'frequencia_sessoes': 'frequenciaSessoes',
            'duracao_sessoes': 'duracaoSessoes',
            'valor_sessao': 'valorSessao',
            'forma_pagamento': 'formaPagamento',
            'sigilo_profissional': 'sigiloProfissional',
            'direitos_paciente': 'direitosPaciente',
            'deveres_paciente': 'deveresPaciente',
            'politica_cancelamento': 'politicaCancelamento',
            'consentimento_gravacao': 'consentimentoGravacao',
            'consentimento_supervisao': 'consentimentoSupervisao',
            'data_assinatura': 'dataAssinatura',
            'assinado_paciente': 'assinadoPaciente',
            'assinado_profissional': 'assinadoProfissional',
            'documento_id': 'documentoId',
            'profissional_nome': 'profissionalNome',
            'profissional_crp': 'profissionalCrp',
            'profissional_especialidade': 'profissionalEspecialidade',
            'criado_em': 'criadoEm',
            'atualizado_em': 'atualizadoEm',
        };

        // Mapeamento automático de snake_case para camelCase
        Object.keys(item).forEach(key => {
            const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
            if (camelKey !== key && mapped[camelKey] === undefined) {
                mapped[camelKey] = item[key];
            }
        });

        Object.keys(reverseMappings).forEach(key => {
            if (mapped[key] !== undefined) {
                const targetKey = reverseMappings[key];
                mapped[targetKey] = mapped[key];
                
                // Mapeamento extra para 'criadoEm' e 'atualizadoEm'
                if (targetKey === 'createdAt') mapped['criadoEm'] = mapped[key];
                if (targetKey === 'updatedAt') mapped['atualizadoEm'] = mapped[key];
            }
        });

        // Fallbacks específicos para compatibilidade
        if (mapped.patient_name && !mapped.paciente) mapped.paciente = mapped.patient_name;
        if (mapped.patient_id && !mapped.pacienteId) mapped.pacienteId = mapped.patient_id;

        return mapped;
    }
}

export const db = new SupabaseDB();


