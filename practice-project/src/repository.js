import { readFile, writeFile } from 'node:fs/promises';
export function createRepository(path) {
  return {
    async save(tasks) { await writeFile(path, JSON.stringify(tasks)); },
    async load() { return JSON.parse(await readFile(path, 'utf8')); },
  };
}
