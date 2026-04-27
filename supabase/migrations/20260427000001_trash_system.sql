-- Migration: 20260427000001_trash_system.sql
-- Descrição: Sistema de Lixeira para Soft Delete

CREATE TABLE IF NOT EXISTS trash (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_id TEXT NOT NULL,
    table_name TEXT NOT NULL,
    data JSONB NOT NULL,
    deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
    deleted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE trash ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança
CREATE POLICY "Users can view their own trash"
    ON trash FOR SELECT
    USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert into trash"
    ON trash FOR INSERT
    WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete from their own trash"
    ON trash FOR DELETE
    USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_trash_tenant_id ON trash(tenant_id);
CREATE INDEX IF NOT EXISTS idx_trash_table_name ON trash(table_name);
