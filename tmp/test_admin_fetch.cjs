const { createClient } = require('@supabase/supabase-js');

const AUTO_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cWlwdHV4am5udW9vbHhzbGlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQwNzM5MiwiZXhwIjoyMDg4OTgzMzkyfQ.49ASWVjoRw0AzTAS7XnUAo9SXv1x20PrrHaWVk4_y2U';
const AUTO_URL = 'https://rwqiptuxjnnuoolxslio.supabase.co';

async function test() {
    const supabaseClient = createClient(AUTO_URL, AUTO_KEY);
    
    // Auth users
    const { data: authUsers, error: errA } = await supabaseClient.auth.admin.listUsers();
    if (errA) { console.error("A", errA); return; }

    // Profiles
    const { data: profiles, error: errP } = await supabaseClient.from('profiles').select('*');
    if (errP) { console.error("P", errP); return; }

    const targetEmail = 'psicologoorganizado@meusistemapsi.com.br';
    const authUser = authUsers.users.find(u => u.email === targetEmail);
    
    if (!authUser) {
        console.log("User not found in Auth");
        return;
    }

    const profile = profiles.find(p => p.id === authUser.id);
    console.log(`\n=== DATAT FOR ${targetEmail} ===`);
    console.log("Auth ID:", authUser.id);
    if (!profile) {
        console.log("Profile NOT FOUND in profiles table for this auth ID!");
    } else {
        console.log("Profile found!");
        console.log("Full Name:", profile.full_name);
        console.log("Phone:", profile.phone);
        console.log("Keys in profile:", Object.keys(profile));
    }
}

test();
