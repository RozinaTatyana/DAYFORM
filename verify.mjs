import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const files = ['dist/main.js', ...readdirSync('dist/js').map(name => `dist/js/${name}`), 'serve.mjs'];
for (const file of files) { const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' }); if (result.status) throw new Error(result.stderr); for (const match of readFileSync(file, 'utf8').matchAll(/from\s+['"](\.\.?\/[^'"]+)['"]/g)) if (!existsSync(path.resolve(path.dirname(file), match[1]))) throw new Error(`Missing import: ${match[1]}`); }
for (const match of readFileSync('dist/index.html', 'utf8').matchAll(/(?:src|href)="((?:styles\/|main\.js)[^"]*)"/g)) if (!existsSync(`dist/${match[1]}`)) throw new Error(`Missing asset: ${match[1]}`);
console.log(`OK: ${files.length} JavaScript modules and all local HTML references.`);
