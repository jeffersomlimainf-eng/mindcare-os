const fs = require('fs');

// Dashboard.jsx
let dFile = 'c:/Users/Jeferson Lima/Desktop/trabalho/MindCare OS/src/pages/Dashboard.jsx';
let d = fs.readFileSync(dFile, 'utf8');
d = d.replace(/\*\*.+?Hipóteses Táticas:\*\*/g, '**🔍 Hipóteses Táticas:**');
d = d.replace(/\*\*.+?Conduta Recomendada:\*\*/g, '**🛠️ Conduta Recomendada:**');
d = d.replace(/\*\*.+?Perguntas Chaves:\*\*/g, '**❓ Perguntas Chaves:**');
d = d.replace(/>.+?Vincular<\/option>/g, '>🔗 Vincular</option>');
d = d.replace(/Parabéns para \$\{p\.nome\}.+?\`/g, 'Parabéns para ${p.nome} 🎂`');
d = d.replace(/Revisar notas da sessão de \$\{proximaSessao\.paciente\}.+?\`/g, 'Revisar notas da sessão de ${proximaSessao.paciente} 📖`');
d = d.replace(/\\n.+?\[Sugestão de Estrutura\]:/g, '\\n🧠 [Sugestão de Estrutura]:');
fs.writeFileSync(dFile, d, 'utf8');
console.log('Dashboard.jsx finalizado');

// EvolucaoSessao.jsx
let eFile = 'c:/Users/Jeferson Lima/Desktop/trabalho/MindCare OS/src/pages/EvolucaoSessao.jsx';
let e = fs.readFileSync(eFile, 'utf8');
e = e.replace(/Rascunho salvo!.+?\`/g, 'Rascunho salvo! 📝`');
e = e.replace(/IMPRESSÃƒO/g, 'IMPRESSÃO');
e = e.replace(/Ã s/g, 'às');
e = e.replace(/Ã s /g, 'às ');
fs.writeFileSync(eFile, e, 'utf8');
console.log('EvolucaoSessao.jsx finalizado');

// TermoConsentimento.jsx
let tFile = 'c:/Users/Jeferson Lima/Desktop/trabalho/MindCare OS/src/pages/TermoConsentimento.jsx';
let t = fs.readFileSync(tFile, 'utf8');
t = t.replace(/Ã udio/g, 'Áudio');
t = t.replace(/ao\(Ã \)/g, 'ao(à)');
t = t.replace(/Ã  /g, 'à ');
t = t.replace(/Ã s /g, 'às ');
t = t.replace(/nÃºmero/g, 'número');
t = t.replace(/nÂº/g, 'nº');
t = t.replace(/â€“/g, '–');
t = t.replace(/â€¢/g, '•');
t = t.replace(/Âº/g, 'º');
fs.writeFileSync(tFile, t, 'utf8');
console.log('TermoConsentimento.jsx finalizado');

// AIClinica.jsx
let aFile = 'c:/Users/Jeferson Lima/Desktop/trabalho/MindCare OS/src/pages/AIClinica.jsx';
let a = fs.readFileSync(aFile, 'utf8');
a = a.replace(/CLÃ NICA/g, 'CLÍNICA');
fs.writeFileSync(aFile, a, 'utf8');
console.log('AIClinica.jsx finalizado');

// Agenda.jsx
let agFile = 'c:/Users/Jeferson Lima/Desktop/trabalho/MindCare OS/src/pages/Agenda.jsx';
let ag = fs.readFileSync(agFile, 'utf8');
ag = ag.replace(/Â€¢/g, '•');
fs.writeFileSync(agFile, ag, 'utf8');
console.log('Agenda.jsx finalizado');

// FichaAnamnese.jsx
let fFile = 'c:/Users/Jeferson Lima/Desktop/trabalho/MindCare OS/src/pages/FichaAnamnese.jsx';
let f = fs.readFileSync(fFile, 'utf8');
f = f.replace(/â€“/g, '–');
fs.writeFileSync(fFile, f, 'utf8');
console.log('FichaAnamnese.jsx finalizado');

console.log('Script Mestre de Regex finalizado com sucesso!');
