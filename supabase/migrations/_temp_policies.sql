-- patient_mood_logs
DROP POLICY IF EXISTS "Patient can manage own mood logs" ON patient_mood_logs;
CREATE POLICY "Patient can manage own mood logs" ON patient_mood_logs
    FOR ALL USING (patient_profile_id = auth.uid());

DROP POLICY IF EXISTS "Therapist can view patient mood logs" ON patient_mood_logs;
CREATE POLICY "Therapist can view patient mood logs" ON patient_mood_logs
    FOR SELECT USING (
        patient_profile_id IN (
            SELECT patient_profile_id FROM patients
            WHERE user_id = auth.uid() AND patient_profile_id IS NOT NULL
        )
    );

-- patient_tasks
DROP POLICY IF EXISTS "Patient can view and update own tasks" ON patient_tasks;
CREATE POLICY "Patient can view and update own tasks" ON patient_tasks
    FOR ALL USING (patient_profile_id = auth.uid());

DROP POLICY IF EXISTS "Therapist can manage patient tasks" ON patient_tasks;
CREATE POLICY "Therapist can manage patient tasks" ON patient_tasks
    FOR ALL USING (
        therapist_id = auth.uid()
        OR patient_profile_id IN (
            SELECT patient_profile_id FROM patients
            WHERE user_id = auth.uid() AND patient_profile_id IS NOT NULL
        )
    );

-- profiles
DROP POLICY IF EXISTS "Patient can read own profile" ON profiles;
CREATE POLICY "Patient can read own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Patient can read therapist profile" ON profiles;
CREATE POLICY "Patient can read therapist profile" ON profiles
    FOR SELECT USING (
        id IN (SELECT user_id FROM patients WHERE patient_profile_id = auth.uid())
    );
