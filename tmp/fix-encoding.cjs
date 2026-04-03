const fs = require('fs');
const path = require('path');

const map = {
    'Ã£': 'ã',
    'Ã§': 'ç',
    'Ãµ': 'õ',
    'Ã³': 'ó',
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã­': 'í',
    'Ãº': 'ú',
    'Ã¢': 'â',
    'Ãª': 'ê',
    'Ã´': 'ô',
    'Ã ': 'à',
    'Ã‡': 'Ç',
    'Ã‰': 'É',
    'Ã“': 'Ó',
    'Ãš': 'Ú',
    'Ã‚': 'Â',
    'Ã”': 'Ô',
    'Ã•': 'Õ',
    'Ã§Ã£o': 'ção',
    'Ã§Ãµes': 'ções'
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
    
    // Replacing compound characters first
    content = content.split('Ã§Ã£o').join('ção');
    content = content.split('Ã§Ãµes').join('ções');
    
    // Single characters
    for (const [key, value] of Object.entries(map)) {
        content = content.split(key).join(value);
    }
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Reparado:', path.basename(file));
        fixedCount++;
    }
});
console.log('Total de arquivos reparados:', fixedCount);

