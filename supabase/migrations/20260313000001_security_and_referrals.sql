-- Security Enhancement: Multi-tenant focus and Referrals table
-- This migration adds RLS policies to existing tables and creates the referrals table.

-- 1. Create Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    referral_email TEXT,
    referral_contact TEXT, -- Can be name or email
    status TEXT DEFAULT 'Pendente', -- Pendente, Cadastrado, Assinou
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- 2. Create Helper Function to get Current User's Tenant ID
-- This makes policies cleaner and potentially faster.
CREATE OR REPLACE FUNCTION auth_tenant_id() 
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. RLS Policies for Tenants
-- Users should be able to see their own tenant details.
CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT USING (id = auth_tenant_id());

-- 4. RLS Policies for Profiles
-- Users can view all profiles in their tenant (team) and edit their own.
CREATE POLICY "Users can view team profiles" ON profiles
    FOR SELECT USING (tenant_id = auth_tenant_id());

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- 5. RLS Policies for Patients
CREATE POLICY "Tenant isolation for patients" ON patients
    FOR ALL USING (tenant_id = auth_tenant_id());

-- 6. RLS Policies for Appointments
CREATE POLICY "Tenant isolation for appointments" ON appointments
    FOR ALL USING (tenant_id = auth_tenant_id());

-- 7. RLS Policies for Evolutions
CREATE POLICY "Tenant isolation for evolutions" ON evolutions
    FOR ALL USING (tenant_id = auth_tenant_id());

-- 8. RLS Policies for Finance
CREATE POLICY "Tenant isolation for finance" ON finance
    FOR ALL USING (tenant_id = auth_tenant_id());

-- 9. RLS Policies for Documents (Laudo, Atestado, Declaracao, Anamnese, Encaminhamento)
CREATE POLICY "Tenant isolation for docs_laudo" ON docs_laudo FOR ALL USING (tenant_id = auth_tenant_id());
CREATE POLICY "Tenant isolation for docs_atestado" ON docs_atestado FOR ALL USING (tenant_id = auth_tenant_id());
CREATE POLICY "Tenant isolation for docs_declaracao" ON docs_declaracao FOR ALL USING (tenant_id = auth_tenant_id());
CREATE POLICY "Tenant isolation for docs_anamnese" ON docs_anamnese FOR ALL USING (tenant_id = auth_tenant_id());
CREATE POLICY "Tenant isolation for docs_encaminhamento" ON docs_encaminhamento FOR ALL USING (tenant_id = auth_tenant_id());

-- 10. RLS Policies for Referrals
CREATE POLICY "Tenant isolation for referrals" ON referrals
    FOR ALL USING (tenant_id = auth_tenant_id());

-- 11. Support for Admin Edge Functions (bypass RLS using service_role)
-- Note: Service role automatically bypasses RLS, so no extra policy needed for it.
