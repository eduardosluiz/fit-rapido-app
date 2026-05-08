const fs = require('fs');
const path = require('path');

const baseDirs = [
    path.join(process.cwd(), 'api', 'uploads'),
    path.join(process.cwd(), 'api', 'importar')
];

const log = [];

function slugify(text) {
    return text
        .toString()
        .normalize('NFD')                   // Decompõe caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '')     // Remove acentos
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')                // Espaços por hífens
        .replace(/[^\w-]+/g, '')             // Remove tudo que não é letra, número ou hífen
        .replace(/--+/g, '-')                // Evita hífens duplos
        .replace(/^-+/, '')                  // Remove hífen no início
        .replace(/-+$/, '');                 // Remove hífen no fim
}

function renameFiles(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            renameFiles(fullPath);
        } else {
            const ext = path.extname(file);
            const nameOnly = path.basename(file, ext);
            const newName = slugify(nameOnly) + ext.toLowerCase();

            if (file !== newName) {
                const newPath = path.join(dir, newName);
                
                // Evitar colisão de nomes
                let finalPath = newPath;
                let counter = 1;
                while (fs.existsSync(finalPath)) {
                    finalPath = path.join(dir, slugify(nameOnly) + '-' + counter + ext.toLowerCase());
                    counter++;
                }

                fs.renameSync(fullPath, finalPath);
                log.push({
                    original: file,
                    novo: path.basename(finalPath),
                    pasta: dir
                });
            }
        }
    });
}

console.log('Iniciando renomeação de arquivos...');
baseDirs.forEach(renameFiles);

const logPath = path.join(process.cwd(), 'docs', 'log_renomeacao_midias.json');
fs.writeFileSync(logPath, JSON.stringify(log, null, 2));

console.log(`Finalizado! ${log.length} arquivos foram renomeados.`);
console.log(`O log foi salvo em: ${logPath}`);
