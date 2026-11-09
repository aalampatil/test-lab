# Production readiness — development only

**Current status: DEV ONLY. TestLab is a personal learning build, not an approved public production release.**

The learning application works locally and has automated verification. A successful `npm run build`, `npm start`, or `NODE_ENV=production` does not mean the deployment, security, identity, data handling, or operations are ready for public users. The visible DEV ONLY notice describes release readiness, not which Next.js command is running.

This document inventories the existing configuration and missing work. It does not configure infrastructure, enable accounts, deploy services, or change the current learning workflow.

## Existing configuration

These are implemented settings, not a complete production environment template.

| Setting / file           | What exists now                                                                                                                 | What production still needs                                                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clerk keys               | Optional Clerk provider, account controls, and session middleware.                                                              | Configure separate development/production instances, production domain, login methods, and verify the complete session lifecycle.                                                                                   |
| `NEXT_PUBLIC_CONVEX_URL` | Optional authenticated reactive progress sync. Guests stay local.                                                               | Separate development/preview/production deployments, configure the correct Clerk issuer on each, deploy functions, and verify account isolation, backups, restore, quotas, and capacity.                            |
| `CONVEX_DEPLOY_KEY`      | Used by Convex CLI during deployment; never sent to the browser.                                                                | Set a deployment-appropriate private key in Vercel and verify preview builds cannot change production data.                                                                                                         |
| `RUNNER_URL`             | Optional URL used by the web API to reach the isolated-runner service. Unset uses the restricted local interpreter.             | If full Vitest is offered: a reachable private service, authenticated transport, network restrictions, health checks, and deployment verification. A browser-facing public URL is not the intended runner boundary. |
| `RUNNER_TOKEN`           | Shared bearer token between the web API and standalone runner. The service requires at least 24 characters.                     | Generate a high-entropy secret, inject the same value into both processes through secret management, rotate it, and verify that unauthorized requests fail. Do not reuse the practice app’s demo token.             |
| `RUNNER_PORT`            | Standalone runner reads this from its process environment; default is 4001. The host binding is currently fixed to `127.0.0.1`. | Decide the private networking topology. Cross-host access requires a deliberate private proxy/service binding change; setting this port alone does not make a loopback service reachable remotely.                  |
| `NODE_ENV`               | Next.js build/start modes and the progress cookie’s Secure flag use the normal environment.                                     | Deploy with the framework’s production command behind HTTPS. Do not interpret this flag as a release approval or a way to remove the development-only notice.                                                       |
| `next.config.ts`         | Cache Components, React Compiler, partial prefetching, a Tailwind loader, and experimental agent feedback are enabled.          | Review the installed version’s deployment guidance, experimental options, runtime compatibility, security headers, asset delivery, and proxy behavior on the actual host.                                           |
| Convex schema            | Issuer-scoped Clerk owner and bounded progress data; transactional completion merging.                                          | Review schema changes, retention/deletion, conflict semantics, and hosted authorization. Existing PostgreSQL data requires a separate migration if needed.                                                          |
| Lockfiles                | Root and practice project lockfiles are committed. Fonts and editor assets are self-hosted.                                     | Pin the deployment Node version, use `npm ci` in the correct build directory, include required build tools, and verify a fresh reproducible artifact.                                                               |

Next.js reads `.env.local` for the web application. Convex deployment configuration, including `CLERK_JWT_ISSUER_DOMAIN`, belongs on the corresponding Convex deployment. **The standalone runner does not load Next.js environment files:** its variables must be supplied to its own process. Do not put server secrets in `NEXT_PUBLIC_*` variables, client bundles, logs, or committed files.

Clerk and Convex configuration is documented in [clerk-setup.md](clerk-setup.md) and [convex-setup.md](convex-setup.md). Email-provider, monitoring-provider, shared rate-limit, and deployment-origin controls still need implementation/configuration. Adding arbitrary variables to `.env.local` will not create those features.

## Missing implementation and production decisions

### 1. Accounts, sessions, and progress

Current behavior is guest browser-local progress or optional Clerk account progress stored in Convex. The editable display name is not an authorization identity; Convex derives ownership from the verified token.

Before promising accounts or cross-device synchronization:

- Verify implemented sign-in, session expiration, sign-out, account recovery as applicable, and server-side authorization against the configured live instances.
- Verify explicit guest-progress import and account switching; define migrations as course content changes.
- Verify concurrent completion merging and failed-save retry behavior; review latest-save draft conflicts and offline limitations.
- Add progress export/deletion and appropriate retention/privacy documentation for hosted user data.
- Keep verified in-app outcomes distinguishable from self-reported project practice. The current client-owned completion flags must not become trusted certificates or assessment evidence.

If a future release intentionally remains anonymous and browser-local, describe that scope clearly rather than advertising accounts. Public hosting still requires the operational and abuse controls below.

### 2. Request handling and abuse controls

The API currently validates submissions with Zod and the interpreter limits supported syntax and execution steps. Those controls do not provide a complete public-service abuse boundary.

- Enforce request body limits at the HTTP ingress and application boundary, including requests without a reliable Content-Length header.
- Add suitable per-user/session and network-level rate limits, admission limits, timeouts, and overload responses.
- Use a consistent shared limit mechanism when multiple web instances are deployed; an individual process’s counters are not a global quota.
- Review token transport and cross-origin behavior through the actual HTTPS proxy and deployment hostname. The old cookie-based progress endpoint has been removed.
- Review security headers and a tested content security policy that accommodates the local editor bundle and worker. No production-specific policy is configured in the current Next.js config.
- Ensure logs and error reports do not retain source submissions, drafts, tokens, or credentials unnecessarily.

### 3. Submitted-code execution, if enabling full Vitest

The default educational interpreter never evaluates arbitrary JavaScript. The optional runner creates restricted Docker containers, but a local implementation and limits are not a verified public execution fleet.

- Run workers on a dedicated private execution host, separated from application credentials, user data, and the public web process.
- Verify isolation suitable for the accepted workload, container or microVM hardening, network restrictions, non-root execution, read-only mounts, and no access to the Docker socket from submissions.
- Test CPU/memory/PID/output limits, timeouts, process termination, temporary-file cleanup, malicious inputs, and worker failure recovery on the actual host.
- Define global concurrency, queue/backpressure behavior, cancellation, request ownership, and quotas before scaling beyond the current single-process two-run admission limit.
- Supervise the runner, add health/readiness checks and useful operational metrics, and verify web-to-runner authentication and transport.

If the public product retains only the restricted interpreter, do not configure or expose the Docker runner merely to satisfy a checklist. Document the supported syntax and complete the interpreter’s own resource and abuse review.

### 4. Database and data operations, if enabling server persistence

- Verify the real Clerk/Convex connection and token-scoped read/write authorization in staging.
- Review schema changes and a controlled backend/frontend deployment order. Test failure and rollback/recovery procedures.
- Configure deployment keys, issuer settings, quotas, retention, and environment separation.
- Configure backups and demonstrate a restore. Monitor capacity and connection failures.
- Test unavailable database behavior, concurrent saves, session lifecycle, guest import, account switching, and browser/server reconciliation.

Leaving Clerk or Convex unconfigured provides browser-only progress. Neon, Prisma, and `DATABASE_URL` are no longer used.

### 5. Hosting and operations

Vercel is the selected hosting target, with Clerk and Convex. A linked deployment, public domain, deployment pipeline, and operational owner still need verification.

- Verify Vercel compatibility with the installed Next.js version and pin the required Node runtime. Docker workers cannot run inside ordinary serverless web functions; an isolated execution service remains separate work.
- Configure the public domain, TLS, trusted proxy behavior, service networking, environment separation, and secret injection.
- Deploy an immutable build produced by `npm ci` and `npm run build`; use the supported production start/runtime command, not `next dev`.
- Add automated release checks, an observed staging rollout, deployment rollback, health monitoring, error tracking, and incident ownership.
- Review dependency advisories, including build/development tools, and define an update policy.
- Verify availability and load behavior with a workload and capacity target; the course’s small performance exercise is not a production load test.

The included GitHub Actions lesson is a learner-facing example stored as course content. It is not an installed or observed production deployment pipeline for TestLab.

### 6. Product and learning validation

- Review lessons and terminology with beginner learners and maintain supported tool-version instructions.
- Complete broader manual keyboard, zoom, screen-reader, and accessibility checks of TestLab itself. The practice app’s axe result does not establish TestLab’s accessibility.
- Validate fresh-install onboarding and supported desktop/mobile browsers.
- Keep project-lab completion explicitly self-reported unless a separately designed verification mechanism is implemented.
- Define what happens to saved progress when lessons, concept IDs, and schemas change.

## Keep the practice project local

`practice-project/` is educational source, not a second production service. It deliberately uses:

- An in-memory store that loses tasks on server restart.
- A fixed `practice-token`, not real authentication.
- A non-production reset endpoint to isolate browser exercises.
- A standalone React component for component labs and a separate lightweight HTML browser interface.

Do not publish that demo server as a secure multi-user application. Exclude its dependencies, test output, coverage, and verification fixtures from the web release artifact. Course source examples can remain available as learning material.

## Required evidence before changing the status

1. Select the actual release scope: anonymous learning, authenticated accounts, server persistence, and/or full code execution.
2. Implement and configure every applicable item above. Explicitly disable or omit features outside the scope.
3. Pass unit, curriculum, type, lint, production-build, browser, and applicable infrastructure checks from a fresh checkout.
4. Observe a staging deployment behind the intended HTTPS/proxy/network setup, including failures, resource limits, data recovery, and rollback.
5. Record the environment, checks, responsible owner, unresolved limitations, and release decision.
6. Only then deliberately update the DEV ONLY notice and readiness documentation.

For currently observed local results, see [verification-report.md](verification-report.md). For a concise release task list, see [release-checklist.md](release-checklist.md). Neither a build flag nor filling the three optional environment variables completes these steps automatically.
