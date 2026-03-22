-- Initial Schema for MindCare OS
-- Based on the local database structure (db.js)

-- Enable RLS
-- Each table will have a tenant_id to ensure data isolation.

-- 1. Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles (Users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    crp TEXT,
    phone TEXT,
    specialty TEXT,
    plan_id TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    configurations JSONB DEFAULT '{"notifEmail": true, "notifWhatsapp": false, "notifLembrete": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Patients
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY, -- Using TEXT to maintain compatibility with #MC-XXXX IDs
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    cpf TEXT,
    birth_date DATE,
    gender TEXT,
    status TEXT DEFAULT 'Ativo',
    color TEXT,
    initials TEXT,
    address_zip TEXT,
    address_street TEXT,
    address_number TEXT,
    address_neighborhood TEXT,
    address_city TEXT,
    address_state TEXT,
    complaint TEXT,
    history TEXT,
    price_per_session TEXT,
    health_plan TEXT,
    is_minor BOOLEAN DEFAULT FALSE,
    responsible_data JSONB,
    marital_status TEXT,
    profession TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id TEXT REFERENCES patients(id) ON DELETE SET NULL,
    patient_name TEXT,
    data DATE NOT NULL,
    time_start FLOAT, -- Local DB uses numbers like 10.5
    duration INTEGER DEFAULT 60,
    status TEXT DEFAULT 'confirmado',
    type TEXT DEFAULT 'presencial',
    recurrence TEXT DEFAULT 'unica',
    obs TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Evolutions
CREATE TABLE IF NOT EXISTS evolutions (
    id TEXT PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
    patient_name TEXT,
    data_hora TIMESTAMPTZ,
    type TEXT,
    status TEXT DEFAULT 'Finalizado',
    professional_name TEXT,
    content_soap JSONB, -- For subjective, objective, assessment, plan
    techniques JSONB DEFAULT '[]',
    observations TEXT,
    humor TEXT,
    risk_level TEXT,
    format TEXT DEFAULT 'SOAP',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Finance
CREATE TABLE IF NOT EXISTS finance (
    id TEXT PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- Receita / Despesa
    description TEXT,
    value NUMERIC(15,2),
    date DATE,
    due_date DATE,
    status TEXT, -- Pago / Pendente / Recebido
    payment_method TEXT,
    category TEXT,
    subcategory TEXT,
    group_id TEXT,
    current_installment INTEGER,
    total_installments INTEGER,
    frequency TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Document: Laudo
CREATE TABLE IF NOT EXISTS docs_laudo (
    id TEXT PRIMARY KEY,
    documento_id TEXT,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
    patient_name TEXT,
    status TEXT,
    solicitante TEXT,
    identificacao TEXT,
    demanda TEXT,
    procedimento TEXT,
    analise_conclusao TEXT,
    professional_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Document: Atestado
CREATE TABLE IF NOT EXISTS docs_atestado (
    id TEXT PRIMARY KEY,
    documento_id TEXT,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
    patient_name TEXT,
    status TEXT,
    finalidade TEXT,
    dias_afastamento TEXT,
    cid TEXT,
    parecer TEXT,
    professional_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Document: Declaracao
CREATE TABLE IF NOT EXISTS docs_declaracao (
    id TEXT PRIMARY KEY,
    documento_id TEXT,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
    patient_name TEXT,
    status TEXT,
    data_atendimento DATE,
    hora_inicio TEXT,
    hora_fim TEXT,
    finalidade TEXT,
    professional_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Document: Anamnese
CREATE TABLE IF NOT EXISTS docs_anamnese (
    id TEXT PRIMARY KEY,
    documento_id TEXT,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
    patient_name TEXT,
    status TEXT,
    queixa_principal TEXT,
    historico_familiar TEXT,
    expectativas TEXT,
    observacoes_gerais TEXT,
    professional_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Document: Encaminhamento
CREATE TABLE IF NOT EXISTS docs_encaminhamento (
    id TEXT PRIMARY KEY,
    documento_id TEXT,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
    patient_name TEXT,
    status TEXT,
    especialidade_destino TEXT,
    profissional_destino TEXT,
    clinica_destino TEXT,
    motivo TEXT,
    resumo_clinico TEXT,
    objetivo TEXT,
    urgencia TEXT,
    professional_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_laudo ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_atestado ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_declaracao ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_anamnese ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_encaminhamento ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Isolation by tenant_id)
-- Note: Simplified for migration script (admin access might be needed for initial upload)
