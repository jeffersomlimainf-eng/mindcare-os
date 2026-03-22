const url = 'https://rwqiptuxjnnuoolxslio.supabase.co/rest/v1/?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cWlwdHV4am5udW9vbHhzbGlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDczOTIsImV4cCI6MjA4ODk4MzM5Mn0.H__h91Iti-fapVmbfOL090en40K-S5qqQH4EhLl0TD8';

const res = await fetch(url);
const swagger = await res.json();
for (let def in swagger.definitions) {
    if (swagger.definitions[def].properties && swagger.definitions[def].properties.id) {
        console.log(`${def}: ${swagger.definitions[def].properties.id.format}`);
    }
}
