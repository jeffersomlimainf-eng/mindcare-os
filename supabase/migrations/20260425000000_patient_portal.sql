-- Patient Portal Migration
-- Run this in Supabase SQL Editor or via: supabase db push

-- 1. Add patient_profile_id to patients (links patient to their auth user)
ALTER TABLE patients
    ADD COLUMN IF NOT EXISTS patient_profile_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Add role to profiles (distinguishes 'psicologo' from 'paciente')
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'psicologo';

-- 3. Patient Mood Logs
CREATE TABLE IF NOT EXISTS patient_mood_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id  TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
    mood        TEXT NOT NULL CHECK (mood IN ('muito_baixo','baixo','neutro','bom','muito_bom')),
    note        TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_mood_logs ENABLE ROW LEVEL SECURITY;

-- Paciente vê e insere seus próprios logs
CREATE POLICY "Patient can manage own mood logs" ON patient_mood_logs
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM patients WHERE patient_profile_id = auth.uid()
        )
    );

-- Terapeuta vê logs dos seus pacientes
CREATE POLICY "Therapist can view patient mood logs" ON patient_mood_logs
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

-- 4. Patient Tasks
CREATE TABLE IF NOT EXISTS patient_tasks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id    TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    therapist_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title         TEXT NOT NULL,
    description   TEXT,
    due_date      DATE,
    status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed')),
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_tasks ENABLE ROW LEVEL SECURITY;

-- Paciente vê e atualiza suas próprias tarefas
CREATE POLICY "Patient can view and update own tasks" ON patient_tasks
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM patients WHERE patient_profile_id = auth.uid()
        )
    );

-- Terapeuta gerencia tarefas dos seus pacientes
CREATE POLICY "Therapist can manage patient tasks" ON patient_tasks
    FOR ALL USING (
        therapist_id = auth.uid()
        OR patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

-- 5. Patient Escalas (future use)
CREATE TABLE IF NOT EXISTS patient_escalas (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id  TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nome        TEXT NOT NULL,
    status      TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','respondida')),
    respostas   JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_escalas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient can view own escalas" ON patient_escalas
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE patient_profile_id = auth.uid()
        )
    );

CREATE POLICY "Patient can update own escalas" ON patient_escalas
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM patients WHERE patient_profile_id = auth.uid()
        )
    );

CREATE POLICY "Therapist can manage patient escalas" ON patient_escalas
    FOR ALL USING (
        therapist_id = auth.uid()
        OR patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

-- 6. Allow patients to read their own profile
DROP POLICY IF EXISTS "Patient can read own profile" ON profiles;
CREATE POLICY "Patient can read own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

-- 7. Allow patients to read their therapist's profile (for PatientPerfil)
DROP POLICY IF EXISTS "Patient can read therapist profile" ON profiles;
CREATE POLICY "Patient can read therapist profile" ON profiles
    FOR SELECT USING (
        id IN (
            SELECT user_id FROM patients WHERE patient_profile_id = auth.uid()
        )
    );
