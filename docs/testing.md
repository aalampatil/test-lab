# Testing and verification

## TestLab application checks

From the repository root:

```sh
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The root suite checks runner behavior, forbidden syntax, required inputs, mutation sensitivity, and course integrity. Every in-browser worked solution must complete its objective; an unrelated passing assertion must not. Each project lab must contain source files, meaningful steps, commands, and a valid knowledge check.

With TestLab running on port 3000:

```sh
npm run test:e2e
```

These checks use installed Chrome according to `playwright.config.ts`. Change the browser channel intentionally on a machine using Playwright-managed Chromium instead. Tests cover the learning loop, saved progress, guides, clipboard behavior, curriculum navigation, glossary, repository-lab completion, and mobile layout. Outputs belong in ignored `test-results/`.

## Verify the course’s worked examples

Install the independent project’s dependencies first:

```sh
cd practice-project
npm ci
```

Return to the repository root:

```sh
node scripts/verify-course-examples.mjs
```

The script bundles trusted course content, writes isolated examples into ignored `practice-project/.verification/`, and runs real Vitest against the Node, async, React/jsdom, HTTP, filesystem, and property examples. It does not overwrite a learner’s test files. It also prepares the browser example fixtures.

Run the prepared browser examples from the root:

```sh
node practice-project/node_modules/@playwright/test/cli.js test --config practice-project/.verification/playwright.config.js --update-snapshots
node practice-project/node_modules/@playwright/test/cli.js test --config practice-project/.verification/playwright.config.js
```

The first command creates the initial screenshot fixture. Inspect it before treating the second run as visual regression evidence. The verification config uses local Chrome; the learner-facing starter config uses Playwright-managed Chromium. Both exercise real browsers, not simulated pass/fail responses.

## Starter checks

Inside `practice-project/`:

```sh
npm test
npm run typecheck
npm run test:coverage -- tests/title.test.js
```

The initial project intentionally includes only one passing test. Create the tests for each lab as you learn. The coverage report is a discovery tool, not a claim that all requirements have been verified.

## Boundaries of verification

- The local interpreter and actual project examples are different engines; keep their behavior aligned for the shared exercises.
- A repository-lab checklist is self-reported. Its API, browser, or CI run is not remotely observed by TestLab.
- The CI example is a workflow template. A hosted run requires the learner’s own repository and an observed workflow execution.
- A diagnostic performance budget is not a load-test report or a production capacity guarantee.
- An automated accessibility scan does not replace manual keyboard and assistive-technology testing.
- Live Clerk/Convex account sync and Docker execution require separate environment verification. The local Convex harness checks authorization and persistence behavior without proving hosted JWT verification.

The optional `npm run test:accounts -- --allow-test-users` command performs live
Clerk/Convex checks using disposable development users and cleanup. Run it only
with approval to create those users, and follow [the account verification setup](convex-setup.md#live-account-verification).
The existing browser suite can target a dedicated server with `PLAYWRIGHT_BASE_URL`.
