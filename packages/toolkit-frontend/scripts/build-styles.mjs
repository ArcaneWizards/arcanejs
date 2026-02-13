import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(scriptDir, '..');
const srcFile = path.join(packageDir, 'src', 'styles', 'core.css');
const outDir = path.join(packageDir, 'dist', 'styles');
const outFile = path.join(outDir, 'core.css');

await fs.mkdir(outDir, { recursive: true });
await fs.copyFile(srcFile, outFile);
