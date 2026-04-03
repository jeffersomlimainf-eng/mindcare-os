import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rwqiptuxjnnuoolxslio.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cWlwdHV4am5udW9vbHhzbGlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDczOTIsImV4cCI6MjA4ODk4MzM5Mn0.H__h91Iti-fapVmbfOL090en40K-S5qqQH4EhLl0TD8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});


