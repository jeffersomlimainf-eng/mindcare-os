const fs = require('fs');
const path = require('path');

const map = {
    'Â€¢': '•',
    'â€“': '–',
    'â€”': '—',
    'Âº': 'º',
    'Âª': 'ª',
    'Ã¢': 'â',
    'Ãª': 'ê',
    'Ã´': 'ô',
    'Ã­': 'í', 
    'Ãº': 'ú'
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

const files = walk('c:/Users/Jeferson Lima/Desktop/trabalho/MindCare OS/src/');
let fixedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace characters
    for (const [key, value] of Object.entries(map)) {
        content = content.split(key).join(value);
    }
    
    // Sometimes bullet points get garbled differently, like 'â€¢'
    content = content.split('â€¢').join('•');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Reparado:', path.basename(file));
        fixedCount++;
    }
});
console.log('Total de arquivos reparados nesta leva:', fixedCount);
