const fs = require('fs');
const path = require('path');

const map = {
    'Ã udio': 'Áudio',
    'Ã s ': 'às ',
    'Ã  ': 'à ',
    'ao(Ã )': 'ao(à)',
    'ðŸ“ ': '📝',
    'ðŸ§ ': '🧠',
    'ðŸ” ': '🔍',
    'ðŸ› ï¸ ': '🛠️',
    'â “': '❓',
    'ðŸŽ‚': '🎂',
    'ðŸ“–': '📖',
    'CLÃ NICA': 'CLÍNICA',
    'IMPRESSÃƒO': 'IMPRESSÃO'
};

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jsx') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('c:/Users/Jeferson Lima/Desktop/trabalho/Meu Sistema PSI/src/');
let fixedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    const entries = Object.entries(map).sort((a,b) => b[0].length - a[0].length);
    for (const [key, value] of entries) {
        content = content.split(key).join(value);
    }
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Reparado Resíduos Finais:', path.basename(file));
        fixedCount++;
    }
});
console.log('Total resolvido final:', fixedCount);

