// scripts/build-extension.mjs — atualizado
// Este script cria um pacote pronto para upload (dist/ e dist/extension.zip)

import fs from 'node:fs';
import path from 'node:path';
import archiver from 'archiver';

const root = process.cwd();
const dist = path.join(root, 'dist');
const tmp = path.join(root, 'dist_tmp');

function rmrf(p) {
  try { fs.rmSync(p, { recursive: true, force: true }); } catch (e) {}
}

// Limpeza
rmrf(dist);
rmrf(tmp);

fs.mkdirSync(dist, { recursive: true });
fs.mkdirSync(tmp, { recursive: true });

// Itens a copiar para a build
const itemsToCopy = [
  'manifest.json',
  'src',
  'icons',
  'README.md'
];

// Copiar recursivamente mantendo estrutura
for (const item of itemsToCopy) {
  const src = path.join(root, item);
  const dest = path.join(tmp, item);
  if (!fs.existsSync(src)) continue;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.cpSync(src, dest, { recursive: true });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Gerar o ZIP final
const zipPath = path.join(dist, 'extension.zip');
const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  // Copiar conteúdo não-zipado para dist também
  fs.cpSync(tmp, dist, { recursive: true });
  rmrf(tmp);
  console.log(`✅ Build concluída!`);
  console.log(`Tamanho do zip: ${archive.pointer()} bytes`);
  console.log(`Arquivo gerado: ${zipPath}`);
});

archive.on('error', err => { throw err; });
archive.pipe(output);
archive.directory(tmp, false);
await archive.finalize();
