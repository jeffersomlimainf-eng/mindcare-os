-- Portal Schema Fixes
-- Aligns patient_escalas, patient_tasks, and patient_mood_logs with the actual app code

-- ── patient_escalas ────────────────────────────────────────────────────────────
ALTER TABLE patient_escalas
    ADD COLUMN IF NOT EXISTS escala_id        TEXT,
    ADD COLUMN IF NOT EXISTS instrucoes       TEXT,
    ADD COLUMN IF NOT EXISTS questions        JSONB,
    ADD COLUMN IF NOT EXISTS response_options JSONB,
    ADD COLUMN IF NOT EXISTS response_labels  JSONB,
    ADD COLUMN IF NOT EXISTS answers          JSONB,
    ADD COLUMN IF NOT EXISTS answered_at      TIMESTAMPTZ;

-- ── patient_tasks ──────────────────────────────────────────────────────────────
-- App code uses a `completed` boolean; table only had a `status` text field.
ALTER TABLE patient_tasks
    ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Sync existing rows
UPDATE patient_tasks SET completed = TRUE WHERE status = 'completed';

-- ── patient_mood_logs ─────────────────────────────────────────────────────────
-- Original migration used (patient_id TEXT NOT NULL, mood TEXT NOT NULL).
-- App code uses (patient_profile_id UUID, mood_level INTEGER).
-- Add the new columns and make old ones nullable so inserts don't fail.
ALTER TABLE patient_mood_logs
    ADD COLUMN IF NOT EXISTS patient_profile_id UUID,
    ADD COLUMN IF NOT EXISTS mood_level         INTEGER;

ALTER TABLE patient_mood_logs
    ALTER COLUMN patient_id DROP NOT NULL,
    ALTER COLUMN mood        DROP NOT NULL;

-- Re-create RLS policy that uses patient_profile_id (the auth.uid())
DROP POLICY IF EXISTS "Patient can manage own mood logs" ON patient_mood_logs;
CREATE POLICY "Patient can manage own mood logs" ON patient_mood_logs
    FOR ALL USING (patient_profile_id = auth.uid());

-- Therapist still sees logs for their patients (via patient_id on the patients table)
DROP POLICY IF EXISTS "Therapist can view patient mood logs" ON patient_mood_logs;
CREATE POLICY "Therapist can view patient mood logs" ON patient_mood_logs
    FOR SELECT USING (
        patient_profile_id IN (
            SELECT patient_profile_id FROM patients WHERE user_id = auth.uid()
        )
    );
