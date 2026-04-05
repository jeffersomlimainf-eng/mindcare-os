import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        '[Supabase] ERRO FATAL: Variáveis de ambiente ausentes!\n' +
        `VITE_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌ AUSENTE'}\n` +
        `VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅' : '❌ AUSENTE'}\n` +
        'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel da Vercel.'
    );
    // Mostra erro visível na tela para o usuário
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#f87171;font-family:monospace;padding:2rem;text-align:center;';
    errorDiv.innerHTML = `
        <div style="max-width:500px">
            <h1 style="font-size:1.5rem;margin-bottom:1rem;color:#fbbf24">⚠️ Erro de Configuração</h1>
            <p style="margin-bottom:1rem;color:#94a3b8">As variáveis de ambiente do Supabase não estão configuradas neste ambiente.</p>
            <p style="font-size:0.75rem;color:#64748b">Configure <strong>VITE_SUPABASE_URL</strong> e <strong>VITE_SUPABASE_ANON_KEY</strong> no painel da Vercel e faça um novo deploy.</p>
        </div>
    `;
    document.body.appendChild(errorDiv);
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);


