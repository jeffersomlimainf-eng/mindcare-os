const fs = require('fs');
const path = require('path');

const map = {
    'Ã ': 'à',
    'Ã ': 'Á',
    'â†’': '→',
    'âš ï¸ ': '⚠️',
    'âš ': '⚠',
    'ðŸ“ ': '📝',
    'ðŸ§ ': '🧠',
    'âœ…': '✅',
    'â”€': '─',
    'Ãƒ': 'Ã',
    'Ã’': 'Ò',
    'Ã•': 'Õ',
    'Ãš': 'Ú',
    'Ã›': 'Û',
    'Ãœ': 'Ü',
    'Ã”': 'Ô',
    'ÃŽ': 'Î',
    'Ã ': 'À',
    'ÃŠ': 'Ê',
    'Ã€': 'À',
    'Ã‚': 'Â',
    'Ãƒ': 'Ã'
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
    
    // As emojis costumam ter de 3 a 4 bytes e sujam muito, vamos iterar na ordem exata
    const entries = Object.entries(map).sort((a,b) => b[0].length - a[0].length);
    for (const [key, value] of entries) {
        content = content.split(key).join(value);
    }
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Reparado Caracteres Raros:', path.basename(file));
        fixedCount++;
    }
});
console.log('Total resolvido:', fixedCount);

