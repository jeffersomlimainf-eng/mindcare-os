const url = 'https://rwqiptuxjnnuoolxslio.supabase.co/rest/v1/?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cWlwdHV4am5udW9vbHhzbGlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDczOTIsImV4cCI6MjA4ODk4MzM5Mn0.H__h91Iti-fapVmbfOL090en40K-S5qqQH4EhLl0TD8';
fetch(url).then(res => res.json()).then(swagger => {
    console.log(JSON.stringify(swagger.definitions.patients, null, 2));
});
