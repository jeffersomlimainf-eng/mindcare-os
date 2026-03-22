const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://rwqiptuxjnnuoolxslio.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cWlwdHV4am5udW9vbHhzbGlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDczOTIsImV4cCI6MjA4ODk4MzM5Mn0.H__h91Iti-fapVmbfOL090en40K-S5qqQH4EhLl0TD8';

const BACKUP_PATH = path.join(__dirname, '..', 'backups', 'backup_mindcare_2026-03-09.json');

async function supabaseRequest(table, method, body = null) {
    const url = `${SUPABASE_URL}/rest/v1/${table}`;
    const options = {
        method,
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Error in ${table} (${method}): ${error}`);
    }
    return response.json();
}

const parseSafely = (val) => {
    if (!val) return [];
    try {
        return JSON.parse(val);
    } catch (e) {
        console.warn('⚠️ Erro ao ripar JSON:', e.message);
        return [];
    }
}

async function migrate() {
    console.log('🚀 Iniciando migração de dados normalizada...');

    try {
        const rawBackup = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf-8'));
        
        let tenantId;
        const existingTenants = await supabaseRequest('tenants?select=id', 'GET');
        if (existingTenants.length > 0) {
            tenantId = existingTenants[0].id;
        } else {
            const tenant = await supabaseRequest('tenants', 'POST', { name: 'MindCare Primary Tenant' });
            tenantId = tenant[0].id;
        }
        console.log(`✅ Tenant: ${tenantId}`);

        // 2. Migrar Pacientes
        const patientsRaw = parseSafely(rawBackup.mindcare_patients);
        if (patientsRaw.length > 0) {
            console.log(`👥 Migrando ${patientsRaw.length} pacientes...`);
            const patients = patientsRaw.map(p => ({
                id: p.id || null,
                tenant_id: tenantId,
                name: p.nome || 'Sem Nome',
                email: p.email || null,
                phone: p.telefone || null,
                cpf: p.cpf || null,
                birth_date: p.dataNascimento || p.nascimento || null,
                gender: p.genero || null,
                status: p.status || 'Ativo',
                color: p.cor || null,
                initials: p.iniciais || null,
                address_zip: p.cep || null,
                address_street: p.rua || null,
                address_number: p.numero || null,
                address_neighborhood: p.bairro || null,
                address_city: p.cidade || null,
                address_state: p.estado || null,
                complaint: p.queixa || null,
                history: p.historico || null,
                price_per_session: String(p.precoSessao || ''),
                health_plan: p.plano || null,
                is_minor: !!p.isMenor,
                responsible_data: p.dadosResponsavel || p.responsavel || null,
                marital_status: p.estadoCivil || null,
                profession: p.profissao || null,
                created_at: p.criadoEm || new Date().toISOString(),
                updated_at: new Date().toISOString()
            }));
            await supabaseRequest('patients', 'POST', patients);
            console.log('✅ Pacientes migrados.');
        }

        // 3. Migrar Agendamentos
        const appointmentsRaw = parseSafely(rawBackup.mindcare_appointments);
        if (appointmentsRaw.length > 0) {
            console.log(`📅 Migrando ${appointmentsRaw.length} agendamentos...`);
            const appointments = appointmentsRaw.map(a => ({
                tenant_id: tenantId,
                patient_id: a.pacienteId || null,
                patient_name: a.paciente || null,
                data: (typeof a.data === 'string' && a.data.includes('de mar.')) ? '2026-03-08' : (a.data || null),
                time_start: parseFloat(a.horaInicio || a.hora || 9),
                duration: parseInt(a.duracao || 60),
                status: a.status || 'confirmado',
                type: a.tipo || 'presencial',
                recurrence: a.recorrencia || 'unica',
                obs: a.obs || a.observacoes || null
            }));
            await supabaseRequest('appointments', 'POST', appointments);
            console.log('✅ Agendamentos migrados.');
        }

        // 4. Migrar Evoluções
        const evolutionsRaw = parseSafely(rawBackup.mindcare_evolutions);
        if (evolutionsRaw.length > 0) {
            console.log(`📝 Migrando ${evolutionsRaw.length} evoluções...`);
            const evolutions = evolutionsRaw.map(e => ({
                id: String(e.id),
                tenant_id: tenantId,
                patient_id: e.pacienteId || null,
                patient_name: e.pacienteNome || null,
                data_hora: e.dataHora || e.criadoEm || new Date().toISOString(),
                type: e.tipo || e.tipoAtendimento || null,
                status: e.status || 'Finalizado',
                professional_name: e.profissionalNome || null,
                content_soap: { 
                    subjetivo: e.subjetivo || null, objetivo: e.objetivo || null, 
                    avaliacao: e.analise || e.avaliacao || null, plano: e.plano || null 
                },
                techniques: e.tecnicas || [],
                observations: e.observacoes || null,
                humor: e.humor || e.humorPaciente || null,
                risk_level: e.risco || e.nivelRisco || null,
                format: e.formato || 'SOAP',
                created_at: e.criadoEm || new Date().toISOString(),
                updated_at: e.atualizadoEm || new Date().toISOString()
            }));
            await supabaseRequest('evolutions', 'POST', evolutions);
            console.log('✅ Evoluções migradas.');
        }

        // 5. Migrar Financeiro
        const transactionsRaw = parseSafely(rawBackup.mindcare_transactions);
        if (transactionsRaw.length > 0) {
            console.log(`💰 Migrando ${transactionsRaw.length} registros financeiros...`);
            const finance = transactionsRaw.map(f => ({
                id: String(f.id),
                tenant_id: tenantId,
                type: f.tipo || 'Receita',
                description: f.desc || f.descricao || null,
                value: parseFloat(f.valor || 0),
                date: (typeof f.data === 'string' && f.data.length > 10) ? f.data.substring(0,10) : (f.data || null),
                due_date: f.dataVencimento || null,
                status: f.status || null,
                payment_method: f.formaPag || null,
                category: f.categoria || null,
                subcategory: f.subcategoria || null,
                group_id: f.groupId || null,
                current_installment: f.parcelaAtual || 1,
                total_installments: f.totalParcelas || f.parcelas || 1,
                frequency: f.frequencia || null,
                created_at: f.criadoEm || new Date().toISOString(),
                updated_at: new Date().toISOString()
            }));
            await supabaseRequest('finance', 'POST', finance);
            console.log('✅ Financeiro migrado.');
        }

        // 6. Migrar Documentos
        const docMappings = [
            { key: 'mindcare_laudos', table: 'docs_laudo', mapper: (d) => ({
                id: String(d.id), documento_id: d.documentoId || null, tenant_id: tenantId, patient_id: d.pacienteId || null, patient_name: d.pacienteNome || null, status: d.status || 'Rascunho',
                solicitante: d.solicitante || null, identificacao: d.identificacao || null, demanda: d.demanda || null, procedimento: d.procedimento || null,
                analise_conclusao: d.analiseConclusao || null, professional_name: d.profissionalNome || null, created_at: d.criadoEm || new Date().toISOString(), updated_at: d.atualizadoEm || new Date().toISOString()
            })},
            { key: 'mindcare_atestados', table: 'docs_atestado', mapper: (d) => ({
                id: String(d.id), documento_id: d.documentoId || null, tenant_id: tenantId, patient_id: d.pacienteId || null, patient_name: d.pacienteNome || null, status: d.status || 'Rascunho',
                finalidade: d.finalidade || null, dias_afastamento: String(d.diasAfastamento || ''), cid: d.cid || null, parecer: d.parecer || null,
                professional_name: d.profissionalNome || null, created_at: d.criadoEm || new Date().toISOString(), updated_at: d.atualizadoEm || new Date().toISOString()
            })},
            { key: 'mindcare_declaracoes', table: 'docs_declaracao', mapper: (d) => ({
                id: String(d.id), documento_id: d.documentoId || null, tenant_id: tenantId, patient_id: d.pacienteId || null, patient_name: d.pacienteNome || null, status: d.status || 'Rascunho',
                data_atendimento: d.dataAtendimento || null, hora_inicio: d.horaInicio || null, hora_fim: d.horaFim || null, finalidade: d.finalidade || null,
                professional_name: d.profissionalNome || null, created_at: d.criadoEm || new Date().toISOString(), updated_at: d.atualizadoEm || new Date().toISOString()
            })},
            { key: 'mindcare_anamneses', table: 'docs_anamnese', mapper: (d) => ({
                id: String(d.id), documento_id: d.documentoId || null, tenant_id: tenantId, patient_id: d.pacienteId || null, patient_name: d.pacienteNome || null, status: d.status || 'Rascunho',
                queixa_principal: d.queixaPrincipal || null, historico_familiar: d.historicoFamiliar || null, expectativas: d.expectativas || null,
                observacoes_gerais: d.observacoesGerais || null, professional_name: d.profissionalNome || null, created_at: d.criadoEm || new Date().toISOString(), updated_at: d.atualizadoEm || new Date().toISOString()
            })},
            { key: 'mindcare_encaminhamentos', table: 'docs_encaminhamento', mapper: (d) => ({
                id: String(d.id), documento_id: d.documentoId || null, tenant_id: tenantId, patient_id: d.pacienteId || null, patient_name: d.pacienteNome || null, status: d.status || 'Rascunho',
                especialidade_destino: d.especialidadeDestino || null, profissional_destino: d.profissionalDestino || null,
                clinica_destino: d.clinicaDestino || null, motivo: d.motivo || null, resumo_clinico: d.resumoClinico || null, objetivo: d.objetivo || null,
                urgencia: d.urgencia || null, professional_name: d.profissionalNome || null, created_at: d.criadoEm || new Date().toISOString(), updated_at: d.atualizadoEm || new Date().toISOString()
            })}
        ];

        for (const {key, table, mapper} of docMappings) {
            const docsRaw = parseSafely(rawBackup[key]);
            if (docsRaw.length > 0) {
                console.log(`📄 Migrando ${docsRaw.length} registros para ${table}...`);
                const docs = docsRaw.map(mapper);
                await supabaseRequest(table, 'POST', docs);
                console.log(`✅ ${table} migrado.`);
            }
        }

        console.log('⭐️ Migração finalizada com sucesso total!');

    } catch (error) {
        console.error('❌ Erro durante a migração:', error.message);
        process.exit(1);
    }
}

migrate();
