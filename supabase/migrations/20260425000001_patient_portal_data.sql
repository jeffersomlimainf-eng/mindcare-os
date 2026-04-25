-- Patient portal: allow patients to read their own appointments and finance records

-- appointments: patient reads their own
DROP POLICY IF EXISTS "Patient can read own appointments" ON appointments;
CREATE POLICY "Patient can read own appointments"
ON appointments FOR SELECT
USING (
    patient_id IN (
        SELECT id FROM patients WHERE patient_profile_id = auth.uid() AND patient_profile_id IS NOT NULL
    )
);

-- finance: patient reads their own pending/paid records
DROP POLICY IF EXISTS "Patient can read own finance" ON finance;
CREATE POLICY "Patient can read own finance"
ON finance FOR SELECT
USING (
    patient_id IN (
        SELECT id FROM patients WHERE patient_profile_id = auth.uid() AND patient_profile_id IS NOT NULL
    )
);
