import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import Beasties from 'beasties';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, 'dist');
const htmlPath = resolve(distDir, 'index.html');

try {
  const html = await readFile(htmlPath, 'utf8');
  const beast = new Beasties({
    logger: 1,
    path: distDir,
    inlineThreshold: 0,
    pruneSource: true,
    merge: true,
  });
  const { html: out } = await beast.process(html);
  await writeFile(htmlPath, out, 'utf8');
  console.log('[beasties] Critical CSS inlined into dist/index.html');
} catch (e) {
  console.error('[beasties] postbuild failed:', e?.message || e);
  process.exit(1);
}
