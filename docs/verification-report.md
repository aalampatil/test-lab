# Local verification report

## Clerk and Convex integration — 10 November 2026

Verified locally on Windows with Node.js 25.9.0 and installed Chrome:

- `npm test`: 80 tests passed across four files, including Convex ownership,
  unauthenticated access rejection, issuer separation, validation, completion
  merging, and progress reconciliation. Convex checks use the local `convex-test`
  harness; they do not verify live Clerk JWT validation.
- `npm run lint` and `npx tsc --noEmit`: passed.
- `npm run build`: passed, with the guest workspace prerendered and the Clerk proxy
  included. The build ran without configured Clerk/Convex credentials.
- `npm run test:e2e`: all seven existing guest learning flows passed against the
  production server, including reload persistence, drafts, desktop/mobile layout,
  editor loading, course search, knowledge checks, and clipboard use.

Live Clerk sign-up/sign-in, account switching in a real browser, Convex token
verification, cross-device subscriptions, Vercel deployment, backups, and restore
remain unverified until the corresponding instances and environment settings are
provided. Production readiness remains incomplete.

An older development-generated route validator still referenced the removed
progress API. `next typegen` regenerated production types but did not clear that
older development validator; removing the stale generated validator allowed
TypeScript and the production build to pass. No application types were suppressed.

## Original learning build

Verified on 6 November 2026, on Windows with the installed Node.js runtime and Chrome.

| Area                                                      | Result                                                                                                                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TestLab runner and curriculum suite                       | 72 tests passed                                                                                                                                              |
| Worked Node/async/React/HTTP/filesystem/property examples | 20 tests in 16 files passed with real Vitest                                                                                                                 |
| TaskBoard starter                                         | Initial test, strict type check, and V8 coverage command passed                                                                                              |
| TaskBoard real browser examples                           | Smoke, journey, keyboard/axe, and visual regression passed                                                                                                   |
| TestLab browser workflows                                 | Seven flows verified, including course filtering, concept/glossary search, self-reported project completion, draft persistence, clipboard, and mobile layout |
| Source validation                                         | ESLint and TypeScript checks passed                                                                                                                          |
| Production build                                          | Next.js build passed                                                                                                                                         |

The initial visual baseline was inspected, then a normal comparison run passed. Generated verification fixtures and screenshot outputs are ignored, not learner exercise files or committed platform-specific baselines.

The starter’s intentionally low coverage demonstrates that only the initial exercise is written; it is not a claim that the practice application has comprehensive test coverage. Write the other lab tests yourself.

Live PostgreSQL, live Docker execution, and hosted GitHub Actions were not available for the original end-to-end verification. PostgreSQL has since been replaced by Clerk-authenticated Convex persistence; those live deployments still need verification. Project-lab completion remains explicitly self-reported. Root and practice-project test commands and their scope are documented in [testing.md](testing.md).
