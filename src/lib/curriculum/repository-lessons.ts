import type { Lesson, RepositoryExercise } from './types';
import { practiceFile } from './practice-project';

type LabInput = {
  id: string;
  title: string;
  category: string;
  stage: string;
  order: number;
  difficulty: Lesson['difficulty'];
  minutes: number;
  explanation: string;
  objective: string;
  files: string[];
  testPath?: string;
  solution: string;
  starter?: string;
  command?: string;
  steps: string[];
  expected: string;
  hint: string;
  checkpoint: RepositoryExercise['checkpoint'];
  checklist?: string[];
};
function lab(input: LabInput): Lesson {
  const testPath = input.testPath ?? `tests/${input.id}.test.js`;
  return {
    id: input.id,
    title: input.title,
    description: input.objective,
    category: input.category,
    stage: input.stage,
    order: input.order,
    difficulty: input.difficulty,
    minutes: input.minutes,
    objective: input.objective,
    explanation: input.explanation,
    source: input.files.map((path) => practiceFile(path).code).join('\n'),
    starter:
      input.starter ??
      `// Create ${testPath} in practice-project.\n// Follow the task steps, then compare with the worked example.\n`,
    hint: input.hint,
    repository: {
      files: input.files.map(practiceFile),
      testPath,
      solution: input.solution,
      command: input.command ?? `npm test -- ${testPath}`,
      steps: input.steps,
      expected: input.expected,
      checkpoint: input.checkpoint,
      checklist: input.checklist ?? [
        'I created the test file and wrote my own assertions.',
        'I ran the command in practice-project and inspected the result.',
        'I introduced a deliberate bug, saw a failure, restored the fix, and ran again.',
      ],
    },
  };
}
const asyncImport =
  "import { it, expect, vi } from 'vitest';\nimport { loadTasks } from '../src/async.js';\n";
const componentImport =
  "// @vitest-environment jsdom\nimport React from 'react';\nimport { it, expect, vi, afterEach } from 'vitest';\nimport { render, screen, cleanup } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport { TaskForm } from '../src/TaskForm.jsx';\nafterEach(cleanup);\n";
const apiSetup =
  "import { beforeEach, afterEach, it, expect } from 'vitest';\nimport { createTaskServer } from '../src/api.js';\nlet server;\nlet base;\nbeforeEach(async () => {\n  server = createTaskServer();\n  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));\n  base = 'http://127.0.0.1:' + server.address().port;\n});\nafterEach(async () => {\n  server.closeAllConnections();\n  await new Promise(resolve => server.close(resolve));\n});\n";
const browserSetup =
  "import { test, expect } from '@playwright/test';\ntest.beforeEach(async ({ request }) => { await request.delete('/api/tasks'); });\n";
const question = (question: string, options: string[], answer: number, explanation: string) => ({
  question,
  options,
  answer,
  explanation,
});

export const repositoryLessons: Lesson[] = [
  lab({
    id: 'async-success',
    title: 'Wait for the real result',
    category: 'Async testing',
    stage: 'async',
    order: 210,
    difficulty: 'Beginner',
    minutes: 18,
    files: ['src/async.js'],
    objective: 'Await an asynchronous task load and verify the returned data.',
    explanation:
      'A Promise is a promise of a later value, not the value itself. An async test returns a Promise to Vitest, which waits for it. Without await, your test can finish before an assertion runs. Here a tiny fake fetcher makes the response deterministic without contacting a network.',
    steps: [
      'Open practice-project and create tests/async-success.test.js.',
      'Create a fetcher with vi.fn().mockResolvedValue returning { ok: true, json: async () => [...] }.',
      'Await loadTasks(fetcher). Compare the returned array with toEqual.',
      'Change the expected title and confirm the test fails before restoring it.',
    ],
    solution:
      asyncImport +
      "it('loads tasks', async () => {\n  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: 1, title: 'Learn' }] });\n  const tasks = await loadTasks(fetcher);\n  expect(tasks).toEqual([{ id: 1, title: 'Learn' }]);\n});",
    expected: 'One test passes. Changing the returned JSON should fail the assertion.',
    hint: 'Await the application call, not just the mock setup. Use async () => ... for a test containing await.',
    checkpoint: question(
      'Why does the test need await?',
      [
        'To make the Promise run twice',
        'To wait for the result before checking it',
        'To disable assertions',
      ],
      1,
      'Await gives the test the resolved value and keeps Vitest waiting until the test work finishes.',
    ),
  }),
  lab({
    id: 'async-rejection',
    title: 'Test the failure path too',
    category: 'Async testing',
    stage: 'async',
    order: 220,
    difficulty: 'Intermediate',
    minutes: 18,
    files: ['src/async.js'],
    objective: 'Check an unsuccessful response and a rejected network request.',
    explanation:
      'HTTP failures and network failures are different. A server can return ok: false, while an unreachable server can reject fetch entirely. Use await expect(promise).rejects.toThrow(...) so Vitest verifies the rejection instead of letting it escape. Keep the expectation itself awaited.',
    steps: [
      'Create tests/async-rejection.test.js.',
      'For one test, resolve the fetcher with { ok: false } and assert the application’s friendly error.',
      'For another, use mockRejectedValue(new Error("Offline")) and assert that rejection.',
      'Temporarily remove the !response.ok check from the source. Which test catches it?',
    ],
    solution:
      asyncImport +
      "it('rejects an unsuccessful response', async () => {\n  const fetcher = vi.fn().mockResolvedValue({ ok: false });\n  await expect(loadTasks(fetcher)).rejects.toThrow('Could not load tasks');\n});\nit('propagates a network failure', async () => {\n  const fetcher = vi.fn().mockRejectedValue(new Error('Offline'));\n  await expect(loadTasks(fetcher)).rejects.toThrow('Offline');\n});",
    expected: 'Two tests pass, covering two different failure paths.',
    hint: 'Do not write await loadTasks(...) before passing it to expect; that would throw before rejects can inspect it.',
    checkpoint: question(
      'How should you assert a rejected Promise?',
      [
        'expect(promise).toBe(false)',
        'Ignore the rejection',
        'await expect(promise).rejects.toThrow(...)',
      ],
      2,
      'The rejects chain unwraps the rejection, and await ensures the assertion finishes.',
    ),
  }),
  lab({
    id: 'mock-boundaries',
    title: 'Fake the boundary, keep the behavior',
    category: 'Mocks and spies',
    stage: 'async',
    order: 230,
    difficulty: 'Intermediate',
    minutes: 20,
    files: ['src/async.js'],
    objective: 'Replace the network boundary and verify its URL and the resulting data.',
    explanation:
      'A mock controls a dependency so your test is fast and repeatable. Mock the fetcher, not loadTasks itself: replacing the function under test would stop you from testing its behavior. Verify both the request URL and returned data; a call assertion alone does not prove a useful result.',
    steps: [
      'Create tests/mock-boundaries.test.js.',
      'Use a new vi.fn() in each test so call history cannot leak.',
      'Assert the fetcher is called exactly once with /api/tasks.',
      'Assert the resulting task data. Introduce a wrong URL to see the interaction assertion fail.',
    ],
    solution:
      asyncImport +
      "it('requests the task endpoint and returns its data', async () => {\n  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: 7 }] });\n  await expect(loadTasks(fetcher)).resolves.toEqual([{ id: 7 }]);\n  expect(fetcher).toHaveBeenCalledTimes(1);\n  expect(fetcher).toHaveBeenCalledWith('/api/tasks');\n});",
    expected: 'One passing test verifies the network boundary and the public output.',
    hint: 'Pass the mock into loadTasks. Do not mock loadTasks itself.',
    checkpoint: question(
      'Which function should remain real here?',
      [
        'loadTasks, because it is the behavior under test',
        'No function should remain real',
        'Only expect',
      ],
      0,
      'Keep your application logic real and replace dependencies at its boundary.',
    ),
  }),
  lab({
    id: 'spy-side-effects',
    title: 'Observe a side effect',
    category: 'Mocks and spies',
    stage: 'async',
    order: 240,
    difficulty: 'Intermediate',
    minutes: 15,
    files: ['src/async.js'],
    objective: 'Verify that creating a notification sends the correct payload once.',
    explanation:
      'Some functions do not return a useful value. Their observable result is a call to a dependency, such as an email sender. A spy records those calls without sending real messages. Assert the payload and number of calls; avoid checking unrelated private helper calls.',
    steps: [
      'Create tests/spy-side-effects.test.js.',
      'Pass vi.fn() as the send dependency.',
      'Call notifyTask with a title and check the payload using toHaveBeenCalledWith.',
      'Change the subject string in the function and observe the failure.',
    ],
    solution:
      "import { it, expect, vi } from 'vitest';\nimport { notifyTask } from '../src/async.js';\nit('sends one task notification', () => {\n  const send = vi.fn();\n  notifyTask({ title: 'Read docs' }, send);\n  expect(send).toHaveBeenCalledTimes(1);\n  expect(send).toHaveBeenCalledWith({ subject: 'Task created', title: 'Read docs' });\n});",
    expected: 'One test passes without sending an email or contacting any service.',
    hint: 'Use dependency injection: notifyTask(task, send). A spy is a safe observer, not a real mail provider.',
    checkpoint: question(
      'What is the observable behavior in this function?',
      ['Its source code formatting', 'The payload sent to the dependency', 'Its file size'],
      1,
      'The side effect at the boundary is the contract worth verifying.',
    ),
  }),
  lab({
    id: 'fake-timers',
    title: 'Control time without waiting',
    category: 'Mocks and spies',
    stage: 'async',
    order: 250,
    difficulty: 'Intermediate',
    minutes: 20,
    files: ['src/async.js'],
    objective: 'Check that a reminder fires at the boundary, then restore real timers.',
    explanation:
      'Sleeping for a real second makes a test slow and flaky. Fake timers let you advance the test clock. Assert that the callback has not run at 999ms, then has run once at 1000ms. Restore the clock after every test so other tests see normal time.',
    steps: [
      'Create tests/fake-timers.test.js.',
      'Enable vi.useFakeTimers() and register afterEach(() => vi.useRealTimers()).',
      'Schedule a reminder for 1000ms. Advance 999ms, then one more millisecond.',
      'Temporarily change the implementation to fire immediately and confirm the test fails.',
    ],
    solution:
      "import { it, expect, vi, afterEach } from 'vitest';\nimport { scheduleReminder } from '../src/async.js';\nafterEach(() => vi.useRealTimers());\nit('fires once at the deadline', () => {\n  vi.useFakeTimers();\n  const callback = vi.fn();\n  scheduleReminder(callback, 1000);\n  vi.advanceTimersByTime(999);\n  expect(callback).not.toHaveBeenCalled();\n  vi.advanceTimersByTime(1);\n  expect(callback).toHaveBeenCalledTimes(1);\n});",
    expected: 'One passing test finishes quickly without a real one-second sleep.',
    hint: 'The first negative assertion catches callbacks that fire too soon. Cleanup matters as much as setup.',
    checkpoint: question(
      'Why restore real timers?',
      [
        'To prevent this test’s clock changes leaking into others',
        'To run the callback twice',
        'To delete the test',
      ],
      0,
      'Fake timers change shared process behavior; cleanup keeps tests independent.',
    ),
  }),
  lab({
    id: 'component-render',
    title: 'Find a control like a user',
    category: 'Component testing',
    stage: 'components',
    order: 310,
    difficulty: 'Intermediate',
    minutes: 20,
    files: ['src/TaskForm.jsx'],
    testPath: 'tests/component-render.test.jsx',
    objective: 'Render a real React form and locate its input and button by accessible names.',
    explanation:
      'A component test renders a piece of UI in a simulated DOM. Query by role and accessible name rather than a CSS class or private state. This teaches both useful tests and accessible markup. jsdom supplies document; React Testing Library renders; Vitest runs the assertions.',
    steps: [
      'Create tests/component-render.test.jsx with the jsdom environment comment at the very top.',
      'Render <TaskForm onAdd={vi.fn()} />.',
      'Find the textbox named Task title and the button named Add task.',
      'Break the label’s htmlFor connection and observe how the accessible-name query catches it.',
    ],
    solution:
      componentImport +
      "it('provides an accessible title field and submit button', () => {\n  render(<TaskForm onAdd={vi.fn()} />);\n  expect(screen.getByRole('textbox', { name: 'Task title' })).toBeTruthy();\n  expect(screen.getByRole('button', { name: 'Add task' }).disabled).toBe(false);\n});",
    expected: 'One component test passes in jsdom. It does not need the development server.',
    hint: 'Use getByRole("textbox", { name: "Task title" }). A label is behavior users and assistive technology depend on.',
    checkpoint: question(
      'Which query best reflects how someone finds the field?',
      [
        'document.querySelector(".input-42")',
        'Inspecting the component’s state variable',
        'getByRole("textbox", { name: "Task title" })',
      ],
      2,
      'The role and name describe the control’s public interface.',
    ),
  }),
  lab({
    id: 'component-interaction',
    title: 'Type, click, and check the outcome',
    category: 'Component testing',
    stage: 'components',
    order: 320,
    difficulty: 'Intermediate',
    minutes: 25,
    files: ['src/TaskForm.jsx'],
    testPath: 'tests/component-interaction.test.jsx',
    objective: 'Submit a trimmed title and show an error for an empty form.',
    explanation:
      'Rendering alone does not prove a form works. userEvent simulates a sequence of user interactions and returns Promises, so await typing and clicking. Verify what crosses the component boundary and what the user sees. For invalid input, also assert that no save occurs.',
    steps: [
      'Create tests/component-interaction.test.jsx.',
      'Use userEvent.setup(), type a padded title, click Add task, and check the saved title and cleared field.',
      'In a second test submit an empty form, check the alert, and verify onAdd was not called.',
      'Change the source to skip trimming, then confirm the first test fails.',
    ],
    solution:
      componentImport +
      "it('saves a trimmed title and clears the field', async () => {\n  const user = userEvent.setup(); const onAdd = vi.fn().mockResolvedValue(undefined);\n  render(<TaskForm onAdd={onAdd} />);\n  const input = screen.getByRole('textbox', { name: 'Task title' });\n  await user.type(input, '  Practice  ');\n  await user.click(screen.getByRole('button', { name: 'Add task' }));\n  expect(onAdd).toHaveBeenCalledWith('Practice');\n  expect(input.value).toBe('');\n});\nit('shows validation without saving', async () => {\n  const user = userEvent.setup(); const onAdd = vi.fn();\n  render(<TaskForm onAdd={onAdd} />);\n  await user.click(screen.getByRole('button', { name: 'Add task' }));\n  expect(screen.getByRole('alert').textContent).toBe('Enter a task title');\n  expect(onAdd).not.toHaveBeenCalled();\n});",
    expected: 'Two tests pass: the happy path and a validation failure.',
    hint: 'A test should ask what the user can do and what changes afterward, not how many times React renders.',
    checkpoint: question(
      'What should invalid submission verify?',
      [
        'Only that an error string exists in the source',
        'An alert is visible and no save occurs',
        'The input has a particular CSS class',
      ],
      1,
      'Check both the useful feedback and the absence of an unwanted side effect.',
    ),
  }),
  lab({
    id: 'component-async',
    title: 'Follow a loading state',
    category: 'Component testing',
    stage: 'components',
    order: 330,
    difficulty: 'Intermediate',
    minutes: 25,
    files: ['src/TaskForm.jsx'],
    testPath: 'tests/component-async.test.jsx',
    objective: 'Check the saving state and recovery after a rejected save.',
    explanation:
      'An async interface has multiple observable states: idle, saving, and success or error. Use a controlled Promise when you need to inspect the loading state before it settles. findByRole waits for an element to appear; getByRole expects it now. Avoid arbitrary sleeps.',
    steps: [
      'Create tests/component-async.test.jsx.',
      'Hold a Promise pending so the Saving… button can be inspected.',
      'Reject the Promise inside act, then find the alert and confirm the form is enabled again.',
      'Break the finally block so saving never resets, and observe the recovery assertion fail.',
    ],
    solution:
      componentImport +
      "import { act } from '@testing-library/react';\nit('shows saving and recovers from a failure', async () => {\n  const user = userEvent.setup(); let rejectSave;\n  const onAdd = vi.fn(() => new Promise((_, reject) => { rejectSave = reject; }));\n  render(<TaskForm onAdd={onAdd} />);\n  await user.type(screen.getByRole('textbox', { name: 'Task title' }), 'Practice');\n  await user.click(screen.getByRole('button', { name: 'Add task' }));\n  expect(screen.getByRole('button', { name: 'Saving…' }).disabled).toBe(true);\n  await act(async () => { rejectSave(new Error('Offline')); });\n  expect((await screen.findByRole('alert')).textContent).toBe('Could not save task');\n  expect(screen.getByRole('button', { name: 'Add task' }).disabled).toBe(false);\n});",
    expected: 'One test checks the pending state and the error recovery state.',
    hint: 'Control when the Promise rejects. Do not use a real network request or setTimeout sleep for this test.',
    checkpoint: question(
      'When is findByRole useful?',
      [
        'When an element should appear after asynchronous work',
        'Only for CSS selectors',
        'When disabling every wait',
      ],
      0,
      'findByRole retries until the element appears or a useful timeout is reached.',
    ),
  }),
  lab({
    id: 'repository-integration',
    title: 'Cross a real storage boundary',
    category: 'Integration testing',
    stage: 'services',
    order: 410,
    difficulty: 'Intermediate',
    minutes: 25,
    files: ['src/repository.js'],
    objective: 'Save and load tasks through a real temporary file with reliable cleanup.',
    explanation:
      'Mocking every dependency can miss serialization and filesystem mistakes. This integration test uses a real file in a unique temporary directory. Round-trip a meaningful object and remove only that directory afterward. This is file-storage integration, not a PostgreSQL test; a database-backed app needs a disposable test database too.',
    steps: [
      'Create tests/repository-integration.test.js.',
      'Use mkdtemp to create a unique directory in the operating system’s temporary folder.',
      'Save task data, load it, and compare the complete structure.',
      'Always remove the created directory in finally, including when the assertion fails.',
    ],
    solution:
      "import { it, expect } from 'vitest';\nimport { mkdtemp, rm } from 'node:fs/promises';\nimport { tmpdir } from 'node:os';\nimport { join } from 'node:path';\nimport { createRepository } from '../src/repository.js';\nit('round-trips tasks through disk', async () => {\n  const directory = await mkdtemp(join(tmpdir(), 'taskboard-test-'));\n  try {\n    const repository = createRepository(join(directory, 'tasks.json'));\n    const tasks = [{ id: 1, title: 'Learn', done: false }];\n    await repository.save(tasks);\n    expect(await repository.load()).toEqual(tasks);\n  } finally { await rm(directory, { recursive: true, force: true }); }\n});",
    expected: 'One integration test passes and leaves no task data behind.',
    hint: 'Use a fresh path for each test. Never point a test at a personal or production data file.',
    checkpoint: question(
      'Why does this use a real temporary file?',
      [
        'To replace every assertion',
        'To check serialization and filesystem behavior together',
        'To test a production database',
      ],
      1,
      'The real boundary is what makes this an integration check; temporary isolation protects test independence.',
    ),
  }),
  lab({
    id: 'http-api',
    title: 'Test a real HTTP request',
    category: 'API testing',
    stage: 'services',
    order: 420,
    difficulty: 'Intermediate',
    minutes: 25,
    files: ['src/api.js', 'src/store.js'],
    objective:
      'Create a task over HTTP and verify status, response body, and subsequent retrieval.',
    explanation:
      'An API test checks the public HTTP contract. A 201 status alone does not prove the right task was saved. Start a fresh server on port 0 so the operating system chooses an unused port. Make real requests, inspect the body, then retrieve the saved task. Close the server after every test.',
    steps: [
      'Create tests/http-api.test.js and include the provided isolated server hooks.',
      'POST a title with JSON headers and the demo token.',
      'Assert 201 and the entire created object, then GET the collection.',
      'Break persistence or the response field and observe which assertion catches it.',
    ],
    solution:
      apiSetup +
      "it('creates and retrieves a task', async () => {\n  const response = await fetch(base + '/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer practice-token' }, body: JSON.stringify({ title: '  Learn  ' }) });\n  expect(response.status).toBe(201);\n  expect(await response.json()).toEqual({ id: 1, title: 'Learn', done: false });\n  const list = await fetch(base + '/api/tasks');\n  expect(list.status).toBe(200);\n  expect(await list.json()).toEqual([{ id: 1, title: 'Learn', done: false }]);\n});",
    expected: 'One test verifies a real POST → storage → GET round trip.',
    hint: 'The server runs inside the test; you do not need npm run dev. Consume response.json() before checking its fields.',
    checkpoint: question(
      'What should a useful create-task API test verify?',
      ['Only a 201 status', 'Only that fetch was called', 'Status, body, and the saved task'],
      2,
      'Status and data together verify that the public operation actually worked.',
    ),
  }),
  lab({
    id: 'api-validation-security',
    title: 'Reject the request and keep data safe',
    category: 'Security testing',
    stage: 'services',
    order: 430,
    difficulty: 'Intermediate',
    minutes: 25,
    files: ['src/api.js', 'src/store.js'],
    objective: 'Check unauthorized and invalid requests without creating a task.',
    explanation:
      'A negative API test needs two assertions: the request is rejected and the forbidden side effect does not happen. Test 401 for a missing token and 400 for an empty title. This demo uses a fixed token to illustrate a boundary; it is not production authentication or a complete security assessment.',
    steps: [
      'Create tests/api-validation-security.test.js with fresh server hooks.',
      'POST without Authorization and check 401.',
      'POST an empty title with the demo token and check 400.',
      'GET the collection after each rejected request and verify it remains empty.',
    ],
    solution:
      apiSetup +
      "it('rejects an unauthorized request without saving', async () => {\n  const response = await fetch(base + '/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Forbidden' }) });\n  expect(response.status).toBe(401);\n  expect(await (await fetch(base + '/api/tasks')).json()).toEqual([]);\n});\nit('rejects an empty title without saving', async () => {\n  const response = await fetch(base + '/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer practice-token' }, body: JSON.stringify({ title: '   ' }) });\n  expect(response.status).toBe(400);\n  expect(await response.json()).toEqual({ error: 'Title is required' });\n  expect(await (await fetch(base + '/api/tasks')).json()).toEqual([]);\n});",
    expected: 'Two passing negative tests, with an empty store after each rejected request.',
    hint: 'A 401 response is insufficient if the application already wrote the task. Check the data too.',
    checkpoint: question(
      'Why inspect stored data after rejection?',
      [
        'To ensure the request did not perform a forbidden write',
        'To make the test longer',
        'To bypass authentication',
      ],
      0,
      'Rejection and absence of side effects form the complete behavior being protected.',
    ),
  }),
  lab({
    id: 'api-contract',
    title: 'Protect the response contract',
    category: 'Contract testing',
    stage: 'services',
    order: 440,
    difficulty: 'Advanced',
    minutes: 25,
    files: ['src/api.js', 'src/store.js'],
    objective: 'Validate the created-task response against a shared schema.',
    explanation:
      'A consumer depends on the shape of an API response: id is a number, title is a string, and done is a boolean. A schema catches a provider that quietly changes a field’s name or type. This is a schema contract check; a consumer-driven contract system across separately deployed services needs additional coordination.',
    steps: [
      'Create tests/api-contract.test.js.',
      'Define a Zod object schema for the response.',
      'POST a valid task and validate the returned body with schema.parse.',
      'Change done to the string "false" in the server response and confirm schema validation fails.',
    ],
    solution:
      apiSetup +
      "import { z } from 'zod';\nconst taskSchema = z.object({ id: z.number().int().positive(), title: z.string().min(1), done: z.boolean() });\nit('returns the agreed task response shape', async () => {\n  const response = await fetch(base + '/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer practice-token' }, body: JSON.stringify({ title: 'Learn' }) });\n  expect(response.status).toBe(201);\n  const task = taskSchema.parse(await response.json());\n  expect(task.title).toBe('Learn');\n  expect(task.done).toBe(false);\n});",
    expected: 'One test passes; a wrong response field type causes a useful schema error.',
    hint: 'parse throws on invalid data, so a response that violates the contract fails the test.',
    checkpoint: question(
      'What does a schema contract test protect?',
      [
        'The exact time a request takes',
        'The response fields and types a consumer expects',
        'The CSS of a button',
      ],
      1,
      'The schema expresses the data agreement between provider and consumer.',
    ),
  }),
  lab({
    id: 'browser-smoke',
    title: 'Make sure the app opens',
    category: 'Smoke testing',
    stage: 'browser',
    order: 510,
    difficulty: 'Beginner',
    minutes: 20,
    files: ['public/index.html', 'server.js'],
    testPath: 'e2e/browser-smoke.spec.js',
    command: 'npx playwright test e2e/browser-smoke.spec.js',
    objective: 'Open the real application and verify its essential controls.',
    explanation:
      'A smoke test is a small check that an application’s essential surface works at all. Playwright opens a real browser; the webServer config starts TaskBoard automatically. This catches errors that a pure function test cannot, such as a page that fails to serve. Keep the smoke suite short.',
    steps: [
      'Run npx playwright install chromium once after npm install in practice-project.',
      'Create e2e/browser-smoke.spec.js.',
      'Navigate to / and assert the heading, textbox, and submit button are visible.',
      'Temporarily change the served heading to confirm the assertion fails.',
    ],
    solution:
      browserSetup +
      "test('opens the essential task interface', async ({ page }) => {\n  await page.goto('/');\n  await expect(page).toHaveTitle(/TaskBoard/);\n  await expect(page.getByRole('heading', { name: 'TaskBoard' })).toBeVisible();\n  await expect(page.getByRole('textbox', { name: 'Task title' })).toBeVisible();\n  await expect(page.getByRole('button', { name: 'Add task' })).toBeVisible();\n});",
    expected: 'One browser test passes. The app is served on port 3100 by Playwright.',
    hint: 'Use locators by role and Playwright’s awaited expect assertions. No fixed sleep is needed.',
    checkpoint: question(
      'What is the purpose of a smoke test?',
      [
        'Cover every possible input',
        'Replace all unit tests',
        'Quickly check essential application behavior',
      ],
      2,
      'A smoke suite is a fast confidence check for the most basic working paths.',
    ),
  }),
  lab({
    id: 'browser-journey',
    title: 'Follow the complete user journey',
    category: 'End-to-end testing',
    stage: 'browser',
    order: 520,
    difficulty: 'Intermediate',
    minutes: 25,
    files: ['public/index.html', 'src/api.js', 'src/store.js'],
    testPath: 'e2e/browser-journey.spec.js',
    command: 'npx playwright test e2e/browser-journey.spec.js',
    objective: 'Create a task through the browser and verify it remains after a page reload.',
    explanation:
      'An end-to-end test crosses the browser, API, and storage boundaries. A visible message alone might be fake, so reload the page and verify the task is fetched again. This app stores tasks in server memory: reload persistence does not mean persistence after restarting the server.',
    steps: [
      'Create e2e/browser-journey.spec.js. Reset local demo data before the test.',
      'Fill the labelled field, click Add task, and assert the status and list item.',
      'Reload and assert the task remains. Avoid fixed sleeps: locator assertions retry.',
      'Break the server write and see why the reload assertion matters.',
    ],
    solution:
      browserSetup +
      "test('creates a task that survives page reload', async ({ page }) => {\n  await page.goto('/');\n  await page.getByRole('textbox', { name: 'Task title' }).fill('Learn end-to-end testing');\n  await page.getByRole('button', { name: 'Add task' }).click();\n  await expect(page.getByRole('status')).toHaveText('Task added');\n  await expect(page.getByRole('listitem')).toHaveText('Learn end-to-end testing');\n  await page.reload();\n  await expect(page.getByRole('listitem')).toHaveText('Learn end-to-end testing');\n});",
    expected: 'One journey passes across UI, HTTP, and server-memory storage.',
    hint: 'Verify the real result after reloading, not just the success message before the request completes.',
    checkpoint: question(
      'What does the reload assertion prove here?',
      [
        'The server wrote a durable database record',
        'The browser can retrieve the created task again',
        'No other tests are needed',
      ],
      1,
      'It checks the read-after-write journey, but the demo’s in-memory store is not durable storage.',
    ),
  }),
  lab({
    id: 'browser-accessibility',
    title: 'Test keyboard access and semantics',
    category: 'Accessibility testing',
    stage: 'browser',
    order: 530,
    difficulty: 'Intermediate',
    minutes: 25,
    files: ['public/index.html'],
    testPath: 'e2e/browser-accessibility.spec.js',
    command: 'npx playwright test e2e/browser-accessibility.spec.js',
    objective: 'Complete the form with the keyboard and run an automated accessibility scan.',
    explanation:
      'Accessibility testing combines automated checks with human exploration. An axe scan catches common issues, while a keyboard test checks a real interaction. Passing an automated scan does not establish full accessibility: also inspect focus visibility, screen-reader announcements, zoom, and the clarity of errors.',
    steps: [
      'Create e2e/browser-accessibility.spec.js.',
      'Use Tab to reach the input, type a title, then Tab and Enter to submit.',
      'Check the added task and run AxeBuilder on the page.',
      'Remove the label or language attribute and inspect the reported violation.',
    ],
    solution:
      browserSetup +
      "import AxeBuilder from '@axe-core/playwright';\ntest('supports keyboard entry without detected axe violations', async ({ page }) => {\n  await page.goto('/');\n  await page.keyboard.press('Tab');\n  await expect(page.getByRole('textbox', { name: 'Task title' })).toBeFocused();\n  await page.keyboard.type('Keyboard task');\n  await page.keyboard.press('Tab');\n  await page.keyboard.press('Enter');\n  await expect(page.getByRole('listitem')).toHaveText('Keyboard task');\n  const results = await new AxeBuilder({ page }).analyze();\n  expect(results.violations).toEqual([]);\n});",
    expected: 'One keyboard journey passes and axe reports no detected violations.',
    hint: 'Do not replace keyboard navigation with a mouse click in this test. Automated scanning is one part of accessibility work.',
    checkpoint: question(
      'Does a clean axe scan prove complete accessibility?',
      [
        'Yes, for every user',
        'No, manual and assistive-technology checks are still needed',
        'Yes, so keyboard checks can be deleted',
      ],
      1,
      'Automated rules cover only some accessibility barriers.',
    ),
  }),
  lab({
    id: 'browser-visual',
    title: 'Notice an unintended visual change',
    category: 'Visual regression',
    stage: 'browser',
    order: 540,
    difficulty: 'Advanced',
    minutes: 25,
    files: ['public/index.html'],
    testPath: 'e2e/browser-visual.spec.js',
    command: 'npx playwright test e2e/browser-visual.spec.js',
    objective: 'Create a reviewed screenshot baseline and detect a deliberate style change.',
    explanation:
      'Visual regression compares a screenshot with a reviewed baseline. Fix the viewport and data so changes represent the UI rather than random content. The first run has no baseline: generate one, inspect it, then run normally. Never accept a new baseline automatically just to turn a failing build green.',
    steps: [
      'Create e2e/browser-visual.spec.js.',
      'Generate the first baseline with npx playwright test e2e/browser-visual.spec.js --update-snapshots.',
      'Inspect the image and commit the intended baseline. Run the ordinary command.',
      'Change the button background, inspect the image diff, then revert or deliberately review a new baseline.',
    ],
    solution:
      browserSetup +
      "test('keeps the form layout stable', async ({ page }) => {\n  await page.setViewportSize({ width: 900, height: 700 });\n  await page.goto('/');\n  await expect(page.getByRole('listitem')).toHaveCount(0);\n  await expect(page).toHaveScreenshot('taskboard-empty.png', { animations: 'disabled' });\n});",
    expected:
      'After creating and reviewing a baseline, the normal run passes. A changed style produces an image diff.',
    hint: 'A screenshot baseline depends on browser, OS, and fonts. Generate and compare in a consistent environment.',
    checkpoint: question(
      'What should you do before accepting a changed baseline?',
      [
        'Inspect the image diff and confirm the change is intended',
        'Always accept every new screenshot',
        'Delete the assertion',
      ],
      0,
      'A baseline is reviewed evidence of intended appearance, not a button for silencing failures.',
    ),
  }),
  lab({
    id: 'property-testing',
    title: 'Test a rule across many inputs',
    category: 'Property-based testing',
    stage: 'advanced',
    order: 610,
    difficulty: 'Advanced',
    minutes: 25,
    files: ['src/title.js'],
    objective: 'Check that cleaning a title is idempotent across generated strings.',
    explanation:
      'Example tests check inputs you choose. Property-based testing generates many inputs and checks an invariant. Cleaning an already cleaned title should not change it again. fast-check can shrink a failure to a smaller counterexample and reports a seed so you can reproduce it. A property complements examples; it does not replace clear requirements.',
    steps: [
      'Create tests/property-testing.test.js.',
      'Use fc.string() to generate strings, with 100 runs.',
      'Assert cleanTitle(cleanTitle(value)) equals cleanTitle(value).',
      'Try changing the function to append a character and observe a minimal counterexample.',
    ],
    solution:
      "import { it, expect } from 'vitest';\nimport fc from 'fast-check';\nimport { cleanTitle } from '../src/title.js';\nit('cleaning is idempotent', () => {\n  fc.assert(fc.property(fc.string(), value => {\n    expect(cleanTitle(cleanTitle(value))).toBe(cleanTitle(value));\n  }), { numRuns: 100, seed: 2026 });\n});",
    expected:
      'One test verifies 100 generated examples and passes deterministically with the chosen seed.',
    hint: 'Idempotent means applying the operation twice gives the same result as once. Keep a failing seed when investigating a real bug.',
    checkpoint: question(
      'What is a property in this kind of test?',
      [
        'A single hardcoded string',
        'An invariant that should hold for many generated inputs',
        'A CSS property',
      ],
      1,
      'The invariant expresses a rule over a broad range of inputs.',
    ),
  }),
  lab({
    id: 'performance-budget',
    title: 'Measure before choosing a budget',
    category: 'Performance testing',
    stage: 'advanced',
    order: 620,
    difficulty: 'Advanced',
    minutes: 25,
    files: ['src/title.js'],
    objective:
      'Measure a representative workload and reason about a repeatable performance budget.',
    explanation:
      'A performance check needs a defined workload and a measured budget. This small diagnostic processes 10,000 tasks and verifies correctness before reporting a duration. It uses a generous 1,000ms ceiling to demonstrate a budget, not a universal speed guarantee. CI hardware and scheduling vary: collect repeated measurements on your target environment before tightening thresholds.',
    steps: [
      'Create tests/performance-budget.test.js.',
      'Build 10,000 deterministic tasks with half completed.',
      'Measure summarize with performance.now; assert the counts before inspecting elapsed time.',
      'Repeat the command several times, record the spread, then add a deliberately slow loop to see the budget fail. Do not make an arbitrary tiny threshold your CI gate.',
    ],
    solution:
      "import { it, expect } from 'vitest';\nimport { performance } from 'node:perf_hooks';\nimport { summarize } from '../src/title.js';\nit('summarizes a representative workload within a generous diagnostic budget', () => {\n  const tasks = Array.from({ length: 10000 }, (_, id) => ({ id, done: id % 2 === 0 }));\n  const start = performance.now();\n  const result = summarize(tasks);\n  const elapsed = performance.now() - start;\n  expect(result).toEqual({ total: 10000, complete: 5000 });\n  console.log('summary duration in ms:', elapsed);\n  expect(elapsed).toBeLessThan(1000);\n});",
    expected:
      'One correctness check and a diagnostic duration are reported. Results depend on the host.',
    hint: 'This is a local micro-performance lesson, not a load test. Real HTTP load tests also need concurrency, latency percentiles, errors, and resource measurements.',
    checkpoint: question(
      'What makes a performance threshold defensible?',
      [
        'The smallest number that passed once',
        'Copying a number from a different laptop',
        'Repeated measurements of a representative workload on the target environment',
      ],
      2,
      'A budget needs context and measurements, otherwise it becomes a source of flaky failures.',
    ),
  }),
  lab({
    id: 'mutation-testing',
    title: 'Test the tests themselves',
    category: 'Mutation testing',
    stage: 'advanced',
    order: 630,
    difficulty: 'Advanced',
    minutes: 20,
    files: ['src/title.js'],
    objective:
      'Introduce a deliberate implementation bug and verify the existing assertion catches it.',
    explanation:
      'A passing suite may be weak. Mutation testing changes a small piece of application logic and asks whether a test fails. Start manually: replace trim() with returning the unchanged title. The padded-title assertion should turn red. Restore the implementation afterward. Automated mutation tools apply many such changes and report survivors that need investigation.',
    steps: [
      'Create tests/mutation-testing.test.js and run it against the correct source.',
      'Temporarily change cleanTitle to return title unchanged.',
      'Run again and inspect the failure. A surviving mutation means the assertion needs work.',
      'Restore trim(), run again, and keep the regression test.',
    ],
    solution:
      "import { it, expect } from 'vitest';\nimport { cleanTitle } from '../src/title.js';\nit('protects the trimming requirement', () => {\n  expect(cleanTitle('  Learn  ')).toBe('Learn');\n});",
    expected:
      'Green with trim(), red with the deliberate no-trim mutation, green again after restoring it.',
    hint: 'Do not edit the expected result to match a broken implementation. The requirement stays the same.',
    checkpoint: question(
      'What does a surviving mutation suggest?',
      [
        'The application is certainly correct',
        'A test may not observe the changed behavior',
        'The mutation must always be deleted from the report',
      ],
      1,
      'Investigate whether it exposes a gap or is an equivalent mutation.',
    ),
  }),
  lab({
    id: 'coverage-and-branches',
    title: 'Use coverage to find a question',
    category: 'Coverage and static checks',
    stage: 'advanced',
    order: 640,
    difficulty: 'Advanced',
    minutes: 25,
    files: ['src/title.js', 'src/types-example.ts'],
    command: 'npm run test:coverage -- tests/coverage-and-branches.test.js',
    objective: 'Inspect a coverage report and distinguish type checks from behavioral tests.',
    explanation:
      'Coverage reports execution, not correctness. Add a meaningful assertion for empty and mixed task lists, then inspect the HTML report in coverage/index.html. Uncovered code elsewhere is useful information, not an instruction to write meaningless assertions. Run the type checker separately: it catches incompatible types before execution but cannot prove a title is trimmed correctly.',
    steps: [
      'Create tests/coverage-and-branches.test.js.',
      'Run the coverage command and open coverage/index.html in your browser.',
      'Run npm run typecheck, then temporarily change done: false to done: "false" in src/types-example.ts to inspect the compile-time error.',
      'Restore the type and compare what static checking found with what behavioral assertions found.',
    ],
    solution:
      "import { it, expect } from 'vitest';\nimport { summarize } from '../src/title.js';\nit('handles no tasks', () => {\n  expect(summarize([])).toEqual({ total: 0, complete: 0 });\n});\nit('counts completed tasks in a mixed list', () => {\n  expect(summarize([{ done: true }, { done: false }])).toEqual({ total: 2, complete: 1 });\n});",
    expected:
      'Two tests pass and text/HTML coverage is produced. The deliberate type mismatch fails npm run typecheck.',
    hint: 'Coverage does not prove that every requirement has been asserted. Ask which meaningful behavior is still missing.',
    checkpoint: question(
      'Can full line coverage replace useful assertions and type checks?',
      ['Yes', 'Only when all files are short', 'No, they provide different evidence'],
      2,
      'Execution coverage, behavioral assertions, and type checking answer different questions.',
    ),
  }),
  lab({
    id: 'continuous-integration',
    title: 'Run the checks on every change',
    category: 'Continuous integration',
    stage: 'advanced',
    order: 650,
    difficulty: 'Advanced',
    minutes: 25,
    files: ['package.json'],
    testPath: '.github/workflows/tests.yml',
    command: 'npm test && npm run typecheck',
    objective: 'Run unit and type checks locally, then configure the same checks in CI.',
    explanation:
      'Tests protect a repository when they run consistently. GitHub Actions can install the committed dependency lockfile and run checks on pushes and pull requests. This workflow assumes practice-project remains a subdirectory of this repository; change working-directory when copying it to another repository. A failing command must keep a nonzero exit code so CI reports the failure.',
    steps: [
      'Run npm install in practice-project and commit its package-lock.json with your project.',
      'Run npm test and npm run typecheck locally.',
      'Create .github/workflows/tests.yml at the repository root using the worked example.',
      'Introduce a failing assertion on a branch, verify the workflow reports failure when you push it, then fix the assertion. TestLab does not push or create workflows on your behalf.',
    ],
    solution:
      "name: TaskBoard checks\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    defaults:\n      run:\n        working-directory: practice-project\n    steps:\n      - uses: actions/checkout@v7\n      - uses: actions/setup-node@v7\n        with:\n          node-version: '22'\n          cache: npm\n          cache-dependency-path: practice-project/package-lock.json\n      - run: npm ci\n      - run: npm test\n      - run: npm run typecheck\n",
    expected:
      'Local commands pass. A CI run is only verified after you add the workflow to your own GitHub repository and observe a run.',
    hint: 'npm ci needs a committed lockfile. Do not add || true to a failing test command.',
    checkpoint: question(
      'Why must a failing check preserve a nonzero exit code?',
      [
        'So CI can correctly mark the job as failed',
        'To hide a broken test',
        'To make the app load faster',
      ],
      0,
      'The process exit status is how the CI system knows a command failed.',
    ),
    checklist: [
      'I ran both checks in the practice project.',
      'I understand where the workflow and lockfile belong.',
      'I tested a deliberate failure locally; I understand that a hosted CI run needs my own repository.',
    ],
  }),
  lab({
    id: 'exploratory-capstone',
    title: 'Plan testing for an app of your own',
    category: 'Exploratory testing',
    stage: 'advanced',
    order: 660,
    difficulty: 'Advanced',
    minutes: 35,
    files: ['public/index.html', 'src/api.js'],
    testPath: 'TEST-PLAN.md',
    command: 'npm run dev',
    objective: 'Create a risk-based test plan and record evidence from a complete testing session.',
    explanation:
      'A tester decides what matters before choosing a tool. Explore TaskBoard with a time-boxed charter: create tasks while varying input, keyboard use, reloads, and network conditions. Separate observations from assumptions. Then propose which findings deserve a unit, component, API, or end-to-end regression test. The same plan transfers to your own application.',
    steps: [
      'Create TEST-PLAN.md in practice-project.',
      'Spend 15 minutes exploring the app with the charter below; record actual observations.',
      'Choose a risky behavior and write an automated regression test at the cheapest layer that can catch it.',
      'Run the relevant suites and record what they do not establish, such as durable storage or a complete security review.',
    ],
    solution:
      '# TaskBoard test plan\n\n## Charter\nExplore creating and reading tasks with unusual input and interrupted requests.\n\n## Risks and checks\n- Empty / whitespace title: component and API validation.\n- Unauthorized write: API rejection plus unchanged storage.\n- Save failure: component error and retry behavior.\n- Lost task after reload: end-to-end read-after-write.\n- Inaccessible form: keyboard exploration plus automated scan.\n\n## Session notes\nRecord input, action, expected behavior, actual behavior, and reproduction steps.\n\n## Regression\nDescribe the bug you found, the test layer you chose, and the fail/fix/pass evidence.\n\n## Limits\nThe app uses in-memory storage and a demo token. Passing checks do not establish durable storage, real authentication, or complete accessibility.\n',
    expected:
      'A personally completed test plan and an actual regression test, not just the copied template.',
    hint: 'Do not test everything at the browser layer. Put calculations in unit tests and keep a few critical end-to-end journeys.',
    checkpoint: question(
      'How should you choose the next test to write?',
      [
        'Add another screenshot regardless of risk',
        'Choose an important behavior and the cheapest layer that can reliably verify it',
        'Only test code that is easiest to reach',
      ],
      1,
      'Risk and observable behavior guide the scope and level of the test.',
    ),
    checklist: [
      'I explored the app and recorded actual observations in TEST-PLAN.md.',
      'I wrote and ran a regression test for one meaningful behavior.',
      'I can explain which checks belong at unit, component, API, and end-to-end levels.',
    ],
  }),
];
