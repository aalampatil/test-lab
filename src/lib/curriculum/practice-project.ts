import type { CodeFile } from './types';

export const practiceFiles: CodeFile[] = [
  {
    path: 'package.json',
    code: JSON.stringify(
      {
        name: 'testlab-taskboard',
        private: true,
        type: 'module',
        scripts: {
          dev: 'node server.js',
          test: 'vitest run',
          'test:watch': 'vitest',
          'test:coverage': 'vitest run --coverage',
          'test:e2e': 'playwright test',
          typecheck: 'tsc --noEmit --strict src/types-example.ts',
        },
        dependencies: { react: '^19.3.0', 'react-dom': '^19.3.0', zod: '^4.6.7' },
        devDependencies: {
          vitest: '^4.1.12',
          '@vitest/coverage-v8': '^4.1.12',
          '@testing-library/react': '^16.3.0',
          '@testing-library/user-event': '^14.6.1',
          jsdom: '^27.0.0',
          '@playwright/test': '^1.65.0',
          '@axe-core/playwright': '^4.11.0',
          'fast-check': '^4.0.0',
          typescript: '^5.9.3',
        },
      },
      null,
      2,
    ),
  },
  {
    path: 'vitest.config.mjs',
    code: `export default {\n  test: {\n    include: ['tests/**/*.test.{js,jsx}'],\n    environment: 'node',\n    coverage: { provider: 'v8', include: ['src/**/*.js', 'src/**/*.jsx'], reporter: ['text', 'html'] },\n  },\n};\n`,
  },
  {
    path: 'playwright.config.js',
    code: `import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  testDir: './e2e',\n  use: { baseURL: 'http://127.0.0.1:3100', headless: true },\n  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:3100', reuseExistingServer: !process.env.CI },\n});\n`,
  },
  {
    path: 'src/title.js',
    code: `export function cleanTitle(title) {\n  return title.trim();\n}\nexport function summarize(tasks) {\n  return { total: tasks.length, complete: tasks.filter(task => task.done).length };\n}\n`,
  },
  {
    path: 'src/async.js',
    code: `export async function loadTasks(fetcher) {\n  const response = await fetcher('/api/tasks');\n  if (!response.ok) throw new Error('Could not load tasks');\n  return response.json();\n}\nexport function notifyTask(task, send) {\n  send({ subject: 'Task created', title: task.title });\n}\nexport function scheduleReminder(callback, delay) {\n  return setTimeout(callback, delay);\n}\n`,
  },
  {
    path: 'src/store.js',
    code: `export function createStore() {\n  let tasks = [];\n  let nextId = 1;\n  return {\n    list() { return tasks.map(task => ({ ...task })); },\n    add(title) {\n      const task = { id: nextId++, title: title.trim(), done: false };\n      tasks.push(task);\n      return { ...task };\n    },\n    clear() { tasks = []; nextId = 1; },\n  };\n}\n`,
  },
  {
    path: 'src/repository.js',
    code: `import { readFile, writeFile } from 'node:fs/promises';\nexport function createRepository(path) {\n  return {\n    async save(tasks) { await writeFile(path, JSON.stringify(tasks)); },\n    async load() { return JSON.parse(await readFile(path, 'utf8')); },\n  };\n}\n`,
  },
  {
    path: 'src/api.js',
    code: `import { createServer } from 'node:http';\nimport { createStore } from './store.js';\nexport function createTaskServer(store = createStore(), html = '<h1>TaskBoard</h1>') {\n  return createServer(async (request, response) => {\n    const send = (status, body) => {\n      response.writeHead(status, { 'Content-Type': 'application/json' });\n      response.end(JSON.stringify(body));\n    };\n    if (request.url === '/' && request.method === 'GET') {\n      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });\n      return response.end(html);\n    }\n    if (request.url !== '/api/tasks') return send(404, { error: 'Not found' });\n    if (request.method === 'GET') return send(200, store.list());\n    // This reset is only for the local learning app, never a production pattern.\n    if (request.method === 'DELETE' && process.env.NODE_ENV !== 'production') {\n      store.clear(); return send(200, { cleared: true });\n    }\n    if (request.method !== 'POST') return send(405, { error: 'Method not allowed' });\n    // A fixed demo token illustrates a boundary; it is not real user authentication.\n    if (request.headers.authorization !== 'Bearer practice-token') return send(401, { error: 'Unauthorized' });\n    try {\n      let raw = '';\n      for await (const chunk of request) { raw += chunk; if (raw.length > 10000) return send(413, { error: 'Too large' }); }\n      const body = JSON.parse(raw);\n      if (typeof body.title !== 'string' || !body.title.trim()) return send(400, { error: 'Title is required' });\n      return send(201, store.add(body.title));\n    } catch { return send(400, { error: 'Invalid JSON' }); }\n  });\n}\n`,
  },
  {
    path: 'src/TaskForm.jsx',
    code: `import React, { useState } from 'react';\nexport function TaskForm({ onAdd }) {\n  const [title, setTitle] = useState('');\n  const [error, setError] = useState('');\n  const [saving, setSaving] = useState(false);\n  async function submit(event) {\n    event.preventDefault();\n    if (!title.trim()) { setError('Enter a task title'); return; }\n    setError(''); setSaving(true);\n    try { await onAdd(title.trim()); setTitle(''); }\n    catch { setError('Could not save task'); }\n    finally { setSaving(false); }\n  }\n  return <form onSubmit={submit}>\n    <label htmlFor="task-title">Task title</label>\n    <input id="task-title" value={title} onChange={event => setTitle(event.target.value)} />\n    <button disabled={saving}>{saving ? 'Saving…' : 'Add task'}</button>\n    {error && <p role="alert">{error}</p>}\n  </form>;\n}\n`,
  },
  {
    path: 'src/types-example.ts',
    code: `type Task = { id: number; title: string; done: boolean };\nconst task: Task = { id: 1, title: 'Learn testing', done: false };\nexport const title: string = task.title;\n// Try done: 'false' above, then run npm run typecheck.\n`,
  },
  {
    path: 'public/index.html',
    code: `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TaskBoard · testing practice</title>\n<style>body{font:16px system-ui;color:#26372b;background:#f7f7f1;margin:0;padding:40px 20px}main{max-width:600px;margin:auto}h1{font-size:32px}label{display:block;margin:20px 0 8px}input{font:inherit;padding:12px;border:1px solid #6a7868;border-radius:5px;width:65%}button{font:inherit;background:#315c40;color:white;border:0;padding:13px;border-radius:5px;cursor:pointer}li{padding:15px 0;border-bottom:1px solid #c5cec0}p{line-height:1.7}#error{color:#9a2424}:focus-visible{outline:3px solid #aa531c;outline-offset:3px}</style></head>\n<body><main><h1>TaskBoard</h1><p>Your small application for learning to test.</p><form id="task-form"><label for="title">Task title</label><input id="title" name="title" required><button>Add task</button></form><p id="error" role="alert"></p><p id="status" role="status"></p><ul id="tasks" aria-label="Tasks"></ul></main>\n<script>\nasync function refresh() {\n  const response = await fetch('/api/tasks'); const tasks = await response.json();\n  document.querySelector('#tasks').replaceChildren(...tasks.map(task => { const li = document.createElement('li'); li.textContent = task.title; return li; }));\n}\ndocument.querySelector('#task-form').addEventListener('submit', async event => {\n  event.preventDefault(); const input = document.querySelector('#title');\n  const response = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer practice-token' }, body: JSON.stringify({ title: input.value }) });\n  if (!response.ok) { document.querySelector('#error').textContent = 'Could not save task'; return; }\n  input.value = ''; document.querySelector('#error').textContent = ''; document.querySelector('#status').textContent = 'Task added'; await refresh();\n});\nrefresh();\n</script></body></html>\n`,
  },
  {
    path: 'server.js',
    code: `import { readFile } from 'node:fs/promises';\nimport { createTaskServer } from './src/api.js';\nconst html = await readFile(new URL('./public/index.html', import.meta.url), 'utf8');\nconst server = createTaskServer(undefined, html);\nserver.listen(3100, '127.0.0.1', () => console.log('TaskBoard: http://127.0.0.1:3100'));\n`,
  },
  {
    path: 'tests/title.test.js',
    code: `import { it, expect } from 'vitest';\nimport { cleanTitle } from '../src/title.js';\nit('trims the task title', () => {\n  expect(cleanTitle('  Learn testing  ')).toBe('Learn testing');\n});\n`,
  },
];

export function practiceFile(path: string): CodeFile {
  const file = practiceFiles.find((file) => file.path === path);
  if (!file) throw Error(`Missing practice file: ${path}`);
  return file;
}
