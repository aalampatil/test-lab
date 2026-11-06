import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'esbuild';
const destination = resolve('public/monaco');
await mkdir(destination, { recursive: true });
const sanitizer = resolve('node_modules/dompurify/dist/purify.es.mjs');
const patchedSanitizer = {
  name: 'patched-monaco-sanitizer',
  setup(builder) {
    // Monaco ships a vendored sanitizer: replace that copy too, not just its npm dependency.
    builder.onResolve({ filter: /dompurify[\\/]dompurify\.js$/ }, () => ({ path: sanitizer }));
  },
};
await build({
  entryPoints: ['scripts/monaco-entry.mjs'],
  outfile: resolve(destination, 'editor.js'),
  bundle: true,
  minify: true,
  format: 'iife',
  globalName: 'TestLabMonaco',
  platform: 'browser',
  loader: { '.ttf': 'file' },
  plugins: [patchedSanitizer],
  logLevel: 'warning',
});
await build({
  entryPoints: ['node_modules/monaco-editor/esm/vs/editor/editor.worker.js'],
  outfile: resolve(destination, 'editor.worker.js'),
  bundle: true,
  minify: true,
  format: 'esm',
  platform: 'browser',
  plugins: [patchedSanitizer],
  logLevel: 'warning',
});
console.log('Monaco assets built locally with the patched sanitizer.');
