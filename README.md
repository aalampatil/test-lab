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

`npm install` builds Monaco assets into `public/monaco`. Both fonts and the editor are self-hosted. If installation scripts were disabled, run `node scripts/setup-monaco.mjs` yourself. The simple editor remains usable while Monaco loads, or can be selected explicitly.

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

Guest progress is stored under `testlab-progress-v1` in this browser. Signed-in users have separate browser copies and sync through Clerk-authenticated Convex functions when configured. Guest progress can be explicitly imported into an account. If browser storage is unavailable, a visible message explains that the browser copy is session-only.

## Folder structure

Start with [the project documentation](docs/README.md) for setup, your personal study plan, architecture, verification, content authoring, and later release work. The real-project labs save drafts and record explicitly self-reported practice; their tests run in `practice-project/`, not through the browser interpreter.

```text
src/
  app/
    api/run/route.ts          Validated execution API and runner selection
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
    convex-api.ts            Typed Convex function references
    testing/                 Restricted interpreter and regression tests
    utils.ts                 Shared class-name helper
  styles/
    workspace.css            Shell, dashboard, and learning paths
    learning.css             Lessons, quizzes, toolkit, and playground
    responsive.css           Breakpoints and reduced-motion support
convex/                      Schema, Clerk verification, progress queries/mutations
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

## Clerk accounts and Convex persistence

See [Clerk setup](docs/clerk-setup.md) for the existing Clerk application and [Convex setup](docs/convex-setup.md) for backend deployment, authentication, and Vercel environment separation. Put development keys in `.env.local`, configure the Clerk issuer on the Convex development deployment, then run:

```sh
npm run db:dev
```

Restart Next.js after setting `NEXT_PUBLIC_CONVEX_URL`. Clerk owns sessions, and Convex derives record ownership from verified identity. Clients cannot supply another user's ID to read or write progress. Completions merge transactionally; draft conflicts use the latest accepted save. Progress remains learner-owned learning data, not certification evidence.

Neon, PostgreSQL, Prisma, and the old anonymous progress endpoint are no longer used. Existing PostgreSQL rows are not automatically migrated or deleted. Export/import existing production data through a separately reviewed migration if needed. Never commit credentials. Only the blank `.env.example` is tracked.

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

This build includes guest learning and optional Clerk accounts with Convex progress sync. Live authentication, storage, and production operations still need verification on the configured deployments. Remote verification of project labs and a hosted execution fleet remain separate work. Use the installed Next.js documentation under `node_modules/next/dist/docs/` before changing framework APIs.

## Contributing and community

Read the [contributing guidelines](CONTRIBUTING.md) for local setup, checks, and pull requests, and
follow the [Code of Conduct](CODE_OF_CONDUCT.md). Use the
[issue forms](https://github.com/aalampatil/test-lab/issues/new/choose) for bugs, feature requests, and
lesson or documentation corrections. Report vulnerabilities through the [security policy](SECURITY.md).

## License

TestLab’s original code, course content, documentation, and practice project are licensed under the [MIT License](LICENSE). Copyright (c) 2026 aalampatil. Third-party code and assets retain their own licenses; see [licensing details](docs/licensing.md). The development-only release status is separate from the license.
