const { createClient } = require('@supabase/supabase-js');

const AUTO_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cWlwdHV4am5udW9vbHhzbGlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQwNzM5MiwiZXhwIjoyMDg4OTgzMzkyfQ.49ASWVjoRw0AzTAS7XnUAo9SXv1x20PrrHaWVk4_y2U';
const AUTO_URL = 'https://rwqiptuxjnnuoolxslio.supabase.co';

async function test() {
    const supabaseClient = createClient(AUTO_URL, AUTO_KEY);
    
    // 1. Create a dummy User
    const email = `test_delete_${Date.now()}@example.com`;
    console.log("Creating user:", email);
    
    const { data: authData, error: errAuth } = await supabaseClient.auth.admin.createUser({
        email,
        password: 'Password123',
        email_confirm: true
    });
    if (errAuth) { console.error("Auth creation failed:", errAuth); return; }
    
    const uid = authData.user.id;
    console.log("User created with ID:", uid);

    // 2. Create Dummy Profile
    await supabaseClient.from('profiles').insert({
        id: uid,
        full_name: 'Test Delete User',
        email: email,
        plan_status: 'Ativo'
    });

    // 3. Create a Dummy Patient referencing this profile
    const { error: errPatient } = await supabaseClient.from('patients').insert({
        user_id: uid,
        name: 'Test Patient',
        tenant_id: 'test_tenant'
    });
    
    if (errPatient) {
         console.log("Patient insertion failed (which might be expected due to missing parent, etc.):", errPatient.message);
    } else {
         console.log("Patient created referencing user profile.");
    }

    // 4. Try to Delete User from Auth
    console.log("\nAttempting to delete user from auth.users...");
    const { error: errDelete } = await supabaseClient.auth.admin.deleteUser(uid);
    
    if (errDelete) {
        console.log("\n[+] DELETE FAILED AS EXPECTED!");
        console.log("Error Message:", errDelete.message);
    } else {
        console.log("\n[-] DELETE SUCCEEDED? Let's check if data is gone!");
        // Check profile
        const { data: prof } = await supabaseClient.from('profiles').select('*').eq('id', uid);
        console.log("Profile row exists:", prof.length > 0);
        
        // Cleanup patients if still there
        await supabaseClient.from('patients').delete().eq('user_id', uid);
    }

    // General Cleanup of the test account if delete failed
    await supabaseClient.from('patients').delete().eq('user_id', uid);
    await supabaseClient.from('profiles').delete().eq('id', uid);
    await supabaseClient.auth.admin.deleteUser(uid);
}

test();
