import { readFile, writeFile } from 'node:fs/promises';
import { transformWithEsbuild } from 'vite';

const source = await readFile(new URL('../src/template/app.js', import.meta.url), 'utf8');
const { code } = await transformWithEsbuild(source, 'app.js', {
  target: 'es2020', minify: true, legalComments: 'inline',
});
await writeFile(new URL('../public/js/app.min.js', import.meta.url), code);
