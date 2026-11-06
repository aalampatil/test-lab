# TaskBoard practice project

This is the real application used by TestLab’s project labs. It is separate from TestLab itself.

```sh
npm ci
npm test
npm run dev
```

Open http://127.0.0.1:3100. Use Node.js 22 LTS. For browser labs, install Chromium with `npx playwright install chromium`.

Follow the TestLab curriculum and create each named file in `tests/` or `e2e/`. Tests in `tests/` run with Vitest; browser tests in `e2e/` run with Playwright. Component tests use the jsdom environment comment shown in their worked example.

Only the initial title test is provided as a finished test. Write the other tests yourself, inspect failures, compare with the worked example when needed, and keep your work in Git.

The source uses an in-memory store, a demo token, and a development reset endpoint so you can learn without credentials. It is a local teaching app, not a production authentication or storage system. Data survives a page reload but not a server restart.

See [the study plan](../docs/learning-plan.md), [setup instructions](../docs/getting-started.md), and [verification guide](../docs/testing.md).
