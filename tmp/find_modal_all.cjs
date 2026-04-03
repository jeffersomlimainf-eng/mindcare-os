const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    try {
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            if (file === 'node_modules' || file === '.git') return;
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat && stat.isDirectory()) { 
                results = results.concat(walk(fullPath));
            } else { 
                if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.html')) {
                    results.push(fullPath);
                }
            }
        });
    } catch (e) { }
    return results;
}

const files = walk('c:/Users/Jeferson Lima/Desktop/trabalho/Meu Sistema PSI');
console.log(`Searching in ${files.length} files...`);

files.forEach(f => {
    try {
        const content = fs.readFileSync(f, 'utf8');
        const search = 'STATUS DA CONTA';
        if (content.toUpperCase().includes(search)) {
            console.log(`[+] FOUND '${search}' in ${f}`);
            const lines = content.split('\n');
            lines.forEach((l, i) => {
                if (l.toUpperCase().includes(search)) {
                    console.log(`  L${i+1}: ${l.trim()}`);
                }
            });
        }
    } catch (e) {}
});

