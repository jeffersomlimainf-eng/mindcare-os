import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkEmail() {
    const email = 'insidecursosonline@gmail.com';
    console.log(`Buscando e-mail: ${email}...`);
    
    const { data: profiles, error: errP } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email);
    
    if (errP) {
        console.error('Erro ao buscar profile:', errP);
    } else {
        console.log('Profiles encontrados:', profiles);
    }
}

checkEmail();
