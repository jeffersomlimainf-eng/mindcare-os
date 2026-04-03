const fs = require('fs');
const path = require('path');

const file = 'c:\\Users\\Jeferson Lima\\Desktop\\trabalho\\Meu Sistema PSI\\src\\pages\\Register.jsx';
let content = fs.readFileSync(file, 'utf8');

// Regex highly flexible to find the multi-line Nome Completo field div
const regex = /(<div>\s*<label[^>]*>\s*Nome Completo\s*<\/label>[\s\S]*?<input[\s\S]*?value=\{nome\}[\s\S]*?\/>\s*<\/div>)/;

const insertStr = `<div>
                                     <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 uppercase tracking-wider opacity-60">Nome Completo</label>
                                     <input
                                         type="text"
                                         value={nome}
                                         onChange={e => setNome(e.target.value)}
                                         className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 px-4 text-sm font-medium text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                         placeholder="Seu nome completo"
                                         required
                                     />
                                 </div>
 
                                 <div>
                                     <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 uppercase tracking-wider opacity-60">CPF / CNPJ</label>
                                     <input
                                         type="text"
                                         value={cpfCnpj}
                                         onChange={e => setCpfCnpj(e.target.value)}
                                         className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 px-4 text-sm font-medium text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                         placeholder="000.000.000-00 ou CNPJ"
                                         required
                                     />
                                 </div>`;

if (regex.test(content)) {
    content = content.replace(regex, insertStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Success: CPF/CNPJ field added');
} else {
    console.log('Error: Target string not found with regex');
}

