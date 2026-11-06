# Before a public release

This is a personal learning application first. The following work belongs to a later public release, not a prerequisite for beginning the course.

## Content and learning

- Review explanations with beginner learners and test that they can follow every path from a fresh clone.
- Run all worked examples on the supported Node version and browser environments.
- Explain prerequisites and which labs are automated, guided, manual, or self-reported.
- Keep installation instructions, tool examples, links, and dependency advisories current.
- Decide how to migrate progress when IDs or the curriculum structure change.

## User data

- Add real authentication before promising accounts or cross-device progress.
- Define progress export, deletion, privacy expectations, and retention if hosting data for other people.
- Do not treat browser or self-reported progress as trusted certification evidence.
- Test optional PostgreSQL persistence against a disposable real database, including failures and concurrent updates.

## Execution and hosting

- Keep submitted-code execution isolated from the web process and credentials.
- Verify a hardened execution host, resource limits, cleanup, admission limits, and failure reporting before opening arbitrary workloads to the public.
- Verify the actual Docker and database deployment; their live infrastructure was not available during local implementation.
- Keep the practice application’s fixed token, in-memory store, and development reset endpoint clearly scoped to local education. Do not expose it as a production service.

## Quality

- Run the root unit suite, type checks, lint, production build, and full browser flows.
- Inspect desktop and mobile layouts, keyboard behavior, focus handling, and error feedback.
- Review visual baselines rather than accepting them automatically.
- Run dependency audits for both package directories; review development-tool advisories separately from production dependencies.
- Document the checks that actually ran and any unverified environment, rather than using a general “production ready” label.
