# Local verification report

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

Live PostgreSQL, live Docker execution, and hosted GitHub Actions were not available for end-to-end verification. Project-lab completion remains explicitly self-reported. Root and practice-project test commands and their scope are documented in [testing.md](testing.md).
