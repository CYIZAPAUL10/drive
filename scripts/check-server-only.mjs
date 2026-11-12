import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'src/server';
const missing = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
    } else if (/\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name)) {
      if (!/import\s+['"]server-only['"]/.test(readFileSync(path, 'utf8'))) missing.push(path);
    }
  }
}

if (existsSync(ROOT)) walk(ROOT);

if (missing.length > 0) {
  console.error('These /server files are missing `import "server-only";`:');
  for (const f of missing) console.error('  - ' + f);
  process.exit(1);
}
console.log('server-only guard OK');