import { cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const destination = resolve('public/monaco');
await mkdir(destination, { recursive: true });
await cp(resolve('node_modules/monaco-editor/min/vs'), resolve(destination, 'vs'), {
  recursive: true,
});
console.log('Monaco editor assets are ready for offline use.');
