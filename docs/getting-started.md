# Getting started

Use Node.js 22 LTS. There are two package.json files because there are two different applications.

## 1. Run the learning workspace

From this repository’s root:

```sh
npm install
npm run dev
```

Open http://localhost:3000. Start with Fundamentals or Learning paths. Root installation builds the self-hosted Monaco editor assets. No database or Docker is required for guest browser exercises. Fonts and editor assets do not need a CDN at runtime.

In an exercise, use The lesson, Syntax explained, and Your project. The last tab teaches real file paths, JavaScript/TypeScript examples, setup, imports, and run commands.

## 2. Open your practice project

In another terminal:

```sh
cd practice-project
npm ci
npm test
```

The starter contains application source, a React component, a small HTTP server, and one passing test. You create more test files as you work through the course; the app’s worked examples are not automatically added as finished solutions to your project.

```text
practice-project/
  package.json
  package-lock.json
  vitest.config.mjs
  playwright.config.js
  server.js
  src/
    title.js
    async.js
    store.js
    repository.js
    api.js
    TaskForm.jsx
    types-example.ts
  public/index.html
  tests/title.test.js
```

Create `tests/async-success.test.js`, for example, when its lab asks you to. Test file names and relative imports matter. The lab specifies the exact target path. Browser tests belong in `e2e/`, not in the Vitest test folder.

Run the mini application manually with:

```sh
npm run dev
```

It opens on http://127.0.0.1:3100. Its data is in server memory, so restarting the server clears it. Its fixed token and development reset endpoint are teaching tools, not a production authentication system.

## 3. Browser testing

From `practice-project/`:

```sh
npx playwright install chromium
npx playwright test e2e/browser-smoke.spec.js
```

Create the lab’s test file first. Playwright starts the application automatically. For the visual lab, create the first baseline with `--update-snapshots`, inspect it, then run normally. Keep browser, OS, fonts, viewport, and data consistent.

## 4. Use the right terminal folder

| Task                      | Folder              | Command                                     |
| ------------------------- | ------------------- | ------------------------------------------- |
| Open TestLab              | Repository root     | `npm run dev`                               |
| Test TestLab itself       | Repository root     | `npm test`                                  |
| Run a lab’s Vitest test   | `practice-project/` | `npm test -- tests/your-file.test.js`       |
| Watch your practice tests | `practice-project/` | `npm run test:watch`                        |
| Run a real browser lab    | `practice-project/` | `npx playwright test e2e/your-file.spec.js` |
| Open TaskBoard manually   | `practice-project/` | `npm run dev`                               |

## Troubleshooting

- **No tests found:** create the named file, check its suffix, and check the runner’s include pattern.
- **Cannot find module:** check the relative import and whether you are in the correct project. The lab’s virtual `./app` import is only for TestLab’s browser editor.
- **Missing dependencies:** run installation in the package directory that owns the test.
- **No document global:** component tests need the `// @vitest-environment jsdom` comment shown in their example.
- **Browser executable missing:** install the Playwright browser above, or intentionally configure a locally installed browser channel.
- **Port 3100 in use:** stop your earlier TaskBoard process or use the existing development server intentionally.
- **Thousands of Git changes:** `node_modules/`, coverage, verification fixtures, and test output are ignored at every depth. Commit source and lockfiles, not installed dependencies.

Optional Clerk/Convex account setup and Docker execution are described in the root README. Neither is needed to start learning as a guest.
