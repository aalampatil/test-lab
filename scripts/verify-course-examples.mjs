import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
const generated = resolve('test-results/course-data.mjs');
await build({
  entryPoints: ['src/lib/content.ts'],
  outfile: generated,
  bundle: true,
  platform: 'node',
  format: 'esm',
  logLevel: 'warning',
});
const { lessons } = await import(pathToFileURL(generated).href);
const root = resolve('practice-project/.verification');
await mkdir(root, { recursive: true });
for (const lesson of lessons.filter(
  (l) => l.repository && l.repository.testPath.startsWith('tests/'),
)) {
  const lab = lesson.repository;
  for (const file of [...lab.files, { path: lab.testPath, code: lab.solution }]) {
    const target = resolve(root, lesson.id, file.path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, file.code);
  }
  // Some source files depend on the shared store implementation.
  const { practiceFiles } = await import(
    pathToFileURL(resolve('src/lib/curriculum/practice-project.ts')).href
  );
  for (const file of practiceFiles.filter(
    (f) => f.path.startsWith('src/') && !lab.files.some((x) => x.path === f.path),
  )) {
    const target = resolve(root, lesson.id, file.path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, file.code);
  }
}
await writeFile(
  resolve(root, 'vitest.config.mjs'),
  'export default ' +
    JSON.stringify({ root, test: { include: ['**/tests/*.test.{js,jsx}'], environment: 'node' } }),
);
const result = spawnSync(
  process.execPath,
  [
    resolve('practice-project/node_modules/vitest/vitest.mjs'),
    'run',
    '--config',
    resolve(root, 'vitest.config.mjs'),
  ],
  { stdio: 'inherit', windowsHide: true },
);
if (result.status !== 0) process.exit(result.status ?? 1);
const browserDir = resolve(root, 'e2e');
await mkdir(browserDir, { recursive: true });
for (const lesson of lessons.filter((l) => l.repository?.testPath.startsWith('e2e/')))
  await writeFile(
    resolve(browserDir, lesson.repository.testPath.split('/').at(-1)),
    lesson.repository.solution,
  );
await writeFile(
  resolve(root, 'playwright.config.js'),
  `import { defineConfig } from '@playwright/test';\nexport default defineConfig({ testDir: './e2e', workers: 1, use: { baseURL: 'http://127.0.0.1:3100', channel: 'chrome', headless: true }, webServer: { command: 'node server.js', cwd: ${JSON.stringify(resolve('practice-project'))}, url: 'http://127.0.0.1:3100', reuseExistingServer: false } });`,
);
console.log(
  'Vitest examples passed. Browser fixtures prepared in practice-project/.verification/e2e.',
);
