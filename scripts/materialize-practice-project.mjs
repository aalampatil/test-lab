import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { practiceFiles } from '../src/lib/curriculum/practice-project.ts';
const root = resolve('practice-project');
for (const file of practiceFiles) {
  const target = resolve(root, file.path);
  if (!target.startsWith(root + sep)) throw Error('Unexpected practice file path.');
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, file.code);
}
console.log(
  `Wrote ${practiceFiles.length} TaskBoard starter files. Existing lesson test files are preserved.`,
);
