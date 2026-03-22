const fs = require('fs');
const path = require('path');

const userId = 'cd9962c2-b66f-4bf6-92d8-3e7e7ec3b6e3';
const tenantId = 'tenant_primary';

// Helper to escape strings for SQL
const escape = (str) => {
    if (str === null || str === undefined) return 'NULL';
    if (typeof str === 'object') return `'${JSON.stringify(str).replace(/'/g, "''")}'::jsonb`;
    return `'${String(str).replace(/'/g, "''")}'`;
};

const sqlLines = [];
sqlLines.push('DO $$');
sqlLines.push('DECLARE');
sqlLines.push('    v_p1_id TEXT; v_p2_id TEXT; v_p3_id TEXT; v_p4_id TEXT; v_p5_id TEXT; v_p6_id TEXT; v_p7_id TEXT;');
sqlLines.push('BEGIN');

// 1. Ana Clara Santos (TAG) -> Anamnese
sqlLines.push(`    v_p1_id := gen_random_uuid()::TEXT;`);
sqlLines.push(`    INSERT INTO public.patients (id, tenant_id, user_id, name, email, phone, cpf, birth_date, gender, status, complaint, history, price_per_session) VALUES (` +
    `v_p1_id, ${escape(tenantId)}, '${userId}', 'Ana Clara Santos', 'ana.santos@email.com', '(11) 98765-4321', '123.456.789-00', '1995-08-15', 'Feminino', 'Ativo', 'Crises de pânico recorrentes e insônia.', 'Relata ansiedade desde a adolescência, piorada após ingresso no mestrado.', '150.00');`
);

sqlLines.push(`    INSERT INTO public.docs_anamnese (id, documento_id, tenant_id, user_id, patient_id, patient_name, status, queixa_principal, historico_familiar, expectativas, observacoes_gerais, professional_name, historico_pessoal, historico_medico, sintomas_atuais, tratamentos_anteriores, plano_terapeutico) VALUES (` +
    `gen_random_uuid()::TEXT, gen_random_uuid()::TEXT, ${escape(tenantId)}, '${userId}', v_p1_id, 'Ana Clara Santos', 'Finalizado', 'Crises de pânico e medo de falhar na academia.', 'Mãe com TAG.', 'Aprender técnicas de respiração e regulação.', 'Paciente colaborativa.', 'Dr. Psicólogo Organizado', 'Infância sem traumas.', 'Nenhum relevante.', 'Palpitação, sudorese, medo.', 'Tentou meditação.', 'TCC focada em exposição.');`
);

// 2. Bruno Oliveira (Depressão) -> Laudo
sqlLines.push(`    v_p2_id := gen_random_uuid()::TEXT;`);
sqlLines.push(`    INSERT INTO public.patients (id, tenant_id, user_id, name, email, phone, cpf, birth_date, gender, status, complaint, history) VALUES (` +
    `v_p2_id, ${escape(tenantId)}, '${userId}', 'Bruno Oliveira', 'bruno.o@email.com', '(11) 91234-5678', '987.654.321-11', '1988-04-22', 'Masculino', 'Ativo', 'Falta de energia, tristeza profunda.', 'Depressão recorrente desde perda de emprego.');`
);

sqlLines.push(`    INSERT INTO public.docs_laudo (id, documento_id, tenant_id, user_id, patient_id, patient_name, status, solicitante, identificacao, demanda, procedimento, analise_conclusao, professional_name) VALUES (` +
    `gen_random_uuid()::TEXT, gen_random_uuid()::TEXT, ${escape(tenantId)}, '${userId}', v_p2_id, 'Bruno Oliveira', 'Finalizado', 'O próprio paciente', 'Bruno Oliveira, 38 anos.', 'Avaliação psicológica para fins de afastamento laboral.', '6 sessões de avaliação clínica e testes projetivos.', 'Paciente apresenta sintomas de Episódio Depressivo Maior (F32.1). Recomenda-se psicoterapia e avaliação psiquiátrica.', 'Dr. Psicólogo Organizado');`
);

// 3. Carla Mendes (TDAH) -> Encaminhamento
sqlLines.push(`    v_p3_id := gen_random_uuid()::TEXT;`);
sqlLines.push(`    INSERT INTO public.patients (id, tenant_id, user_id, name, email, phone, cpf, birth_date, gender, status, complaint, history) VALUES (` +
    `v_p3_id, ${escape(tenantId)}, '${userId}', 'Carla Mendes', 'carla.m@email.com', '(11) 92222-3333', '222.333.444-55', '1992-12-05', 'Feminino', 'Ativo', 'Dificuldade de foco e organização.', 'Sempre foi considerada "distraída". Agora impacta no cargo de gerência.');`
);

sqlLines.push(`    INSERT INTO public.docs_encaminhamento (id, documento_id, tenant_id, user_id, patient_id, patient_name, status, especialidade_destino, profissional_destino, clinica_destino, motivo, resumo_clinico, objetivo, urgencia, professional_name) VALUES (` +
    `gen_random_uuid()::TEXT, gen_random_uuid()::TEXT, ${escape(tenantId)}, '${userId}', v_p3_id, 'Carla Mendes', 'Finalizado', 'Neurologia', 'A/C Dr. Especialista', 'Clinica Ideal', 'Avaliação de TDAH em adultos para suporte medicamentoso.', 'Paciente apresenta desatenção e hiperatividade mental há anos.', 'Confirmar diagnóstico e avaliar medicação.', 'Normal', 'Dr. Psicólogo Organizado');`
);

// 4. Diego Almeida (Burnout) -> Atestado
sqlLines.push(`    v_p4_id := gen_random_uuid()::TEXT;`);
sqlLines.push(`    INSERT INTO public.patients (id, tenant_id, user_id, name, email, phone, cpf, birth_date, gender, status, complaint, history) VALUES (` +
    `v_p4_id, ${escape(tenantId)}, '${userId}', 'Diego Almeida', 'diego.a@email.com', '(11) 93333-4444', '333.444.555-66', '1990-07-30', 'Masculino', 'Ativo', 'Esgotamento extremo, irritabilidade.', 'Trabalha 14h por dia em startup. Sintomas físicos de estresse.');`
);

sqlLines.push(`    INSERT INTO public.docs_atestado (id, documento_id, tenant_id, user_id, patient_id, patient_name, status, finalidade, dias_afastamento, cid, parecer, professional_name) VALUES (` +
    `gen_random_uuid()::TEXT, gen_random_uuid()::TEXT, ${escape(tenantId)}, '${userId}', v_p4_id, 'Diego Almeida', 'Finalizado', 'Tratamento de saúde', '15', 'QD85', 'Necessita de afastamento das atividades laborais por esgotamento psicológico.', 'Dr. Psicólogo Organizado');`
);

// 5. Elena Silva (Luto) -> Declaração
sqlLines.push(`    v_p5_id := gen_random_uuid()::TEXT;`);
sqlLines.push(`    INSERT INTO public.patients (id, tenant_id, user_id, name, email, phone, cpf, birth_date, gender, status, complaint, history) VALUES (` +
    `v_p5_id, ${escape(tenantId)}, '${userId}', 'Elena Silva', 'elena.s@email.com', '(11) 94444-5555', '444.555.666-77', '1965-02-14', 'Feminino', 'Ativo', 'Luto e isolamento.', 'Perda do marido há 6 meses. Filhos moram longe.');`
);

sqlLines.push(`    INSERT INTO public.docs_declaracao (id, documento_id, tenant_id, user_id, patient_id, patient_name, status, data_atendimento, hora_inicio, hora_fim, finalidade, professional_name) VALUES (` +
    `gen_random_uuid()::TEXT, gen_random_uuid()::TEXT, ${escape(tenantId)}, '${userId}', v_p5_id, 'Elena Silva', 'Finalizado', CURRENT_DATE, '14:00', '15:00', 'Justificativa de ausência laboral para sessão psicoterápica.', 'Dr. Psicólogo Organizado');`
);

// 6. Fabio Rodrigues (TEPT) -> TCLE
sqlLines.push(`    v_p6_id := gen_random_uuid()::TEXT;`);
sqlLines.push(`    INSERT INTO public.patients (id, tenant_id, user_id, name, email, phone, cpf, birth_date, gender, status, complaint, history) VALUES (` +
    `v_p6_id, ${escape(tenantId)}, '${userId}', 'Fabio Rodrigues', 'fabio.r@email.com', '(11) 95555-6666', '555.666.777-88', '1985-11-12', 'Masculino', 'Ativo', 'Flashbacks e pesadelos.', 'Assalto à mão armada há 3 meses. Evita sair à noite.');`
);

sqlLines.push(`    INSERT INTO public.docs_tcle (id, user_id, paciente_id, paciente_nome, tipo_atendimento, modalidade, status, documento_id, profissional_nome, assinado_paciente, assinado_profissional) VALUES (` +
    `gen_random_uuid(), '${userId}', v_p6_id, 'Fabio Rodrigues', 'Individual', 'Online', 'Assinado', gen_random_uuid()::TEXT, 'Dr. Psicólogo Organizado', true, true);`
);

// 7. Gabriela Costa (TOC) -> Evolução (SOAP)
sqlLines.push(`    v_p7_id := gen_random_uuid()::TEXT;`);
sqlLines.push(`    INSERT INTO public.patients (id, tenant_id, user_id, name, email, phone, cpf, birth_date, gender, status, complaint, history) VALUES (` +
    `v_p7_id, ${escape(tenantId)}, '${userId}', 'Gabriela Costa', 'gabriela.c@email.com', '(11) 96666-7777', '666.777.888-99', '1998-03-25', 'Feminino', 'Ativo', 'Pensamentos intrusivos e rituais de limpeza.', 'Medo de contaminação. Lava as mãos 20x ao dia.');`
);

const soapContent = {
    s: "Paciente relata ansiedade alta de manhã antes de sair de casa. Medos de 'levar germes' para a mãe.",
    o: "Demonstrou mãos ressecadas pelo uso de álcool. Postura tensa.",
    a: "TOC com rituais de lavagem. Compreende a irrationalidade mas cede à compulsão para aliviar a angústia.",
    p: "Iniciar exercícios de ERP (Exposição) leves: tocar na maçaneta da porta e retardar a lavagem por 2 min."
};

sqlLines.push(`    INSERT INTO public.evolutions (id, tenant_id, user_id, patient_id, patient_name, data_hora, type, status, professional_name, content_soap, humor, risk_level, format) VALUES (` +
    `gen_random_uuid()::TEXT, ${escape(tenantId)}, '${userId}', v_p7_id, 'Gabriela Costa', NOW(), 'Sessão', 'Finalizado', 'Dr. Psicólogo Organizado', ${escape(soapContent)}, 'Ansioso', 'Baixo', 'Presencial');`
);

sqlLines.push('END $$;');

const sqlContent = sqlLines.join('\n');
fs.writeFileSync(path.join(__dirname, 'populate_data.sql'), sqlContent);
console.log('SQL file generated successfully.');
