# Contributing to TestLab

Thanks for helping people learn to write useful tests. Contributions can improve lessons, fix bugs,
clarify documentation, or make the interface more accessible. Beginners are welcome.

TestLab is currently a personal learning build intended for development use. Read the
[README](README.md) and [production readiness notes](docs/production-readiness.md) before proposing
deployment or infrastructure changes.

## Before you start

- Follow the [Code of Conduct](CODE_OF_CONDUCT.md).
- Search existing issues and pull requests before opening a new one.
- Use the issue forms for bugs, feature requests, and lesson or documentation corrections. For large
  changes, describe the problem and proposed approach in an issue before investing in implementation.
  Small fixes can go straight to a pull request.
- Report vulnerabilities through the [security policy](SECURITY.md), without posting sensitive details
  in a public issue or pull request.

## Set up a local checkout

Fork this repository, clone your fork, and create a branch for your change. Use Node.js 22 LTS, as
described in the [getting started guide](docs/getting-started.md).

From the repository root:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Guest mode needs no credentials, database, or Docker. Installation prepares
the self-hosted Monaco assets. Optional accounts and Docker execution have separate setup instructions
in the README. Never commit credentials or populated environment files.

The independent `practice-project/` has its own dependencies and commands. Install them with `npm ci`
from that directory when working on its source or tests.

## Make your change

- Keep pull requests focused on one problem and follow nearby code and formatting conventions.
- Read [AGENTS.md](AGENTS.md). Before changing Next.js framework code, read the relevant installed guide
  under `node_modules/next/dist/docs/`.
- For lessons and practice examples, follow the [curriculum authoring guide](docs/curriculum-authoring.md).
  Keep lesson IDs stable and preserve existing concept order because saved progress depends on them.
- Keep interpreter changes within the documented syntax and execution boundaries. Add regression
  coverage for behavior changes, including tests that catch incorrect implementations where relevant.
- Update documentation when setup, commands, or learner-visible behavior changes. Explain what a check
  actually verifies; do not present self-reported practice as remotely verified execution.
- Keep generated assets, dependencies, coverage, build output, and local configuration out of commits.

## Verify your work

For application code changes, run these checks from the repository root:

```sh
npm run lint
npm test
npx tsc --noEmit
npm run build
```

For interface or learning-flow changes, also run `npm run test:e2e` with the application running on port 3000. The root Playwright configuration uses installed Chrome. See [testing and verification](docs/testing.md)
for browser setup, practice-project checks, and worked-example verification when course content changes.

For documentation or GitHub template changes, check formatting, links, and any affected commands;
application tests are only needed if application behavior changes. Format only the files you edited
with the repository's Prettier configuration.

Live account verification creates development users and requires separate approval and configuration
as described in the testing guide. It is not a prerequisite for ordinary guest-mode contributions.

## Open a pull request

Describe the problem, the resulting behavior, and how you verified it. Link related issues and include
screenshots for visual changes when useful. Record any checks you could not run and why; do not claim
they passed. Maintainers may request changes before merging, and review times vary.

Contributions are provided under the repository's [MIT License](LICENSE). Only submit material you have
the right to contribute, and retain applicable third-party license notices.
