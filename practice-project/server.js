import { readFile } from 'node:fs/promises';
import { createTaskServer } from './src/api.js';
const html = await readFile(new URL('./public/index.html', import.meta.url), 'utf8');
const server = createTaskServer(undefined, html);
server.listen(3100, '127.0.0.1', () => console.log('TaskBoard: http://127.0.0.1:3100'));
