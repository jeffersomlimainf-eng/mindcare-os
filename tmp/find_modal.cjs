const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
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

const files = walk('c:/Users/Jeferson Lima/Desktop/trabalho/Meu Sistema PSI/src');
const searchTerms = ['CRP', 'TELEFONE', 'GERAL', 'HISTÓRICO', 'PAGTO'];

files.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    if (content.toUpperCase().includes('CRP') && content.toUpperCase().includes('TELEFONE')) {
        console.log(`[+] MATCH in ${f}`);
        // Print snippet around MATCH if possible
        const lines = content.split('\n');
        lines.forEach((l, i) => {
            if (l.toUpperCase().includes('CRP') || l.toUpperCase().includes('TELEFONE')) {
                if (l.includes('label') || l.includes('value')) {
                    console.log(`  L${i+1}: ${l.trim()}`);
                }
            }
        });
    }
});

