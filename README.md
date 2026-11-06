# TestLab

**Learn to test real applications, one bug at a time.**

> **DEV ONLY — personal learning build. Not ready for a public production release.** See [production readiness](docs/production-readiness.md) for implemented configuration, missing features/infrastructure, and required verification. A successful production build does not change this status.

A Next.js learning application with short lessons, a Monaco playground, structured test feedback, mutation-based challenge validation, and persistent progress. Local mode needs no account, database, API key, Docker, or external service.

## Start locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. The overview is the default workspace. The About TestLab navigation item opens the product introduction; every learning screen is shareable through its URL query parameters, and browser back/forward navigation works.

`npm install` generates the Prisma client and builds Monaco assets into `public/monaco`. Both fonts and the editor are self-hosted. If installation scripts were disabled, run `npm run db:generate` and `node scripts/setup-monaco.mjs` yourself. The simple editor remains usable while Monaco loads, or can be selected explicitly.

## What works

- A dashboard showing real completed lessons, overall progress, learning time rounded to minutes, and solved challenges.
- Forty concept lessons with examples and scored knowledge checks, plus fifty searchable glossary terms.
- Thirty-six practical lessons in seven beginner-to-advanced stages: fourteen in-browser exercises and twenty-two real-project labs.
- An independent TaskBoard practice project for real async, mock, timer, React, storage, HTTP, contract, security-boundary, browser, accessibility, visual, property, performance, mutation, coverage, type-check, CI, and exploratory exercises.
- Editable, saved test drafts; reset, hints, a syntax guide, run status, expected/actual results, and beginner-friendly explanations.
- A “Your project” guide in every exercise: exact repository folders and filenames, JavaScript/TypeScript source and tests, copy buttons, Vitest configuration, npm scripts, run/watch commands, and troubleshooting.
- Completion checks that require passing assertions, required inputs, and detection of deliberate bugs. `expect(true).toBe(true)` never completes a challenge.
- A searchable/filterable catalog of Vitest, Jest, React Testing Library, Playwright, Cypress, and Postman, including installation examples and documentation links. Only Vitest-style lessons execute.
- Local progress, profile name, theme selection, recent activity, keyboard search, and responsive navigation.

Local progress is stored under `testlab-progress-v1` in this browser. It is not an authenticated account and does not sync between devices. Clearing browser data removes the local copy. If browser storage is unavailable, a visible message explains that progress is session-only.

## Folder structure

Start with [the project documentation](docs/README.md) for setup, your personal study plan, architecture, verification, content authoring, and later release work. The real-project labs save drafts and record explicitly self-reported practice; their tests run in `practice-project/`, not through the browser interpreter.

```text
src/
  app/
    api/run/route.ts          Validated execution API and runner selection
    api/progress/route.ts     Optional cookie-scoped PostgreSQL progress API
    layout.tsx               Metadata, local fonts, application styles
    page.tsx                 Workspace entry point
    icon.svg                 TestLab favicon
  components/
    test-lab.tsx             Navigation, persistence, profile, shared dialogs
    features/
      dashboard.tsx          Overview, path cards, curriculum, bug cases
      fundamentals.tsx       Concept reader and knowledge checks
      playground.tsx         Lesson/editor/result learning loop
      tools.tsx              Filterable catalog and tool details
      landing.tsx            Product introduction
    ui/                      Accessible Radix/shadcn-style primitives and Monaco wrapper
  lib/
    content.ts               Public catalog and stable original content
    curriculum/              Typed stages, expanded lessons, concepts, glossary, starter files
    progress.ts              Versioned progress schema and shared types
    database.ts              Optional Prisma/PostgreSQL connection
    testing/                 Restricted interpreter and regression tests
    utils.ts                 Shared class-name helper
  styles/
    workspace.css            Shell, dashboard, and learning paths
    learning.css             Lessons, quizzes, toolkit, and playground
    responsive.css           Breakpoints and reduced-motion support
prisma/                      PostgreSQL schema
runner/                      Trusted orchestrator and isolated Vitest container
scripts/                     Reproducible local asset setup
tests/e2e/                   Browser learning-flow and mobile tests
practice-project/            Independent TaskBoard app and your exercise test files
docs/                        Project documentation and personal study plan
```

## Execution architecture

The browser posts `{ lessonId, code }` to `/api/run`. Zod validates the submission, and the server checks the lesson ID. Local mode parses submitted code into a TypeScript AST and **interprets an allowlisted subset**, without `eval`, `new Function`, subprocesses, filesystem access, or network access. It supports named imports from `vitest` and `./app`, `describe`, `it`/`test`, constants, arrays, plain objects, negative literals, and common expect matchers. Loops, arbitrary function calls, general JavaScript execution, asynchronous callbacks, and unrelated modules are rejected with explanatory feedback. There is a code-size limit and an interpretation-step budget.

This is an educational Vitest-compatible practice interpreter, not the Vitest runtime. The local application implementations mirror the read-only lesson code. Adding a lesson requires adding its subject, mutations, and objective checks to the interpreter and a regression test.

The interpreter runs the submitted assertions against correct behavior and deliberately incorrect implementations. Completion also requires the lesson's target inputs, such as both sides of a boundary. A test passing once is not enough. This checks the exercise objective; it does not mathematically prove comprehensive coverage.

### Optional real Vitest execution

The included trusted orchestrator starts one disposable Docker container per run. Containers have no network, a read-only filesystem, no added capabilities, a non-root user, a read-only submission mount, bounded temporary storage, memory/CPU/PID limits, output limits, and an execution timeout. Submitted code is never run directly in the Next.js process or in the orchestrator process.

Requires a Docker host; it was not available in the development environment, so container execution needs verification on your target host.

```sh
docker build -t testlab-vitest ./runner
```

Set a randomly generated secret of at least 24 characters in `RUNNER_TOKEN`, then start the service in a separate terminal:

```sh
npm run runner:start
```

For Next.js, set these in `.env.local`, then restart it:

```dotenv
RUNNER_URL=http://127.0.0.1:4001
RUNNER_TOKEN=the-same-random-secret-as-the-runner
```

The runner process also needs `RUNNER_TOKEN` in its shell environment (it does not read Next.js environment files). On PowerShell, use `$env:RUNNER_TOKEN = 'your-secret'` before starting it; on Bash, use `export RUNNER_TOKEN='your-secret'`.

The execution API still validates lesson objectives with the restricted interpreter, then additionally requires actual Vitest to pass. Consequently, Docker mode currently accepts the same lesson syntax subset. This keeps completion validation consistent. The Vitest report and local assertion details are combined in the response. Tests using additional Vitest APIs need an expanded objective adapter before they can complete lessons.

Keep the orchestrator and Docker socket private. The service binds to loopback by default and accepts two concurrent runs. Run it on a dedicated execution host for deployment. Container isolation shares the host kernel; use a hardened container runtime or microVM boundary before accepting unrestricted public workloads. Serverless hosting generally cannot launch Docker; host the runner separately behind an authenticated private service. The fixed Vitest container is the first execution adapter; add separate adapters and objective validators for other frameworks.

## Optional PostgreSQL persistence

Requires your own PostgreSQL database. Copy `.env.example` to `.env.local`, set `DATABASE_URL`, and run:

```sh
npm run db:generate
npm run db:push
```

Restart Next.js. The app then loads and saves progress through `/api/progress`, retaining a browser copy as a fallback. Prisma uses the PostgreSQL driver adapter. Server data is scoped by a random HttpOnly, SameSite cookie; no user-supplied learner ID is trusted. This is anonymous session persistence, not login or cross-device identity. Add authentication before offering named accounts. The database schema is available, but a live database was not provided for verification.

`db:push` applies the schema to a development database. For hosted releases, generate and review migrations before applying them. Never commit credentials. Only the blank `.env.example` is tracked.

## Checks

```sh
npm run lint
npm test
npx tsc --noEmit
npm run build
```

Browser checks use Playwright with installed Chrome. Start the development server in one terminal, then:

```sh
npm run test:e2e
```

If Chrome is not installed, install a Playwright browser and change `channel` in `playwright.config.ts`, or configure the channel for your available browser. Browser tests cover a failing test, a corrected test, completion, saved progress after reload, a knowledge check, tool filtering, keyboard search, mobile navigation, and viewport overflow. Screenshots and traces are written to ignored `test-results/`.

For a production server:

```sh
npm run build
npm start
```

## MVP boundaries

No fake sign-in, certificates, live in-app coverage reports, or simulated execution for the informational tool guides. This MVP includes local learning, real browser/API exercises in the separate practice project, and anonymous optional PostgreSQL storage. Authentication, cross-device accounts, remote verification of project labs, and a hosted execution fleet require additional implementation and infrastructure. Use the installed Next.js documentation under `node_modules/next/dist/docs/` before changing framework APIs.
