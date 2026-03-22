const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('c:/Users/Jeferson Lima/Desktop/trabalho/MindCare OS/key/admin.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const { window } = dom;

// Mock data
const userData = {
    id: 'cd9962c2-b66f-4bf6-92d8-3e7e7ec3b6e3',
    email: 'psicologoorganizado@meusistemapsi.com.br',
    created_at: '2025-01-01T00:00:00Z',
    profile: {
        full_name: 'Psicologo Organizado',
        phone: '(44) 98888-8888',
        crp: '06/123456',
        plan_status: 'Ativo'
    }
};

// Call the function
try {
    window.openEditModal(userData);
    const input = window.document.getElementById('edit-phone');
    const nameInput = window.document.getElementById('edit-name');
    console.log("Input edit-name value:", nameInput.value);
    console.log("Input edit-phone value:", input.value);
    if (!input.value) {
        console.log("BUG REPLICATED: Value is EMPTY!");
    } else {
        console.log("Value is set correctly in JSDOM.");
    }
} catch (e) {
    console.error("Error running openEditModal:", e);
}
